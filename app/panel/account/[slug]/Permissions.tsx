"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
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

// هوک برای افزودن کاربر
export function useAddUser() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (userData: { phone: string; name: string; is_admin: boolean }) => {
      const { data } = await axiosClient.post(
        `/panel/shops/${currentShop.id}/users`,
        userData,
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

// هوک برای تغییر سطح دسترسی
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async ({ phone, is_admin }: { phone: string; is_admin: boolean }) => {
      const { data } = await axiosClient.put(
        `/panel/shops/${currentShop.id}/users/${phone}`,
        { is_admin },
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
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    is_admin: false,
  });

  const { data, isLoading, error } = useGetPermissions();
  const removeUser = useRemoveUser();
  const addUser = useAddUser();
  const updateUserRole = useUpdateUserRole();

  const handleAddUser = () => {
    if (!formData.phone || !formData.name) {
      alert("لطفاً شماره موبایل و نام را وارد کنید");
      return;
    }
    addUser.mutate(formData, {
      onSuccess: () => {
        setShowAddModal(false);
        setFormData({ phone: "", name: "", is_admin: false });
      },
    });
  };

  const handleRemoveUser = (phone: string, name: string) => {
    if (confirm(`آیا از حذف دسترسی "${name}" اطمینان دارید؟`)) {
      removeUser.mutate(phone);
    }
  };

  const handleToggleAdmin = (phone: string, currentIsAdmin: boolean) => {
    updateUserRole.mutate({ phone, is_admin: !currentIsAdmin });
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
                          <button
                            onClick={() => handleToggleAdmin(user.phone, true)}
                            disabled={!isOwner}
                            className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ادمین
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleAdmin(user.phone, false)}
                            disabled={!isOwner}
                            className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            کاربر
                          </button>
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

        {/* مودال افزودن عضو */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  افزودن عضو جدید
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    شماره موبایل *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="
                      w-full px-4 py-2.5 rounded-xl
                      border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-[#0f172a]
                      text-gray-900 dark:text-white
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                      outline-none transition
                    "
                    placeholder="مثال: 09123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نام *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="
                      w-full px-4 py-2.5 rounded-xl
                      border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-[#0f172a]
                      text-gray-900 dark:text-white
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                      outline-none transition
                    "
                    placeholder="نام کامل"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      دسترسی ادمین
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddUser}
                    disabled={addUser.isPending}
                    className="
                      flex-1 py-2.5
                      bg-blue-500 hover:bg-blue-600
                      text-white text-sm font-medium
                      rounded-xl
                      transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {addUser.isPending ? "در حال افزودن..." : "افزودن عضو"}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="
                      px-6 py-2.5
                      bg-gray-100 hover:bg-gray-200
                      dark:bg-gray-700 dark:hover:bg-gray-600
                      text-gray-700 dark:text-gray-300
                      text-sm font-medium
                      rounded-xl
                      transition
                    "
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}