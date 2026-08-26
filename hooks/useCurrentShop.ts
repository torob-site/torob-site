"use client";

import {
    useEffect,
    useMemo,
} from "react";

import {
    useLocalStorage,
} from "@uidotdev/usehooks";

import {
    useGetMyShops,
} from "@/lib/apis";

export function useCurrentShop() {
    const [
        shopId,
        setShopId,
    ] = useLocalStorage<number | null>(
        "shop_id",
        null
    );

    const {
        data: shops = [],
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetMyShops();

    /**
     * -----------------------------------------
     * Current Shop
     * -----------------------------------------
     *
     * اول:
     * shop ذخیره شده در localStorage
     *
     * اگر وجود نداشت:
     * اولین shop
     */
    const currentShop = useMemo(() => {
        if (shops.length === 0) {
            return null;
        }

        const savedShop = shops.find(
            (shop) =>
                shop.id === shopId
        );

        return (
            savedShop ??
            shops[0]
        );
    }, [
        shops,
        shopId,
    ]);

    /**
     * -----------------------------------------
     * ذخیره shop فعلی
     * -----------------------------------------
     */
    useEffect(() => {
        if (!currentShop) {
            return;
        }

        if (
            currentShop.id !== shopId
        ) {
            setShopId(
                currentShop.id
            );
        }
    }, [
        currentShop,
        shopId,
        setShopId,
    ]);

    /**
     * -----------------------------------------
     * تغییر فروشگاه
     * -----------------------------------------
     */
    const selectShop = (
        shop
    ) => {
        setShopId(
            shop.id
        );
    };

    return {
        shops,

        currentShop,

        shopId:
            currentShop?.id ?? null,

        selectShop,

        isLoading: isPending,

        isFetching,

        isError,

        error,

        refetch,
    };
}