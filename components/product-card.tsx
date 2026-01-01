"use client";

import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { ProductModal } from "@/components/product-modal"; // Asegúrate de tener este componente

interface ProductCardProps {
  product: any;
  dark?: boolean;
}

export const ProductCard = ({ product, dark = false }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();

  const isSoldOut = (product.stock || 0) <= 0;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  // Función simple para chequear si es nuevo (puedes moverla a utils)
  const checkIsNew = (created_at: string) => {
    const diff = new Date().getTime() - new Date(created_at).getTime();
    return diff / (1000 * 3600 * 24) <= 30;
  };
  const isNewArrival = checkIsNew(product.created_at);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      image: product.image_url,
      category: product.category,
      color: "Único",
      size: "Única",
    });
  };

  return (
    <ProductModal product={product}>
      <div className="group cursor-pointer flex flex-col h-full relative">
        <div
          className={cn(
            "relative aspect-square overflow-hidden rounded-sm mb-4 w-full transition-all duration-500",
            dark
              ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              : "bg-zinc-100"
          )}
        >
          {/* Badges */}
          {hasDiscount ? (
            <span className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">
              Sale
            </span>
          ) : isNewArrival ? (
            <span className="absolute top-2 left-2 bg-white text-black border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">
              New
            </span>
          ) : null}

          {isSoldOut && (
            <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-zinc-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Agotado
              </span>
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/80 hover:bg-white hover:shadow-md transition-all text-zinc-500 hover:text-black"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                isFavorite(product.id)
                  ? "fill-red-500 text-red-500"
                  : "text-current"
              )}
            />
          </button>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center bg-black/5 pointer-events-none">
            <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 border border-black">
              <Eye size={14} /> Quick View
            </span>
          </div>

          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-110",
                isSoldOut && "grayscale opacity-50"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest font-bold">
              Sin Imagen
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 px-1">
          <h3
            className={cn(
              "text-base font-bold leading-tight group-hover:underline decoration-1 underline-offset-4 truncate font-sans",
              dark ? "text-white" : "text-zinc-900"
            )}
          >
            {product.title}
          </h3>
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              dark ? "text-zinc-500" : "text-zinc-500"
            )}
          >
            {product.category}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-red-600">
                  ${product.sale_price}
                </span>
                <span
                  className={cn(
                    "text-xs line-through font-medium",
                    dark ? "text-zinc-600" : "text-zinc-400"
                  )}
                >
                  ${product.price}
                </span>
              </>
            ) : (
              <span
                className={cn(
                  "text-sm font-bold",
                  dark ? "text-white" : "text-zinc-900"
                )}
              >
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </ProductModal>
  );
};
