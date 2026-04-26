import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * Root Layout
 * ────────────
 * Configures Google Fonts (Outfit + DM Sans) and global metadata.
 */

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cassini Observatory — EU Space for Water",
  description:
    "Real-time water monitoring dashboard for the Timișoara region. Track flood risks, contamination alerts, soil moisture anomalies, and infrastructure status using satellite and ground-sensor data.",
  keywords: [
    "EU Space for Water",
    "Cassini",
    "water monitoring",
    "flood detection",
    "Timișoara",
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
      className={`${outfit.variable} ${dmSans.variable} h-full`}
    >
      <body className="h-full overflow-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
