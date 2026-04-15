import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext"],
  variable: "--font-be-vietnam",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HAKUNA | Start Something New Today",
  description:
    "Find and book the best activities near you. Sports, pottery, yoga, music — discover your passion with Hakuna.",
  keywords: [
    "activities",
    "classes",
    "sports",
    "yoga",
    "pottery",
    "workshops",
    "Hakuna",
    "booking",
  ],
  openGraph: {
    title: "HAKUNA | Start Something New Today",
    description:
      "Find and book the best activities near you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf9f0",
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
      className={`scroll-smooth overflow-x-hidden ${plusJakarta.variable} ${beVietnam.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body antialiased bg-surface text-on-surface overflow-x-hidden w-full relative" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
