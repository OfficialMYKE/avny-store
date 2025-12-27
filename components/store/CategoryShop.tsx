"use client";

import { useState, useMemo } from "react";
import { ProductModal } from "@/components/product-modal"; // Asegúrate de tener este componente (el que ya usabas)
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TIPOS DE DATOS ---
interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  image_url: string;
  category: string;
  colors: string[] | string | null;
  size: string | null;
  sizes_data?: { size: string; available: boolean }[];
  sold_out_colors?: string[];
  is_sold?: boolean;
  // Agrega aquí otras propiedades si las tienes
}

// --- CONSTANTES DE FILTROS ---
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
const ALL_COLORS = [
  "Negro",
  "Blanco",
  "Gris",
  "Rojo",
  "Azul",
  "Verde",
  "Beige",
  "Amarillo",
  "Multicolor",
];

export const CategoryShop = ({
  products,
  categoryName,
}: {
  products: Product[];
  categoryName: string;
}) => {
  // ESTADOS DE LOS FILTROS
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]); // Rango $0 - $500
  const [sortOrder, setSortOrder] = useState<
    "newest" | "price_asc" | "price_desc"
  >("newest");

  // --- LÓGICA DE FILTRADO (MAGIA) ---
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Filtro por Precio
        const finalPrice = product.sale_price || product.price;
        if (finalPrice < priceRange[0] || finalPrice > priceRange[1])
          return false;

        // 2. Filtro por Talla (Si hay tallas seleccionadas)
        if (selectedSizes.length > 0) {
          // Extraemos las tallas del producto
          let productSizes: string[] = [];
          if (product.sizes_data) {
            productSizes = product.sizes_data
              .filter((s) => s.available)
              .map((s) => s.size);
          } else if (product.size) {
            productSizes = product.size.split(",").map((s) => s.trim());
          }
          // Verificamos si AL MENOS UNA talla coincide
          const hasSize = selectedSizes.some((size) =>
            productSizes.includes(size)
          );
          if (!hasSize) return false;
        }

        // 3. Filtro por Color (Si hay colores seleccionados)
        if (selectedColors.length > 0) {
          let productColors: string[] = [];
          if (Array.isArray(product.colors)) productColors = product.colors;
          else if (typeof product.colors === "string")
            productColors = [product.colors];

          const hasColor = selectedColors.some((color) =>
            productColors.includes(color)
          );
          if (!hasColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Lógica de Ordenamiento
        const priceA = a.sale_price || a.price;
        const priceB = b.sale_price || b.price;

        if (sortOrder === "price_asc") return priceA - priceB;
        if (sortOrder === "price_desc") return priceB - priceA;
        return 0; // "newest" asume el orden por defecto que viene de base de datos
      });
  }, [products, selectedSizes, selectedColors, priceRange, sortOrder]);

  // FUNCIONES HELPER
  const toggleFilter = (
    item: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // --- COMPONENTE DE BARRA LATERAL (Sidebar) ---
  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* HEADER FILTROS */}
      <div className="flex justify-between items-center lg:hidden mb-4">
        <h3 className="font-bold text-lg">Filtros</h3>
        <button onClick={() => setShowMobileFilters(false)}>
          <X />
        </button>
      </div>

      {/* 1. SECCIÓN TALLAS */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest border-b border-black pb-2">
          Talla
        </h4>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() =>
                toggleFilter(size, selectedSizes, setSelectedSizes)
              }
              className={cn(
                "w-10 h-10 text-xs font-medium border flex items-center justify-center transition-all",
                selectedSizes.includes(size)
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-black"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SECCIÓN COLORES */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest border-b border-black pb-2">
          Color
        </h4>
        <div className="flex flex-col gap-2">
          {ALL_COLORS.map((color) => (
            <label
              key={color}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 border flex items-center justify-center transition-all",
                  selectedColors.includes(color)
                    ? "bg-black border-black"
                    : "bg-white border-zinc-300 group-hover:border-black"
                )}
              >
                {selectedColors.includes(color) && (
                  <Check size={10} className="text-white" />
                )}
              </div>
              <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">
                {color}
              </span>
              {/* Checkbox oculto real */}
              <input
                type="checkbox"
                className="hidden"
                checked={selectedColors.includes(color)}
                onChange={() =>
                  toggleFilter(color, selectedColors, setSelectedColors)
                }
              />
            </label>
          ))}
        </div>
      </div>

      {/* 3. SECCIÓN PRECIO (Simple) */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest border-b border-black pb-2">
          Precio Máximo
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full accent-black h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs font-bold">
            <span>$0</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* BOTÓN LIMPIAR */}
      {(selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        priceRange[1] < 500) && (
        <button
          onClick={() => {
            setSelectedSizes([]);
            setSelectedColors([]);
            setPriceRange([0, 500]);
          }}
          className="text-xs underline text-zinc-500 hover:text-black w-full text-center py-2"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER DE LA CATEGORÍA */}
      <div className="py-8 border-b mb-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Colección
            </p>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              {categoryName}
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Botón Filtros Móvil */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 border border-black px-4 py-2 text-sm font-bold uppercase hover:bg-zinc-50 flex-1 justify-center"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>

            {/* Ordenar Por */}
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="border border-zinc-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-black rounded-none flex-1 md:flex-none"
            >
              <option value="newest">Lo más nuevo</option>
              <option value="price_asc">Precio: Bajo a Alto</option>
              <option value="price_desc">Precio: Alto a Bajo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex gap-10">
          {/* SIDEBAR (DESKTOP) */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
            <FilterSidebar />
          </div>

          {/* SIDEBAR (MÓVIL - DRAWER) */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="relative bg-white w-80 h-full p-6 overflow-y-auto shadow-xl animate-in slide-in-from-left">
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* GRILLA DE PRODUCTOS */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 border border-dashed rounded-lg">
                <p className="text-zinc-500 mb-2">
                  No se encontraron productos con estos filtros.
                </p>
                <button
                  onClick={() => {
                    setSelectedSizes([]);
                    setSelectedColors([]);
                    setPriceRange([0, 500]);
                  }}
                  className="font-bold underline"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductModal
                    key={product.id}
                    product={product}
                    allProducts={filteredProducts}
                  >
                    <div className="group cursor-pointer">
                      <div className="aspect-[4/5] bg-zinc-100 mb-4 relative overflow-hidden border border-transparent group-hover:border-black transition-all">
                        {/* Badge Oferta */}
                        {product.sale_price &&
                          product.sale_price < product.price && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase z-10">
                              Sale
                            </span>
                          )}
                        {/* Badge Agotado */}
                        {product.is_sold && (
                          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase z-10">
                            Sold Out
                          </span>
                        )}

                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          {product.category}
                        </p>
                        <h3 className="text-sm font-bold uppercase leading-tight line-clamp-2 group-hover:underline decoration-1 underline-offset-4">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          {product.sale_price &&
                          product.sale_price < product.price ? (
                            <>
                              <span className="font-bold">
                                ${product.sale_price}
                              </span>
                              <span className="text-zinc-400 line-through text-xs">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold">${product.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ProductModal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
