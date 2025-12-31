"use client";

import { ProductModal } from "@/components/product-modal";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";

// Función auxiliar para saber si es nuevo (menos de 30 días)
const checkIsNew = (created_at: string) => {
  const diff = new Date().getTime() - new Date(created_at).getTime();
  return diff / (1000 * 3600 * 24) <= 30;
};

export default function GroupedShop({ products }: { products: any[] }) {
  const { toggleFavorite, isFavorite } = useFavorites();

  // 1. Obtener categorías únicas presentes en los productos
  const categories = [...new Set(products.map((p) => p.category))].sort();

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
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
    <div className="flex flex-col gap-16 pb-20">
      {categories.map((categoryName) => {
        // Filtrar productos de esta categoría
        const categoryProducts = products.filter(
          (p) => p.category === categoryName
        );

        if (categoryProducts.length === 0) return null;

        return (
          <div key={categoryName} className="container mx-auto px-4">
            {/* Título de la Sección */}
            <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 pb-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                {categoryName}
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">
                ({categoryProducts.length})
              </span>
            </div>

            {/* Grid de Productos (Estilo Limpio/Nike) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {categoryProducts.map((product) => {
                const isSoldOut = (product.stock || 0) <= 0;
                const hasDiscount =
                  product.sale_price && product.sale_price < product.price;
                const isNewArrival = checkIsNew(product.created_at);

                return (
                  <ProductModal
                    key={product.id}
                    product={product}
                    allProducts={products}
                  >
                    <div className="group cursor-pointer flex flex-col h-full bg-white">
                      {/* Imagen Limpia */}
                      <div className="relative aspect-square bg-zinc-100 overflow-hidden rounded-sm mb-4">
                        {/* Badges */}
                        {hasDiscount ? (
                          <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 shadow-sm z-10">
                            Sale
                          </span>
                        ) : isNewArrival ? (
                          <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 shadow-sm z-10">
                            Lo Nuevo
                          </span>
                        ) : null}

                        {isSoldOut && (
                          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                            <span className="bg-zinc-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                              Agotado
                            </span>
                          </div>
                        )}

                        <button
                          onClick={(e) => handleToggleFavorite(e, product)}
                          className="absolute top-2 right-2 z-30 p-1.5 rounded-full hover:bg-white hover:shadow-md transition-all text-zinc-500 hover:text-black opacity-0 group-hover:opacity-100"
                        >
                          <Heart
                            size={18}
                            className={cn(
                              "transition-colors",
                              isFavorite(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-current"
                            )}
                          />
                        </button>

                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className={cn(
                              "w-full h-full object-contain object-center p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-105",
                              isSoldOut && "grayscale opacity-50"
                            )}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest font-bold">
                            Sin Imagen
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-1 px-1">
                        <h3 className="text-sm font-semibold text-zinc-900 leading-tight group-hover:underline decoration-1 underline-offset-2 decoration-zinc-300 truncate">
                          {product.title}
                        </h3>
                        <p className="text-xs text-zinc-500 capitalize">
                          {product.category}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm font-medium text-red-700">
                                ${product.sale_price}
                              </span>
                              <span className="text-xs text-zinc-400 line-through">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-zinc-900">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ProductModal>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
