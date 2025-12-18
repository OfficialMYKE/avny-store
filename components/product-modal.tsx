"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ShoppingBag, Ruler } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener utils o la función auxiliar

// --- DATOS DE LA TABLA DE TALLAS (Recreado de tu imagen) ---
const SIZE_CHART_DATA = [
  { us_men: "7", col: "38", us_women: "8.5", kids: "7Y", cm: "25" },
  { us_men: "7.5", col: "38.5", us_women: "9", kids: "-", cm: "25.5" },
  { us_men: "8", col: "39", us_women: "9.5", kids: "-", cm: "26" },
  { us_men: "8.5", col: "39.5", us_women: "10", kids: "-", cm: "26.5" },
  { us_men: "9", col: "40", us_women: "10.5", kids: "-", cm: "27" },
  { us_men: "9.5", col: "40.5", us_women: "11", kids: "-", cm: "27.5" },
  { us_men: "10", col: "41", us_women: "11.5", kids: "-", cm: "28" },
  { us_men: "10.5", col: "41.5", us_women: "12", kids: "-", cm: "28.5" },
  { us_men: "11", col: "42", us_women: "12.5", kids: "-", cm: "29" },
  { us_men: "11.5", col: "42.5", us_women: "13", kids: "-", cm: "29.5" },
  { us_men: "12", col: "43", us_women: "13.5", kids: "-", cm: "30" },
];

interface ProductModalProps {
  product: any;
  children: React.ReactNode;
}

