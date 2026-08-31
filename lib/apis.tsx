import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { axiosClient } from "./axios";
import { useMemo } from "react";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useGetUser() {
  return useQuery({
    queryKey: ["user"],
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get("/users/me");
      return res.data;
    },
  });
}

export function usePostAuthSendCode() {
  return useMutation<any>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post("/auth/send-code", payload);
      return res.data;
    },
  });
}

export function usePostAuthVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation<any>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post("/auth/verify-code", payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useGetUserFavorites(
  only_ids = false,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<any>({
    queryKey: ["favorites", only_ids],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/users/me/favorites${only_ids ? "?only_ids=true" : ""}`,
      );

      return res.data;
    },
    ...options,
  });
}

export function usePostUserFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { product_id: number }) => {
      const res = await axiosClient.post("/users/me/favorites/toggle", data);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
    onError: console.error,
  });
}

export function useGetUserHistories() {
  return useQuery<any>({
    queryKey: ["histories"],
    queryFn: async () => {
      const res = await axiosClient.get("/users/me/histories");
      return res.data;
    },
  });
}

export function useDeleteUserHistories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.delete("/users/me/histories");
      return res.data;
    },
    onError: console.error,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
  });
}

export function usePostUserHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post("/users/me/histories", data);
      return res.data;
    },
    onError: console.error,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
  });
}

export function useGetUserAlerts(
  only_ids = false,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<any>({
    queryKey: ["alerts", only_ids],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/users/me/alerts${only_ids ? "?only_ids=true" : ""}`,
      );
      return res.data;
    },
    ...options,
  });
}

export function useGetInfiniteShops(query?: string) {
  return useInfiniteQuery({
    queryKey: ["shops", query],

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const { data } = await axiosClient.get("/shops", {
        params: {
          page: pageParam,
          limit: 20,
          ...(query && { q: query }),
        },
      });

      return data;
    },

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useGetShop(shop_id: number) {
  return useQuery<any>({
    queryKey: ["shop", shop_id],
    queryFn: async () => {
      const res = await axiosClient.get(`/shops/${shop_id}`);
      return res.data;
    },
    enabled: !!shop_id,
  });
}

export function useGetUserReports() {
  return useQuery<any>({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await axiosClient.get("/users/me/reports");
      return res.data;
    },
  });
}

export function useGetUserTickets() {
  return useQuery<any>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await axiosClient.get("/users/me/tickets");
      return res.data;
    },
  });
}

export function useGetAutoComplete(keyword: string) {
  return useQuery<any>({
    queryKey: ["autocomplete", keyword],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/search/autocomplete?keyword=${keyword}`,
      );
      return res.data;
    },
    enabled: keyword.trim().length > 0,
  });
}

export function useSearch(params: Record<string, any>) {
  const stableParams = useMemo(() => {
    const { page, limit, ...rest } = params;
    return rest;
  }, [params]);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();

    Object.entries(stableParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => {
          qs.append(key, String(v));
        });
      } else {
        qs.set(key, String(value));
      }
    });

    return qs.toString();
  }, [stableParams]);

  const queryKey = useMemo(() => ["search", queryString], [queryString]);

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const qs = new URLSearchParams(queryString);
      qs.set("page", String(pageParam));
      qs.set("limit", "20");

      const res = await axiosClient.get(`/search?${qs.toString()}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(params.query) || Boolean(params.category_id),
    refetchOnWindowFocus: false,
  });
}

export function useGetSimilarProducts(product_id: number) {
  return useInfiniteQuery<any>({
    queryKey: ["similar", product_id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosClient.get(
        `/products/${product_id}/similar?page=${pageParam}&limit=20`,
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!product_id,
  });
}

export function useGetProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await axiosClient.get("/locations/provinces");
      return res.data;
    },
  });
}

export function useGetCities(province_id?: number) {
  return useQuery({
    queryKey: ["cities", province_id],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/locations/provinces/${province_id}/cities`,
      );
      return res.data;
    },
    enabled: !!province_id,
  });
}

export function useSelectCity() {
  return useMutation({
    mutationFn: async (city_id) => {
      const res = await axiosClient.post("/users/me/select-city", {
        city_id,
      });
      return res.data;
    },
  });
}

export function useGetPopularCities() {
  return useQuery({
    queryKey: ["popular-cities"],
    queryFn: async () => {
      const res = await axiosClient.get(`/locations/cities/popular`);
      return res.data;
    },
  });
}

export function useGetProductPriceHistory(product_id: number) {
  return useQuery({
    queryKey: ["price-history", product_id],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/products/${product_id}/price-history`,
      );
      return res.data;
    },
    enabled: !!product_id,
  });
}

