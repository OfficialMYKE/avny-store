"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "./lib/supabase";
import { ProductModal } from "@/components/product-modal";
import {
  Loader2,
  Heart,
  ShoppingCart,
  ArrowRight,
  Truck,
  ShieldCheck,
  Star,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { toast } from "sonner";
import Link from "next/link";

// --- DATOS DE MARCAS (SVGs Oficiales de Wikimedia - Alta Calidad) ---
const BRANDS = [
  {
    name: "Nike",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Nike-Logo-500x281.png",
  },
  {
    name: "Adidas",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Adidas-Logo-500x281.png",
  },
  {
    name: "Reebok",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Reebok-Symbol-700x394.png",
  },
  {
    name: "The North Face",
    logo: "https://1000logos.net/wp-content/uploads/2017/05/North-Face-Logo.png",
  },
  {
    name: "Fila",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Fila-Logo-700x394.png",
  },
  {
    name: "New Balance",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Emblem-700x394.png",
  },
  {
    name: "Vans",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Vans-Logo-1966-700x394.png",
  },
  {
    name: "Puma",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Puma-Logo-1980-500x281.png",
  },
];

export default function Home() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- ESTADO NEWSLETTER ---
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) setProducts(data);
    setLoading(false);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const currentScroll = scrollContainerRef.current.scrollLeft;

      scrollContainerRef.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail || !subscriberEmail.includes("@")) {
      toast.error("Ingresa un correo válido");
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscriberEmail("");
      toast.success("¡Suscripción exitosa!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* 1. TOP TICKER */}
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap relative flex z-50">
        <div className="animate-marquee-right flex min-w-full shrink-0 items-center justify-around">
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Envíos seguros a todo el Ecuador 🇪🇨
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Streetwear Classics 90s & 00s
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Authentic Vintage New York Style
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Pagos seguros con Tarjeta o Transferencia
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Directo desde Brooklyn & Manhattan
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
        </div>
        <div
          className="animate-marquee-right flex min-w-full shrink-0 items-center justify-around"
          aria-hidden="true"
        >
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Envíos seguros a todo el Ecuador 🇪🇨
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Streetwear Classics 90s & 00s
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Authentic Vintage New York Style
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Pagos seguros con Tarjeta o Transferencia
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            Directo desde Brooklyn & Manhattan
          </span>
          <span className="mx-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            •
          </span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative border-b border-zinc-100 bg-zinc-50 py-24 md:py-40 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-9xl font-black italic">
            NYC
          </div>
          <div className="absolute bottom-10 right-10 text-9xl font-black italic">
            VINTAGE
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6">
            Est. 2025 — Quito, Ecuador
          </p>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic mb-8 uppercase leading-[0.85]">
            Authentic <br /> Vintage
          </h1>
          <p className="text-sm md:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed font-medium mb-10">
            Piezas únicas seleccionadas a mano desde Brooklyn, Bronx &
            Manhattan. Traemos la cultura del streetwear neoyorquino
            directamente a tu armario.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop/todos"
              className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
            >
              Ver Colección
            </Link>
            <Link
              href="/shop/zapatos"
              className="px-10 py-4 bg-white border border-zinc-200 text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-50 transition-all shadow-sm hover:shadow-md"
            >
              Ver Zapatos
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BRANDS TICKER */}
      <section className="py-8 border-b border-zinc-100 bg-white overflow-hidden">
        <div className="flex w-full">
          <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-12 opacity-40 hover:opacity-100 transition-opacity duration-500">
            {[
              "NIKE",
              "ADIDAS",
              "CARHARTT",
              "STUSSY",
              "RALPH LAUREN",
              "THE NORTH FACE",
              "JORDAN",
              "CHAMPION",
            ].map((brand, i) => (
              <span
                key={i}
                className="text-2xl md:text-4xl font-black italic tracking-tighter text-zinc-300 select-none"
              >
                {brand}
              </span>
            ))}
          </div>
          <div
            className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-12 opacity-40 hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          >
            {[
              "NIKE",
              "ADIDAS",
              "CARHARTT",
              "STUSSY",
              "RALPH LAUREN",
              "THE NORTH FACE",
              "JORDAN",
              "CHAMPION",
            ].map((brand, i) => (
              <span
                key={i}
                className="text-2xl md:text-4xl font-black italic tracking-tighter text-zinc-300 select-none"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CATEGORÍAS */}
      <section className="container mx-auto px-4 py-24 border-b border-zinc-100">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">
            Shop Category
          </h3>
          <Link
            href="/shop/todos"
            className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4"
          >
            Ver Todo
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] md:h-[600px]">
          {/* Categoría Grande 1 */}
          <Link
            href="/shop/ropa"
            className="group relative bg-zinc-100 overflow-hidden md:col-span-1 h-full"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-0 left-0 p-8">
              <h4 className="text-white text-4xl font-black uppercase italic tracking-tighter mb-2">
                Apparel
              </h4>
              <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                Explorar <ArrowRight size={12} />
              </span>
            </div>
          </Link>

          <div className="flex flex-col gap-4 md:col-span-2 h-full">
            {/* Categoría Ancha */}
            <Link
              href="/shop/zapatos"
              className="group relative flex-1 bg-zinc-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 p-8">
                <h4 className="text-white text-4xl font-black uppercase italic tracking-tighter mb-2">
                  Footwear
                </h4>
                <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                  Explorar <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            {/* Categoría Ancha */}
            <Link
              href="/shop/accesorios"
              className="group relative flex-1 bg-zinc-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 p-8">
                <h4 className="text-white text-4xl font-black uppercase italic tracking-tighter mb-2">
                  Accessories
                </h4>
                <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                  Explorar <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS (CARRUSEL) */}
      <main className="container mx-auto px-4 py-24 border-b border-zinc-100">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">
              New Arrivals
            </h2>
            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] mt-2 font-bold">
              Últimas 6 adquisiciones
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-3 border border-zinc-200 rounded-full hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 border border-zinc-200 rounded-full hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-zinc-900 w-8 h-8" />
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-10 scroll-smooth snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => {
              const isSoldOut = (product.stock || 0) <= 0;
              const hasDiscount =
                product.sale_price && product.sale_price < product.price;

              return (
                <div
                  key={product.id}
                  className="min-w-[280px] md:min-w-[320px] snap-start"
                >
                  <ProductModal product={product} allProducts={products}>
                    <div className="group cursor-pointer flex flex-col h-full">
                      <div className="aspect-[3/4] bg-zinc-100 mb-4 relative overflow-hidden border border-transparent group-hover:border-black transition-all rounded-sm">
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase z-10 shadow-sm tracking-wider">
                            Sale
                          </span>
                        )}
                        {isSoldOut && (
                          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase z-10 shadow-sm tracking-wider">
                            Sold Out
                          </span>
                        )}
                        <button
                          onClick={(e) => handleToggleFavorite(e, product)}
                          className="absolute top-2 right-2 z-20 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-black hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 duration-300"
                        >
                          <Heart
                            size={14}
                            className={cn(
                              "transition-colors",
                              isFavorite(product.id)
                                ? "fill-red-500 text-red-500 hover:text-red-500 hover:fill-white"
                                : "text-current"
                            )}
                          />
                        </button>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                              isSoldOut && "grayscale opacity-80"
                            )}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest font-bold bg-zinc-50">
                            Sin Imagen
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                          {product.category}
                        </p>
                        <h3 className="text-sm font-bold uppercase leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-4 min-h-[2.5em]">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-auto pt-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm font-black text-red-600">
                                ${product.sale_price}
                              </span>
                              <span className="text-xs text-zinc-400 line-through decoration-zinc-300">
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
        )}

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/shop/todos"
            className="inline-block px-8 py-3 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </main>

      {/* 6. THE ARCHIVE SELECTION */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-32 md:py-48">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=2535&auto=format&fit=crop')] bg-cover bg-center grayscale pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl">
            <span className="inline-block border border-white/30 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-sm bg-white/5">
              Limited Edition
            </span>
            <h2 className="text-6xl md:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
              The <span className="text-zinc-600">Archive</span> <br />{" "}
              Selection
            </h2>
            <div className="flex flex-col md:flex-row gap-10 md:items-end border-t border-white/10 pt-10">
              <p className="text-zinc-400 max-w-lg text-base md:text-lg leading-relaxed font-medium">
                Una curaduría de las piezas más raras y codiciadas de los 90s y
                00s. Chaquetas universitarias, rompevientos técnicos y prendas
                de colección que definieron una era.
              </p>
              <Link
                href="/shop/ropa"
                className="group flex items-center gap-4 text-white font-bold uppercase tracking-[0.2em] text-sm hover:text-zinc-300 transition-colors"
              >
                Explorar Colección
                <span className="bg-white text-black rounded-full p-2 group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN CURATED BRANDS (GRID BRUTALISTA CON LOGOS) --- */}
      <section className="py-24 border-b border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter">
              Curated Brands
            </h3>
            <Link
              href="/shop/todos"
              className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4"
            >
              Ver Todas
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={`/shop/todos?search=${brand.name}`}
                className="group relative bg-white h-40 flex items-center justify-center overflow-hidden hover:bg-black transition-colors duration-500"
              >
                {/* Ajuste de CSS para que todos los logos se vean del mismo tamaño visual:
                   - h-10 md:h-14: Altura base para escritorio y móvil.
                   - w-auto: Mantiene la proporción.
                   - object-contain: Asegura que entre en la caja.
                   - brightness-0: Fuerza a que el logo sea NEGRO (unifica colores).
                   - invert: Al hacer hover, se vuelve BLANCO (por el fondo negro).
                */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-10 md:h-14 w-auto max-w-[70%] object-contain 
                             brightness-0 opacity-80 
                             group-hover:opacity-100 group-hover:invert 
                             transition-all duration-300"
                />
                <ArrowUpRight
                  className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  size={20}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-24 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                100% Auténtico
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Verificación manual de cada prenda. Sin réplicas, solo original.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <Truck size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Envíos Seguros
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Envío express a todo Ecuador con seguimiento en tiempo real.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <Star size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Piezas Únicas
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Vintage real. 1 de 1. Si te gusta, llévalo antes que otro.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <RefreshCcw size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Lavado & Listo
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Todas las prendas pasan por un proceso de lavado profesional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER */}
      <section className="py-32 px-4 text-center bg-white">
        <div className="max-w-xl mx-auto">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
            Don't Miss the Drop
          </h3>
          <p className="text-sm text-zinc-500 mb-8 font-medium">
            Suscríbete para recibir alertas de nuevos lanzamientos, eventos en
            Quito y descuentos exclusivos.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto border border-black p-1"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none placeholder:text-zinc-400"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              disabled={isSubscribing}
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="bg-black text-white px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isSubscribing ? "..." : "Suscribirse"}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 bg-zinc-50 py-20 text-center">
        <h2 className="text-5xl font-black tracking-tighter italic mb-8">
          AVNYC.
        </h2>
        <div className="flex justify-center gap-8 mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link href="#" className="hover:text-black transition-colors">
            Instagram
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            TikTok
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            WhatsApp
          </Link>
        </div>
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
          © 2025 Authentic Vintage NY. <br /> Quito, Ecuador.
        </p>
      </footer>
    </div>
  );
}
