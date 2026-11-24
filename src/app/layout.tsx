import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Precifica",
  description: "Precificação de produtos",
  authors: [{ name: "Precifica" }],
  icons: {
    icon: [{ url: "/favicon.svg?v=2", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Precifica",
    description: "Precificação de produtos",
    type: "website",
    url: "/",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f5f5" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="bg-neutral-100 overscroll-none">
      <body className={`${inter.className} bg-neutral-100 overscroll-none`}>
        <Providers>
          <main className="relative z-10 min-h-screen bg-neutral-100 text-foreground overscroll-none">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
