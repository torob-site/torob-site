"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  UserPlus,
  Shield,
  User,
  Crown,
  X,
  AlertCircle
} from "lucide-react";
import { axiosClient } from "@/lib/axios";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import PhoneStep from "@/components/phone-step";
import OtpStep from "@/components/otp-step";

interface User {
  access: string[];
  name: string;
  phone: string;
  is_current_user: boolean;
  can_remove: boolean;
  is_deleted: boolean;
}

interface PermissionsResponse {
  current_user_permissions: {
    is_owner: boolean;
    is_admin: boolean;
    is_deleted: boolean;
  };
  users: User[];
}

// هوک برای دریافت دسترسی‌ها
export function useGetPermissions() {
  const { currentShop } = useCurrentShop();
  
  return useQuery({
    queryKey: ["permissions", currentShop?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop.id}/permissions`,
      );
      return data;
    },
    enabled: !!currentShop?.id,
  });
}

// هوک برای حذف کاربر
export function useRemoveUser() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (phone: string) => {
      const { data } = await axiosClient.delete(
        `/panel/shops/${currentShop.id}/users/${phone}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["permissions", currentShop?.id] 
      });
    },
  });
}

// ارسال کد تأیید از روت عمومی auth (همان ورود و ثبت‌نام)
export function useSendAuthCode() {
  return useMutation({
    mutationFn: async (data: { phone: string }) => {
      const res = await axiosClient.post(`/auth/send-code`, data);
      return res.data;
    },
  });
}

// تأیید کد از روت عمومی auth — عمداً بدون ذخیره توکن تا جای صاحب فروشگاه لاگین نشود
export function useVerifyAuthCode() {
  return useMutation({
    mutationFn: async (data: { phone: string; code: string }) => {
      const res = await axiosClient.post(`/auth/verify-code`, data);
      return res.data;
    },
  });
}

// افزودن عضو بعد از تأیید کد — همیشه ادمین
export function useAddUser() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (data: { phone: string }) => {
      const res = await axiosClient.post(
        `/panel/shops/${currentShop.id}/users`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["permissions", currentShop?.id]
      });
    },
  });
}

// هوک برای انتقال مالکیت فروشگاه
export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (phone: string) => {
      const { data } = await axiosClient.put(
        `/panel/shops/${currentShop.id}/users/${phone}/transfer-ownership`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["permissions", currentShop?.id]
      });
    },
  });
}

