import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { getTimezone } from "@/lib/timezone/server";
import { TimezoneProvider, TimezoneSync } from "@/lib/timezone/client";

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
export const metadata: Metadata = {
  title: "PawSure 宠诺 · Every pet comes with confidence",
  description:
    "PawSure 宠诺 — trusted lifelong health passports for breeders, shops, and the families who adopt their pets.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const timeZone = await getTimezone();
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <I18nProvider locale={locale}>
          <TimezoneProvider timeZone={timeZone}>
            <TimezoneSync serverTimeZone={timeZone} />
            {children}
          </TimezoneProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
