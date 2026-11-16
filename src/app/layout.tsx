import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CopperEye — Security jobs done right first time",
  description: "AI walk-round surveys for CCTV, alarms, gates and every kind of home & business security. Customers walk the property with an AI surveyor; engineers quote accurately without call-outs.",
  keywords: ["CopperEye", "CCTV", "intruder alarms", "gate automation", "access control", "security engineer", "AI survey"],
  authors: [{ name: "CopperEye" }],
  icons: {
    icon: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#c47a4e"/><circle cx="12" cy="12" r="3.4" fill="#0b0b0d"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="#0b0b0d" stroke-width="2"/></svg>'),
  },
  openGraph: {
    title: "CopperEye — AI walk-round security surveys",
    description: "CCTV, alarms, gates and access — quoted accurately from an AI survey, no call-out needed.",
    siteName: "CopperEye",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