export function useGetProduct(product_id: number) {
  return useQuery({
    queryKey: ["product", product_id],
    queryFn: async () => {
      const res = await axiosClient.get(`/products/${product_id}`);
      return res.data;
    },
    enabled: !!product_id,
  });
}

export function useGetProductMapOffers(product_id: number) {
  return useQuery<any>({
    queryKey: ["product-map-offers", product_id],
    queryFn: async () => {
      const res = await axiosClient.get(`/products/${product_id}/map/offers`);
      return res.data;
    },
    enabled: !!product_id,
  });
}

export function useGetProductOffers(product_id: number, filter?: string) {
  return useQuery<any>({
    queryKey: ["product-offers", product_id, filter ?? "all"],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter && filter !== "all") params.filter = filter;
      const res = await axiosClient.get(`/products/${product_id}/offers`, { params });
      return res.data;
    },
    enabled: !!product_id,
  });
}

export function useGetShopProducts(
  shop_id: number,
  filters?: Record<string, any>,
) {
  return useInfiniteQuery<any>({
    queryKey: ["shop-products", shop_id, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosClient.get(
        `/shops/${shop_id}/products?page=${pageParam}&limit=20`,
        {
          params: {
            ...filters,
          },
        },
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!shop_id,
  });
}

export function useGetMyShops() {
  return useQuery({
    queryKey: ["user-shops"],
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get("/panel/shops/my-shops");
      return res.data;
    },
  });
}

export function usePatchShopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      authModal: false,
    },
    mutationFn: async ({
      shop_id,
      is_active,
    }: {
      shop_id: number;
      is_active: boolean;
    }) => {
      const res = await axiosClient.patch(`/panel/shops/${shop_id}/status`, {
        is_active,
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-shops"],
      });
    },
  });
}

export function useGetShopInstagramUserName() {
  const { currentShop } = useCurrentShop();
  return useQuery({
    queryKey: ["shop-instagram-username", currentShop?.id],
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get(
        `/panel/shops/${currentShop.id}/instagram-username`,
      );
      return res.data;
    },
    enabled: !!currentShop?.id,
  });
}

export function usePatchShopInstagramUserName() {
  return useMutation({
    meta: {
      authModal: false,
    },

    mutationFn: async ({
      shop_id,
      instagram_username,
    }: {
      shop_id: number;
      instagram_username: string;
    }) => {
      const res = await axiosClient.patch(
        `/panel/shops/${shop_id}/instagram-username`,
        {
          instagram_username,
        },
      );

      return res.data;
    },
    onSuccess: () => {
      toast.success("اکانت اینستاگرام با موفقیت ثبت شد");
    },
  });
}

export function useGetShopStatus() {
  const { currentShop } = useCurrentShop();
  return useQuery({
    queryKey: ["shop-status", currentShop?.id],
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get(
        `/panel/shops/${currentShop.id}/status`,
      );
      return res.data;
    },
    enabled: !!currentShop?.id,
  });
}

export function useGetShopOwnerInfo() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-owner-info", currentShop?.id],
    enabled: !!currentShop?.id,
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get(
        `/panel/shops/${currentShop.id}/owner-info`,
      );

      return res.data;
    },
  });
}

export function useGetBusinessTypes() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["business-types", currentShop?.id],
    enabled: !!currentShop?.id,
    meta: {
      authModal: false,
    },
    queryFn: async () => {
      const res = await axiosClient.get(
        `/panel/shops/${currentShop.id}/business-types`,
      );

      return res.data;
    },
  });
}

interface UpdateBusinessTypeData {
  business_type: string;
}

export function useUpdateBusinessType() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (data: UpdateBusinessTypeData) => {
      const res = await axiosClient.patch(
        `/panel/shops/${currentShop.id}/business-type`,
        data,
      );

      return res.data;
    },
    meta: {
      authModal: false,
    },
    onSuccess: () => {
      toast.success("نوع کسب و کار با موفقیت ثبت شد");
      queryClient.invalidateQueries({
        queryKey: ["business-types", currentShop.id],
      });
    },
  });
}

export function useGetShopProfile() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-profile", currentShop?.id],
    enabled: !!currentShop?.id,

    meta: {
      authModal: false,
    },

    queryFn: async () => {
      const res = await axiosClient.get(
        `/panel/shops/${currentShop.id}/profile`,
      );

      return res.data;
    },
  });
}

