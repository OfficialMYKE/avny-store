"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  Package,
  DollarSign,
  AlertTriangle,
  Store,
  EyeOff,
  Minus,
  TrendingUp,
  Archive,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Usamos sonner para notificaciones
import { cn } from "@/lib/utils";

// Interfaz actualizada con campos nuevos (brand, section)
interface Product {
  id: string;
  title: string;
  category: string;
  brand?: string;
  image_url: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  gender: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "out">(
    "all"
  );

  // Estadísticas
  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (acc, curr) => acc + (curr.stock || 0),
      0
    );
    const totalValue = products.reduce(
      (acc, curr) => acc + curr.price * (curr.stock || 0),
      0
    );
    const lowStock = products.filter(
      (p) => (p.stock || 0) < 3 && (p.stock || 0) > 0
    ).length;

    return { totalProducts: products.length, totalStock, totalValue, lowStock };
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar productos");
    } else if (data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  // --- LÓGICA DE ACTUALIZAR STOCK (OPTIMISTA) ---
  const handleUpdateStock = async (
    id: string,
    currentStock: number,
    change: number
  ) => {
    const newStock = currentStock + change;
    if (newStock < 0) return;

    // 1. UI Optimista
    const originalProducts = [...products];
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );

    // 2. Llamada a BD
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar stock");
      setProducts(originalProducts); // Revertir cambios
    } else {
      // Opcional: toast.success("Stock actualizado");
      // (A veces es mejor no mostrar nada si es una acción rápida)
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro? Esta acción es irreversible.")) return;

    // UI Optimista
    const originalProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("No se pudo eliminar el producto");
      setProducts(originalProducts);
    } else {
      toast.success("Producto eliminado");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Filtrado Avanzado (Título, Categoría, Marca)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term));

      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = (p.stock || 0) > 0;
      if (filterStatus === "out") matchesStatus = (p.stock || 0) <= 0;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, filterStatus]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2">
              Dashboard
            </h1>
            <p className="text-zinc-500 font-medium">
              Gestiona tu inventario, precios y stock en tiempo real.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              asChild
              variant="outline"
              className="h-12 border-zinc-300 hover:bg-zinc-100 text-zinc-600 font-bold uppercase tracking-wider text-xs"
            >
              <Link href="/">
                <Store className="mr-2 h-4 w-4" /> Ver Tienda
              </Link>
            </Button>
            <Button
              asChild
              className="h-12 bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-wider text-xs shadow-lg"
            >
              <Link href="/admin/create">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
              </Link>
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="h-5 w-5" />}
            label="Total Productos"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<Archive className="h-5 w-5" />}
            label="Stock Total"
            value={stats.totalStock}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Valor Inventario"
            value={formatCurrency(stats.totalValue)}
            accent="text-emerald-600"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Stock Bajo"
            value={stats.lowStock}
            accent="text-amber-600"
            alert={stats.lowStock > 0}
          />
        </div>

        {/* FILTROS Y TABLA */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {/* BARRA DE HERRAMIENTAS */}
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between gap-4">
            {/* Pestañas de Filtro */}
            <div className="flex p-1 bg-zinc-200/60 rounded-lg self-start">
              {[
                { key: "all", label: "Todos" },
                { key: "active", label: "En Venta" },
                {
                  key: "out",
                  label: `Agotados (${
                    products.filter((p) => p.stock <= 0).length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key as any)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide",
                    filterStatus === tab.key
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-500 hover:text-black"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar por nombre, marca o categoría..."
                className="pl-9 h-10 bg-white border-zinc-200 text-sm placeholder:text-zinc-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-zinc-500">
                    Producto
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-zinc-500 hidden md:table-cell">
                    Detalles
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-zinc-500">
                    Precio
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-zinc-500 text-center">
                    Inventario
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-zinc-500 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Package className="h-10 w-10 opacity-20" />
                        <p className="font-medium">
                          No se encontraron productos.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isOutOfStock = (product.stock || 0) <= 0;
                    return (
                      <tr
                        key={product.id}
                        className={cn(
                          "group transition-colors",
                          isOutOfStock ? "bg-red-50/30" : "hover:bg-zinc-50/50"
                        )}
                      >
                        {/* 1. PRODUCTO */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "relative w-12 h-12 rounded-lg border border-zinc-200 overflow-hidden bg-white flex-shrink-0",
                                isOutOfStock && "grayscale opacity-60"
                              )}
                            >
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                                  <Store size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p
                                className={cn(
                                  "font-bold text-sm text-zinc-900 truncate max-w-[180px]",
                                  isOutOfStock &&
                                    "text-zinc-500 line-through decoration-red-300"
                                )}
                              >
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {isOutOfStock && (
                                  <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                                    <EyeOff size={10} /> Agotado
                                  </span>
                                )}
                                <span className="text-xs text-zinc-500 capitalize">
                                  {product.brand || "Generico"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. DETALLES (Categoría/Genero) */}
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded w-fit text-zinc-600 capitalize">
                              {product.category}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wide font-bold">
                              {product.gender || "Unisex"}
                            </span>
                          </div>
                        </td>

                        {/* 3. PRECIO */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "font-bold text-sm",
                                isOutOfStock && "text-zinc-400"
                              )}
                            >
                              {formatCurrency(product.price)}
                            </span>
                            {product.sale_price &&
                              product.sale_price < product.price && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 rounded w-fit mt-0.5">
                                  Oferta: {formatCurrency(product.sale_price)}
                                </span>
                              )}
                          </div>
                        </td>

                        {/* 4. GESTIÓN DE STOCK */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() =>
                                handleUpdateStock(product.id, product.stock, -1)
                              }
                              disabled={isOutOfStock}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus size={14} />
                            </button>

                            <span
                              className={cn(
                                "font-black text-lg w-8 text-center tabular-nums",
                                isOutOfStock ? "text-red-500" : "text-zinc-800"
                              )}
                            >
                              {product.stock}
                            </span>

                            <button
                              onClick={() =>
                                handleUpdateStock(product.id, product.stock, 1)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        {/* 5. ACCIONES */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/edit/${product.id}`}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-zinc-400 hover:text-black hover:bg-zinc-100"
                              >
                                <Edit3 size={16} />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE DE TARJETA DE ESTADÍSTICA
function StatCard({ icon, label, value, accent, alert }: any) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md",
        alert && "border-red-200 bg-red-50/50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("text-zinc-400", accent, alert && "text-red-500")}>
          {icon}
        </div>
        {alert && (
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </p>
        <p
          className={cn(
            "text-3xl font-black text-zinc-900 tracking-tight",
            accent,
            alert && "text-red-600"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
