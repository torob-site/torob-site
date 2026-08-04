// providers/auth-provider.tsx

"use client";

import { useEffect, useState } from "react";
import { authManager } from "@/components/auth-manager";
import AuthModal from "@/components/auth-modal";


export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [open, setOpen] = useState(false);


    useEffect(() => {

        return authManager.subscribe(() => {
            setOpen(true);
        });

    }, []);


    return (
        <>
            {children}


            <AuthModal
                open={open}
                onOpenChange={(value) => {

                    setOpen(value);

                }}
            />

        </>
    );
}