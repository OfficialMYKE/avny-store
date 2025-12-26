"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuide = ({ isOpen, onClose }: SizeGuideProps) => {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen) return null;

  const tableData = [
    { usM: "3.5", usW: "5", ru: "3", ue: "35.5", in: "8 1/2", cm: "21.6" },
    { usM: "4", usW: "5.5", ru: "3.5", ue: "36", in: "8 11/16", cm: "22.1" },
    { usM: "4.5", usW: "6", ru: "4", ue: "36.5", in: "8 13/16", cm: "22.4" },
    { usM: "5", usW: "6.5", ru: "4.5", ue: "37.5", in: "9", cm: "22.9" },
    { usM: "5.5", usW: "7", ru: "5", ue: "38", in: "9 3/16", cm: "23.3" },
    { usM: "6", usW: "7.5", ru: "5.5", ue: "38.5", in: "9 5/16", cm: "23.7" },
    { usM: "6.5", usW: "8", ru: "6", ue: "39", in: "9 1/2", cm: "24.1" },
  ];

  const measurementSteps = [
    "Pega con cinta adhesiva un trozo de papel a una superficie plana y dura, y asegúrate de que el papel no se resbale.",
    "Párate sobre el papel con los pies separados a la altura de los hombros y el peso equilibrado de manera uniforme (solo un pie debe estar sobre el papel).",
    "Con un bolígrafo o lápiz apuntando hacia abajo, pídele a otra persona que te ayude a marcar la punta del dedo gordo y la parte más externa del talón.",
    "Una vez hechas las marcas, retírate del papel y usa una regla o cinta métrica para medir la distancia entre los dos puntos. Esta medida representa la longitud del pie.",
    "Repite el proceso con el otro pie. Ten en cuenta que es común que el largo de un pie sea ligeramente diferente al del otro.",
    "Aplica la medida más larga de las dos a nuestra tabla de tallas para encontrar la talla correlacionada adecuada. Si la medida está entre tallas, recomendamos elegir la talla más grande.",
  ];

  return (
    <div className="absolute inset-0 z-[70] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Botón de Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-black z-10"
      >
        <X size={20} />
      </button>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        {/* Encabezado y Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Tabla de tallas
          </h2>

          <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-zinc-200">
            <button
              onClick={() => setUnit("in")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-bold transition-all",
                unit === "in"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              in
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-bold transition-all",
                unit === "cm"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              cm
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm mb-12">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="py-4 px-4 whitespace-nowrap">EE. UU.: Hombre</th>
                <th className="py-4 px-4 whitespace-nowrap">EE. UU.: Mujer</th>
                <th className="py-4 px-4 whitespace-nowrap">RU</th>
                <th className="py-4 px-4 whitespace-nowrap">UE</th>
                <th className="py-4 px-4 whitespace-nowrap">
                  Largo del pie ({unit})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">
                    {row.usM}
                  </td>
                  <td className="py-4 px-4 text-zinc-600">{row.usW}</td>
                  <td className="py-4 px-4 text-zinc-600">{row.ru}</td>
                  <td className="py-4 px-4 text-zinc-600">{row.ue}</td>
                  <td className="py-4 px-4 font-bold text-black bg-zinc-50/30">
                    {unit === "in" ? row.in : row.cm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instrucciones de Medición Completas */}
        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-gray-900 mb-8">
            Cómo tomar las medidas del largo del pie
          </h3>
          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {measurementSteps.map((text, i) => (
              <div key={i} className="flex gap-5 items-start">
                <span className="text-2xl font-black text-zinc-200 leading-none">
                  0{i + 1}
                </span>
                <p className="text-zinc-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
