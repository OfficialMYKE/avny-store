"use client";

import { useState } from "react";
import { ArrowLeft, Save, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase";

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Estado para guardar el archivo de imagen seleccionado
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    size: "M",
    category: "Hoodies & Sweatshirts",
    condition: "9/10 (Excelente vintage)",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Detectar cuando el usuario elige un archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validamos que haya foto
    if (!imageFile) {
      alert(
        "¡Falta la foto! Tu primo tiene que subir una imagen de la prenda."
      );
      return;
    }

    setLoading(true);

    try {
      // 1. SUBIR LA FOTO A SUPABASE (BUCKET 'IMAGES')
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images") // Nombre del bucket que acabas de crear
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. OBTENER EL LINK PÚBLICO
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName);

      // 3. GUARDAR EL PRODUCTO EN LA BASE DE DATOS
      const { error: dbError } = await supabase.from("products").insert([
        {
          title: formData.title,
          price: parseFloat(formData.price),
          size: formData.size,
          category: formData.category,
          condition: formData.condition,
          image_url: publicUrl, // Aquí guardamos el link real
          is_sold: false,
        },
      ]);

      if (dbError) throw dbError;

      alert("¡Producto publicado con foto!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver al inventario
        </Link>

        <div className="bg-white border border-zinc-200 shadow-sm p-8 rounded-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            Nueva Prenda (Con Foto)
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AREA DE SUBIDA DE FOTO */}
            <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*" // Solo acepta imágenes
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={32} className="text-zinc-400 mb-2" />
              {imageFile ? (
                <div className="text-green-600 font-bold">
                  ✅ Foto lista: {imageFile.name}
                </div>
              ) : (
                <>
                  <span className="text-black font-semibold">
                    Toca aquí para subir foto
                  </span>
                  <span className="text-zinc-500 block text-xs mt-1">
                    JPG o PNG
                  </span>
                </>
              )}
            </div>

            {/* CAMPOS DE TEXTO */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Título
              </label>
              <input
                name="title"
                onChange={handleChange}
                type="text"
                required
                placeholder="Ej: Carhartt Detroit Jacket"
                className="w-full px-3 py-2 border border-zinc-300 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Precio ($)
                </label>
                <input
                  name="price"
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-zinc-300 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Talla
                </label>
                <select
                  name="size"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 focus:ring-2 focus:ring-black outline-none bg-white"
                >
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Categoría
                </label>
                <select
                  name="category"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 focus:ring-2 focus:ring-black outline-none bg-white"
                >
                  <option>Hoodies</option>
                  <option>Jackets</option>
                  <option>T-Shirts</option>
                  <option>Pants</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Estado
                </label>
                <select
                  name="condition"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 focus:ring-2 focus:ring-black outline-none bg-white"
                >
                  <option>10/10 (Nuevo)</option>
                  <option>9/10 (Excelente)</option>
                  <option>8/10 (Buen estado)</option>
                  <option>7/10 (Vintage real)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Subiendo foto...
                </>
              ) : (
                <>
                  <Save size={18} /> Publicar Ahora
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
