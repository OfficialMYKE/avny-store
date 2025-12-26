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
  ArrowRight,
  ShoppingCart,
  Heart,
  Check,
  Mail,
  Phone,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SizeGuide } from "./SizeGuide";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useFavorites } from "@/context/FavoritesContext";

// --- DEFINICIÓN DE INTERFACES (Esto es lo que faltaba) ---
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

  const [open, setOpen] = useState(false);

  // ESTADO PARA EL DIALOGO DE CAPTURA DE DATOS
  const [showContactForm, setShowContactForm] = useState(false);
  const [tempContact, setTempContact] = useState({ email: "", whatsapp: "" });

  // Estado local del producto
  const [viewProduct, setViewProduct] = useState<Product>(product);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  // Verificamos si es favorito
  const isProductFavorite = isFavorite(viewProduct.id);

  useEffect(() => {
    if (open) {
      loadProductData(product);
      setShowSizeGuide(false);
      setIsAdded(false);
      setShowContactForm(false);
    }
  }, [open, product]);

  const loadProductData = (p: Product) => {
    setViewProduct(p);
    setActiveImage(p.image_url);

    let defaultColor = "Único";
    if (Array.isArray(p.colors) && p.colors.length > 0) {
      defaultColor = p.colors[0];
    } else if (typeof p.colors === "string" && p.colors.trim() !== "") {
      defaultColor = p.colors;
    }
    setSelectedColor(defaultColor);

    let defaultSize = "Única";
    let sizes = p.sizes_data || [];
    if (sizes.length === 0 && p.size) {
      sizes = p.size
        .split(",")
        .map((s) => ({ size: s.trim(), available: true }));
    }
    const firstAvailable = sizes.find((s) => s.available);
    if (firstAvailable) {
      defaultSize = firstAvailable.size;
    } else if (sizes.length > 0) {
      defaultSize = sizes[0].size;
    }
    setSelectedSize(defaultSize);
  };

  const hasDiscount =
    viewProduct.sale_price && viewProduct.sale_price < viewProduct.price;
  const currentPrice = hasDiscount ? viewProduct.sale_price : viewProduct.price;

  const colorsArray = useMemo(() => {
    if (Array.isArray(viewProduct.colors) && viewProduct.colors.length > 0)
      return viewProduct.colors;
    if (typeof viewProduct.colors === "string" && viewProduct.colors)
      return [viewProduct.colors];
    return ["Único"];
  }, [viewProduct.colors]);

  const sizesList = useMemo(() => {
    let list = viewProduct.sizes_data || [];
    if (list.length === 0) {
      if (viewProduct.size) {
        list = viewProduct.size
          .split(",")
          .map((s) => ({ size: s.trim(), available: true }));
      } else {
        list = [{ size: "Única", available: true }];
      }
    }
    return list;
  }, [viewProduct.sizes_data, viewProduct.size]);

  const currentColorGallery =
    viewProduct.gallery?.find((g) => g.color === selectedColor)?.images || [];
  const extraImages = viewProduct.extra_images || [];
  const imagesToShow = [
    viewProduct.image_url,
    ...extraImages,
    ...currentColorGallery,
  ].filter(Boolean);
  const uniqueImages = Array.from(new Set(imagesToShow));

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.category === viewProduct.category &&
        p.id !== viewProduct.id &&
        !p.is_sold
    )
    .slice(0, 3);

  // --- LÓGICA DE FAVORITOS MEJORADA ---
  const handleFavoriteClick = () => {
    if (isProductFavorite) {
      handleToggleAction();
      return;
    }
    if (userContact) {
      handleToggleAction();
    } else {
      setShowContactForm(true);
    }
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempContact.email && !tempContact.whatsapp) {
      toast.error("Por favor ingresa al menos un método de contacto");
      return;
    }
    saveUserContact(tempContact);
    setShowContactForm(false);
    handleToggleAction();
    toast.success("¡Datos guardados!", {
      description: "Te avisaremos de ofertas.",
    });
  };

  const handleToggleAction = () => {
    toggleFavorite({
      id: viewProduct.id,
      title: viewProduct.title,
      image: viewProduct.image_url,
      price: currentPrice || 0,
      category: viewProduct.category,
      color: selectedColor || "Único",
      size: selectedSize || "Única",
    });
  };

  const handleAddToCart = () => {
    const finalSize = selectedSize || "Única";
    const finalColor = selectedColor || "Único";

    addToCart({
      id: `${viewProduct.id}-${finalSize}-${finalColor}`,
      productId: viewProduct.id,
      title: viewProduct.title,
      price: currentPrice || 0,
      image: viewProduct.image_url,
      size: finalSize,
      color: finalColor,
      quantity: 1,
    });

    toast.success("¡Producto agregado al carrito!", {
      description: `${viewProduct.title} - ${finalSize} / ${finalColor}`,
      duration: 3000,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* CONTENIDO PRINCIPAL */}
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-4xl w-full p-0 bg-white gap-0 rounded-none sm:rounded-lg border-none shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogTitle className="hidden">{viewProduct.title}</DialogTitle>

        <SizeGuide
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
        />

        <div className="grid sm:grid-cols-2 overflow-y-auto h-full">
          {/* FOTOS */}
          <div className="bg-zinc-50 p-4 sm:p-0 flex flex-col gap-4">
            <div className="aspect-square w-full bg-white flex items-center justify-center overflow-hidden border-b sm:border-r sm:border-b-0 p-8">
              <img
                src={activeImage}
                alt={viewProduct.title}
                className="object-contain w-full h-full mix-blend-multiply transition-opacity duration-300"
              />
            </div>
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "w-16 h-16 border-2 rounded overflow-hidden flex-shrink-0 transition-all bg-white",
                      activeImage === img
                        ? "border-black opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                {viewProduct.category}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">
                {viewProduct.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">${currentPrice}</span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through decoration-red-500 decoration-2">
                    ${viewProduct.price}
                  </span>
                )}
              </div>
            </div>

            {viewProduct.description && (
              <div className="text-sm text-zinc-600 leading-relaxed border-l-2 border-black pl-4 py-1">
                {viewProduct.description}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase">
                  Color: {selectedColor}
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorsArray.map((c) => {
                    const isSoldOut = viewProduct.sold_out_colors?.includes(c);
                    return (
                      <button
                        key={c}
                        disabled={isSoldOut}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold border transition-all rounded-sm",
                          selectedColor === c
                            ? "bg-black text-white border-black"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-black",
                          isSoldOut &&
                            "opacity-50 line-through cursor-not-allowed bg-zinc-100"
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase">
                    Talla: {selectedSize}
                  </span>
                  {viewProduct.category === "Zapatos" && (
                    <div
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[10px] flex items-center gap-1 text-muted-foreground cursor-pointer hover:underline hover:text-black transition-colors"
                    >
                      <Ruler size={12} /> Guía de Tallas
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((s, idx) => (
                    <button
                      key={idx}
                      disabled={s.available === false}
                      onClick={() => setSelectedSize(s.size)}
                      className={cn(
                        "min-w-[40px] h-10 px-2 flex items-center justify-center text-xs font-bold border transition-all rounded-sm",
                        selectedSize === s.size
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-black",
                        s.available === false &&
                          "opacity-40 line-through cursor-not-allowed bg-zinc-50 border-transparent text-zinc-300"
                      )}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-zinc-300 hover:border-red-500 hover:bg-red-50 flex-shrink-0"
                onClick={handleFavoriteClick}
                title={
                  isProductFavorite
                    ? "Quitar de Favoritos"
                    : "Agregar a Favoritos"
                }
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-all",
                    isProductFavorite
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-zinc-600"
                  )}
                />
              </Button>

              <Button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={cn(
                  "flex-1 h-12 text-base font-bold uppercase tracking-wide gap-2 text-white shadow-md transition-all duration-300",
                  isAdded
                    ? "bg-green-600 hover:bg-green-700 scale-105"
                    : "bg-black hover:bg-zinc-800"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 animate-in zoom-in" /> ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                  </>
                )}
              </Button>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-dashed">
                <h4 className="text-xs font-bold uppercase mb-4 text-muted-foreground flex items-center gap-2">
                  <ArrowRight size={14} /> También te podría gustar
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      className="group cursor-pointer"
                      onClick={() => loadProductData(rel)}
                    >
                      <div className="aspect-square bg-zinc-100 rounded-sm overflow-hidden mb-2 relative border border-transparent hover:border-black transition-all">
                        <img
                          src={rel.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-[10px] font-bold line-clamp-1 leading-tight mt-1">
                        {rel.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ${rel.sale_price || rel.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* --- SUB-DIALOGO PARA PEDIR DATOS --- */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic">
              ¡No te pierdas las ofertas!
            </DialogTitle>
            <DialogDescription>
              Para guardar en favoritos y avisarte si este producto baja de
              precio, necesitamos saber dónde escribirte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="tu@email.com"
                  className="pl-9"
                  value={tempContact.email}
                  onChange={(e) =>
                    setTempContact({ ...tempContact, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold text-center justify-center my-1">
              - O -
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp" className="font-bold">
                WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="099..."
                  className="pl-9"
                  type="tel"
                  value={tempContact.whatsapp}
                  onChange={(e) =>
                    setTempContact({ ...tempContact, whatsapp: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full font-bold bg-black text-white mt-2"
            >
              Guardar y Agregar a Favoritos
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
