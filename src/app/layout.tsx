import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { EnrollmentProvider } from "@/context/enrollment-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Bahamas — Znajdź idealne zajęcia",
  description:
    "Platforma łącząca ludzi z najlepszymi zajęciami dodatkowymi. Dla dzieci, młodzieży i dorosłych.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>
        <AuthProvider>
          <EnrollmentProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </EnrollmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
