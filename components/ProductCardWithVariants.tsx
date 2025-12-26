import ProductCardWithVariants from "@/components/ProductCardWithVariants"; // Ajusta la ruta si es necesario

export default function Home() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-black italic mb-8 text-center">
        NUEVOS DROPS
      </h1>

      {/* Aquí renderizas la tarjeta para probarla */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductCardWithVariants />
        {/* Puedes poner más si quieres ver cómo se ve la grilla */}
        {/* <ProductCardWithVariants /> */}
      </div>
    </main>
  );
}
