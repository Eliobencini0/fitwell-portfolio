import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { translate } from "@/i18n/define";
import { common } from "@/i18n/messages/common";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Fitwell",
    description: translate(common, locale, "appDescription"),
    applicationName: "Fitwell",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Fitwell",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1118",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.className} antialiased`}>
        <LocaleProvider locale={locale}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </LocaleProvider>
        <Toaster />
      </body>
    </html>
  );
}
