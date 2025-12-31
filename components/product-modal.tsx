"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ruler,
  ShoppingCart,
  Heart,
  Check,
  Mail,
  Truck,
  ShieldCheck,
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

  // ESTADO INICIAL: FALSE (Para que no se abra solo al cargar la página)
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

  const sizeCategory: SizeCategory = useMemo(() => {
    const cat = viewProduct.category.toLowerCase();
    const title = viewProduct.title.toLowerCase();
    if (cat.includes("niño") || cat.includes("kids")) return "kids";
    if (
      cat.includes("accesorio") ||
      cat.includes("gorra") ||
      cat.includes("bolso")
    )
      return "accessories";
    if (
      cat.includes("pantalon") ||
      title.includes("pant") ||
      title.includes("short")
    )
      return "bottoms";
    if (
      cat.includes("ropa") ||
      title.includes("camiseta") ||
      title.includes("hoodie")
    )
      return "tops";
    return "shoes";
  }, [viewProduct.category, viewProduct.title]);

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
      toast.error("Por favor ingresa un correo válido");
      return;
    }
    const contactData = { email: emailInput, whatsapp: "" };
    saveUserContact(contactData);
    setShowContactForm(false);
    handleToggleAction(contactData);
    toast.success("¡Correo guardado!");
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
    toast.success("¡Agregado al carrito!");
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* Z-INDEX 100 para estar encima de todo */}
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="fixed left-[50%] top-[50%] z-[100] grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-white p-0 shadow-2xl sm:rounded-xl overflow-hidden h-[95vh] sm:h-[85vh] md:grid-cols-2"
      >
        {/* SOLUCIÓN AL WARNING: Descripción invisible */}
        <DialogHeader className="sr-only">
          <DialogTitle>{viewProduct.title}</DialogTitle>
          <DialogDescription>
            Detalles del producto {viewProduct.title}, precio ${currentPrice},
            categoría {viewProduct.category}.
          </DialogDescription>
        </DialogHeader>

        <SizeGuide
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          category={sizeCategory}
        />

        {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
        <div className="relative h-[40vh] md:h-full bg-[#f9f9f9] flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <img
              src={activeImage}
              alt={viewProduct.title}
              className="h-full w-full object-contain mix-blend-multiply transition-all duration-500 animate-in fade-in zoom-in-95"
            />
          </div>
          {imagesToShow.length > 1 && (
            <div className="flex gap-2 px-6 pb-6 overflow-x-auto scrollbar-hide justify-center">
              {imagesToShow.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border bg-white transition-all",
                    activeImage === img
                      ? "border-black ring-1 ring-black"
                      : "border-transparent opacity-70"
                  )}
                >
                  <img
                    src={img}
                    className="h-full w-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: INFO --- */}
        <div className="flex flex-col h-full overflow-y-auto bg-white p-6 sm:p-10 scrollbar-thin scrollbar-thumb-zinc-200">
          <div className="mb-8 border-b border-zinc-100 pb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              {viewProduct.category}
            </span>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 leading-[0.9] mb-4">
              {viewProduct.title}
            </h2>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold tracking-tight">
                ${currentPrice}
              </span>
              {hasDiscount && (
                <span className="mb-1 text-lg text-zinc-400 line-through">
                  ${viewProduct.price}
                </span>
              )}
              {viewProduct.is_sold && (
                <span className="mb-1 rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Agotado
                </span>
              )}
            </div>
          </div>

          {viewProduct.description && (
            <p className="text-sm leading-relaxed text-zinc-600 mb-8">
              {viewProduct.description}
            </p>
          )}

          <div className="space-y-8 flex-1">
            {/* Colores */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Color:{" "}
                <span className="text-zinc-500 font-normal ml-1">
                  {selectedColor}
                </span>
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
                      "px-4 py-2 text-xs font-medium border rounded-sm transition-all",
                      selectedColor === c
                        ? "bg-black text-white border-black"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
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
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Talla:{" "}
                  <span className="text-zinc-500 font-normal ml-1">
                    {selectedSize}
                  </span>
                </span>
                {sizeCategory !== "accessories" && (
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-black underline underline-offset-4"
                  >
                    <Ruler className="h-3 w-3" /> Guía de Tallas
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
                      "min-w-[48px] h-12 px-2 text-xs font-bold border rounded-sm transition-all",
                      selectedSize === s.size
                        ? "bg-black text-white border-black ring-2 ring-black ring-offset-2"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900",
                      !s.available && "opacity-40 cursor-not-allowed bg-zinc-50"
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-14 w-14 rounded-sm border-zinc-200 transition-all",
                isProductFavorite && "border-red-500 bg-red-50 text-red-500"
              )}
              onClick={handleFavoriteClick}
            >
              <Heart
                className={cn("h-6 w-6", isProductFavorite && "fill-current")}
              />
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={isAdded || viewProduct.is_sold}
              className={cn(
                "h-14 flex-1 rounded-sm text-sm font-bold uppercase tracking-widest transition-all",
                isAdded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-black hover:bg-zinc-800"
              )}
            >
              {viewProduct.is_sold
                ? "Agotado"
                : isAdded
                ? "Agregado"
                : "Agregar al Carrito"}
            </Button>
          </div>

          {/* Footer Informativo */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-dashed border-zinc-200 pt-6">
            <div className="flex items-center gap-3 text-zinc-500">
              <Truck className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wide">
                Envíos a todo Ecuador
              </span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wide">
                Compra Segura
              </span>
            </div>
          </div>

          {/* Productos Relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-zinc-100">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                También te podría gustar
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    className="group cursor-pointer"
                    onClick={() => loadProductData(rel)}
                  >
                    <div className="aspect-square relative mb-2 overflow-hidden rounded-sm bg-zinc-50">
                      <img
                        src={rel.image_url}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                        alt={rel.title}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="line-clamp-1 text-[10px] font-bold uppercase leading-tight text-zinc-900">
                        {rel.title}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        ${rel.sale_price || rel.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* --- MODAL EMAIL --- */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[400px] z-[110]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic">
              ¡Avísame de ofertas!
            </DialogTitle>
            <DialogDescription>
              Déjanos tu correo para alertas de precio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold">
                Tu Correo
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="ejemplo@gmail.com"
                  className="pl-9 rounded-sm"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-black font-bold text-white uppercase tracking-widest rounded-sm h-12"
            >
              Guardar Alerta
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