export function useGetShopImages() {
  const { currentShop } = useCurrentShop();
  return useQuery({
    queryKey: ["shop-images", currentShop?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop.id}/images`,
      );

      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export function useGetWorkingHours() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["working-hours", currentShop?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop.id}/working-hours`,
      );
      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export function usePostWorkingHours() {
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (workingHours: any) => {
      const { data } = await axiosClient.post(
        `/panel/shops/${currentShop.id}/working-hours`,
        workingHours,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("ساعات کاری با موفقیت ذخیره شد.");
    },
  });
}

export function useGetShopTransactions() {
  const { currentShop } = useCurrentShop();
  return useQuery({
    queryKey: ["shop-transactions", currentShop?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop!.id}/transactions`,
      );
      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export type StatisticsRange = "24h" | "7d" | "30d";

export function useGetShopStatistics(
  range: StatisticsRange,
  product_id?: number,
) {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-statistics", currentShop?.id, product_id, , range],

    queryFn: async () => {
      const params = new URLSearchParams();

      params.set("range", range);

      if (product_id) {
        params.set("product_id", String(product_id));
      }
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop!.id}/statistics`,
        {
          params,
        },
      );

      return data;
    },

    enabled: !!currentShop?.id || !!product_id,
  });
}

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

export type ReportType =
  | "PRICE_CHANGE_AFTER_ORDER"
  | "AVAILABILITY_CHANGE_AFTER_ORDER"
  | "INCORRECT_SHOP_INFO"
  | "PRODUCT_INFO_MISMATCH"
  | "FREE_SHIPPING"
  | "SAME_DAY_DELIVERY"
  | "PAYMENT_ON_DELIVERY"
  | "IRREGULAR_SHIPPING_COST_AS_PRICE_REPORT"
  | "OTHER";

type Report = {
  id: number;
  description: string | null;
  price_at_report_time: number;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  created_at: string;
  updated_at: string;

  product: {
    id: number;
    name: string;
  };

  reason: {
    id: number;
    title: string;
    type: "OPTION" | "OPTION_LIST" | "REDIRECT_TO_COMPLAINT";
    report_type: string | null;
    needs_description: boolean;
  };
};

export interface ReportsResponse {
  reports: Report[];
}

export enum ReportAction {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export interface UpdateReportStatusPayload {
  action: ReportAction;
  new_price?: number;
}

export function useGetReports() {
  const { currentShop } = useCurrentShop();

  return useQuery<ReportsResponse>({
    queryKey: ["reports", currentShop?.id],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop!.id}/reports`,
      );

      return data;
    },

    enabled: !!currentShop?.id,
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async ({
      reportId,
      payload,
    }: {
      reportId: number;
      payload: UpdateReportStatusPayload;
    }) => {
      const { data } = await axiosClient.patch(
        `/panel/reports/${reportId}/status`,
        payload,
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reports", currentShop?.id],
      });
    },
  });
}
export interface CreateAlertDto {
  product_id: number;
  watch_price?: number | null;
  watch_availability?: boolean | null;
}

export function useGetProductAlert(productId: number) {
  return useQuery({
    queryKey: ["product-alert", productId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/users/me/alerts/products/${productId}`,
      );
      return response.data;
    },
    enabled: false,
  });
}

export function usePostUserAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAlertDto) => {
      const hasPrice = data.watch_price != null && data.watch_price > 0;
      const hasAvailability = data.watch_availability === true;

      if (!hasPrice && !hasAvailability) {
        throw new Error(
          "حداقل یکی از گزینه‌های قیمت یا موجودی باید انتخاب شود",
        );
      }

      if (hasPrice && hasAvailability) {
        throw new Error(
          "فقط یکی از گزینه‌های قیمت یا موجودی می‌تواند انتخاب شود",
        );
      }

      const payload: any = {
        product_id: data.product_id,
      };

      if (hasPrice) {
        payload.watch_price = data.watch_price;
      }

      if (hasAvailability) {
        payload.watch_availability = true;
      }

      const response = await axiosClient.post("/users/me/alerts", payload);
      return response.data;
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || "خطا در ثبت اعلان";
      toast.error(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alerts"],
      });
    },
  });
}
export interface RemoveAlertDto {
  product_id: number;
}
export function useDeleteUserAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RemoveAlertDto) => {
      const response = await axiosClient.delete("/users/me/alerts", {
        data: { product_id: data.product_id },
      });
      return response.data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "خطا در حذف اعلان";
      toast.error(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alerts"],
      });
    },
  });
}

export function useGetContactInfo() {
  const { currentShop } = useCurrentShop();
  return useQuery({
    queryKey: ["shop-contact-info", currentShop?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/contact-info`,
      );

      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export function useUpdateContactInfo() {
  const { currentShop } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosClient.patch(
        `/panel/shops/${currentShop?.id}/contact-info`,
        data,
      );

      return res.data;
    },

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["shop-contact-info", currentShop?.id],
      });
    },
  });
}

export function useGetLocation() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-location", currentShop?.id],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/location`,
      );

      return data;
    },

    enabled: !!currentShop?.id,
  });
}

export function useUpdateLocation() {
  const { currentShop } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      address: string;
      province_id: number;
      city_id: number;
      latitude: number;
      longitude: number;
    }) => {
      const res = await axiosClient.patch(
        `/panel/shops/${currentShop?.id}/location`,
        data,
      );
      return res.data;
    },

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["shop-location", currentShop?.id],
      });
    },
  });
}

