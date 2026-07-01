import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnNaksha — Home Interior Design & Project Management, Bangalore",
  description:
    "EnNaksha — premium home interior design and project management for Bangalore homeowners. Transparent, scope-locked pricing. Weekly updates. Zero site visits needed.",
  openGraph: {
    title: "EnNaksha — Home Interior Design & Project Management, Bangalore",
    description:
      "Transparent, scope-locked pricing. Weekly photo updates. Zero site visits. We design and manage your home project end-to-end. Free 2D layout in 48 hours.",
    type: "website",
    locale: "en_IN",
    siteName: "EnNaksha",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
      </head>
      <body className={`${playfair.variable} ${inter.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  );
}
