import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
// 1. IMPORTAR EL PROVEEDOR DE FAVORITOS
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentic Vintage NY",
  description: "Streetwear Source in Quito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          {/* 2. ENVOLVER AQUÍ (Dentro del CartProvider) */}
          <FavoritesProvider>
            {children}

            <Toaster position="top-center" richColors />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
