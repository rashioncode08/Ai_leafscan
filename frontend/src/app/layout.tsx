import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Poppins, Outfit } from "next/font/google";
import "./globals.css";

const pacifico = localFont({
  src: "../../public/Pacifico-Regular.ttf",
  variable: "--font-pacifico",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "../../public/SpaceGrotesk-VariableFont_wght.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeafScan — AI Plant Disease Detection & Treatment",
  description:
    "Smart AI platform for plant disease detection. Scan your plants, get instant diagnosis with organic & chemical treatment suggestions. Built for farmers and plant lovers.",
  keywords: [
    "leafscan",
    "plant disease detection",
    "AI agriculture",
    "crop health",
    "smart farming",
    "organic treatment",
    "plant care",
  ],
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#1a7a4c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pacifico.variable} ${spaceGrotesk.variable} ${outfit.variable} ${poppins.variable}`}>
      <body className="antialiased overflow-x-hidden md:pb-0 pb-[80px]">
        <Navbar />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
