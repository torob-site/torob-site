"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import PhoneSelectModal from "@/components/phone-select-modal";
import AddPhoneModal from "@/components/add-phone-modal";
import { useGetContactInfo, useUpdateContactInfo } from "@/lib/apis";
import BaleIcon from "@/public/icons/BaleIcon";
import TelegramIcon from "@/public/icons/TelegramIcon";
import InstagramIcon from "@/public/icons/InstagramIcon";
import WhatsapIcon from "@/public/icons/WhatsapIcon";

const phones = ["09195707425", "09345701113"];

type PhoneTarget = "default" | "second" | "bale" | "whatsapp" | "telegram";

const messengerList = [
  {
    title: "بله",
    key: "bale",
    icon: <BaleIcon />,
  },
  {
    title: "واتساپ",
    key: "whatsapp",
    icon: <WhatsapIcon />,
  },
  {
    title: "تلگرام",
    key: "telegram",
    icon: <TelegramIcon />,
  },
];

const socialList = [
  {
    title: "کانال بله",
    platform: "bale",
    icon: <BaleIcon />,
  },
  {
    title: "کانال تلگرام",
    platform: "telegram",
    icon: <TelegramIcon />,
  },
  {
    title: "اینستاگرام",
    platform: "instagram",
    icon: <InstagramIcon />,
  },
];

