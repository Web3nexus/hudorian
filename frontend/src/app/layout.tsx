import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUDORIAN | A Private World of Extraordinary Places",
  description: "A private members club built around a collection of Houses, Estates, Stays, Wellness facilities, and member-only events.",
  keywords: ["private members club", "luxury stays", "exclusive houses", "editorial hospitality", "HUDORIAN"],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/images/hudorian-seal.png', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: "HUDORIAN | Private Members Club",
    description: "Exclusive houses, estates and clubs in the world's most inspiring destinations. For members only.",
    type: "website",
    locale: "en_GB",
  },
};

import { CmsProvider } from "@/lib/cms";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#141414]">
        <CmsProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
