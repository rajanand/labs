import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardShell } from "@/components/DashboardShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Labs | Interactive Experiments",
  description: "Personal experimentation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-50 overflow-hidden h-screen w-screen flex flex-col`}
      >
        <DashboardShell>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
