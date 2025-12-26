"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export const CartSheet = () => {
  const { cart, removeFromCart, cartTotal, cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    const phoneNumber = "593986355332";
    let message = "*Hola AVNYC, quiero realizar el siguiente pedido:*\n\n";

    cart.forEach((item, index) => {
      message += `-----------------------------------\n`;
      message += `🛒 *PRODUCTO ${index + 1}*\n`;
      message += `📝 *${item.title}*\n`;
      message += `   ▪️ Talla: ${item.size}\n`;
      message += `   ▪️ Color: ${item.color}\n`;
      message += `   ▪️ Precio: $${item.price.toFixed(2)}\n`;

      // --- CORRECCIÓN DE URL DE IMAGEN ---
      if (item.image) {
        const cleanImage = item.image.trim();

        // Verificamos si la imagen YA es un link completo (viene de Supabase)
        const isAbsoluteUrl = cleanImage.startsWith("http");

        // Si ya es absoluta, usamos la imagen tal cual. Si no, le agregamos el dominio.
        const imageUrl = isAbsoluteUrl
          ? cleanImage
          : `${window.location.origin}${
              cleanImage.startsWith("/") ? "" : "/"
            }${cleanImage}`;

        // El \n al inicio y final asegura que WhatsApp lo ponga azul
        message += `📷 Ver Foto:\n${imageUrl}\n`;
      }
    });

    message += `-----------------------------------\n`;
    message += `\n💰 *TOTAL A PAGAR: $${cartTotal.toFixed(2)}*`;
    message += `\n\nQuedo a la espera de la confirmación y datos de pago.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative hover:bg-zinc-100 p-2">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-[90%] sm:w-[540px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-black italic flex items-center gap-2">
            TU CARRITO{" "}
            <span className="text-sm font-normal text-zinc-500 not-italic">
              ({cartCount} items)
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20 flex flex-col items-center">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">Tu carrito está vacío</p>
              <p className="text-sm">¡Agrega algunos productos vintage!</p>
              <Button
                variant="link"
                className="mt-4 text-black font-bold"
                onClick={() => setIsOpen(false)}
              >
                Volver a la tienda
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b pb-4 last:border-0"
              >
                {/* Imagen Miniatura */}
                <div className="relative w-20 h-24 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 border border-zinc-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-sm line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-black">
                      ${item.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t pt-4 mt-auto space-y-4">
            <div className="flex justify-between items-center text-lg font-black">
              <span>Total Estimado:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full h-14 text-base font-bold bg-green-600 hover:bg-green-700 shadow-md transition-all hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Completar pedido por WhatsApp
            </Button>
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wide">
              Serás redirigido a WhatsApp con el detalle y fotos de tu pedido.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
