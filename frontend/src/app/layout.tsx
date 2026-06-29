import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { playfair, hanken, geistMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "OpenATS",
  description: "Open-source ATS powered by AI. Parse CVs, score candidates, and manage job postings - self-hostable and free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${hanken.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-base text-text-primary font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