export default function ContactPage() {
  const { data: contactInfo, isLoading } = useGetContactInfo();
  const updateContact = useUpdateContactInfo();

  const [open, setOpen] = useState(false);

  const [addPhoneOpen, setAddPhoneOpen] = useState(false);

  const [phoneTarget, setPhoneTarget] = useState<PhoneTarget>("default");

  const [values, setValues] = useState<Record<PhoneTarget, string>>({
    default: "",

    second: "",

    bale: "",

    whatsapp: "",

    telegram: "",
  });

  const [socials, setSocials] = useState<Record<string, string>>({
    "کانال بله": "",

    "کانال تلگرام": "",

    اینستاگرام: "",
  });

  useEffect(() => {
    if (!contactInfo) return;

    const messengerValues = {
      bale: "",
      whatsapp: "",
      telegram: "",
    };

    contactInfo.messengers?.forEach(
      (item: { platform: string; value: string }) => {
        if (item.platform in messengerValues) {
          messengerValues[item.platform as keyof typeof messengerValues] =
            item.value;
        }
      },
    );

    const socialValues = {
      "کانال بله": "",
      "کانال تلگرام": "",
      اینستاگرام: "",
    };

    contactInfo.social_medias?.forEach(
      (item: { platform: string; value: string }) => {
        if (item.platform === "bale") {
          socialValues["کانال بله"] = item.value;
        }

        if (item.platform === "telegram") {
          socialValues["کانال تلگرام"] = item.value;
        }

        if (item.platform === "instagram") {
          socialValues["اینستاگرام"] = item.value;
        }
      },
    );

    setValues({
      default: contactInfo.phone ?? "",

      second: contactInfo.second_phone ?? "",

      ...messengerValues,
    });

    setSocials(socialValues);
  }, [contactInfo]);

  function openPhoneModal(target: PhoneTarget) {
    setPhoneTarget(target);

    setOpen(true);
  }

  function SelectBox({
    value,
    onClick,
    onRemove,
  }: {
    value: string;
    onClick: () => void;
    onRemove?: () => void;
  }) {
    return (
      <div className="flex gap-2 flex-1">
        <button
          onClick={onClick}
          className="
flex-1
h-11
border
rounded-lg
px-4
flex
items-center
justify-between
text-sm
"
        >
          <span>{value || "انتخاب کنید"}</span>

          <ChevronDown size={18} />
        </button>

        {value && onRemove && (
          <button
            onClick={onRemove}
            className="
w-11
h-11
border
rounded-lg
flex
items-center
justify-center
"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="
max-w-[700px]
mx-auto
px-5
pb-32
"
    >
      <p
        className="
mt-6
text-sm
text-gray-600
text-right
"
      >
        لطفا شماره‌ای که برای تماس با فروشگاه نمایش داده می‌شود و شماره واتساپ
        خود را وارد کنید.
      </p>

      <div className="mt-8 space-y-5">
        <label className="font-bold">شماره تماس پیش فرض</label>

        <SelectBox
          value={values.default}
          onClick={() => openPhoneModal("default")}
        />

        {values.default &&
          values.second &&
          values.default === values.second && (
            <p
              className="
text-red-500
text-xs
text-right
"
            >
              شماره تلفن انتخاب شده نمی‌تواند با شماره پیش‌فرض یکی باشد
            </p>
          )}

        <label className="font-bold">
          شماره تماس دوم
          <span className="text-gray-400 mr-2 text-xs">اختیاری</span>
        </label>

        <SelectBox
          value={values.second}
          onClick={() => openPhoneModal("second")}
          onRemove={() => {
            setValues((prev) => ({
              ...prev,

              second: "",
            }));
          }}
        />

        <h3 className="font-bold mt-8">
          پیام‌رسان‌ها
          <span className="text-gray-400 mr-2 text-xs">اختیاری</span>
        </h3>

        {messengerList.map((item) => (
          <div
            key={item.key}
            className="
flex
gap-3
"
          >
            <Button
              variant="outline"
              className="
  w-36
  px-4
  h-10
  gap-2
  justify-center
  "
            >
              {item.icon}

              {item.title}
            </Button>

            <SelectBox
              value={values[item.key as PhoneTarget]}
              onClick={() => openPhoneModal(item.key as PhoneTarget)}
              onRemove={() => {
                setValues((prev) => ({
                  ...prev,

                  [item.key]: "",
                }));
              }}
            />
          </div>
        ))}

        <h3 className="font-bold mt-8">
          شبکه‌های اجتماعی
          <span className="text-gray-400 mr-2 text-xs">اختیاری</span>
        </h3>

        {socialList.map((item) => (
          <div
            key={item.title}
            className="
flex
gap-3
"
          >
            <Button
              variant="outline"
              className="
  w-36
  px-4
  h-10
  gap-2
  justify-center
  "
            >
              {item.icon}

              {item.title}
            </Button>

            <div className="flex flex-1 gap-2">
              <input
                value={socials[item.title]}
                onChange={(e) => {
                  setSocials((prev) => ({
                    ...prev,

                    [item.title]: e.target.value,
                  }));
                }}
                className="
h-11
border
rounded-lg
flex-1
px-3
text-left
"
              />

              {socials[item.title] && (
                <button
                  onClick={() => {
                    setSocials((prev) => ({
                      ...prev,

                      [item.title]: "",
                    }));
                  }}
                  className="
w-11
h-11
border
rounded-lg
flex
items-center
justify-center
"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div
        className="
                          fixed
                          bottom-0
                          left-1/2
                          z-30
                          w-full
                          max-w-[700px]
                          -translate-x-1/2
                          border-t
                          border-gray-200
                          bg-white
                          px-5
                          py-4
                          shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
                      "
      >
        <button
          type="button"
          onClick={() => {
            const payload = {
              phone: values.default,

              second_phone: values.second || undefined,

              messengers: messengerList
                .filter((item) => values[item.key as PhoneTarget])
                .map((item) => ({
                  platform: item.key.toUpperCase(),
                  value: values[item.key as PhoneTarget],
                })),

              social_medias: socialList
                .filter((item) => socials[item.title])
                .map((item) => ({
                  platform: item.platform.toUpperCase(),
                  value: socials[item.title],
                })),
            };

            updateContact.mutate({
              ...payload,
            });
          }}
          disabled={updateContact.isPending}
          className="
                              flex
                              h-11
                              w-full
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-600
                              text-sm
                              font-medium
                              text-white
                              transition
                              hover:bg-blue-700
                              disabled:cursor-not-allowed
                              disabled:bg-gray-300
                          "
        >
          {updateContact.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "ثبت"
          )}
        </button>
      </div>

      <PhoneSelectModal
        open={open}
        onClose={() => setOpen(false)}
        phones={phones}
        selected={values[phoneTarget]}
        onSelect={(phone) => {
          setValues((prev) => ({
            ...prev,

            [phoneTarget]: phone,
          }));
        }}
        onAddPhone={() => {
          setAddPhoneOpen(true);
        }}
      />

      <AddPhoneModal
        open={addPhoneOpen}
        onClose={() => setAddPhoneOpen(false)}
      />
    </div>
  );
}
