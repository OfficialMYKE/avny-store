"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingBag, Loader2, Heart, Eye } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ProductModal } from "@/components/product-modal";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Orden de prioridad para las secciones macro
const SECTION_ORDER = [
  "ROPA SUPERIOR",
  "ROPA INFERIOR",
  "CALZADO",
  "CALZADO Y ACCESORIOS",
  "ROPA",
  "ACCESORIOS",
  "CABEZA",
  "EQUIPAJE",
  "OTROS",
];

export default function CategoryPage({ params, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();

  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const supabase = useMemo(() => createClient(), []);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const maxPrice = resolvedSearchParams.price
    ? parseInt(resolvedSearchParams.price as string)
    : 500;
  const filterSize = resolvedSearchParams.size as string;
  const filterColor = resolvedSearchParams.color as string;
  const searchTerm = resolvedSearchParams.search as string;

  // --- 1. FETCH DE DATOS ---
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

        // Lógica de Búsqueda y Categoría
        if (searchTerm) {
          // Buscamos coincidencias amplias (incluyendo MARCA)
          query = query.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
          );
        } else if (normalizedCategory !== "todos") {
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

        // Filtro Tallas (Memoria)
        let list = data || [];
        if (filterSize) {
          list = list.filter((p: any) =>
            p.sizes_data?.some((s: any) => s.size === filterSize && s.available)
          );
        }

        if (isMounted) setProducts(list);
      } catch (err) {
        console.error("Error:", err);
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
    supabase,
    maxPrice,
    filterColor,
    filterSize,
    searchTerm,
  ]);

  // --- 2. LÓGICA DE DOBLE AGRUPACIÓN (SECCIÓN -> CATEGORÍA) ---
  // AHORA SE APLICA SIEMPRE (Incluso en búsqueda/marcas)
  const groupedStructure = useMemo(() => {
    if (!products || products.length === 0) return null;

    // Estructura: { "ROPA SUPERIOR": { "Camisetas": [...], "Hoodies": [...] }, "CALZADO": { ... } }
    const hierarchy: Record<string, Record<string, any[]>> = {};

    products.forEach((product) => {
      // Normalizamos Sección (Si no tiene, va a "COLECCIÓN")
      const section = (product.section || "COLECCIÓN").toUpperCase();

      // Normalizamos Categoría (Si no tiene, va a "GENERAL")
      const rawCat = product.category || "General";
      const category = rawCat.split(",")[0].trim(); // Tomamos la primera si hay varias

      if (!hierarchy[section]) hierarchy[section] = {};
      if (!hierarchy[section][category]) hierarchy[section][category] = [];

      hierarchy[section][category].push(product);
    });

    // Ordenar Secciones (Nivel 1) según nuestra constante SECTION_ORDER
    const sortedSections = Object.keys(hierarchy).sort((a, b) => {
      const idxA = SECTION_ORDER.indexOf(a);
      const idxB = SECTION_ORDER.indexOf(b);

      // Lógica de ordenamiento personalizada
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Construir Array Final para renderizar
    return sortedSections.map((section) => {
      const categoriesObj = hierarchy[section];
      const sortedCategories = Object.keys(categoriesObj).sort(); // Orden alfabético de categorías

      return {
        title: section,
        subGroups: sortedCategories.map((cat) => ({
          title: cat,
          items: categoriesObj[cat],
        })),
      };
    });
  }, [products]); // Quitamos searchTerm de dependencias para que siempre agrupe

  // --- HANDLERS ---
  const handlePriceChange = (value: number[]) => {
    const current = new URLSearchParams(searchParamsHook.toString());
    current.set("price", value[0].toString());
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
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

  const pageTitle = searchTerm
    ? `Colección: "${searchTerm}"`
    : decodeURIComponent(resolvedParams.category);

  // --- COMPONENTE CARD ---
  const ProductCard = ({ product }: { product: any }) => {
    const hasDiscount =
      product.sale_price && product.sale_price < product.price;
    const isNew =
      (new Date().getTime() - new Date(product.created_at).getTime()) /
        (1000 * 3600 * 24) <=
      30;

    return (
      <ProductModal product={product} allProducts={products}>
        <div className="group cursor-pointer flex flex-col h-full relative">
          <div className="relative aspect-square overflow-hidden rounded-sm mb-4 w-full bg-zinc-100">
            {/* Badges */}
            {hasDiscount ? (
              <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 shadow-sm z-20">
                Sale
              </span>
            ) : isNew ? (
              <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 shadow-sm z-20">
                New
              </span>
            ) : null}

            {/* Actions */}
            <button
              onClick={(e) => handleToggleFavorite(e, product)}
              className="absolute top-2 right-2 z-30 p-1.5 rounded-full hover:bg-white hover:shadow-md transition-all text-zinc-500 hover:text-black"
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

            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center bg-black/5 pointer-events-none">
              <span className="bg-white/90 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                <Eye size={14} /> Vista Rápida
              </span>
            </div>

            {/* Imagen */}
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest font-bold">
                Sin Imagen
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 px-1">
            <h3 className="text-base font-semibold leading-tight group-hover:underline decoration-1 underline-offset-2 truncate text-zinc-900 decoration-zinc-300">
              {product.title}
            </h3>
            <p className="text-sm capitalize text-zinc-500">
              {product.category}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-sm font-medium text-red-600">
                    ${product.sale_price}
                  </span>
                  <span className="text-xs line-through text-zinc-400">
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
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-500 transition-all"
        >
          <ArrowLeft size={14} /> Inicio
        </Link>
        <Link
          href="/"
          className="text-2xl font-black italic tracking-tighter absolute left-1/2 -translate-x-1/2 uppercase"
        >
          AVNYC.
        </Link>
        <div className="w-10"></div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-screen">
        {/* SIDEBAR FILTROS */}
        <aside className="hidden md:block w-72 p-8 border-r border-zinc-100 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto z-30 bg-white">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-10 leading-none break-words">
            {pageTitle}
          </h1>

          <div className="space-y-10">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-2 text-zinc-400">
                Talla
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "OS"].map((t) => {
                  const newParams = new URLSearchParams(
                    searchParamsHook.toString()
                  );
                  newParams.set("size", t);
                  return (
                    <Link
                      key={t}
                      href={`${pathname}?${newParams.toString()}`}
                      replace
                      className={cn(
                        "border border-zinc-200 py-2 text-center text-[10px] font-bold uppercase tracking-widest transition-all",
                        resolvedSearchParams?.size === t
                          ? "bg-black text-white border-black"
                          : "bg-white hover:border-black"
                      )}
                    >
                      {t}
                    </Link>
                  );
                })}
              </div>
            </div>

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
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mt-4 italic">
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </div>

            <Link
              href={pathname}
              className="block text-center text-[10px] font-black uppercase underline decoration-2 underline-offset-4 tracking-[0.2em] text-zinc-400 hover:text-black pt-4"
            >
              Limpiar Filtros
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-10 bg-white">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <Loader2 className="animate-spin text-zinc-900" size={40} />
              <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Cargando...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-24">
              {/* LOGICA DE RENDERIZADO:
                   Siempre intentamos renderizar por grupos (groupedStructure), 
                   ya que la lógica de búsqueda ahora permite agrupar también.
                */}

              {groupedStructure &&
                groupedStructure.map((section) => (
                  <div
                    key={section.title}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  >
                    {/* HEADER SECCIÓN (GIGANTE) */}
                    <div className="flex items-end gap-4 mb-10 border-b border-zinc-900 pb-4">
                      <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-zinc-900 leading-[0.8]">
                        {section.title}
                      </h2>
                    </div>

                    {/* SUB-GRUPOS POR CATEGORÍA (Ej: Hoodies, Camisetas) */}
                    <div className="space-y-16">
                      {section.subGroups.map((subGroup) => (
                        <div key={subGroup.title}>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1 text-zinc-600 rounded-sm">
                              {subGroup.title}
                            </span>
                            <div className="h-px bg-zinc-100 flex-1"></div>
                            <span className="text-[10px] font-bold text-zinc-400">
                              {subGroup.items.length} Items
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                            {subGroup.items.map((product: any) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-40 text-center flex flex-col items-center gap-4">
              <ShoppingBag className="text-zinc-300" size={32} />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em] text-sm text-black font-bold">
                  Sin Resultados
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Intenta ajustar tus filtros o buscar con otro término.
                </p>
              </div>
              <Link
                href="/shop/todos"
                className="text-xs font-bold underline mt-4"
              >
                Ver Todo
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
