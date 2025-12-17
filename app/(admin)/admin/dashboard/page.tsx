import { Plus, Package, DollarSign, Tag } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Inventario
          </h1>
          <p className="text-zinc-500">
            Gestiona tu catálogo de Nueva York desde aquí.
          </p>
        </div>

        <Link
          href="/admin/create"
          className="bg-black text-white px-4 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-100 rounded-full">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Prendas</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        <div className="bg-white p-6 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-100 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Valor Inventario</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>
        <div className="bg-white p-6 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-100 rounded-full">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Vendidos</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* Lista Vacía */}
      <div className="max-w-6xl mx-auto bg-white border border-zinc-200 shadow-sm overflow-hidden rounded-sm">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="font-semibold text-zinc-700">Productos Recientes</h2>
        </div>
        <div className="p-12 text-center text-zinc-400">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p>No hay productos cargados aún.</p>
        </div>
      </div>
    </div>
  );
}
