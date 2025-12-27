import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

// --- CAMBIO IMPORTANTE ---
// Importamos el Wrapper en lugar del Navbar directo
// Asegúrate de que la ruta coincida con donde creaste el archivo NavbarWrapper.tsx
import { NavbarWrapper } from "@/components/NavbarWrapper";

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
          <FavoritesProvider>
            {/* Usamos el Wrapper: Él decidirá si mostrar el Navbar o no */}
            <NavbarWrapper />

            <main>{children}</main>

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
