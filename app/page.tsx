import { createClient } from "./lib/supabase";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_sold", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* NAV */}
      <nav className="border-b-2 border-black sticky top-0 bg-white z-50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter italic">
          AUTHENTIC VINTAGE NY.
        </h1>
        <Link
          href="/login"
          className="text-xs font-bold underline hover:text-zinc-500"
        >
          ADMIN
        </Link>
      </nav>

      {/* PORTADA */}
      <header className="py-20 px-4 text-center border-b border-zinc-200 bg-zinc-50">
        <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase">
          Streetwear <br /> from Brooklyn
        </h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-8 font-mono text-sm">
          Piezas únicas seleccionadas en Nueva York. <br /> Enviamos a todo
          Ecuador por Servientrega.
        </p>
      </header>

      {/* GRILLA DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products?.map((product) => {
            // PREPARAMOS EL MENSAJE DE WHATSAPP AQUÍ
            // Usamos encodeURIComponent para que los espacios y saltos de línea funcionen bien
            const message = `Hola! 👋 Me interesa comprar esta prenda:\n\n🧢 *${product.title}*\n💰 Precio: $${product.price}\n\n¿Aún está disponible?\n\nVer foto: ${product.image_url}`;
            const whatsappLink = `https://wa.me/593986355332?text=${encodeURIComponent(
              message
            )}`;

            return (
              <div key={product.id} className="group relative">
                {/* FOTO */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 border border-black relative mb-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      Sin Foto
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase">
                    {product.size}
                  </div>
                </div>

                {/* INFO */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase">
                      {product.title}
                    </h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">
                      {product.condition}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-xl">
                      ${product.price}
                    </span>
                  </div>
                </div>

                {/* BOTÓN WHATSAPP MEJORADO */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  className="mt-4 w-full bg-black text-white py-3 font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Comprar
                </a>
              </div>
            );
          })}

          {(!products || products.length === 0) && (
            <div className="col-span-full text-center py-20 text-zinc-400">
              <p>Aún no hay stock disponible. Vuelve pronto.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-12 text-center text-xs text-zinc-400 font-mono">
        <p>© 2025 Authentic Vintage Store. Quito, Ecuador.</p>
      </footer>
    </div>
  );
}
