import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GUIEDUC2",
  description: "Acesso e gerenciamento educacional",
  themeColor: "#0A66FF",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192.png" },
    { rel: "icon", url: "/icons/icon-512.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192.png" }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GUIEDUC2"
  }
};
