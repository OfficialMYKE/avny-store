"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Ruler,
  Plus,
  Box,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// CONSTANTES IGUALES QUE ANTES...
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

export default function CreateProduct() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sale_price: "",
    stock: "1",
    category: "",
    colors: "",
    gender: "Unisex",
  });

  const [sizesData, setSizesData] = useState<
    { size: string; available: boolean }[]
  >([]);
  const [soldOutColors, setSoldOutColors] = useState<string[]>([]);

  // IMÁGENES
  const [imageFile, setImageFile] = useState<File | null>(null); // Portada
  const [extraFiles, setExtraFiles] = useState<File[]>([]); // NUEVO: Fotos de poses/ángulos
  const [galleryFiles, setGalleryFiles] = useState<Record<string, File[]>>({}); // Variantes por color

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  // Manejar fotos extra (poses)
  const handleExtraFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExtraFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  const removeExtraFile = (index: number) => {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGalleryChange = (
    color: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => ({
        ...prev,
        [color]: [...(prev[color] || []), ...newFiles],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir Portada
      let mainImageUrl = "";
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

      // 2. NUEVO: Subir Fotos Extra (Poses)
      const extraImagesUrls: string[] = [];
      for (const file of extraFiles) {
        const fileName = `extra_${Date.now()}_${Math.random()}.${file.name
          .split(".")
          .pop()}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, file);
        if (!error) {
          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          extraImagesUrls.push(data.publicUrl);
        }
      }

      // 3. Subir Galería por Color
      const galleryData: { color: string; images: string[] }[] = [];
      for (const [color, files] of Object.entries(galleryFiles)) {
        if (files.length === 0) continue;
        const uploadedUrls: string[] = [];
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
            uploadedUrls.push(data.publicUrl);
          }
        }
        if (uploadedUrls.length > 0)
          galleryData.push({ color, images: uploadedUrls });
      }

      const colorsSet = new Set<string>();
      if (formData.colors) colorsSet.add(formData.colors);
      galleryData.forEach((item) => colorsSet.add(item.color));

      const { error } = await supabase.from("products").insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          sale_price: formData.sale_price
            ? parseFloat(formData.sale_price)
            : null,
          stock: parseInt(formData.stock) || 1,
          category: formData.category,
          gender: formData.gender,
          colors: Array.from(colorsSet),
          image_url: mainImageUrl,
          extra_images: extraImagesUrls, // GUARDAMOS LAS NUEVAS FOTOS
          gallery: galleryData,
          sizes_data: sizesData,
          sold_out_colors: soldOutColors,
          size: sizesData.map((s) => s.size).join(", "),
          is_sold: false,
        },
      ]);

      if (error) throw error;
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-black italic">Nuevo Producto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: INFO GENERAL (Sin cambios) */}
          <div className="grid gap-4 p-5 border rounded-lg bg-zinc-50/50">
            <h3 className="font-bold text-sm text-muted-foreground uppercase">
              Información General
            </h3>
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                name="title"
                required
                onChange={handleChange}
                className="bg-white"
                placeholder="Ej: Camiseta Mickey Vintage"
              />
            </div>
            <div className="space-y-1">
              <Label>Descripción & Detalles</Label>
              <textarea
                name="description"
                rows={4}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                placeholder="Describe el estado..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Precio ($)</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  onChange={handleChange}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-red-600">Oferta ($)</Label>
                <Input
                  name="sale_price"
                  type="number"
                  step="0.01"
                  onChange={handleChange}
                  className="bg-white border-red-100"
                />
              </div>
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
                  className="bg-white border-blue-200"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select
                  name="category"
                  required
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar...
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Género / Público</Label>
                <select
                  name="gender"
                  required
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  defaultValue="Unisex"
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

          {/* SECCIÓN 2: TALLAS (Sin cambios, resumido) */}
          <div className="p-5 border rounded-lg bg-zinc-50/50">
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

          {/* SECCIÓN 3: FOTOS PRINCIPALES Y POSES (MODIFICADO) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Foto Portada</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && setImageFile(e.target.files[0])
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Color Principal</Label>
              <select
                name="colors"
                required
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Seleccionar...
                </option>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NUEVA SECCIÓN: FOTOS ADICIONALES (POSES) */}
          <div className="space-y-2 p-4 border rounded-lg bg-zinc-50">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Otras Poses / Ángulos
                (Opcional)
              </Label>
              <label className="cursor-pointer text-xs bg-black text-white px-3 py-1.5 rounded-md flex items-center gap-1">
                <Plus size={12} /> Agregar Fotos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleExtraFilesChange}
                />
              </label>
            </div>
            {extraFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {extraFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 flex-shrink-0 group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraFile(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 4: VARIANTES POR COLOR (Sin cambios) */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              Variantes Específicas por Color (Opcional)
            </Label>
            <div className="grid gap-6 p-4 border rounded-lg bg-zinc-50">
              {COLORS.map((color) => (
                <div
                  key={color}
                  className="space-y-2 border-b border-dashed pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{color}</span>
                    <label className="cursor-pointer text-xs bg-black text-white px-3 py-1.5 rounded-md flex items-center gap-1">
                      <Plus size={12} /> Fotos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleGalleryChange(color, e)}
                      />
                    </label>
                  </div>
                  {galleryFiles[color] && (
                    <div className="flex gap-2 py-2">
                      {galleryFiles[color].map((file, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 bg-white border rounded overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Publicar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
