"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
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
  Check,
  Save,
  DollarSign,
  Tag,
  Layers,
  Palette,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- JERARQUÍA IDENTICA ---
const PRODUCT_HIERARCHY: Record<
  string,
  { heading: string; items: string[] }[]
> = {
  Hombre: [
    {
      heading: "ROPA SUPERIOR",
      items: [
        "Chaquetas y Abrigos",
        "Camisetas y Polos",
        "Sudaderas (Hoodies)",
        "Camisas y Franelas",
        "Jerseys Deportivos",
      ],
    },
    {
      heading: "ROPA INFERIOR",
      items: [
        "Jeans Vintage",
        "Pantalones Cargo & Trabajo",
        "Joggers",
        "Shorts y Bermudas",
      ],
    },
    { heading: "CALZADO", items: ["Sneakers & Retro", "Botas", "Sandalias"] },
  ],
  Mujer: [
    {
      heading: "ROPA SUPERIOR",
      items: [
        "Tops y Corsets",
        "Camisetas Gráficas",
        "Sudaderas y Buzos",
        "Chaquetas y Abrigos",
      ],
    },
    {
      heading: "ROPA INFERIOR",
      items: [
        "Jeans y Pantalones",
        "Faldas (Mini/Maxi)",
        "Shorts",
        "Vestidos y Conjuntos",
      ],
    },
    {
      heading: "CALZADO",
      items: ["Deportivos", "Botas y Plataformas", "Sandalias"],
    },
  ],
  Niños: [
    {
      heading: "ROPA",
      items: [
        "Camisetas y Polos",
        "Abrigos y Chompas",
        "Pantalones y Jeans",
        "Conjuntos",
      ],
    },
    {
      heading: "CALZADO Y ACCESORIOS",
      items: ["Zapatos", "Gorras y Mochilas", "Ropa de Bebé (0-24m)"],
    },
  ],
  Unisex: [
    {
      heading: "CABEZA",
      items: [
        "Gorras (Snapbacks/Trucker)",
        "Gorros (Beanies)",
        "Sombreros (Bucket Hats)",
      ],
    },
    {
      heading: "EQUIPAJE",
      items: ["Mochilas", "Bolsos y Totes", "Cangureras"],
    },
    { heading: "OTROS", items: ["Gafas de Sol", "Cinturones", "Bufandas"] },
  ],
};

const COLORS = [
  "Negro",
  "Blanco",
  "Gris",
  "Gris Oscuro",
  "Azul",
  "Azul Marino",
  "Celeste",
  "Azul Denim Claro",
  "Rojo",
  "Vino",
  "Verde",
  "Beige",
  "Camel",
  "Café",
  "Amarillo",
  "Naranja",
  "Rosa",
  "Morado",
  "Multicolor",
  "Camuflaje",
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
  "US 8",
  "US 9",
  "US 10",
  "US 11",
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
  "1Y",
  "2Y",
  "3Y",
];

const BRANDS_LIST = [
  "Nike",
  "Adidas",
  "Jordan",
  "The North Face",
  "Carhartt",
  "Stüssy",
  "Ralph Lauren",
  "Tommy Hilfiger",
  "Levi's",
  "Champion",
  "Dickies",
  "New Balance",
  "Reebok",
  "Puma",
  "Converse",
  "Vans",
  "Supreme",
  "Bape",
  "Patagonia",
  "Columbia",
  "Harley Davidson",
  "Starter",
  "Russell Athletic",
  "Lee",
  "Wrangler",
  "Otros",
].sort();

