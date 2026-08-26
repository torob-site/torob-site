import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import QueryProvider from "@/components/query-provider";
import AuthProvider from "@/components/auth-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
const myFont = localFont({
  src: [
    {
      path: "../public/assets/Vazirmatn-Regular.ttf",
      weight: "400",
    },
  ],
});
export const metadata: Metadata = {
  title: "ترب | بهترین قیمیت بازار",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="fa" dir="rtl" className={myFont.className}>
      <body className="dark:bg-[#15202b] bg-[#f1f5f9]">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <AuthProvider>
                <NuqsAdapter>
                  {children}
                  <Toaster />
                </NuqsAdapter>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
