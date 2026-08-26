"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

type LoginStep = "phone" | "otp";

const OFFLINE_SHOPS_LOGO =
    "https://panel.torob.com/o/assets/images/offline-shops-logo.svg";

export default function PanelLoginPage() {
    const [step, setStep] = useState<LoginStep>("phone");

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    const [timeLeft, setTimeLeft] = useState(116);

    const [loading, setLoading] = useState(false);

    // ==========================================
    // OTP TIMER
    // ==========================================

    useEffect(() => {
        if (step !== "otp") {
            return;
        }

        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    // ==========================================
    // FORMAT TIMER
    // ==========================================

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    // ==========================================
    // NORMALIZE PERSIAN / ARABIC NUMBERS
    // ==========================================

    const normalizeNumbers = (value: string) => {
        return value
            .replace(/[۰-۹]/g, (char) =>
                String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)),
            )
            .replace(/[٠-٩]/g, (char) =>
                String("٠١٢٣٤٥٦٧٨٩".indexOf(char)),
            );
    };

    // ==========================================
    // NORMALIZE PHONE
    // ==========================================

    const normalizePhone = (value: string) => {
        return normalizeNumbers(value)
            .replace(/\D/g, "")
            .slice(0, 11);
    };

    // ==========================================
    // SEND OTP
    // ==========================================

    const handlePhoneSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const normalizedPhone = normalizePhone(phone);

        if (normalizedPhone.length !== 11) {
            return;
        }

        try {
            setLoading(true);

            /*
             * بعداً API واقعی را اینجا قرار بده:
             *
             * await sendLoginCode({
             *     phone: normalizedPhone,
             * });
             */

            console.log("SEND OTP:", normalizedPhone);

            setPhone(normalizedPhone);
            setOtp("");
            setTimeLeft(116);
            setStep("otp");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // VERIFY OTP
    // ==========================================

    const handleOtpSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (otp.length !== 6) {
            return;
        }

        try {
            setLoading(true);

            /*
             * بعداً API واقعی ورود را اینجا قرار بده:
             *
             * const response = await login({
             *     phone,
             *     code: otp,
             * });
             *
             * localStorage.setItem(
             *     "token",
             *     response.token,
             * );
             *
             * router.replace("/panel");
             */

            console.log("VERIFY OTP:", {
                phone,
                otp,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // EDIT PHONE
    // ==========================================

    const handleEditPhone = () => {
        setOtp("");
        setTimeLeft(116);
        setStep("phone");
    };

    // ==========================================
    // RESEND OTP
    // ==========================================

    const handleResend = async () => {
        if (timeLeft > 0) {
            return;
        }

        try {
            /*
             * API ارسال مجدد کد:
             *
             * await sendLoginCode({
             *     phone,
             * });
             */

            console.log("RESEND OTP:", phone);

            setTimeLeft(116);
        } catch (error) {
            console.error(error);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <main
            dir="rtl"
            className="
                min-h-screen
                bg-white
            "
        >
            <div
                className="
                    mx-auto
                    min-h-screen
                    w-full
                    max-w-[870px]
                    border-x
                    border-[#e5e7eb]
                    bg-white
                "
            >
                <div
                    className="
                        flex
                        min-h-screen
                        flex-col
                        px-7
                        sm:px-10
                    "
                >
                    {/* ================================= */}
                    {/* MAIN CONTENT */}
                    {/* ================================= */}

                    <div
                        className="
                            flex
                            flex-1
                            flex-col
                            items-center
                            pt-[96px]
                        "
                    >
                        {/* ================================= */}
                        {/* LOGO */}
                        {/* ================================= */}

                        <div
                            className="
                                flex
                                h-[100px]
                                w-[100px]
                                items-center
                                justify-center
                            "
                        >
                            <img
                                src={OFFLINE_SHOPS_LOGO}
                                alt="پنل فروشندگان حضوری ترب"
                                className="
                                    h-[100px]
                                    w-[100px]
                                    object-contain
                                "
                            />
                        </div>

                        {/* ================================= */}
                        {/* TITLE */}
                        {/* ================================= */}

                        <h1
                            className="
                                mt-5
                                text-[20px]
                                font-bold
                                leading-8
                                text-[#202124]
                            "
                        >
                            پنل فروشندگان حضوری ترب
                        </h1>

                        {/* ================================= */}
                        {/* FORM */}
                        {/* ================================= */}

                        <div
                            className="
                                mt-[52px]
                                w-full
                                max-w-[816px]
                            "
                        >
                            {/* ================================= */}
                            {/* PHONE STEP */}
                            {/* ================================= */}

                            {step === "phone" && (
                                <form
                                    onSubmit={handlePhoneSubmit}
                                    className="w-full"
                                >
                                    {/* LABEL */}

                                    <label
                                        htmlFor="phone"
                                        className="
                                            mb-3
                                            block
                                            text-[15px]
                                            font-medium
                                            text-[#202124]
                                        "
                                    >
                                        تلفن همراه خود را وارد کنید.
                                    </label>

                                    {/* PHONE */}

                                    <input
                                        id="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        dir="ltr"
                                        value={phone}
                                        onChange={(event) => {
                                            setPhone(
                                                normalizePhone(
                                                    event.target.value,
                                                ),
                                            );
                                        }}
                                        placeholder="مثلاً: 09123456789"
                                        className="
                                            h-[52px]
                                            w-full
                                            rounded-[9px]
                                            border
                                            border-[#d9dde3]
                                            bg-white
                                            px-4
                                            text-right
                                            text-[14px]
                                            text-[#202124]
                                            outline-none
                                            transition
                                            placeholder:text-[#9ca3af]
                                            focus:border-[#3474dc]
                                            focus:ring-2
                                            focus:ring-[#3474dc]/10
                                        "
                                    />

                                    {/* LOGIN BUTTON */}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            normalizePhone(phone)
                                                .length !== 11
                                        }
                                        className="
                                            mt-[18px]
                                            h-[52px]
                                            w-full
                                            rounded-[9px]
                                            bg-[#3474dc]
                                            text-[17px]
                                            font-bold
                                            text-white
                                            transition
                                            hover:bg-[#2864c7]
                                            disabled:cursor-not-allowed
                                            disabled:bg-[#dfe2e6]
                                            disabled:text-[#8b8f94]
                                        "
                                    >
                                        {loading
                                            ? "در حال ارسال..."
                                            : "ورود به پنل فروشندگان"}
                                    </button>
                                </form>
                            )}

                            {/* ================================= */}
                            {/* OTP STEP */}
                            {/* ================================= */}

                            {step === "otp" && (
                                <form
                                    onSubmit={handleOtpSubmit}
                                    className="w-full"
                                >
                                    {/* TITLE */}

                                    <div
                                        className="
                                            text-center
                                            text-[15px]
                                            font-medium
                                            text-[#202124]
                                        "
                                    >
                                        دریافت کد تایید
                                    </div>

                                    {/* OTP INPUT */}

                                    <div className="mt-6">
                                        <div
                                            className="
                                                flex
                                                h-[52px]
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-[9px]
                                                border
                                                border-[#d9dde3]
                                                bg-white
                                                px-1
                                            "
                                        >
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                dir="ltr"
                                                value={otp}
                                                onChange={(event) => {
                                                    setOtp(
                                                        normalizeNumbers(
                                                            event.target.value,
                                                        )
                                                            .replace(
                                                                /\D/g,
                                                                "",
                                                            )
                                                            .slice(0, 6),
                                                    );
                                                }}
                                                placeholder="مثلاً: 133456"
                                                className="
                                                    h-full
                                                    min-w-0
                                                    flex-1
                                                    bg-transparent
                                                    px-4
                                                    text-right
                                                    text-[14px]
                                                    outline-none
                                                    placeholder:text-[#9ca3af]
                                                "
                                            />

                                            {/* TIMER */}

                                            <div
                                                className="
                                                    flex
                                                    h-[40px]
                                                    min-w-[68px]
                                                    items-center
                                                    justify-center
                                                    rounded-[9px]
                                                    bg-[#eef0f3]
                                                    px-3
                                                    text-[13px]
                                                    text-[#6b7280]
                                                "
                                                dir="ltr"
                                            >
                                                {formatTime(timeLeft)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SENT PHONE */}

                                    <div
                                        className="
                                            mt-5
                                            flex
                                            flex-wrap
                                            items-center
                                            justify-center
                                            gap-2
                                            text-[14px]
                                            font-medium
                                            text-[#202124]
                                        "
                                    >
                                        <span>
                                            ارسال کد تایید به:
                                        </span>

                                        <span dir="ltr">
                                            {phone}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleEditPhone}
                                            className="
                                                mr-1
                                                flex
                                                items-center
                                                gap-1
                                                text-[#3474dc]
                                                transition
                                                hover:text-[#2864c7]
                                            "
                                        >
                                            <Pencil
                                                className="
                                                    h-4
                                                    w-4
                                                "
                                            />

                                            <span>
                                                ویرایش
                                            </span>
                                        </button>
                                    </div>

                                    {/* CONFIRM BUTTON */}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            otp.length !== 6
                                        }
                                        className="
                                            mt-[38px]
                                            h-[52px]
                                            w-full
                                            rounded-[9px]
                                            bg-[#dfe1e5]
                                            text-[17px]
                                            font-medium
                                            text-[#7b7f84]
                                            transition
                                            hover:bg-[#d4d7db]
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {loading
                                            ? "در حال بررسی..."
                                            : "تایید"}
                                    </button>

                                    {/* RESEND */}

                                    <div
                                        className="
                                            mt-5
                                            text-center
                                            text-[14px]
                                            text-[#202124]
                                        "
                                    >
                                        {timeLeft > 0 ? (
                                            <>
                                                <span>
                                                    امکان ارسال مجدد
                                                    کد تا{" "}
                                                </span>

                                                <span
                                                    className="
                                                        font-medium
                                                    "
                                                    dir="ltr"
                                                >
                                                    {formatTime(
                                                        timeLeft,
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleResend
                                                }
                                                className="
                                                    font-medium
                                                    text-[#3474dc]
                                                    hover:underline
                                                "
                                            >
                                                ارسال مجدد کد
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ================================= */}
                        {/* REGISTER */}
                        {/* ================================= */}

                        <div
                            className="
                                mt-auto
                                pb-[85px]
                                pt-10
                                text-center
                                text-[14px]
                                text-[#202124]
                            "
                        >
                            <span>
                                هنوز ثبت نام نکرده‌اید؟
                            </span>

                            <button
                                type="button"
                                className="
                                    mr-1
                                    font-bold
                                    text-[#3474dc]
                                    hover:underline
                                "
                            >
                                همین حالا ثبت نام کنید!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}