export function useUpdateOwnerInfo() {
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async (data: {
      national_code: string;
      first_name: string;
      last_name: string;
      birth_date: string;
      mobile_phone: string;
    }) => {
      const res = await axiosClient.patch(
        `/panel/shops/${currentShop?.id}/owner-info`,
        data,
      );
      return res.data;
    },

    onSuccess() {
      toast.success("اطلاعات مالک با موفقیت به‌روزرسانی شد");
    },

    onError(error: any) {
      console.error("Error updating owner info:", error);

      let errorMessages: string[] = [];

      if (error?.response?.data) {
        const responseData = error.response.data;

        if (responseData.message && Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (
          responseData.message &&
          typeof responseData.message === "string"
        ) {
          errorMessages = [responseData.message];
        } else if (responseData.errors) {
          const allErrors = Object.values(responseData.errors).flat();
          errorMessages = allErrors as string[];
        } else if (responseData.statusCode && responseData.message) {
          if (Array.isArray(responseData.message)) {
            errorMessages = responseData.message;
          } else {
            errorMessages = [responseData.message];
          }
        }
      }

      if (errorMessages.length === 0) {
        errorMessages = ["خطا در به‌روزرسانی اطلاعات مالک"];
      }

      if (errorMessages.length === 1) {
        toast.error(errorMessages[0]);
      } else {
        toast.error(
          <div className="space-y-1">
            <ul className="list-disc pr-4 space-y-1">
              {errorMessages.map((msg, index) => (
                <li key={index} className="text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          </div>,
          {
            duration: 5000,
          },
        );
      }
    },
  });
}

export function useGetAddress() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-address", currentShop?.id],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/address`,
      );

      return data;
    },

    enabled: !!currentShop?.id,
  });
}

export function useGetIdentityVideo() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["shop-address", currentShop?.id],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/identity-video`,
      );

      return data;
    },

    enabled: !!currentShop?.id,
  });
}

export function useGetBusinessLicense(
  shopId: number | undefined,
  type: string | null,
) {
  return useQuery({
    queryKey: ["business-license", shopId, type],
    queryFn: async () => {
      if (!shopId || !type) return null;

      const { data } = await axiosClient.get(
        `/panel/shops/${shopId}/certificate/${type}`,
      );

      return data;
    },
    enabled: !!shopId && !!type,
  });
}

export function useGetShopProductDetails(product_id: number) {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["product", currentShop?.id, product_id],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/products/${product_id}`,
      );

      return data;
    },
    enabled: !!currentShop?.id || !!product_id,
  });
}

export function useGetWarranties() {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["warranties"],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop?.id}/warranties`,
      );

      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export function useDeleteShopProduct(product_id: number) {
  const { currentShop } = useCurrentShop();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosClient.delete(
        `/panel/shops/${currentShop?.id}/products/${product_id}`,
        data,
      );

      return res.data;
    },
    onSuccess: () => {
      router.push("/panel");
      queryClient.invalidateQueries({
        queryKey: ["products", currentShop?.id],
      });
    },
  });
}

export function useGetOfferHistory(productId?: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["offer-history", productId, page, limit],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/products/${productId}/offer-history`,
        {
          params: {
            page,
            limit,
          },
        },
      );

      return data;
    },

    enabled: !!productId,
  });
}

export function useGetPurchaseDetail(id: number) {
  return useQuery({
    queryKey: ["purchase-detail", id],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/users/me/purchases/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useGetUserPurchases(search?: string) {
  return useInfiniteQuery({
    queryKey: ["purchases", search],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        page: pageParam,
        limit: 20,
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const { data } = await axiosClient.get("/users/me/purchases", {
        params,
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useGetPriceList(categoryId: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["price-list", categoryId, page, limit],

    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/products/price-list/${categoryId}`,
        {
          params: {
            page,
            limit,
          },
        },
      );

      return data;
    },

    enabled: Number.isFinite(categoryId),
  });
}

export function useGetReportOptions(
  shop_type?: "ONLINE_SHOP" | "OFFLINE_SHOP",
) {
  return useQuery({
    queryKey: ["report-options", shop_type],
    queryFn: async () => {
      const { data } = await axiosClient.get("/reports/options", {
        params: {
          shop_type,
        },
      });

      return data;
    },
    enabled: !!shop_type,
  });
}

interface CreateReportPayload {
  shop_id: number;
  product_id: number;
  report_reason_id: number;
  description?: string | null;
}

export function usePostUserReport() {
  return useMutation({
    mutationFn: async (data: CreateReportPayload) => {
      const response = await axiosClient.post("/users/me/reports", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('گزارش ثبت شد')
    }
  });
}
