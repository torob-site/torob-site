import { useInfiniteQuery, useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { axiosClient } from "./axios";
import { useMemo } from "react";


export function useGetUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await axiosClient.get('/users/me')
      return res.data
    },
  })
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
        localStorage.setItem('token', data.token)
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useGetUserFavorites(only_ids = false, options?: Omit<
  UseQueryOptions<any, Error>,
  "queryKey" | "queryFn"
>) {
  return useQuery<any>({
    queryKey: ['favorites', only_ids],

    queryFn: async () => {

      const res = await axiosClient.get(
        `/users/me/favorites${only_ids ? "?only_ids=true" : ""}`
      );

      return res.data;
    },
    ...options
  });
}

export function usePostUserFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { product_id: number }) => {
      const res = await axiosClient.post(
        "/users/me/favorites/toggle",
        data
      );

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
    queryKey: ['histories'],
    queryFn: async () => {
      const res = await axiosClient.get('/users/me/histories')
      return res.data
    },
  })
}

export function useDeleteUserHistories() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.delete('/users/me/histories')
      return res.data
    },
    onError: console.error,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['histories'] })
    },
  })
}

export function usePostUserHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post('/users/me/histories', data)
      return res.data
    },
    onError: console.error,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['histories'] })
    },
  })
}

export function useGetCategories() {
  return useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosClient.get('/categories')
      return res.data
    },
  })
}

export function useGetUserAlerts(only_ids = false, options?: Omit<
  UseQueryOptions<any, Error>,
  "queryKey" | "queryFn"
>) {
  return useQuery<any>({
    queryKey: ['alerts', only_ids],
    queryFn: async () => {
      const res = await axiosClient.get(`/alerts${only_ids ? "?only_ids=true" : ""}`)
      return res.data
    },
    ...options
  })
}

export function useDeleteUserAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.delete('/alerts', data)
      return res.data
    },
    onError: console.error,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
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
      const {
        page,
        totalPages,
      } = lastPage.pagination;

      return page < totalPages
        ? page + 1
        : undefined;
    },
  });
}

export function useGetShop(shop_id: number, slug: string) {
  return useQuery<any>({
    queryKey: ['shops', shop_id, slug],
    queryFn: async () => {
      const res = await axiosClient.get(`/shops/${shop_id}/${slug}`)
      return res.data
    },
  })
}

export function useGetUserReports() {
  return useQuery<any>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await axiosClient.get('/reports')
      return res.data
    },
  })
}

export function useGetUserTickets() {
  return useQuery<any>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await axiosClient.get('/tickets')
      return res.data
    },
  })
}

export function useGetAutoComplete(keyword: string) {
  return useQuery<any>({
    queryKey: ['autocomplete', keyword],
    queryFn: async () => {
      const res = await axiosClient.get(`/search/autocomplete?keyword=${keyword}`)
      return res.data
    },
    enabled: keyword.trim().length > 0,
  })
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

  const queryKey = useMemo(
    () => ["search", queryString],
    [queryString]
  );

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
    queryKey: ['similar', product_id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosClient.get(
        `/products/${product_id}/similar?page=${pageParam}&limit=20`
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
        `/locations/provinces/${province_id}/cities`
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
      const res = await axiosClient.get(
        `/locations/cities/popular`
      );
      return res.data;
    },
  });
}

export function useGetProductPriceHistory(product_id: number) {
  return useQuery({
    queryKey: ["price-history", product_id],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/products/${product_id}/price-history`
      );
      return res.data;
    },
    enabled: !!product_id
  });
}