export default function CreateProductPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  // Estados del Formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sale_price: "",
    stock: "1",
    brand: "",
    gender: [] as string[],
    section: "",
    category: [] as string[],
    colors: "",
    image_url: "",
  });

  const [availableSections, setAvailableSections] = useState<
    { heading: string; items: string[] }[]
  >([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [sizesData, setSizesData] = useState<
    { size: string; available: boolean }[]
  >([]);
  const [soldOutColors, setSoldOutColors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newExtraFiles, setNewExtraFiles] = useState<File[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<
    Record<string, File[]>
  >({});

  // Lógica de Cascada (Idéntica a Edit)
  const toggleGender = (g: string) => {
    setFormData((prev) => {
      const current = prev.gender.includes(g)
        ? prev.gender.filter((i) => i !== g)
        : [...prev.gender, g];
      return { ...prev, gender: current, section: "", category: [] };
    });
  };

  const toggleCategory = (c: string) => {
    setFormData((prev) => {
      const current = prev.category.includes(c)
        ? prev.category.filter((item) => item !== c)
        : [...prev.category, c];
      return { ...prev, category: current };
    });
  };

  useEffect(() => {
    if (formData.gender.length > 0) {
      const sectionsMap = new Map<string, Set<string>>();
      formData.gender.forEach((g) => {
        const sections = PRODUCT_HIERARCHY[g] || [];
        sections.forEach((sec) => {
          if (!sectionsMap.has(sec.heading))
            sectionsMap.set(sec.heading, new Set(sec.items));
          else
            sec.items.forEach((item) =>
              sectionsMap.get(sec.heading)?.add(item)
            );
        });
      });
      setAvailableSections(
        Array.from(sectionsMap.entries()).map(([heading, itemsSet]) => ({
          heading,
          items: Array.from(itemsSet).sort(),
        }))
      );
      if (formData.section && !sectionsMap.has(formData.section)) {
        setFormData((prev) => ({ ...prev, section: "", category: [] }));
      }
    } else {
      setAvailableSections([]);
    }
  }, [formData.gender]);

  useEffect(() => {
    const sectionData = availableSections.find(
      (s) => s.heading === formData.section
    );
    if (sectionData) {
      setAvailableCategories(sectionData.items);
      const validCategories = formData.category.filter((c) =>
        sectionData.items.includes(c)
      );
      if (validCategories.length !== formData.category.length) {
        setFormData((prev) => ({ ...prev, category: validCategories }));
      }
    } else {
      setAvailableCategories([]);
      setFormData((prev) => ({ ...prev, category: [] }));
    }
  }, [formData.section, availableSections]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleNewExtraFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setNewExtraFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeNewExtraFile = (idx: number) =>
    setNewExtraFiles((prev) => prev.filter((_, i) => i !== idx));

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.gender.length === 0)
        throw new Error("Selecciona al menos un público objetivo.");
      if (formData.category.length === 0)
        throw new Error("Selecciona al menos una categoría.");
      if (!imageFile) throw new Error("La imagen de portada es obligatoria.");

      const mainFileName = `main_${Date.now()}.${imageFile.name
        .split(".")
        .pop()}`;
      const { error: mainError } = await supabase.storage
        .from("images")
        .upload(mainFileName, imageFile);
      if (mainError) throw mainError;
      const { data: mainUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(mainFileName);

      const extraUrls = await Promise.all(
        newExtraFiles.map(async (file) => {
          const fileName = `extra_${Date.now()}_${Math.random()}.${file.name
            .split(".")
            .pop()}`;
          const { error } = await supabase.storage
            .from("images")
            .upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          return data.publicUrl;
        })
      );

      const galleryData: { color: string; images: string[] }[] = [];
      // (Simplified logic: no handling of complex color galleries in creation for brevity, can be added if needed, sticking to extras for creation speed)

      const colorsSet = new Set<string>();
      if (formData.colors) colorsSet.add(formData.colors);

      const categoryToSave = formData.category.join(", ");

      const { error } = await supabase.from("products").insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          sale_price: formData.sale_price
            ? parseFloat(formData.sale_price)
            : null,
          stock: parseInt(formData.stock),
          brand: formData.brand || null,
          gender: formData.gender,
          section: formData.section,
          category: categoryToSave,
          image_url: mainUrlData.publicUrl,
          extra_images: extraUrls,
          colors: Array.from(colorsSet),
          sizes_data: sizesData,
          sold_out_colors: soldOutColors,
          gallery: galleryData,
          size: sizesData.map((s) => s.size).join(", "),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      toast.success("Producto creado exitosamente");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al crear producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors bg-white shadow-sm border"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              Nuevo Producto
            </h1>
            <p className="text-zinc-500 text-sm">
              Añade inventario fresco a la tienda
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <Tag className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Datos Básicos
                </h3>
              </div>
              <div className="space-y-1.5">
                <Label>Nombre del Producto</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-zinc-50 border-zinc-200"
                  required
                  placeholder="Ej: Vintage Nike Tee"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Estado, medidas, detalles..."
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Precio ($)</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="bg-zinc-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-red-600">Oferta ($)</Label>
                  <Input
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={handleChange}
                    className="bg-red-50 border-red-100 text-red-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="bg-zinc-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Marca</Label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <option value="">Ninguna</option>
                    {BRANDS_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <Layers className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Clasificación
                </h3>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-zinc-400">
                  1. Público Objetivo
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRODUCT_HIERARCHY).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGender(g)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2",
                        formData.gender.includes(g)
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                      )}
                    >
                      {formData.gender.includes(g) && <Check size={14} />}{" "}
                      {g === "Unisex" ? "Accesorios (Unisex)" : g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-zinc-400">
                    2. Sección
                  </Label>
                  <select
                    name="section"
                    required
                    onChange={handleChange}
                    value={formData.section}
                    disabled={formData.gender.length === 0}
                    className="flex h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Seleccionar...
                    </option>
                    {availableSections.map((s) => (
                      <option key={s.heading} value={s.heading}>
                        {s.heading}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-zinc-400">
                    3. Categoría(s)
                  </Label>
                  {!formData.section ? (
                    <div className="h-12 flex items-center px-4 rounded-lg bg-zinc-100 border border-dashed text-zinc-400 text-sm italic">
                      Primero selecciona una sección
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-zinc-50/50 min-h-[3rem]">
                      {availableCategories.map((c) => {
                        const isSelected = formData.category.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCategory(c)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold border transition-all",
                              isSelected
                                ? "bg-zinc-800 text-white border-zinc-800"
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                            )}
                          >
                            {c} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <Ruler className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Tallas Disponibles
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...ADULT_SIZES, ...KIDS_SIZES].map((size) => {
                  const status = sizesData.find((s) => s.size === size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-12 h-10 rounded-lg text-xs font-bold border transition-all shadow-sm",
                        !status &&
                          "bg-white hover:border-zinc-400 text-zinc-400",
                        status?.available &&
                          "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-100",
                        status?.available === false &&
                          "bg-red-50 text-red-400 border-red-100 line-through"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 sticky top-6">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <Camera className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Multimedia
                </h3>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-zinc-400">
                  Foto Principal
                </Label>
                <div className="aspect-square relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center overflow-hidden group hover:border-zinc-400 transition-colors">
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                      <span className="text-xs text-zinc-400">
                        Subir Portada
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setImageFile(e.target.files[0])
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-zinc-400">
                  Color Principal
                </Label>
                <select
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-zinc-400">
                    Galería Extra
                  </Label>
                  <label className="cursor-pointer text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-zinc-800 transition-colors">
                    <Plus size={12} /> Agregar
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleNewExtraFiles}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {newExtraFiles.length === 0 && (
                    <span className="text-xs text-zinc-300 col-span-4 text-center py-2">
                      Sin fotos adicionales
                    </span>
                  )}
                  {newExtraFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-blue-400 group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewExtraFile(idx)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 text-sm bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-widest shadow-xl"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" /> Guardar Producto
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
