import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/ui/providers";
import { Toaster } from "sonner";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MORIKAWA FERRE+ - Gestión de Inventario",
  description: "Sistema completo de gestión de inventario para ferreterías",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
