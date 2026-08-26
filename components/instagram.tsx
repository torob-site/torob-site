"use client";

import InstagramIcon from "@/components/instagram-svg";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import {
    useGetShopInstagramUserName,
    usePatchShopInstagramUserName,
} from "@/lib/apis";
import {
    ArrowLeft,
    Info,
    CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function InstagramComponent() {
    const { currentShop } = useCurrentShop();

    const {
        data,
        isPending: isLoadingUsername,
    } = useGetShopInstagramUserName();

    const patchInstagramUsername =
        usePatchShopInstagramUserName();

    const [username, setUsername] = useState("");

    useEffect(() => {
        if (data?.instagram_username !== undefined) {
            setUsername(data.instagram_username ?? "");
        }
    }, [data]);

    const handleSubmit = () => {
        const value = username.trim();

        if (!value || !currentShop) {
            return;
        }

        patchInstagramUsername.mutate({
            shop_id: currentShop.id,
            instagram_username: value,
        });
    };

    return (
        <div className="min-h-[calc(100vh-120px)] bg-white">

            {/* محتوا */}
            <div className="px-6 py-6">
                {/* Instagram Icon */}
                <div className="mt-2 flex justify-center">
                    <div
                        className="
                            flex
                            h-24
                            w-24
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-tr
                            from-yellow-400
                            via-pink-500
                            to-purple-600
                        "
                    >
                        <InstagramIcon className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* توضیحات */}
                <p className="mt-7 text-center text-sm leading-7 text-gray-700">
                    با اتصال حساب اینستاگرام خود، می‌توانید محصولات را مستقیماً از
                    پست‌های خود وارد کنید.
                </p>

                {/* Label + Input */}
                <div className="mt-12">
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                        شناسه با لینک اینستاگرام
                    </label>

                    <div className="flex h-11 overflow-hidden rounded-lg border border-gray-200">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={
                                isLoadingUsername
                                    ? "در حال دریافت..."
                                    : "شناسه اینستاگرام"
                            }
                            disabled={
                                isLoadingUsername ||
                                patchInstagramUsername.isPending
                            }
                            className="
                                flex-1
                                px-3
                                text-sm
                                text-gray-800
                                outline-none
                                placeholder:text-gray-400
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            "
                            dir="ltr"
                        />

                        <div
                            className="
                                flex
                                w-10
                                items-center
                                justify-center
                                border-r
                                border-gray-200
                                text-gray-500
                            "
                        >
                            @
                        </div>
                    </div>
                </div>

                {/* اطلاعیه Public */}
                <div
                    className="
                        mt-3
                        flex
                        min-h-12
                        items-center
                        gap-2
                        rounded-lg
                        bg-blue-50
                        px-4
                        py-3
                        text-sm
                        text-blue-700
                    "
                >
                    <Info className="h-5 w-5 shrink-0" />

                    <span>
                        پیج شما باید عمومی (Public) باشد.
                    </span>
                </div>

                {/* دسترسی */}
                <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />

                    <p className="text-sm text-gray-500">
                        با این کار، به ما اجازه می‌دهید تا محتوای عمومی صفحه شما را
                        برای نمایش محصولات استفاده کنیم.
                    </p>
                </div>

                {/* Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                        !username.trim() ||
                        !currentShop ||
                        isLoadingUsername ||
                        patchInstagramUsername.isPending
                    }
                    className="
                        mt-6
                        h-11
                        w-full
                        rounded-lg
                        bg-gray-200
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        enabled:bg-blue-600
                        enabled:text-white
                        enabled:hover:bg-blue-700
                        disabled:cursor-not-allowed
                    "
                >
                    {patchInstagramUsername.isPending
                        ? "در حال ذخیره..."
                        : "ثبت"}
                </button>
            </div>

            {/* بخش پایین */}
            <div className="mt-64 px-4 pb-6">
                <button
                    type="button"
                    className="
                        flex
                        h-14
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        bg-gradient-to-r
                        from-purple-500
                        to-pink-500
                        px-4
                        text-sm
                        font-bold
                        text-white
                    "
                >
                    <span className="flex items-center gap-2">
                        <InstagramIcon className="h-6 w-6 text-white" />

                        اینستاگرام
                    </span>

                    <span>
                        کل محصولات پیجت رو اضافه کن!
                    </span>
                </button>
            </div>
        </div>
    );
}