"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// --- LISTA COMPLETA DE MARCAS (URLs Optimizadas y Estables) ---
const ALL_BRANDS = [
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
    name: "Jordan",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Air-Jordan-Symbol-700x394.png",
  },
  {
    name: "Patagonia",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Patagonia-Logo-700x394.png",
  },
  {
    name: "Fila",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Fila-Logo-700x394.png",
  },
  {
    name: "Thrasher",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Thrasher-Emblem-700x394.png",
  },
  {
    name: "Umbro",
    logo: "https://logos-world.net/wp-content/uploads/2023/01/Umbro-Logo-2000-500x281.png",
  },
  {
    name: "Champion",
    logo: "https://logos-world.net/wp-content/uploads/2021/08/Champion-Emblem-700x394.png",
  },
  {
    name: "Vans",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Vans-Logo-1966-700x394.png",
  },
  {
    name: "Converse",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Converse-Logo-2017-present-700x394.png",
  },
  {
    name: "Levi's",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Levis-Logo-700x394.png",
  },
  {
    name: "Puma",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo-700x394.png",
  },
  {
    name: "Columbia",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Columbia-Logo-700x394.png",
  },
  {
    name: "Reebok",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Reebok-Logo-700x394.png",
  },
  {
    name: "New Balance",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Logo-700x394.png",
  },
  {
    name: "Nautica",
    logo: "https://logos-world.net/wp-content/uploads/2024/01/Nautica-Logo-500x281.png",
  },
  {
    name: "Lacoste",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Lacoste-Logo-2002-2011-700x394.png",
  },
];

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* Hero de Marcas */}
      <section className="bg-zinc-50 py-24 px-4 text-center border-b border-zinc-100">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
            Directory
          </span>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-[0.9]">
            Our Brands
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
            Trabajamos con las marcas que definieron la cultura del streetwear,
            el workwear y el sportswear de los 90s y 00s. Seleccionamos
            únicamente piezas con historia, durabilidad y estilo atemporal.
          </p>
        </div>
      </section>

      {/* Grid de Marcas Completo */}
      <section className="py-20 px-4 container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px bg-zinc-200 border border-zinc-200">
          {ALL_BRANDS.map((brand) => (
            <Link
              key={brand.name}
              href={`/shop/todos?search=${brand.name}`}
              className="group relative bg-white h-48 flex items-center justify-center overflow-hidden hover:bg-black transition-colors duration-500"
            >
              {/* Lógica Visual:
                  1. brightness-0: Fuerza a que el logo sea NEGRO por defecto.
                  2. group-hover:invert: Al hacer hover (fondo negro), invierte el logo a BLANCO.
                  3. object-contain: Asegura que el logo entre bien en la caja.
              */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 md:h-16 w-auto max-w-[70%] object-contain 
                           brightness-0 opacity-80 
                           group-hover:opacity-100 group-hover:invert 
                           transition-all duration-300 transform group-hover:scale-110"
              />

              <ArrowUpRight
                className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0"
                size={20}
              />

              <span className="absolute bottom-6 left-0 w-full text-center text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                Ver Colección
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Simple */}
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
