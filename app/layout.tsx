import "./../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Acesso e gerenciamento educacional",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icons/icon-192.png" }
  ],
  openGraph: { title: APP_NAME, type: "website" }
};

export const viewport: Viewport = {
  themeColor: "#0A66FF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
