import type { Metadata, Viewport } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { isSearchEngineBotRequest } from "@/lib/i18n/bot-server";
import { I18nProvider, LocaleBootstrap } from "@/lib/i18n/client";
import { getTimezone } from "@/lib/timezone/server";
import { TimezoneProvider, TimezoneSync } from "@/lib/timezone/client";
import { defaultSiteMetadata } from "@/lib/seo";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AnalyticsListener } from "@/components/AnalyticsListener";
import { Analytics } from "@vercel/analytics/next";

// Nunito gives the warm, rounded, trustworthy feel of the PawSure brand. CJK
// text falls back to the system stack (PingFang/YaHei) to avoid shipping a
// multi-megabyte web font.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Favicon / apple-touch icons are provided via the file conventions
// src/app/icon.png and src/app/apple-icon.png.
export const metadata: Metadata = defaultSiteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const timeZone = await getTimezone();
  const forBot = await isSearchEngineBotRequest();
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
      {...(forBot ? { "data-seo-bot": "true" } : {})}
    >
      <body className="min-h-full w-full max-w-full overflow-x-clip">
        <GoogleAnalytics />
        <AnalyticsListener />
        <Analytics />
        <I18nProvider initialLocale={locale}>
          {!forBot && <LocaleBootstrap serverLocale={locale} />}
          <TimezoneProvider timeZone={timeZone}>
            <TimezoneSync serverTimeZone={timeZone} />
            {children}
          </TimezoneProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
