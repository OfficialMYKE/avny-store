"use client";

import { useState, useEffect } from "react";
import { createClient } from "./lib/supabase";
import { Navbar5 } from "@/components/ui/navbar-5";
import { ProductModal } from "@/components/product-modal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado compartido
  const [filter, setFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .gt("stock", 0) // <--- AQUÍ ESTÁ EL CAMBIO: Solo trae productos con stock mayor a 0
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter((p) => {
    // 1. Filtro de Búsqueda
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Filtro de Categoría / Género / Ofertas
    let matchesCategory = true;

    if (filter === "Todos") {
      matchesCategory = true;
    } else if (filter === "Ofertas") {
      // Solo mostramos ofertas. Ya no hace falta chequear stock aquí porque la BD ya lo filtró
      matchesCategory = p.sale_price && p.sale_price < p.price;
    } else if (["Hombre", "Mujer", "Niños"].includes(filter)) {
      if (filter === "Niños") {
        matchesCategory = p.gender === "Niños";
      } else {
        matchesCategory = p.gender === filter || p.gender === "Unisex";
      }
    } else {
      matchesCategory = p.category === filter;
    }

    return matchesCategory && matchesSearch;
  });

  // Traductor visual de títulos
  const getDisplayTitle = (categoryName: string) => {
    switch (categoryName) {
      case "Todos":
        return "New Arrivals";
      case "Ofertas":
        return "Ofertas & Descuentos";
      case "Hombre":
        return "Colección Hombre";
      case "Mujer":
        return "Colección Mujer";
      case "Niños":
        return "Kids Vintage";
      case "Zapatos":
        return "Shoes & Sneakers";
      case "Pantalones":
        return "Pants & Denim";
      case "Camisetas":
        return "T-Shirts Graphic";
      case "Chaquetas":
        return "Jackets & Coats";
      case "Accesorios":
        return "Accessories";
      case "Hoodies":
        return "Hoodies & Sweatshirts";
      default:
        return categoryName;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900">
      <Navbar5 onCategoryChange={setFilter} onSearchChange={setSearchTerm} />

      {/* HEADER / HERO SECTION */}
      <div className="bg-white border-b py-12 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic mb-2 uppercase">
          AUTHENTIC VINTAGE NEW YORK STYLE
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          From Brooklyn, Bronx & Manhattan:
          <br />
          Prendas vintage desde NYC <br />
          Envíos seguros a todo Ecuador 🇪🇨
        </p>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase">
              {getDisplayTitle(filter)}
            </h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {filteredProducts.length} Items
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-zinc-900 w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-4 md:gap-x-8">
            {filteredProducts.map((product) => {
              // Como filtramos en DB, esto siempre será falso en esta vista,
              // pero lo dejamos por si usas la tarjeta en otro lado.
              const isSoldOut = (product.stock || 0) <= 0;

              const hasDiscount =
                product.sale_price && product.sale_price < product.price;
              const currentPrice = hasDiscount
                ? product.sale_price
                : product.price;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((product.price - currentPrice) / product.price) * 100
                  )
                : 0;

              return (
                <ProductModal
                  key={product.id}
                  product={product}
                  allProducts={products}
                >
                  <div
                    className={cn(
                      "group bg-transparent h-full flex flex-col cursor-pointer",
                      isSoldOut && "opacity-75"
                    )}
                  >
                    {/* FOTO CARD */}
                    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 relative rounded-sm mb-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className={cn(
                            "object-cover w-full h-full transition-transform duration-700 group-hover:scale-105",
                            isSoldOut && "grayscale"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">
                          Sin Foto
                        </div>
                      )}

                      {/* BADGES (Talla y Descuento) */}
                      {!isSoldOut && (
                        <>
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-black px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm z-10 shadow-sm">
                            {product.size}
                          </div>

                          {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-1.5 py-1 text-[10px] font-bold rounded-sm z-10 shadow-sm">
                              -{discountPercent}%
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* INFO CARD */}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-xs md:text-sm leading-tight uppercase tracking-tight line-clamp-2">
                          {product.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-sm font-black",
                            hasDiscount ? "text-red-600" : "text-zinc-900"
                          )}
                        >
                          ${currentPrice}
                        </span>

                        {hasDiscount && (
                          <span className="text-xs text-muted-foreground line-through decoration-zinc-300">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </ProductModal>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-12 text-center">
        <h2 className="text-2xl font-black tracking-tighter italic mb-4">
          AVNYC.
        </h2>
        <p className="text-xs text-muted-foreground">
          © 2025 Authentic Vintage NY. <br /> Quito, Ecuador.
        </p>
      </footer>
    </div>
  );
}
