import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pacifico.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
