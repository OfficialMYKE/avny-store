import { createClient } from "../../lib/supabase";
import { CategoryShop } from "@/components/store/CategoryShop";

// 1. Definimos que searchParams también es una promesa (Next.js 15)
type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { category } = await params;
  const { gender } = await searchParams; // Leemos el género (si existe)

  const decodedCategory = decodeURIComponent(category).toUpperCase();
  const genderTitle = gender ? `${gender} | ` : ""; // Ej: "Hombre | "

  return {
    title: `${genderTitle}${decodedCategory} | Authentic Vintage NY`,
    description: `Explora nuestra colección de ${decodedCategory}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const supabase = createClient();

  // Await obligatorio
  const { category } = await params;
  const { gender } = await searchParams;

  const rawCategory = decodeURIComponent(category);
  // Formatear categoría (ej: "hoodies" -> "Hoodies")
  const dbCategory =
    rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

  // --- CONSTRUCCIÓN DE LA CONSULTA ---
  // Empezamos la consulta base
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_sold", false)
    .order("created_at", { ascending: false });

  // 1. Si la categoría NO es "Hombre/Mujer/Niños" (ej: es "Hoodies"), filtramos por esa categoría
  // (Si la categoría ES "Hombre", no filtramos por category column, porque "Hombre" es un gender)
  const isGenderCategory = ["Hombre", "Mujer", "Niños"].includes(dbCategory);

  if (isGenderCategory) {
    // Si la URL es /shop/hombre, filtramos por gender = Hombre
    query = query.eq("gender", dbCategory);
  } else {
    // Si la URL es /shop/hoodies, filtramos por category = Hoodies
    query = query.ilike("category", dbCategory);

    // Y ADEMÁS, si hay un ?gender=Hombre en la URL, lo aplicamos
    if (gender && typeof gender === "string") {
      query = query.eq("gender", gender);
    }
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error cargando productos:", error);
    return <div>Error al cargar la tienda.</div>;
  }

  // Título bonito para la tienda (Ej: "Hombre > Zapatos")
  const displayTitle = gender ? `${gender} · ${dbCategory}` : dbCategory;

  return <CategoryShop products={products || []} categoryName={displayTitle} />;
}
