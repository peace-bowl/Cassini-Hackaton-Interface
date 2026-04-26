import type { Metadata } from "next";
import { Syne, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * Root Layout
 * ────────────
 * Configures Google Fonts (Syne + Source Sans 3) and global metadata.
 */

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nereus System — EU Space for Water",
  description:
    "Real-time water monitoring dashboard powered by Copernicus Sentinel-2 satellite data. Track flood risks, contamination alerts, soil moisture anomalies, and infrastructure status across Romania.",
  keywords: [
    "EU Space for Water",
    "Nereus System",
    "Cassini Hackathon",
    "water monitoring",
    "flood detection",
    "Copernicus Sentinel-2",
    "environmental dashboard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${sourceSans.variable} h-full`}
    >
      <body className="h-full overflow-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
