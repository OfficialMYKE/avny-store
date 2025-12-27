"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductModal } from "@/components/product-modal";
import Link from "next/link";
import { SlidersHorizontal, X, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { toast } from "sonner";

// --- TIPOS DE DATOS ---
interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  image_url: string;
  category: string;
  gender?: string; // Agregamos género para el subtítulo
  colors: string[] | string | null;
  size: string | null;
  sizes_data?: { size: string; available: boolean }[];
  sold_out_colors?: string[];
  is_sold?: boolean;
}

// --- CONSTANTES ---
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
const SHOE_SIZES = [
  "US 6",
  "US 6.5",
  "US 7",
  "US 7.5",
  "US 8",
  "US 8.5",
  "US 9",
  "US 9.5",
  "US 10",
  "US 10.5",
  "US 11",
  "US 12",
  "US 13",
];
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
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Estados Filtros
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "price_asc" | "price_desc"
  >("newest");

  useEffect(() => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 500]);
  }, [categoryName]);

  const currentSizeList = useMemo(() => {
    const cat = categoryName.toLowerCase().trim();
    if (
      cat.includes("zapato") ||
      cat.includes("shoe") ||
      cat.includes("sneaker")
    )
      return SHOE_SIZES;
    if (
      cat.includes("accesorio") ||
      cat.includes("gorra") ||
      cat.includes("bolso")
    )
      return ["OS"];
    return CLOTHING_SIZES;
  }, [categoryName]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const finalPrice = product.sale_price || product.price;
        if (finalPrice < priceRange[0] || finalPrice > priceRange[1])
          return false;

        if (selectedSizes.length > 0) {
          let productSizes: string[] = [];
          if (product.sizes_data) {
            productSizes = product.sizes_data
              .filter((s) => s.available)
              .map((s) => s.size);
          } else if (product.size) {
            productSizes = product.size.split(",").map((s) => s.trim());
          }
          if (!selectedSizes.some((size) => productSizes.includes(size)))
            return false;
        }

        if (selectedColors.length > 0) {
          let productColors: string[] = [];
          if (Array.isArray(product.colors)) productColors = product.colors;
          else if (typeof product.colors === "string")
            productColors = [product.colors];
          if (!selectedColors.some((color) => productColors.includes(color)))
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.sale_price || a.price;
        const priceB = b.sale_price || b.price;
        if (sortOrder === "price_asc") return priceA - priceB;
        if (sortOrder === "price_desc") return priceB - priceA;
        return 0;
      });
  }, [products, selectedSizes, selectedColors, priceRange, sortOrder]);

  const toggleFilter = (
    item: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    let defaultSize = "Única";
    if (product.sizes_data?.length) {
      const first = product.sizes_data.find((s) => s.available);
      if (first) defaultSize = first.size;
    } else if (product.size) {
      defaultSize = product.size.split(",")[0].trim();
    }

    let defaultColor = "Único";
    if (Array.isArray(product.colors) && product.colors.length)
      defaultColor = product.colors[0];
    else if (typeof product.colors === "string" && product.colors)
      defaultColor = product.colors;

    addToCart({
      id: `${product.id}-${defaultSize}-${defaultColor}`,
      productId: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      image: product.image_url,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });

    toast.success("¡Agregado al carrito!", { description: `${product.title}` });
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
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

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center lg:hidden mb-4">
        <h3 className="font-bold text-lg">Filtros</h3>
        <button onClick={() => setShowMobileFilters(false)}>
          <X />
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest border-b border-black pb-2">
          Talla {categoryName.toLowerCase().includes("zapato") ? "(US)" : ""}
        </h4>
        <div className="flex flex-wrap gap-2">
          {currentSizeList.map((size) => (
            <button
              key={size}
              onClick={() =>
                toggleFilter(size, selectedSizes, setSelectedSizes)
              }
              className={cn(
                "min-w-[40px] h-10 px-2 text-xs font-medium border flex items-center justify-center transition-all",
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
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 border border-black px-4 py-2 text-sm font-bold uppercase hover:bg-zinc-50 flex-1 justify-center"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
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
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
            <FilterSidebar />
          </div>

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

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 border border-dashed rounded-lg">
                <p className="text-zinc-500 mb-4">
                  No se encontraron productos.
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={() => {
                      setSelectedSizes([]);
                      setSelectedColors([]);
                      setPriceRange([0, 500]);
                    }}
                    className="font-bold underline text-sm mb-4"
                  >
                    Limpiar filtros actuales
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-2 bg-black text-white text-sm font-bold uppercase rounded-sm hover:bg-zinc-800 transition-colors"
                  >
                    Ir al Inicio / Ver Todo
                  </Link>
                </div>
              </div>
            ) : (
              // GRILLA RESPONSIVE
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductModal
                    key={product.id}
                    product={product}
                    allProducts={filteredProducts}
                  >
                    <div className="group cursor-pointer">
                      {/* --- DISEÑO DE TARJETA ESTILO NIKE --- */}

                      {/* Contenedor Imagen (Gris Claro) */}
                      <div className="relative aspect-square bg-[#f5f5f5] mb-4 overflow-hidden rounded-sm">
                        {/* Botón Favorito (Top Right) */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, product)}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full hover:bg-white/80 transition-colors"
                        >
                          <Heart
                            size={20}
                            className={cn(
                              "transition-colors",
                              isFavorite(product.id)
                                ? "fill-black text-black"
                                : "text-zinc-500 hover:text-black"
                            )}
                          />
                        </button>

                        <img
                          src={product.image_url}
                          alt={product.title}
                          className={cn(
                            "w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105",
                            product.is_sold && "grayscale opacity-50"
                          )}
                        />

                        {product.is_sold && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                            <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Información del Producto */}
                      <div className="space-y-1">
                        {/* Etiqueta Naranja (Lo nuevo / Oferta) */}
                        {product.sale_price &&
                        product.sale_price < product.price ? (
                          <div className="text-[#9E3500] font-medium text-sm">
                            Oferta
                          </div>
                        ) : (
                          <div className="text-[#9E3500] font-medium text-sm">
                            Lo nuevo
                          </div>
                        )}

                        {/* Título */}
                        <h3 className="text-base font-bold text-black leading-tight line-clamp-1">
                          {product.title}
                        </h3>

                        {/* Subtítulo (Categoría + Género) */}
                        <p className="text-zinc-500 text-sm font-medium">
                          {product.category}{" "}
                          {product.gender ? `para ${product.gender}` : ""}
                        </p>

                        {/* Precio */}
                        <div className="flex items-center gap-2 mt-1">
                          {product.sale_price &&
                          product.sale_price < product.price ? (
                            <>
                              <span className="text-base font-bold text-black">
                                ${product.sale_price}
                              </span>
                              <span className="text-sm text-zinc-400 line-through">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-black">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón Agregar al Carrito (Negro, Redondeado) */}
                      {!product.is_sold && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="w-full bg-black text-white font-bold py-3 rounded-full hover:bg-zinc-800 transition-colors text-sm"
                          >
                            Agregar al Carrito
                          </button>
                        </div>
                      )}
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
