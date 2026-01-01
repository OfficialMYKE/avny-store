"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  MessageCircle,
  ArrowRight,
  PackageOpen,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

export const CartSheet = () => {
  const { cart, removeFromCart, cartTotal, cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    const phoneNumber = "593986355332";
    let message = "*Hola AVNYC, quiero confirmar mi pedido:*\n\n";

    cart.forEach((item, index) => {
      message += `-----------------------------------\n`;
      message += `*#${index + 1} - ${item.title.toUpperCase()}*\n`;
      message += `   ▫️ Talla: ${item.size}\n`;
      message += `   ▫️ Color: ${item.color}\n`;
      message += `   ▫️ Precio: $${item.price.toFixed(2)}\n`;

      if (item.image) {
        const imgLink = item.image.trim();
        const isExternalLink =
          imgLink.startsWith("http") || imgLink.startsWith("https");
        const finalUrl = isExternalLink
          ? imgLink
          : `${window.location.origin}${
              imgLink.startsWith("/") ? "" : "/"
            }${imgLink}`;
        message += `🔗 Foto: ${finalUrl}\n`;
      }
    });

    message += `-----------------------------------\n`;
    message += `\n*TOTAL A PAGAR: $${cartTotal.toFixed(2)}*`;
    message += `\n\nQuedo atento a los datos de pago/envío. Gracias.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-zinc-100 text-black transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-full sm:w-[500px] p-0 border-l border-zinc-200 bg-white">
        {/* HEADER */}
        <SheetHeader className="px-6 py-5 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-baseline gap-2">
            Tu Carrito
            <span className="text-xs font-bold text-zinc-400 not-italic tracking-widest bg-zinc-100 px-2 py-0.5 rounded-full">
              {cartCount} Ítems
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <PackageOpen className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Tu carrito está vacío
                </h3>
                <p className="text-sm text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                  Parece que aún no has encontrado tu próxima prenda favorita.
                </p>
              </div>
              <SheetClose asChild>
                <Link href="/shop/new">
                  <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-8 uppercase font-bold text-xs tracking-widest h-12 shadow-lg hover:shadow-xl transition-all">
                    Ver Novedades <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-4 p-4 bg-white border border-zinc-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* IMAGEN */}
                  <div className="relative w-20 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-bold text-sm leading-tight text-zinc-900 line-clamp-2">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 border border-zinc-200">
                          {item.size}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 border border-zinc-200">
                          {item.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <p className="text-base font-black text-zinc-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER (Checkout) */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-zinc-100 bg-white/90 backdrop-blur-lg shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs mb-1">
                  Total Estimado
                </span>
                <span className="font-black text-3xl tracking-tighter">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full h-14 bg-black hover:bg-zinc-800 text-white text-sm font-bold uppercase tracking-widest gap-2 rounded-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Confirmar por WhatsApp
              </Button>

              <p className="text-center text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
                Envío calculado al confirmar el pedido
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
