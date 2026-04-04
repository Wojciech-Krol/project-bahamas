import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAKUNA — Zacznij coś nowego dzisiaj",
  description:
    "Znajdź i zarezerwuj najlepsze zajęcia w Twojej okolicy. Sport, muzyka, taniec, kodowanie — odkryj swoją pasję z Hakuna.",
  keywords: [
    "zajęcia",
    "kursy",
    "sport",
    "taniec",
    "muzyka",
    "kodowanie",
    "warsztaty",
    "Hakuna",
  ],
  openGraph: {
    title: "HAKUNA — Zacznij coś nowego dzisiaj",
    description:
      "Znajdź i zarezerwuj najlepsze zajęcia w Twojej okolicy.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#171021",
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
      lang="pl"
      className={`dark ${plusJakarta.variable} ${inter.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
