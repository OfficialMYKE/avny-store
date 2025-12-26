"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext"; // Para mover al carrito
import { useState } from "react";
import { cn } from "@/lib/utils";

export const FavoritesSheet = () => {
  const { favorites, toggleFavorite, favoritesCount } = useFavorites();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

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
    // Opcional: Eliminar de favoritos al mover al carrito
    // toggleFavorite(item);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="relative hover:bg-zinc-100 p-2 text-zinc-800"
        >
          <Heart className="w-5 h-5" />
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-[90%] sm:w-[540px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-black italic flex items-center gap-2">
            MIS FAVORITOS{" "}
            <span className="text-sm font-normal text-zinc-500 not-italic">
              ({favoritesCount})
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20 flex flex-col items-center">
              <Heart className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">
                Tu lista de deseos está vacía
              </p>
              <p className="text-sm">
                Guarda lo que te gusta para que te avisemos de ofertas.
              </p>
            </div>
          ) : (
            favorites.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b pb-4 last:border-0 group"
              >
                <div className="relative w-20 h-24 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 border border-zinc-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-sm line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.category}
                    </p>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                    <p className="text-sm font-black">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 border-black hover:bg-black hover:text-white transition-colors"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingCart size={12} /> Comprar
                      </Button>
                      <button
                        onClick={() => toggleFavorite(item)}
                        className="text-xs text-zinc-400 hover:text-red-500 font-bold p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
