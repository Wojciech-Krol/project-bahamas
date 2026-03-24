import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hakuna | Extracurricular Marketplace",
  description:
    "Find and book the best classes for kids, teens, and adults in The Bahamas. From art to sports, cooking to coding - discover your next adventure.",
  keywords: [
    "classes",
    "Bahamas",
    "kids activities",
    "teen programs",
    "adult workshops",
    "learning",
  ],
  openGraph: {
    title: "Hakuna | Discover Classes in The Bahamas",
    description:
      "Find and book the best classes for kids, teens, and adults in The Bahamas.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${inter.variable}`}
    >
      <head>
        {/* Material Symbols Outlined — used by all Stitch-generated screens */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Material Symbols Rounded — kept for any existing components */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
