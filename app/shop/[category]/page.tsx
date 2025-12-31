"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ProductModal } from "@/components/product-modal";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function CategoryPage({ params, searchParams }: Props) {
  const router = useRouter();

  // 1. Desempaquetar promesas de Next.js 15
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  // 2. Cliente de Supabase memoizado (Singleton) para evitar bucles infinitos
  const supabase = useMemo(() => createClient(), []);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Valores de filtro resueltos
  const maxPrice = resolvedSearchParams.price
    ? parseInt(resolvedSearchParams.price as string)
    : 500;
  const filterSize = resolvedSearchParams.size as string;
  const filterColor = resolvedSearchParams.color as string;

  useEffect(() => {
    let isMounted = true;

    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const rawCategory = decodeURIComponent(resolvedParams.category);
        const normalizedCategory = rawCategory.toLowerCase();

        let query = supabase
          .from("products")
          .select("*")
          .gt("stock", 0)
          .lte("price", maxPrice)
          .order("created_at", { ascending: false });

        if (normalizedCategory !== "todos") {
          const isGender = ["hombre", "mujer", "niños", "unisex"].includes(
            normalizedCategory
          );
          if (isGender) {
            const dbGender =
              rawCategory.charAt(0).toUpperCase() +
              rawCategory.slice(1).toLowerCase();
            query = query.contains("gender", [dbGender]);
          } else {
            query = query.or(
              `category.ilike.%${rawCategory}%,section.ilike.%${rawCategory}%`
            );
          }
        }

        if (filterColor) query = query.contains("colors", [filterColor]);

        const { data, error } = await query;
        if (error) throw error;

        let list = data || [];
        if (filterSize) {
          list = list.filter((p: any) =>
            p.sizes_data?.some((s: any) => s.size === filterSize && s.available)
          );
        }

        if (isMounted) setProducts(list);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFilteredProducts();
    return () => {
      isMounted = false;
    };
  }, [
    resolvedParams.category,
    resolvedSearchParams,
    supabase,
    maxPrice,
    filterColor,
    filterSize,
  ]);

  // Manejo de cambio de precio sin recargar la pestaña (Uso de Router)
  const handlePriceChange = (value: number[]) => {
    const current = new URLSearchParams(
      Array.from(Object.entries(resolvedSearchParams as any))
    );
    current.set("price", value[0].toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${window.location.pathname}${query}`, { scroll: false });
  };

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
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* HEADER - z-50 y pointer-events-auto para asegurar el click de retorno */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-500 transition-all z-[60] pointer-events-auto"
        >
          <ArrowLeft size={14} /> Inicio
        </Link>
        <Link
          href="/"
          className="text-2xl font-black italic tracking-tighter absolute left-1/2 -translate-x-1/2 uppercase"
        >
          AVNYC.
        </Link>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <ShoppingBag size={20} className="text-zinc-900" />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-screen">
        {/* BARRA LATERAL FILTROS */}
        <aside className="hidden md:block w-72 p-8 border-r border-zinc-100 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto z-30 bg-white">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-10 leading-none">
            {decodeURIComponent(resolvedParams.category)}
          </h1>

          <div className="space-y-10">
            {/* Talla */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-2 text-zinc-400">
                Talla
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "OS"].map((t) => (
                  <Link
                    key={t}
                    href={`?size=${t}`}
                    className={cn(
                      "border border-zinc-200 py-2 text-center text-[10px] font-bold uppercase tracking-widest transition-all",
                      resolvedSearchParams?.size === t
                        ? "bg-black text-white border-black"
                        : "bg-white hover:border-black"
                    )}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-2 text-zinc-400">
                Precio Máximo
              </h3>
              <div className="pt-4 px-1">
                <Slider
                  defaultValue={[maxPrice]}
                  max={500}
                  step={10}
                  onValueCommit={handlePriceChange}
                />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mt-4 italic">
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/shop/${resolvedParams.category}`}
              className="block text-center text-[10px] font-black uppercase underline decoration-2 underline-offset-4 tracking-[0.2em] text-zinc-400 hover:text-black pt-4"
            >
              Limpiar Filtros
            </Link>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-10 bg-zinc-50/30">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <Loader2 className="animate-spin text-zinc-900" size={40} />
              <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Sincronizando inventario...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => {
                const hasDiscount =
                  product.sale_price && product.sale_price < product.price;
                return (
                  <div key={product.id}>
                    <ProductModal product={product} allProducts={products}>
                      <div className="group cursor-pointer flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="relative aspect-[3/4] bg-[#f6f6f6] overflow-hidden rounded-sm mb-4">
                          {hasDiscount ? (
                            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-tighter z-10 shadow-sm">
                              Sale
                            </span>
                          ) : (
                            <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-900 z-10 shadow-sm">
                              Lo Nuevo
                            </span>
                          )}

                          <button
                            onClick={(e) => handleToggleFavorite(e, product)}
                            className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/80 hover:bg-white transition-all text-zinc-500 hover:text-red-500"
                          >
                            <Heart
                              size={16}
                              className={cn(
                                "transition-colors",
                                isFavorite(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              )}
                            />
                          </button>

                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex flex-col gap-1 px-2 pb-2 text-left">
                          <h3 className="text-base font-semibold text-zinc-900 leading-tight group-hover:underline decoration-1 underline-offset-2 decoration-zinc-300 truncate uppercase tracking-tighter">
                            {product.title}
                          </h3>
                          <p className="text-sm text-zinc-500 capitalize font-medium">
                            {product.category}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm font-black text-red-700">
                                  ${product.sale_price}
                                </span>
                                <span className="text-xs text-zinc-400 line-through">
                                  ${product.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-black text-zinc-900">
                                ${product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </ProductModal>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-40 text-center uppercase tracking-[0.2em] text-[10px] text-zinc-400 font-bold">
              No se encontraron piezas en esta selección.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
