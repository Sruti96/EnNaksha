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
  title: "EnNaksha — Premium Home Interiors, Bangalore",
  description:
    "A software-disciplined approach to premium home interiors for urban Indian homeowners. Fixed pricing, on-time delivery, daily photo updates.",
  openGraph: {
    title: "EnNaksha — Premium Home Interiors, Bangalore",
    description:
      "Fixed pricing, on-time delivery, zero surprises. Get a free 2D layout within 48 hours.",
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
      <body className={`${playfair.variable} ${inter.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  );
}
