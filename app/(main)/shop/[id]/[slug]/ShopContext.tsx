"use client"

import {
    createContext,
    useContext,
} from "react"

const ShopContext = createContext<any>(null)

export function ShopProvider({
    shop,
    children,
}: {
    shop: any
    children: React.ReactNode
}) {
    return (
        <ShopContext.Provider value={shop}>
            {children}
        </ShopContext.Provider>
    )
}

export function useShop() {
    return useContext(ShopContext)
}