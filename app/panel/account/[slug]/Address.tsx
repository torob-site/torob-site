"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationMap from "@/components/location-map";
import {
  getProvinceCities,
  useGetLocation,
  useGetProvinces,
  useUpdateLocation,
} from "@/lib/apis";

export default function LocationPage() {
  const { data: location, isLoading, refetch } = useGetLocation();
  const { data: provinces = [] } = useGetProvinces();
  const updateLocation = useUpdateLocation();

  const [form, setForm] = useState({
    address: "",
    province_id: undefined as number | undefined,
    city_id: undefined as number | undefined,
    latitude: 35.0,
    longitude: 51.0,
  });

  const { data: cities = [] } = getProvinceCities(form.province_id);

  useEffect(() => {
    if (location) {
      setForm({
        address: location.address ?? "",
        province_id: location.province?.id,
        city_id: location.city?.id,
        latitude: location.latitude ?? 35,
        longitude: location.longitude ?? 51,
      });
    }
  }, [location]);

  // بررسی کامل بودن اطلاعات
  const hasInitialLocation =
    !!location?.address &&
    !!location?.province &&
    !!location?.city &&
    !!location?.latitude &&
    !!location?.longitude;

  // اگر اطلاعات کامل باشد، غیرفعال است
  const isFullyDisabled = hasInitialLocation;

  // بررسی اینکه آیا دکمه ثبت باید نمایش داده شود
  const showSubmitButton = !hasInitialLocation;

  function updateField(key: keyof typeof form, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    // اعتبارسنجی ساده در فرانت
    if (!form.province_id || !form.city_id || !form.address) {
      // می‌توانید یک toast error نشان دهید
      console.error("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    await updateLocation.mutateAsync({
      address: form.address,
      province_id: form.province_id,
      city_id: form.city_id,
      latitude: form.latitude,
      longitude: form.longitude,
    });

    await refetch();
  }

  if (isLoading) return <div>درحال دریافت اطلاعات...</div>;

  return (
    <div className="space-y-6 p-5 pb-28" dir="rtl">
      <div>
        <Label className="mb-4">استان</Label>
        <Select
          value={String(form.province_id ?? "")}
          disabled={isFullyDisabled}
          onValueChange={(value) => {
            setForm((prev) => ({
              ...prev,
              province_id: Number(value),
              city_id: undefined, // ریست کردن شهر هنگام تغییر استان
            }));
          }}
        >
          <SelectTrigger className="w-full py-5">
            <SelectValue placeholder="انتخاب استان" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {provinces.map((item: any) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-4">شهر</Label>
        <Select
          value={String(form.city_id ?? "")}
          disabled={isFullyDisabled || !form.province_id}
          onValueChange={(value) => {
            updateField("city_id", Number(value));
          }}
        >
          <SelectTrigger className="w-full py-5">
            <SelectValue placeholder="انتخاب شهر" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {cities.map((item: any) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-4">موقعیت روی نقشه</Label>
        <LocationMap
          latitude={form.latitude}
          longitude={form.longitude}
          disabled={isFullyDisabled}
          onChange={(lat, lng) => {
            setForm((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
            }));
          }}
        />
      </div>

      <div>
        <Label className="mb-4">آدرس دقیق</Label>
        <Input
          value={form.address}
          disabled={isFullyDisabled}
          className="py-6"
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="آدرس دقیق خود را وارد کنید..."
        />
      </div>

      {showSubmitButton && (
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
            onClick={handleSubmit}
            disabled={
              updateLocation.isPending ||
              !form.province_id ||
              !form.city_id ||
              !form.address ||
              !form.latitude ||
              !form.longitude
            }
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
            {updateLocation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "ثبت اطلاعات"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
