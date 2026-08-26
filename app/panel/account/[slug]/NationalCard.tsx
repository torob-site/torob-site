"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FileImage,
    CheckCircle,
    File,
    Image,
    Upload,
    Loader2,
    X,
    Save
} from "lucide-react";
import { axiosClient } from "@/lib/axios";
import { useCurrentShop } from "@/hooks/useCurrentShop";

interface NationalCardDocument {
    document_url: string;
}

// هوک برای دریافت تصویر کارت ملی
export function useGetNationalCard() {
    const { currentShop } = useCurrentShop();

    return useQuery({
        queryKey: ["national-card", currentShop?.id],
        queryFn: async () => {
            const { data } = await axiosClient.get(
                `/panel/shops/${currentShop.id}/national-card`,
            );
            return data;
        },
        enabled: !!currentShop?.id,
        retry: false,
    });
}

// هوک برای آپلود تصویر
export function useUploadNationalCard() {
    const { currentShop } = useCurrentShop();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const { data } = await axiosClient.post(
                `/panel/shops/${currentShop.id}/national-card/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return data;
        },
    });
}

// هوک برای ذخیره URL
export function useSaveNationalCard() {
    const queryClient = useQueryClient();
    const { currentShop } = useCurrentShop();

    return useMutation({
        mutationFn: async (documentUrl: string) => {
            const { data } = await axiosClient.post(
                `/panel/shops/${currentShop.id}/national-card`,
                { document_url: documentUrl },
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["national-card", currentShop?.id]
            });
        },
    });
}

export default function NationalCardSection() {
    const { currentShop } = useCurrentShop();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // دریافت تصویر کارت ملی
    const { data, isLoading, error } = useGetNationalCard();

    // آپلود تصویر
    const uploadMutation = useUploadNationalCard();

    // ذخیره URL
    const saveMutation = useSaveNationalCard();

    // استخراج image_url از آرایه
    const documents = data || [];
    const firstDocument = documents.length > 0 ? documents[0] : null;
    const savedImageUrl = firstDocument?.document_url || null;

    // تابع برای فرمت کردن حجم فایل
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // استخراج نام فایل از URL
    const getFileNameFromUrl = (url: string) => {
        if (!url) return 'national-card.jpg';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'national-card.jpg';
    };

    // هندلر انتخاب فایل
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // اعتبارسنجی فایل
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('فرمت فایل باید JPG یا PNG باشد');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('حجم فایل باید کمتر از ۵MB باشد');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadedUrl(null);
    };

    // هندلر آپلود و ذخیره
    const handleUploadAndSave = async () => {
        if (!selectedFile) {
            alert('لطفاً ابتدا یک فایل انتخاب کنید');
            return;
        }

        setIsUploading(true);

        uploadMutation.mutate(selectedFile, {
            onSuccess: (uploadData) => {
                const url = uploadData?.url || uploadData?.document_url || URL.createObjectURL(selectedFile);
                setUploadedUrl(url);
                setPreviewUrl(null);

                saveMutation.mutate(url, {
                    onSuccess: () => {
                        setIsUploading(false);
                        alert('تصویر کارت ملی با موفقیت ذخیره شد');
                        setSelectedFile(null);
                        setUploadedUrl(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    },
                    onError: (error) => {
                        setIsUploading(false);
                        alert('خطا در ذخیره تصویر');
                        console.error(error);
                    },
                });
            },
            onError: (error) => {
                setIsUploading(false);
                alert('خطا در آپلود فایل');
                console.error(error);
            },
        });
    };

    // هندلر لغو
    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadedUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!currentShop) {
        return (
            <div className="w-full max-w-[700px] mx-auto">
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">لطفاً یک فروشگاه انتخاب کنید</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-[700px] mx-auto">
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="mr-3 text-gray-500 dark:text-gray-400">در حال بارگذاری...</span>
                    </div>
                </div>
            </div>
        );
    }

    // نمایش تصویر نهایی
    const displayImage = savedImageUrl || uploadedUrl || previewUrl;
    const isImageSaved = !!savedImageUrl;

    return (
        <div dir="rtl" className="w-full max-w-[700px] mx-auto">
            {/* کارت اصلی */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">

                {/* عنوان */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <FileImage className="h-5 w-5 text-blue-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            تصویر کارت ملی
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        این مدرک به مشتریان نمایش داده نخواهد شد.
                    </p>
                </div>

                {/* زیرنویس */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        تصویر کارت ملی مالک فروشگاه
                    </p>
                </div>

                {/* نمایش تصویر */}
                {displayImage ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                            src={displayImage}
                            alt="کارت ملی"
                            className="w-full h-48 object-cover"
                        />
                    </div>
                ) : (
                    // حالت: بدون تصویر
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-[#0f172a] rounded-full flex items-center justify-center">
                                <Image className="h-8 w-8 text-gray-400" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تصویری انتخاب نشده است
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    برای آپلود تصویر روی دکمه زیر کلیک کنید
                                </p>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || saveMutation.isPending}
                                className="
                  inline-flex items-center gap-2
                  px-6 py-2.5
                  bg-blue-500 hover:bg-blue-600
                  text-white text-sm font-medium
                  rounded-xl
                  transition
                  shadow-lg shadow-blue-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                <Upload className="h-4 w-4" />
                                انتخاب فایل
                            </button>
                        </div>
                    </div>
                )}

                {/* Input فایل مخفی */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* اطلاعات فایل انتخاب شده */}
                {selectedFile && !isImageSaved && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-[#0f172a] rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <File className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                disabled={isUploading || saveMutation.isPending}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* راهنماهای فرمت */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-green-500 text-base">✓</span>
                            <span>فرمت‌های مجاز: PNG, JPG, JPEG</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500 text-base">✓</span>
                            <span>حداکثر حجم: ۵MB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer با دکمه ثبت */}
            <div
                className="
          fixed
          bottom-0
          left-0
          right-0
          z-40
          bg-white/95
          px-4
          py-3
          backdrop-blur
          dark:bg-[#0f172a]/95
          flex
          justify-center
          rounded-t-2xl
          shadow-lg
          shadow-gray-200/50
          dark:shadow-none
        "
            >
                <div className="w-full max-w-[700px] px-4">
                    <button
                        onClick={handleUploadAndSave}
                        disabled={
                            isImageSaved ||
                            !selectedFile ||
                            isUploading ||
                            saveMutation.isPending
                        }
                        className="
              w-full
              flex items-center justify-center gap-2
              py-3
              bg-blue-500 hover:bg-blue-600
              text-white text-sm font-medium
              rounded-xl
              transition
              shadow-lg shadow-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {isUploading || saveMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                در حال ثبت...
                            </>
                        ) : isImageSaved ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                ثبت شده
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                ثبت
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}