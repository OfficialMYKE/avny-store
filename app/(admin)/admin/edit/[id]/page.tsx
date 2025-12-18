"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; // Asegúrate de que esta ruta sea correcta
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Ruler,
  Plus,
  X,
  Box,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// LISTAS MAESTRAS
const CATEGORIES = [
  "Camisetas",
  "Hoodies",
  "Zapatos",
  "Pantalones",
  "Chaquetas",
  "Accesorios",
  "Gorras",
];
const GENDERS = ["Hombre", "Mujer", "Niños", "Unisex"];
const COLORS = [
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
const ADULT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "US 6",
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
  "OS",
];
const KIDS_SIZES = [
  "2T",
  "3T",
  "4T",
  "5T",
  "YS",
  "YM",
  "YL",
  "YXL",
  "10C",
  "11C",
  "12C",
  "13C",
  "1Y",
  "2Y",
  "3Y",
];

export default function EditProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    sale_price: "",
    stock: "", // Iniciamos como string vacío para evitar ceros molestos
    category: "",
    gender: "Unisex",
    colors: "",
    image_url: "",
  });

  // ESTADOS AUXILIARES
  const [sizesData, setSizesData] = useState<
    { size: string; available: boolean }[]
  >([]);
  const [soldOutColors, setSoldOutColors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingGallery, setExistingGallery] = useState<
    { color: string; images: string[] }[]
  >([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<
    Record<string, File[]>
  >({});

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Error al cargar producto");
        router.push("/admin/dashboard");
        return;
      }

      setFormData({
        title: data.title || "",
        price: data.price?.toString() || "",
        sale_price: data.sale_price?.toString() || "",
        // CORRECCIÓN: Si es null o undefined, ponemos "0".
        stock:
          data.stock !== null && data.stock !== undefined
            ? data.stock.toString()
            : "0",
        category: data.category || "",
        gender: data.gender || "Unisex",
        colors: Array.isArray(data.colors) ? data.colors[0] : data.colors || "",
        image_url: data.image_url || "",
      });

      if (data.sizes_data) setSizesData(data.sizes_data);
      else if (data.size) setSizesData([{ size: data.size, available: true }]);

      if (data.sold_out_colors) setSoldOutColors(data.sold_out_colors);
      if (data.gallery) setExistingGallery(data.gallery);

      setLoading(false);
    };

    fetchProduct();
  }, [id, router]);

  // MANEJADORES DE ESTADO
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSize = (size: string) => {
    setSizesData((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (!exists) return [...prev, { size, available: true }];
      if (exists.available)
        return prev.map((s) =>
          s.size === size ? { ...s, available: false } : s
        );
      return prev.filter((s) => s.size !== size);
    });
  };

  const toggleColorStock = (color: string) => {
    setSoldOutColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleNewGalleryFiles = (
    color: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewGalleryFiles((prev) => ({
        ...prev,
        [color]: [...(prev[color] || []), ...files],
      }));
    }
  };

  const removeNewFile = (color: string, index: number) => {
    setNewGalleryFiles((prev) => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (color: string, imgUrl: string) => {
    setExistingGallery((prev) =>
      prev
        .map((item) => {
          if (item.color === color)
            return {
              ...item,
              images: item.images.filter((img) => img !== imgUrl),
            };
          return item;
        })
        .filter((item) => item.images.length > 0)
    );
  };

  // 2. GUARDAR DATOS (SUBMIT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // A. Subir imagen principal si cambió
      let mainImageUrl = formData.image_url;
      if (imageFile) {
        const fileName = `main_${Date.now()}.${imageFile.name
          .split(".")
          .pop()}`;
        const { error, data } = await supabase.storage
          .from("images")
          .upload(fileName, imageFile);
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          mainImageUrl = urlData.publicUrl;
        }
      }

      // B. Subir galería nueva
      const newUploadedGallery: { color: string; images: string[] }[] = [];
      for (const [color, files] of Object.entries(newGalleryFiles)) {
        if (files.length === 0) continue;
        const urls: string[] = [];
        for (const file of files) {
          const fileName = `gallery_${color}_${Date.now()}_${Math.random()}.${file.name
            .split(".")
            .pop()}`;
          const { error } = await supabase.storage
            .from("images")
            .upload(fileName, file);
          if (!error) {
            const { data } = supabase.storage
              .from("images")
              .getPublicUrl(fileName);
            urls.push(data.publicUrl);
          }
        }
        newUploadedGallery.push({ color, images: urls });
      }

      // C. Combinar galerías
      const finalGalleryMap = new Map<string, string[]>();
      existingGallery.forEach((item) =>
        finalGalleryMap.set(item.color, item.images)
      );
      newUploadedGallery.forEach((item) => {
        const current = finalGalleryMap.get(item.color) || [];
        finalGalleryMap.set(item.color, [...current, ...item.images]);
      });
      const finalGalleryData = Array.from(finalGalleryMap.entries()).map(
        ([color, images]) => ({ color, images })
      );

      // D. Preparar Colores
      const colorsSet = new Set<string>();
      if (formData.colors) colorsSet.add(formData.colors);
      finalGalleryData.forEach((g) => colorsSet.add(g.color));

      // E. ACTUALIZAR BASE DE DATOS
      const { error } = await supabase
        .from("products")
        .update({
          title: formData.title,
          price: parseFloat(formData.price),
          sale_price: formData.sale_price
            ? parseFloat(formData.sale_price)
            : null,

          // --- CORRECCIÓN CLAVE AQUÍ ---
          // Usamos Number() en vez de parseInt para mayor precisión.
          stock: Number(formData.stock),
          // -----------------------------

          category: formData.category,
          gender: formData.gender,
          image_url: mainImageUrl,
          colors: Array.from(colorsSet),
          sizes_data: sizesData,
          sold_out_colors: soldOutColors,
          gallery: finalGalleryData,
          size: sizesData.map((s) => s.size).join(", "),
        })
        .eq("id", id);

      if (error) throw error;

      // Redirigir al panel
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full p-8 rounded-xl border shadow-sm my-10">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-zinc-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black italic">Editar Producto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="grid gap-4 p-5 border rounded-lg bg-zinc-50/50">
            <h3 className="font-bold text-sm text-muted-foreground uppercase">
              Información General
            </h3>

            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Precio ($)</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="bg-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-red-600">Oferta ($)</Label>
                <Input
                  name="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={handleChange}
                  className="bg-white border-red-100"
                />
              </div>

              {/* CAMPO STOCK CORREGIDO */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Box size={14} /> Stock
                </Label>
                <Input
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="bg-white border-blue-200 font-bold text-blue-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Género</Label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  required
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: TALLAS */}
          <div className="p-5 border rounded-lg bg-zinc-50/50">
            {/* ... (código de tallas igual que antes) ... */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-muted-foreground uppercase flex gap-2 items-center">
                <Ruler size={16} /> Tallas Disponibles
              </h3>
            </div>
            <p className="text-xs font-bold mb-2 uppercase">Adultos</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {ADULT_SIZES.map((size) => {
                const status = sizesData.find((s) => s.size === size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "w-12 h-9 rounded text-xs font-bold border transition-all",
                      !status &&
                        "bg-white text-muted-foreground hover:border-black",
                      status?.available === true &&
                        "bg-green-600 text-white border-green-600",
                      status?.available === false &&
                        "bg-red-50 text-red-500 border-red-200 line-through"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold mb-2 uppercase text-blue-600">
              Niños
            </p>
            <div className="flex flex-wrap gap-2">
              {KIDS_SIZES.map((size) => {
                const status = sizesData.find((s) => s.size === size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "w-12 h-9 rounded text-xs font-bold border transition-all",
                      !status &&
                        "bg-white text-muted-foreground hover:border-black",
                      status?.available === true &&
                        "bg-blue-600 text-white border-blue-600",
                      status?.available === false &&
                        "bg-red-50 text-red-500 border-red-200 line-through"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 3: FOTOS */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Portada</Label>
              <div className="flex gap-4 items-center">
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setImageFile(e.target.files[0])
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color Principal</Label>
              <select
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                required
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECCIÓN 4: VARIANTES */}
          <div className="space-y-4">
            {/* ... (código de galería igual que antes, solo asegúrate de cerrar bien los maps) ... */}
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Variantes (Stock & Fotos)
            </Label>
            <div className="grid gap-6 p-4 border rounded-lg bg-zinc-50">
              {COLORS.map((color) => {
                const existingForColor = existingGallery.find(
                  (g) => g.color === color
                );
                const newForColor = newGalleryFiles[color] || [];
                const isSoldOut = soldOutColors.includes(color);
                return (
                  <div
                    key={color}
                    className="space-y-2 border-b border-dashed pb-4 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{color}</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-zinc-200 px-2 py-1 rounded transition">
                          <input
                            type="checkbox"
                            checked={isSoldOut}
                            onChange={() => toggleColorStock(color)}
                            className="rounded border-gray-300"
                          />
                          <span
                            className={
                              isSoldOut
                                ? "text-red-600 font-bold"
                                : "text-muted-foreground"
                            }
                          >
                            {isSoldOut ? "Agotado" : "Marcar Agotado"}
                          </span>
                        </label>
                        <label className="cursor-pointer text-xs bg-black text-white px-3 py-1.5 rounded-md flex items-center gap-1">
                          <Plus size={12} /> Fotos
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleNewGalleryFiles(color, e)}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {existingForColor?.images.map((img, idx) => (
                        <div
                          key={`old-${idx}`}
                          className="relative w-12 h-12 flex-shrink-0 group"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover rounded border border-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(color, img)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {newForColor.map((file, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="relative w-12 h-12 flex-shrink-0 group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover rounded border border-blue-200 opacity-70"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewFile(color, idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" /> : "Guardar Cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
}