export const ProductModal = ({ product, children }: ProductModalProps) => {
  // 1. Manejo de COLORES
  const colorsList = Array.isArray(product.colors) ? product.colors : [];
  const soldOutColors = Array.isArray(product.sold_out_colors)
    ? product.sold_out_colors
    : [];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorsList.length > 0 ? colorsList[0] : null
  );

  // 2. Manejo de TALLAS (Compatibilidad sistema nuevo y viejo)
  const hasNewSizeSystem =
    product.sizes_data &&
    Array.isArray(product.sizes_data) &&
    product.sizes_data.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (hasNewSizeSystem) {
      // Seleccionar la primera talla disponible automáticamente
      const firstAvailable = product.sizes_data.find(
        (s: any) => s.available === true
      );
      if (firstAvailable) setSelectedSize(firstAvailable.size);
    } else {
      setSelectedSize(product.size); // Sistema antiguo
    }
  }, [product]);

  // 3. Manejo de IMÁGENES
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getDisplayImages = () => {
    let images = [product.image_url];
    if (selectedColor) {
      const variant = product.gallery?.find(
        (item: any) => item.color === selectedColor
      );
      if (variant?.images?.length > 0) images = variant.images;
    }
    return images;
  };

  const currentImages = getDisplayImages();

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // Precios y WhatsApp
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const currentPrice = hasDiscount ? product.sale_price : product.price;

  const message = `Hola! 👋 Me interesa: ${product.title} 
Color: ${selectedColor || "N/A"}
Talla: ${selectedSize || "N/A"}
Precio: $${currentPrice}`;
  const whatsappLink = `https://wa.me/593986355332?text=${encodeURIComponent(
    message
  )}`;

  // Estado para el Modal de Guía de Tallas
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[900px] p-0 overflow-hidden bg-white gap-0 border-none"
        aria-describedby="product-desc"
      >
        <div className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>Detalles de {product.title}</DialogDescription>
        </div>

        <div className="grid md:grid-cols-2 h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
          {/* --- FOTOS --- */}
          <div className="bg-zinc-50 relative flex flex-col h-full min-h-[400px]">
            <div className="flex-1 relative overflow-hidden">
              <img
                src={currentImages[currentImageIndex]}
                alt={product.title}
                className="object-cover w-full h-full absolute inset-0 transition-opacity duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  Oferta
                </span>
              )}
            </div>
            {currentImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-white border-t scrollbar-hide">
                {currentImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "w-16 h-16 border-2 rounded-md overflow-hidden flex-shrink-0",
                      currentImageIndex === idx
                        ? "border-black"
                        : "border-transparent opacity-60"
                    )}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`view ${idx}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- INFO --- */}
          <div className="p-6 md:p-8 flex flex-col bg-white h-full overflow-y-auto relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">
                  {product.category}
                </p>
                <h2 className="text-2xl md:text-3xl font-black italic uppercase leading-none mb-4">
                  {product.title}
                </h2>
              </div>

              {/* --- BOTÓN GUÍA DE TALLAS (SOLO ZAPATOS) --- */}
              {product.category === "Zapatos" && (
                <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-8 underline text-muted-foreground hover:text-black"
                    >
                      <Ruler size={14} /> Guía de Tallas
                    </Button>
                  </DialogTrigger>

                  {/* CONTENIDO DEL MODAL DE LA TABLA */}
                  <DialogContent className="max-w-3xl bg-white p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                    <DialogTitle className="text-center font-black text-2xl uppercase italic mb-2">
                      Tabla de Tallas
                    </DialogTitle>
                    <DialogDescription className="text-center mb-6">
                      Encuentra tu talla en la siguiente tabla. Las medidas son
                      aproximadas.
                    </DialogDescription>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm text-center">
                        <thead className="bg-zinc-800 text-white font-bold uppercase text-[10px] md:text-xs">
                          <tr>
                            <th className="p-3">
                              Hombre
                              <br />
                              USA
                            </th>
                            <th className="p-3">
                              Hombre
                              <br />
                              COL
                            </th>
                            <th className="p-3">
                              Mujer
                              <br />
                              USA
                            </th>
                            <th className="p-3">
                              Niño/a
                              <br />
                              USA
                            </th>
                            <th className="p-3 bg-zinc-600">
                              Largo
                              <br />
                              CM
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-zinc-700 font-medium">
                          {SIZE_CHART_DATA.map((row, i) => (
                            <tr
                              key={i}
                              className="even:bg-zinc-100 border-b last:border-0 hover:bg-zinc-200 transition-colors"
                            >
                              <td className="p-3">{row.us_men}</td>
                              <td className="p-3">{row.col}</td>
                              <td className="p-3">{row.us_women}</td>
                              <td className="p-3">{row.kids}</td>
                              <td className="p-3 font-bold text-black bg-zinc-50">
                                {row.cm}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 text-xs text-muted-foreground bg-zinc-50 p-4 rounded-md">
                      <p className="font-bold mb-1 text-black">¿Cómo medir?</p>
                      <p>
                        Si no sabes cuál es tu talla, mide el largo de tu pie en
                        cm (desde el talón hasta el dedo más largo) y busca la
                        equivalencia en la columna <strong>LARGO CM</strong>.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black">${currentPrice}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                  ${product.price}
                </span>
              )}
            </div>

            {/* SELECTOR DE COLOR */}
            {colorsList.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">
                  Color:{" "}
                  <span className="font-normal text-muted-foreground">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color: string) => {
                    const isSoldOut = soldOutColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-3 py-1.5 border rounded-md text-sm transition-all relative overflow-hidden",
                          selectedColor === color
                            ? "border-black bg-black text-white"
                            : "border-zinc-200 hover:border-black",
                          isSoldOut &&
                            "opacity-50 cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400"
                        )}
                      >
                        {color}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-full h-[1px] bg-red-500 rotate-45"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SELECTOR DE TALLA */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-2">
                Talla:{" "}
                <span className="font-normal text-muted-foreground">
                  {selectedSize || "Selecciona"}
                </span>
              </p>
              {hasNewSizeSystem ? (
                <div className="flex flex-wrap gap-2">
                  {product.sizes_data.map((s: any) => (
                    <button
                      key={s.size}
                      disabled={!s.available}
                      onClick={() => s.available && setSelectedSize(s.size)}
                      className={cn(
                        "min-w-[3rem] h-10 px-2 border rounded font-bold text-sm transition-all flex items-center justify-center relative",
                        selectedSize === s.size
                          ? "bg-black text-white border-black"
                          : "hover:border-black",
                        !s.available &&
                          "opacity-40 bg-zinc-100 text-zinc-400 cursor-not-allowed hover:border-zinc-200"
                      )}
                    >
                      {s.size}
                      {!s.available && (
                        <span className="absolute w-[120%] h-[1px] bg-red-400 rotate-[-25deg]"></span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Fallback para productos antiguos
                <div className="inline-block px-4 py-2 bg-zinc-100 rounded text-sm font-bold">
                  {product.size}
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t">
              <Button
                size="lg"
                className="w-full text-lg gap-2 h-12"
                asChild
                disabled={!selectedSize}
              >
                <a href={whatsappLink} target="_blank">
                  <ShoppingBag size={20} />
                  {selectedSize
                    ? "Comprar en WhatsApp"
                    : "Selecciona una Talla"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
