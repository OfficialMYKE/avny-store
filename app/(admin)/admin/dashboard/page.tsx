"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  DollarSign,
  AlertCircle,
  Store,
  EyeOff,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  gender: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "out">(
    "all"
  );

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
      calculateStats(data as Product[]);
    }
    setLoading(false);
  };

  const calculateStats = (data: Product[]) => {
    const totalStock = data.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    const totalValue = data.reduce(
      (acc, curr) => acc + curr.price * (curr.stock || 0),
      0
    );
    const lowStock = data.filter(
      (p) => (p.stock || 0) < 5 && (p.stock || 0) > 0
    ).length;

    setStats({ totalProducts: data.length, totalStock, totalValue, lowStock });
  };

  // --- LÓGICA DE ACTUALIZAR STOCK ---
  const handleUpdateStock = async (
    id: string,
    currentStock: number,
    change: number
  ) => {
    const newStock = currentStock + change;

    // Evitar stock negativo
    if (newStock < 0) return;

    // Actualización Optimista
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, stock: newStock } : p
    );
    setProducts(updatedProducts);
    calculateStats(updatedProducts);

    // Actualización en BD
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar el stock.");
      fetchProducts(); // Revertir si falla
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("¿Estás seguro de borrar este producto permanentemente?")
    )
      return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      const newProducts = products.filter((p) => p.id !== id);
      setProducts(newProducts);
      calculateStats(newProducts);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === "active") matchesStatus = (p.stock || 0) > 0;
    if (filterStatus === "out") matchesStatus = (p.stock || 0) <= 0;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">
              Panel de Control
            </h1>
            <p className="text-muted-foreground text-sm">
              Control de inventario en tiempo real.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              asChild
              variant="outline"
              className="gap-2 flex-1 md:flex-none"
            >
              <Link href="/">
                <Store size={18} />{" "}
                <span className="hidden sm:inline">Ver Tienda</span>
              </Link>
            </Button>
            <Button
              asChild
              className="bg-black hover:bg-zinc-800 text-white gap-2 shadow-lg flex-1 md:flex-none"
            >
              <Link href="/admin/create">
                <Plus size={18} /> Nuevo Producto
              </Link>
            </Button>
          </div>
        </div>

        {/* METRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Package size={16} />}
            label="Total Productos"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<Package size={16} />}
            label="Stock Total"
            value={stats.totalStock}
          />
          <StatCard
            icon={<DollarSign size={16} />}
            label="Valor Inventario"
            value={formatCurrency(stats.totalValue)}
            textColor="text-green-700"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<AlertCircle size={16} />}
            label="Stock Bajo"
            value={stats.lowStock}
            textColor="text-red-600"
            iconColor="text-red-600"
          />
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-50/50">
            <div className="flex p-1 bg-zinc-200/50 rounded-lg w-full md:w-auto">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filterStatus === "all"
                    ? "bg-white shadow text-black"
                    : "text-zinc-500 hover:text-black"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filterStatus === "active"
                    ? "bg-white shadow text-green-700"
                    : "text-zinc-500 hover:text-black"
                }`}
              >
                En Venta
              </button>
              <button
                onClick={() => setFilterStatus("out")}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filterStatus === "out"
                    ? "bg-white shadow text-red-600"
                    : "text-zinc-500 hover:text-black"
                }`}
              >
                Agotados ({products.filter((p) => (p.stock || 0) <= 0).length})
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md w-full md:w-72 shadow-sm">
              <Search className="text-muted-foreground w-4 h-4" />
              <input
                placeholder="Buscar..."
                className="border-none outline-none text-sm w-full bg-transparent"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-100 text-muted-foreground font-bold uppercase text-xs">
                {/* --- AQUÍ ESTABA EL ERROR CORREGIDO --- */}
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Género</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3 text-center">Gestión de Stock</th>
                  <th className="px-4 py-3 text-right">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center text-muted-foreground"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isOutOfStock = (product.stock || 0) <= 0;

                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors group ${
                          isOutOfStock
                            ? "bg-red-50/40 hover:bg-red-50"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`relative w-10 h-10 rounded bg-zinc-200 overflow-hidden flex-shrink-0 border ${
                                isOutOfStock ? "grayscale opacity-70" : ""
                              }`}
                            >
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p
                                className={`font-bold line-clamp-1 max-w-[150px] md:max-w-xs ${
                                  isOutOfStock
                                    ? "text-zinc-500 line-through decoration-red-300"
                                    : "text-zinc-900"
                                }`}
                              >
                                {product.title}
                              </p>
                              <div className="flex gap-2 items-center mt-0.5">
                                <p className="text-xs text-muted-foreground">
                                  {product.category}
                                </p>
                                {isOutOfStock && (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 rounded flex items-center gap-1">
                                    <EyeOff size={8} /> AGOTADO
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border capitalize">
                            {product.gender || "Unisex"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex flex-col">
                            <span
                              className={isOutOfStock ? "text-zinc-400" : ""}
                            >
                              {formatCurrency(product.price)}
                            </span>
                            {product.sale_price &&
                              product.sale_price < product.price && (
                                <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded w-fit">
                                  Oferta
                                </span>
                              )}
                          </div>
                        </td>

                        {/* --- COLUMNA DE CONTROLES --- */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* Botón MENOS */}
                            <Button
                              size="icon"
                              variant="outline"
                              className={`h-8 w-8 rounded-full border shadow-sm ${
                                isOutOfStock
                                  ? "opacity-20 cursor-not-allowed"
                                  : "hover:bg-red-100 hover:text-red-600 hover:border-red-200"
                              }`}
                              onClick={() =>
                                handleUpdateStock(product.id, product.stock, -1)
                              }
                              disabled={isOutOfStock}
                              title="Vender uno (-1)"
                            >
                              <Minus size={14} />
                            </Button>

                            {/* Número Central */}
                            <div
                              className={`w-12 text-center font-black text-lg ${
                                isOutOfStock ? "text-red-500" : "text-zinc-800"
                              }`}
                            >
                              {product.stock}
                            </div>

                            {/* Botón MÁS */}
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border shadow-sm hover:bg-green-100 hover:text-green-600 hover:border-green-200"
                              onClick={() =>
                                handleUpdateStock(product.id, product.stock, 1)
                              }
                              title="Reponer uno (+1)"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/edit/${product.id}`}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit size={14} />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 size={14} />
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

function StatCard({
  icon,
  label,
  value,
  textColor = "text-black",
  iconColor = "text-muted-foreground",
}: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase ${iconColor}`}
      >
        {icon} {label}
      </div>
      <p className={`text-2xl font-black ${textColor}`}>{value}</p>
    </div>
  );
}
