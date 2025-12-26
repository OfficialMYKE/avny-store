import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORTAMOS EL CONTEXTO DEL CARRITO
import { CartProvider } from "@/context/CartContext";

// 2. IMPORTAMOS EL COMPONENTE DE NOTIFICACIONES (TOASTER)
// Asegúrate de haber ejecutado: npx shadcn@latest add sonner
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
          {/* Renderizamos los hijos (tu página) */}
          {children}

          {/* Renderizamos el componente de notificaciones */}
          {/* 'richColors' hace que los mensajes de éxito sean verdes y errores rojos */}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
