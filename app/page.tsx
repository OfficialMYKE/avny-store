"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase";
import { ProductModal } from "@/components/product-modal";
import {
  Heart,
  ArrowRight,
  Truck,
  ShieldCheck,
  Star,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Minus,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { toast } from "sonner";
import Link from "next/link";

// --- DATOS DE MARCAS ---
const BRANDS = [
  {
    name: "Nike",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Nike-Logo.png",
  },
  {
    name: "Adidas",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Adidas-Logo-1991.png",
  },
  {
    name: "Under Armour",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png",
  },
  {
    name: "Stüssy",
    logo: "https://logos-world.net/wp-content/uploads/2022/12/Stussy-Logo-500x281.png",
  },
  {
    name: "The North Face",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/The-North-Face-Logo-700x394.png",
  },
  {
    name: "Converse",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Converse-Logo-2017-present-700x394.png",
  },
  {
    name: "New Balance",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Logo-700x394.png",
  },
  {
    name: "Fila",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Fila-Logo-700x394.png",
  },
];

// --- DATOS FAQ ---
const FAQS = [
  {
    question: "¿Las prendas son originales?",
    answer:
      "Absolutamente. Cada pieza pasa por un riguroso proceso de autenticación manual. Solo vendemos vintage auténtico de las décadas de los 80s, 90s y 00s traído de USA.",
  },
  {
    question: "¿Hacen envíos a todo el Ecuador?",
    answer:
      "Sí, enviamos a todas las provincias a través de Servientrega o Cooperativa. El tiempo de entrega es de 24 a 48 horas hábiles.",
  },
  {
    question: "¿La ropa viene lavada?",
    answer:
      "Sí. Todas nuestras prendas pasan por un proceso profesional de lavado y desinfección (Lavandería y Vapor) antes de ser puestas a la venta.",
  },
  {
    question: "¿Tienen tienda física?",
    answer:
      "Somos una tienda 100% online con base en Quito. Realizamos entregas personales en el norte de la ciudad previa cita.",
  },
];

// --- COMPONENTE SKELETON ---
const ProductSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex flex-col h-full animate-pulse">
    <div
      className={cn(
        "aspect-square rounded-sm mb-4 w-full",
        dark ? "bg-zinc-800" : "bg-zinc-200"
      )}
    />
    <div
      className={cn(
        "h-4 w-3/4 rounded mb-2",
        dark ? "bg-zinc-800" : "bg-zinc-200"
      )}
    />
    <div
      className={cn("h-3 w-1/2 rounded", dark ? "bg-zinc-800" : "bg-zinc-200")}
    />
  </div>
);

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [apparel, setApparel] = useState<any[]>([]);
  const [sneakers, setSneakers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [newAdsReq, kicksReq, clothesReq] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .gt("stock", 0)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("products")
            .select("*")
            .gt("stock", 0)
            .or(
              "section.ilike.%calzado%,category.ilike.%zapatos%,category.ilike.%sneakers%"
            )
            .limit(4),
          supabase
            .from("products")
            .select("*")
            .gt("stock", 0)
            .not("section", "ilike", "%calzado%")
            .limit(4),
        ]);

        if (isMounted) {
          if (newAdsReq.data) setNewArrivals(newAdsReq.data);
          if (kicksReq.data) setSneakers(kicksReq.data);
          if (clothesReq.data) setApparel(clothesReq.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

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

  const checkIsNew = (created_at: string) => {
    const productDate = new Date(created_at);
    const today = new Date();
    const differenceInTime = today.getTime() - productDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays <= 30;
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

  // --- COMPONENTE PRODUCT CARD MEJORADO ---
  const ProductCard = ({
    product,
    dark = false,
  }: {
    product: any;
    dark?: boolean;
  }) => {
    const isSoldOut = (product.stock || 0) <= 0;
    const hasDiscount =
      product.sale_price && product.sale_price < product.price;
    const isNewArrival = checkIsNew(product.created_at);

    return (
      <ProductModal product={product} allProducts={newArrivals}>
        <div className="group cursor-pointer flex flex-col h-full relative">
          {/* FOTO: Usamos 'bg-white' incluso en modo dark para contraste alto con la prenda */}
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

            {/* Favorite Button */}
            <button
              onClick={(e) => handleToggleFavorite(e, product)}
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

            {/* Vista Rápida (Desktop) */}
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center bg-black/5 pointer-events-none">
              <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 border border-black">
                <Eye size={14} /> Quick View
              </span>
            </div>

            {/* Imagen Optimizada */}
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

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* 1. TOP TICKER */}
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap relative flex z-50">
        <div className="animate-marquee-right flex min-w-full shrink-0 items-center justify-around">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="mx-8 text-[11px] font-bold uppercase tracking-[0.2em]">
                Envíos seguros a todo el Ecuador 🇪🇨
              </span>
              <span className="mx-8 text-[11px] font-bold uppercase tracking-[0.2em]">
                •
              </span>
              <span className="mx-8 text-[11px] font-bold uppercase tracking-[0.2em]">
                Ropa Nueva 100% Original
              </span>
              <span className="mx-8 text-[11px] font-bold uppercase tracking-[0.2em]">
                •
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative border-b border-zinc-100 bg-zinc-50 py-24 md:py-40 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-9xl font-black italic">
            NYC
          </div>
          <div className="absolute bottom-10 right-10 text-9xl font-black italic">
            NEW
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
            Piezas de colección <strong>nuevas y sin uso</strong> traídas desde
            Brooklyn, Bronx & Manhattan. Traemos el "Deadstock" neoyorquino
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

      {/* 3. CATEGORÍAS (IMAGEN APPAREL ACTUALIZADA) */}
      <section className="container mx-auto px-4 py-24 border-b border-zinc-100">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">
            Shop Category
          </h3>
          <Link
            href="/shop/todos"
            className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-zinc-600"
          >
            Ver Todo
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] md:h-[600px]">
          <Link
            href="/shop/ropa"
            className="group relative bg-zinc-100 overflow-hidden md:col-span-1 h-full"
          >
            {/* NUEVA IMAGEN: MÁS STREETWEAR/VINTAGE */}
            <Image
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop"
              alt="Apparel"
              fill
              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
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
            <Link
              href="/shop/zapatos"
              className="group relative flex-1 bg-zinc-100 overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop"
                alt="Footwear"
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
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
            <Link
              href="/shop/accesorios"
              className="group relative flex-1 bg-zinc-100 overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=2070&auto=format&fit=crop"
                alt="Accessories"
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
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

      {/* 4. NEW ARRIVALS (SLIDER) */}
      <main className="container mx-auto px-4 py-24 border-b border-zinc-100">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              New Arrivals
            </h2>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Últimas 8 adquisiciones listas para usar
            </p>
          </div>

          <div className="hidden md:flex gap-2">
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

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-10 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] md:min-w-[320px] snap-start"
                >
                  <ProductSkeleton />
                </div>
              ))
            : newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[280px] md:min-w-[320px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/shop/new"
            className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4"
          >
            Ver más New Arrivals
          </Link>
        </div>
      </main>

      {/* 5. THE SOURCING JOURNEY */}
      <section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Lado Izquierdo */}
          <div className="relative h-[500px] lg:h-auto bg-zinc-100 overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop"
              alt="NYC Streets"
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-8 left-8 text-white">
              <span className="block text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                Origin Point
              </span>
              <h3 className="text-6xl font-black italic tracking-tighter leading-none">
                BROOKLYN
                <br />
                NY.
              </h3>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="p-12 lg:p-24 flex flex-col justify-center bg-zinc-50 relative">
            <div className="absolute top-8 right-8 text-xs font-mono text-zinc-400">
              REF: NYC-UIO-2025
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6 block">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Direct from the <br /> Concrete Jungle.
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed mb-12 max-w-md font-medium">
              No intermediarios. No ropa usada. Viajamos a Nueva York para
              rescatar lotes de "Deadstock" (inventario antiguo nunca vendido)
              de los 90s y 00s.
            </p>

            {/* Manifiesto de Carga */}
            <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="block text-4xl font-black">JFK</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                    New York
                  </span>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-400 mb-1">
                    AIR FREIGHT
                  </span>
                  <div className="w-full h-px bg-zinc-300 relative">
                    <div className="absolute -top-1 right-0 w-2 h-2 bg-black rounded-full" />
                    <div className="absolute -top-1 left-0 w-2 h-2 bg-black rounded-full" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-black">UIO</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                    Quito
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Condition
                  </span>
                  <span className="text-sm font-bold">Brand New / Tags On</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Era
                  </span>
                  <span className="text-sm font-bold">1990s — 2000s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEPARATOR (HANDPICKED) --- */}
      <div className="overflow-hidden bg-white py-16 border-b border-zinc-100">
        <div className="animate-marquee-left flex min-w-full shrink-0 whitespace-nowrap items-center">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="mx-4 text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-zinc-900 select-none"
            >
              Handpicked in NYC •
            </span>
          ))}
          {[...Array(6)].map((_, i) => (
            <span
              key={`dup-${i}`}
              className="mx-4 text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-zinc-900 select-none"
            >
              Handpicked in NYC •
            </span>
          ))}
        </div>
      </div>

      {/* --- 6. HEAVY ROTATION (ROPA) MEJORADO --- */}
      <section className="py-32 bg-zinc-950 text-white border-b border-zinc-900 relative overflow-hidden">
        {/* Fondo sutil para dar profundidad */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4 block flex items-center gap-2">
                <span className="w-8 h-[1px] bg-zinc-500 inline-block"></span>
                Apparel Selection
              </span>
              <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                Heavy <br /> Rotation
              </h3>
            </div>
            <div className="flex flex-col items-start md:items-end gap-4">
              <p className="text-zinc-400 text-sm max-w-xs text-left md:text-right leading-relaxed">
                Prendas seleccionadas listas para tu rotación semanal. Vintage
                auténtico con estilo atemporal.
              </p>
              <Link
                href="/shop/ropa"
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-zinc-300 transition-colors border-b border-transparent hover:border-white pb-1"
              >
                Ver Todo Apparel{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-0">
                  <ProductSkeleton dark />
                </div>
              ))
            ) : apparel.length > 0 ? (
              apparel.map((product) => (
                <div
                  key={product.id}
                  className="transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Enviamos dark={true} pero la ProductCard maneja el bg-white internamente */}
                  <ProductCard product={product} dark={true} />
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-sm italic col-span-4 text-center py-20 border border-zinc-900 border-dashed rounded-lg">
                Próximamente más ropa en stock...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 7. THE ARCHIVE SELECTION (PARALLAX) */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-32 md:py-48 border-t border-zinc-800">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=2535&auto=format&fit=crop"
            alt="Archive Background"
            fill
            className="object-cover grayscale"
          />
        </div>
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
                de colección <strong>totalmente nuevas</strong>.
              </p>
              <Link
                href="/shop/ropa"
                className="group flex items-center gap-4 text-white font-bold uppercase tracking-[0.2em] text-sm hover:text-zinc-300 transition-colors"
              >
                Explorar Colección{" "}
                <span className="bg-white text-black rounded-full p-2 group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- 8. SNEAKER VAULT (ZAPATOS) --- */}
      <section className="py-24 bg-white border-b border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2 block">
              Footwear
            </span>
            <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
              The Sneaker Vault
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Modelos retro, colaboraciones difíciles de encontrar y clásicos
              atemporales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {loading ? (
              [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            ) : sneakers.length > 0 ? (
              sneakers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-zinc-300 text-sm italic col-span-4 text-center py-10">
                Próximamente...
              </p>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/shop/zapatos"
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4"
            >
              Ver todo el calzado
            </Link>
          </div>
        </div>
      </section>

      {/* 9. CURATED BRANDS */}
      <section className="py-24 border-b border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter">
              Curated Brands
            </h3>
            <Link
              href="/brands"
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
                <div className="relative w-[140px] h-14">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain brightness-0 opacity-80 group-hover:opacity-100 group-hover:invert transition-all duration-300"
                  />
                </div>
                <ArrowUpRight
                  className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  size={20}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-24 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-12 text-center">
            F.A.Q.
          </h3>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-zinc-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 transition-colors"
                >
                  <span className="font-bold text-sm uppercase tracking-wide">
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <Minus size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
                <div
                  className={cn(
                    "px-6 text-zinc-500 text-sm leading-relaxed transition-all duration-300 ease-in-out",
                    openFaqIndex === index
                      ? "max-h-40 pb-6 opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. WHY CHOOSE US */}
      <section className="py-24 bg-white border-b border-zinc-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                100% Auténtico
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Verificación manual. Solo original, nada de réplicas.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <Truck size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Envíos Seguros
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Envío express a todo Ecuador con seguimiento.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <Star size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Piezas Únicas
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Vintage real pero NUEVO. Si te gusta, llévalo.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <RefreshCcw size={28} />
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-2">
                Listo para Usar
              </h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                Prendas nuevas, limpias y listas para estrenar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. NEWSLETTER */}
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
