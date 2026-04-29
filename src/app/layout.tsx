import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/shared/store/UserContext";
import { getUser } from "@/shared/lib/getUser";
import { Providers } from "./providers";
import { getLocale, getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { type Locale } from '@/i18n/config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EquiPay - Share Expenses",
  description: "EquiPay is a simple and intuitive expense sharing app that helps you split bills and manage group expenses with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const locale = await getLocale() as Locale;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider initialLocale={locale} initialMessages={messages as Record<string, unknown>}>
          <Providers>
            <UserProvider user={user}>{children}</UserProvider>
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
