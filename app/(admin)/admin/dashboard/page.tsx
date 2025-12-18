"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  DollarSign,
  AlertCircle,
  Store, // Icono para la tienda
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStock: 0,
  });

  // Al usar useEffect así, se recarga cada vez que entras a la página
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true); // Ponemos loading para que se note que refresca
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
    const totalStock = data.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    const totalValue = data.reduce(
      (acc, curr) => acc + curr.price * (curr.stock || 0),
      0
    );
    const lowStock = data.filter((p) => (p.stock || 0) < 2).length;

    setStats({ totalProducts: data.length, totalStock, totalValue, lowStock });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de borrar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      const newProducts = products.filter((p) => p.id !== id);
      setProducts(newProducts);
      calculateStats(newProducts);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER CON BOTONES DE NAVEGACIÓN CORREGIDOS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">
              Panel de Control
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestiona tu inventario.
            </p>
          </div>

          <div className="flex gap-3">
            {/* BOTÓN NUEVO: VOLVER A LA TIENDA */}
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <Store size={18} /> Ver Tienda
              </Link>
            </Button>

            <Button
              asChild
              className="bg-black hover:bg-zinc-800 text-white gap-2 shadow-lg"
            >
              <Link href="/admin/create">
                <Plus size={18} /> Nuevo Producto
              </Link>
            </Button>
          </div>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase">
              <Package size={14} /> Total Productos
            </div>
            <p className="text-2xl font-black">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase">
              <Package size={14} /> Stock Total
            </div>
            <p className="text-2xl font-black">{stats.totalStock}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2 text-xs font-bold uppercase">
              <DollarSign size={14} /> Valor Inventario
            </div>
            <p className="text-2xl font-black text-green-700">
              ${stats.totalValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-2 text-xs font-bold uppercase">
              <AlertCircle size={14} /> Stock Bajo
            </div>
            <p className="text-2xl font-black text-red-600">{stats.lowStock}</p>
          </div>
        </div>

        {/* BARRA Y TABLA */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2 bg-zinc-50/50">
            <Search className="text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-100 text-muted-foreground font-bold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Género</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-zinc-200 overflow-hidden flex-shrink-0 border">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border">
                        {product.gender || "Unisex"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${product.price}{" "}
                      {product.sale_price &&
                        product.sale_price < product.price && (
                          <span className="ml-2 text-xs text-red-600 font-bold bg-red-50 px-1 rounded">
                            Oferta
                          </span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold w-12 ${
                          (product.stock || 0) > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
