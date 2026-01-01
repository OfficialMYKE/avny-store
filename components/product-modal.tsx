"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ruler,
  Heart,
  Truck,
  ShieldCheck,
  X,
  Star,
  RefreshCcw,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SizeGuide, SizeCategory } from "./SizeGuide";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useFavorites } from "@/context/FavoritesContext";

// --- DEFINICIÓN DE INTERFACES ---
interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  description?: string;
  image_url: string;
  extra_images?: string[];
  category: string;
  colors: string[] | string | null;
  size: string | null;
  sizes_data?: { size: string; available: boolean }[];
  sold_out_colors?: string[];
  gallery?: { color: string; images: string[] }[];
  is_sold?: boolean;
  created_at?: string;
}

interface ProductModalProps {
  product: Product;
  allProducts?: Product[];
  children: React.ReactNode;
}

export const ProductModal = ({
  product,
  allProducts = [],
  children,
}: ProductModalProps) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite, userContact, saveUserContact } =
    useFavorites();

  const [open, setOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [viewProduct, setViewProduct] = useState<Product>(product);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  const isProductFavorite = isFavorite(viewProduct.id);

  useEffect(() => {
    if (open) {
      loadProductData(product);
      setShowSizeGuide(false);
      setIsAdded(false);
      setShowContactForm(false);
      if (userContact?.email) setEmailInput(userContact.email);
    }
  }, [open, product, userContact]);

  const loadProductData = (p: Product) => {
    setViewProduct(p);
    setActiveImage(p.image_url);

    let defaultColor = "Único";
    if (Array.isArray(p.colors) && p.colors.length > 0)
      defaultColor = p.colors[0];
    else if (typeof p.colors === "string" && p.colors.trim() !== "")
      defaultColor = p.colors;
    setSelectedColor(defaultColor);

    let sizes = p.sizes_data || [];
    if (sizes.length === 0 && p.size) {
      sizes = p.size
        .split(",")
        .map((s) => ({ size: s.trim(), available: true }));
    }
    const firstAvailable = sizes.find((s) => s.available);
    setSelectedSize(
      firstAvailable ? firstAvailable.size : sizes[0]?.size || "Única"
    );
  };

  const hasDiscount =
    viewProduct.sale_price && viewProduct.sale_price < viewProduct.price;
  const currentPrice = hasDiscount ? viewProduct.sale_price : viewProduct.price;

  // Lógica simple para categoría de tallas
  const sizeCategory: SizeCategory = useMemo(() => {
    const cat = viewProduct.category.toLowerCase();
    if (cat.includes("niño") || cat.includes("kids")) return "kids";
    if (cat.includes("accesorio") || cat.includes("gorra"))
      return "accessories";
    if (cat.includes("pantalon") || cat.includes("short")) return "bottoms";
    if (
      cat.includes("ropa") ||
      cat.includes("camiseta") ||
      cat.includes("hoodie")
    )
      return "tops";
    return "shoes";
  }, [viewProduct.category]);

  const imagesToShow = useMemo(() => {
    const currentColorGallery =
      viewProduct.gallery?.find((g) => g.color === selectedColor)?.images || [];
    return Array.from(
      new Set([
        viewProduct.image_url,
        ...(viewProduct.extra_images || []),
        ...currentColorGallery,
      ])
    ).filter(Boolean);
  }, [viewProduct, selectedColor]);

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.category === viewProduct.category &&
        p.id !== viewProduct.id &&
        !p.is_sold
    )
    .slice(0, 3);

  const handleFavoriteClick = () => {
    if (isProductFavorite || userContact?.email) {
      handleToggleAction();
    } else {
      setShowContactForm(true);
    }
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Ingresa un correo válido");
      return;
    }
    const contactData = { email: emailInput, whatsapp: "" };
    saveUserContact(contactData);
    setShowContactForm(false);
    handleToggleAction(contactData);
    toast.success("¡Listo! Te avisaremos.");
  };

  const handleToggleAction = (manualContact?: {
    email: string;
    whatsapp: string;
  }) => {
    toggleFavorite(
      {
        id: viewProduct.id,
        title: viewProduct.title,
        image: viewProduct.image_url,
        price: currentPrice || 0,
        category: viewProduct.category,
        color: selectedColor || "Único",
        size: selectedSize || "Única",
      },
      manualContact
    );
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${viewProduct.id}-${selectedSize || "Única"}-${
        selectedColor || "Único"
      }`,
      productId: viewProduct.id,
      title: viewProduct.title,
      price: currentPrice || 0,
      image: viewProduct.image_url,
      size: selectedSize || "Única",
      color: selectedColor || "Único",
      quantity: 1,
    });
    toast.success("AGREGADO AL CARRITO");
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="fixed z-[100] gap-0 border-none bg-white p-0 shadow-2xl sm:rounded-none overflow-hidden max-w-5xl h-[100dvh] sm:h-[85vh] grid grid-cols-1 md:grid-cols-2"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{viewProduct.title}</DialogTitle>
          <DialogDescription>Detalles del producto</DialogDescription>
        </DialogHeader>

        <SizeGuide
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          category={sizeCategory}
        />

        {/* --- BOTÓN CERRAR FLOTANTE (Visible siempre) --- */}
        <DialogClose className="absolute right-4 top-4 z-[110] rounded-full bg-white/80 p-2 hover:bg-black hover:text-white transition-colors backdrop-blur-sm shadow-sm">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
        <div className="relative h-[45vh] md:h-full bg-zinc-50 flex flex-col justify-between group">
          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
            {viewProduct.is_sold && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                <span className="bg-zinc-900 text-white px-6 py-2 text-xl font-black uppercase tracking-widest transform -rotate-6">
                  Agotado
                </span>
              </div>
            )}
            <img
              src={activeImage}
              alt={viewProduct.title}
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {imagesToShow.length > 1 && (
            <div className="p-4 flex justify-center gap-2 overflow-x-auto scrollbar-hide bg-white/50 backdrop-blur-sm border-t border-zinc-100">
              {imagesToShow.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border bg-white transition-all",
                    activeImage === img
                      ? "border-black ring-1 ring-black opacity-100"
                      : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
                  )}
                >
                  <img
                    src={img}
                    className="h-full w-full object-cover mix-blend-multiply p-1"
                    alt={`view-${idx}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: INFO --- */}
        <div className="flex flex-col h-full overflow-y-auto bg-white">
          <div className="p-6 sm:p-10 flex-1">
            {/* Header Info */}
            <div className="mb-8 border-b border-zinc-100 pb-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  {viewProduct.category}
                </span>
                {hasDiscount && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-sm">
                    Sale
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-[0.9] mb-4">
                {viewProduct.title}
              </h2>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                  ${currentPrice?.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-zinc-400 line-through decoration-zinc-300">
                    ${viewProduct.price?.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Selectores */}
            <div className="space-y-8">
              {/* Colores */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Color Seleccionado
                </span>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(viewProduct.colors)
                    ? viewProduct.colors
                    : [viewProduct.colors || "Único"]
                  ).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "h-10 px-4 text-xs font-bold border rounded-sm transition-all uppercase tracking-wide",
                        selectedColor === c
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tallas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    Talla
                  </span>
                  {sizeCategory !== "accessories" && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-black hover:underline uppercase tracking-wide transition-colors"
                    >
                      <Ruler className="h-3 w-3" /> Guía
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    viewProduct.sizes_data || [
                      { size: viewProduct.size || "Única", available: true },
                    ]
                  ).map((s, idx) => (
                    <button
                      key={idx}
                      disabled={!s.available}
                      onClick={() => setSelectedSize(s.size)}
                      className={cn(
                        "min-w-[3rem] h-12 px-3 text-xs font-bold border rounded-sm transition-all uppercase",
                        selectedSize === s.size
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900",
                        !s.available &&
                          "opacity-30 cursor-not-allowed bg-zinc-100 decoration-zinc-400 line-through"
                      )}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdded || viewProduct.is_sold}
                  className={cn(
                    "h-14 flex-1 rounded-none text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl",
                    isAdded
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : "bg-black hover:bg-zinc-800 text-white"
                  )}
                >
                  {viewProduct.is_sold ? (
                    "Agotado"
                  ) : isAdded ? (
                    "En el carrito"
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" /> Agregar al
                      Carrito
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "h-14 w-14 rounded-none border-zinc-200 hover:bg-zinc-50 transition-all",
                    isProductFavorite &&
                      "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 hover:border-red-300"
                  )}
                  onClick={handleFavoriteClick}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isProductFavorite && "fill-current"
                    )}
                  />
                </Button>
              </div>

              {/* Garantías */}
              <div className="grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-200 mt-8 rounded-sm overflow-hidden">
                <div className="bg-white p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-zinc-900" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Auténtico
                    </p>
                    <p className="text-[9px] text-zinc-500">100% Original</p>
                  </div>
                </div>
                <div className="bg-white p-4 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-zinc-900" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Envío Rápido
                    </p>
                    <p className="text-[9px] text-zinc-500">Todo Ecuador</p>
                  </div>
                </div>
                <div className="bg-white p-4 flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-zinc-900" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Lavado
                    </p>
                    <p className="text-[9px] text-zinc-500">Listo para usar</p>
                  </div>
                </div>
                <div className="bg-white p-4 flex items-center gap-3">
                  <Star className="w-5 h-5 text-zinc-900" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Exclusivo
                    </p>
                    <p className="text-[9px] text-zinc-500">Pieza única</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="p-6 sm:p-10 bg-zinc-50 border-t border-zinc-100">
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                Quizás te interese
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    className="group cursor-pointer"
                    onClick={() => loadProductData(rel)}
                  >
                    <div className="aspect-square relative mb-2 overflow-hidden bg-white border border-zinc-200">
                      <img
                        src={rel.image_url}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 mix-blend-multiply p-2"
                        alt={rel.title}
                      />
                    </div>
                    <p className="line-clamp-1 text-[10px] font-bold uppercase leading-tight text-zinc-900 group-hover:underline">
                      {rel.title}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      ${rel.sale_price || rel.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* --- MODAL EMAIL --- */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[400px] z-[110] border-zinc-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
              Alertas de Precio
            </DialogTitle>
            <DialogDescription className="text-xs">
              Guarda este producto en favoritos y te avisaremos si baja de
              precio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest"
              >
                Correo Electrónico
              </Label>
              <Input
                id="email"
                placeholder="tu@email.com"
                className="h-12 bg-zinc-50 border-zinc-200 focus:bg-white"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-black text-white font-bold uppercase tracking-widest hover:bg-zinc-800"
            >
              Guardar y Continuar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
