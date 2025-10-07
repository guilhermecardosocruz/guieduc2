import "./../styles/globals.css";
import ApiQueueBoot from "@/components/ApiQueueBoot";
import SwAutoUpdateClient from "@/components/SwAutoUpdateClient";
import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@/lib/config";


export const viewport: Viewport = {
  colorScheme: "light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  // SW auto-update
  if (typeof window !== "undefined") {
    import("@/lib/sw-update").then(m => m.setupSwAutoUpdate());
  }
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh"><SwAutoUpdateClient />
      <ApiQueueBoot />
      {children}</body>
    </html>
  );
}

// SW update helper
import "@/styles/globals.css";

export { metadata } from "./metadata";
