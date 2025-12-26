import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
// 1. IMPORTAR EL PROVEEDOR DE FAVORITOS
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
// 2. IMPORTAR EL COMPONENTE DE WHATSAPP
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

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
          {/* ENVOLVER AQUÍ (Dentro del CartProvider) */}
          <FavoritesProvider>
            {children}

            {/* Notificaciones tipo Toast */}
            <Toaster position="top-center" richColors />

            {/* BOTÓN FLOTANTE DE WHATSAPP */}
            <WhatsAppFloat />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
