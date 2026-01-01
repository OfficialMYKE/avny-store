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
import { Heart, Trash2, ShoppingBag, ArrowRight, X } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FavoritesSheet = () => {
  const { favorites, toggleFavorite, favoritesCount } = useFavorites();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Calcular valor total de la wishlist (Opcional, pero se ve pro)
  const wishlistTotal = useMemo(() => {
    return favorites.reduce((acc, item) => acc + item.price, 0);
  }, [favorites]);

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: `${item.id}-${item.size}-${item.color}`,
      productId: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      size: item.size,
      color: item.color,
      quantity: 1,
    });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-zinc-100 text-black transition-all"
        >
          <Heart className="w-5 h-5" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {favoritesCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-full sm:w-[500px] p-0 border-l border-zinc-200 bg-white">
        {/* HEADER STICKY */}
        <SheetHeader className="px-6 py-5 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-baseline gap-2">
            Wishlist
            <span className="text-xs font-bold text-zinc-400 not-italic tracking-widest bg-zinc-100 px-2 py-0.5 rounded-full">
              {favoritesCount} Ítems
            </span>
          </SheetTitle>
          {/* El botón de cerrar default de SheetContent a veces queda tapado, podemos omitir o ajustar */}
        </SheetHeader>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                <Heart className="w-8 h-8 text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Tu lista está vacía
                </h3>
                <p className="text-sm text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                  Guarda tus piezas favoritas aquí para no perderlas de vista.
                </p>
              </div>
              <SheetClose asChild>
                <Link href="/shop/todos">
                  <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-8 uppercase font-bold text-xs tracking-widest h-12">
                    Explorar Colección
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-6">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-4 relative animate-in slide-in-from-right-4 duration-500"
                >
                  {/* IMAGEN */}
                  <div className="relative w-24 h-28 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm leading-tight text-zinc-900 line-clamp-2">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => toggleFavorite(item)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 capitalize font-medium">
                        {item.category} • {item.size}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-black text-zinc-900">
                        ${item.price.toFixed(2)}
                      </p>

                      <Button
                        size="sm"
                        className="w-full h-9 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest gap-2 rounded-sm shadow-sm transition-transform active:scale-95"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag size={14} /> Añadir al Carrito
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER (Solo si hay items) */}
        {favorites.length > 0 && (
          <SheetFooter className="p-6 border-t border-zinc-100 bg-zinc-50/50">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-xs">
                  Valor Total
                </span>
                <span className="font-black text-lg">
                  ${wishlistTotal.toFixed(2)}
                </span>
              </div>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 uppercase font-bold text-xs tracking-widest border-zinc-300 hover:bg-white hover:text-black"
                >
                  Seguir Viendo
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