export default function PermissionsPage() {
  const { currentShop } = useCurrentShop();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState<"phone" | "otp">("phone");
  const [addPhone, setAddPhone] = useState("");
  const [addCode, setAddCode] = useState("");

  const { data, isLoading, error } = useGetPermissions();
  const removeUser = useRemoveUser();
  const sendAuthCode = useSendAuthCode();
  const verifyAuthCode = useVerifyAuthCode();
  const addUser = useAddUser();
  const transferOwnership = useTransferOwnership();
  const [transferTarget, setTransferTarget] = useState<User | null>(null);

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddStep("phone");
    setAddPhone("");
    setAddCode("");
  };

  const handleSendMemberCode = async (phone: string) => {
    try {
      await sendAuthCode.mutateAsync({ phone });
      setAddPhone(phone);
      setAddCode("");
      setAddStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "خطا در ارسال کد تأیید");
    }
  };

  const handleVerifyMemberCode = async (code: string) => {
    try {
      // اول کد از روت عمومی auth تأیید می‌شود؛ فقط اگر درست بود عضو اضافه می‌شود
      await verifyAuthCode.mutateAsync({ phone: addPhone, code });
      await addUser.mutateAsync({ phone: addPhone });
      toast.success("عضو جدید با موفقیت اضافه شد");
      closeAddModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "کد تأیید نامعتبر است");
    }
  };

  const handleResendMemberCode = async () => {
    await sendAuthCode.mutateAsync({ phone: addPhone });
  };

  const handleRemoveUser = (phone: string, name: string) => {
    if (confirm(`آیا از حذف دسترسی "${name}" اطمینان دارید؟`)) {
      removeUser.mutate(phone);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget) return;
    try {
      await transferOwnership.mutateAsync(transferTarget.phone);
      toast.success(`مالکیت فروشگاه به "${transferTarget.name || transferTarget.phone}" منتقل شد`);
      setTransferTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "خطا در انتقال مالکیت");
      setTransferTarget(null);
    }
  };

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">لطفاً یک فروشگاه انتخاب کنید</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-500">خطا در دریافت اطلاعات</div>
      </div>
    );
  }

  const { users, current_user_permissions } = data || { users: [], current_user_permissions: {} };
  const isOwner = current_user_permissions?.is_owner || false;

  // جداسازی کاربران فعال و غیرفعال
  const activeUsers = users?.filter((user: User) => !user.is_deleted) || [];
  const deletedUsers = users?.filter((user: User) => user.is_deleted) || [];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4">
      <div className="mx-auto max-w-[700px]">
        {/* هدر */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                دسترسی‌ها
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                مدیریت اعضای فروشگاه و سطح دسترسی آنها
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2
                  bg-blue-500 hover:bg-blue-600
                  text-white text-sm font-medium
                  rounded-xl
                  transition
                  shadow-lg shadow-blue-500/20
                "
              >
                <UserPlus className="h-4 w-4" />
                افزودن عضو
              </button>
            )}
          </div>
        </div>

        {/* جدول اعضا */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                    نام
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                    شماره موبایل
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                    سطح دسترسی
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user: User, index: number) => {
                  const isOwnerUser = user.access.includes('صاحب امتیاز');
                  const isAdmin = user.access.includes('ادمین');
                  
                  return (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0f172a] transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isOwnerUser ? (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          ) : isAdmin ? (
                            <Shield className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || "نامشخص"}
                          </span>
                          {user.is_current_user && (
                            <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                              خودتان
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3">
                        {isOwnerUser ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 rounded-full">
                            صاحب امتیاز
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">
                            ادمین
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                            کاربر
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isOwnerUser ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : user.is_current_user ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : (
                            isOwner && (
                              <>
                                <button
                                  onClick={() => setTransferTarget(user)}
                                  className="
                                    p-1.5
                                    text-yellow-500 hover:text-yellow-600
                                    hover:bg-yellow-50 dark:hover:bg-yellow-500/10
                                    rounded-lg
                                    transition
                                  "
                                  title="انتقال مالکیت"
                                >
                                  <Crown className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveUser(user.phone, user.name)}
                                  className="
                                    p-1.5
                                    text-red-400 hover:text-red-600
                                    hover:bg-red-50 dark:hover:bg-red-500/10
                                    rounded-lg
                                    transition
                                  "
                                  title="حذف دسترسی"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {activeUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">هیچ عضوی در فروشگاه وجود ندارد</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* کاربران حذف شده */}
        {deletedUsers.length > 0 && (
          <div className="mt-4 bg-gray-50 dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <AlertCircle className="h-4 w-4" />
              <span>کاربران حذف شده</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {deletedUsers.map((user: User, index: number) => (
                <span key={index} className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {user.name || "نامشخص"} ({user.phone})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* مودال تأیید انتقال مالکیت */}
        {transferTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  انتقال مالکیت فروشگاه
                </h3>
                <button
                  onClick={() => setTransferTarget(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-7">
                آیا از انتقال مالکیت به{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {transferTarget.name || "نامشخص"}
                </span>{" "}
                (<span dir="ltr">{transferTarget.phone}</span>) اطمینان دارید؟
                <br />
                <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                  بعد از انتقال، شما ادمین فروشگاه خواهید بود و مالکیت قابل بازگشت فقط توسط مالک جدید است.
                </span>
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleTransferOwnership}
                  disabled={transferOwnership.isPending}
                  className={
                    "flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium " +
                    "rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                >
                  {transferOwnership.isPending ? "در حال انتقال..." : "انتقال مالکیت"}
                </button>
                <button
                  onClick={() => setTransferTarget(null)}
                  className={
                    "px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 " +
                    "text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition"
                  }
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال افزودن عضو */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  افزودن عضو جدید
                </h3>
                <button
                  onClick={closeAddModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {addStep === "phone" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      شماره موبایل *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      maxLength={11}
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className={
                        "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 " +
                        "bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white " +
                        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                      }
                      placeholder="مثال: 09123456789"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleSendMemberCode(addPhone)}
                      disabled={!/^09\d{9}$/.test(addPhone) || sendAuthCode.isPending}
                      className={
                        "flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium " +
                        "rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                      }
                    >
                      {sendAuthCode.isPending ? "در حال ارسال کد..." : "ارسال کد تأیید"}
                    </button>
                    <button
                      onClick={closeAddModal}
                      className={
                        "px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 " +
                        "text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition"
                      }
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    کد تأیید به شماره{" "}
                    <span dir="ltr" className="font-medium text-gray-700 dark:text-gray-300">
                      {addPhone}
                    </span>{" "}
                    ارسال شد. کد را وارد کنید:
                  </p>

                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={6}
                    value={addCode}
                    onChange={(e) => setAddCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className={
                      "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 " +
                      "bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-center text-lg tracking-[0.4em] " +
                      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                    }
                    placeholder="------"
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleVerifyMemberCode(addCode)}
                      disabled={addCode.length !== 6 || verifyAuthCode.isPending || addUser.isPending}
                      className={
                        "flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium "
                        + "rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                      }
                    >
                      {verifyAuthCode.isPending || addUser.isPending ? "در حال تأیید..." : "تأیید و افزودن"}
                    </button>
                    <button
                      onClick={() => setAddStep("phone")}
                      className={
                        "px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 "
                        + "text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition"
                      }
                    >
                      ویرایش شماره
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}