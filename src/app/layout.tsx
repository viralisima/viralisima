import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import Header from "@/components/Header";

const ADSENSE_ID = "ca-pub-2858145565650267";
const GA_ID = "G-L7MY2DFZLE";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viralisima.com"),
  title: {
    default: "Viralísima — Quizzes virales en español",
    template: "%s | Viralísima",
  },
  description:
    "Los quizzes, tests y generadores más virales en español. Descubre qué famoso eres, cuánto sabes de música y más. Gratis, sin registro.",
  openGraph: {
    siteName: "Viralísima",
    locale: "es_ES",
    type: "website",
  },
  verification: {
    google: "fHIn0dZ8fDrZNNW34_CxtqNLLweR5HFfLuQLH4EtQvE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Analytics />
        <SpeedInsights />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `}
        </Script>
      </body>
    </html>
  );
}
