"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// 1. Nuevos tipos: separamos tops de bottoms
export type SizeCategory =
  | "shoes"
  | "tops"
  | "bottoms"
  | "kids"
  | "accessories";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  category: SizeCategory;
}

// --- DATA ---

const shoeSizes = [
  { usM: "3.5", usW: "5", uk: "3", ue: "35.5", in: "8 1/2", cm: "21.6" },
  { usM: "4", usW: "5.5", uk: "3.5", ue: "36", in: "8 11/16", cm: "22.1" },
  { usM: "5", usW: "6.5", uk: "4.5", ue: "37.5", in: "9", cm: "22.9" },
  { usM: "6", usW: "7.5", uk: "5.5", ue: "38.5", in: "9 5/16", cm: "23.7" },
  { usM: "7", usW: "8.5", uk: "6.5", ue: "40", in: "9 11/16", cm: "24.6" },
  { usM: "8", usW: "9.5", uk: "7.5", ue: "41", in: "10", cm: "25.4" },
  { usM: "9", usW: "10.5", uk: "8.5", ue: "42", in: "10 5/16", cm: "26.2" },
  { usM: "10", usW: "11.5", uk: "9.5", ue: "43", in: "10 11/16", cm: "27.1" },
  { usM: "11", usW: "12.5", uk: "10.5", ue: "44.5", in: "11", cm: "27.9" },
];

// Data para CAMISETAS / HOODIES
const topsSizes = [
  {
    size: "S",
    chestIn: "36-38",
    chestCm: "91-96",
    lengthIn: "27",
    lengthCm: "68",
  },
  {
    size: "M",
    chestIn: "38-40",
    chestCm: "96-101",
    lengthIn: "28",
    lengthCm: "71",
  },
  {
    size: "L",
    chestIn: "40-42",
    chestCm: "101-106",
    lengthIn: "29",
    lengthCm: "74",
  },
  {
    size: "XL",
    chestIn: "42-44",
    chestCm: "106-111",
    lengthIn: "30",
    lengthCm: "76",
  },
  {
    size: "XXL",
    chestIn: "44-46",
    chestCm: "111-116",
    lengthIn: "31",
    lengthCm: "79",
  },
];

// Data para PANTALONES / SHORTS
const bottomsSizes = [
  {
    size: "S",
    waistIn: "28-30",
    waistCm: "71-76",
    hipsIn: "35-37",
    hipsCm: "89-94",
  },
  {
    size: "M",
    waistIn: "31-33",
    waistCm: "79-84",
    hipsIn: "38-40",
    hipsCm: "97-102",
  },
  {
    size: "L",
    waistIn: "34-36",
    waistCm: "86-91",
    hipsIn: "41-43",
    hipsCm: "104-109",
  },
  {
    size: "XL",
    waistIn: "37-39",
    waistCm: "94-99",
    hipsIn: "44-46",
    hipsCm: "112-117",
  },
  {
    size: "XXL",
    waistIn: "40-42",
    waistCm: "102-107",
    hipsIn: "47-49",
    hipsCm: "119-124",
  },
];

const kidsSizes = [
  { us: "10K", uk: "9.5", ue: "27", in: "6 1/2", cm: "16.5" },
  { us: "11K", uk: "10.5", ue: "28.5", in: "6 3/4", cm: "17.1" },
  { us: "12K", uk: "11.5", ue: "30", in: "7 1/8", cm: "18.1" },
  { us: "13K", uk: "12.5", ue: "31", in: "7 1/2", cm: "19.1" },
];

export const SizeGuide = ({ isOpen, onClose, category }: SizeGuideProps) => {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen || category === "accessories") return null;

  // Selección de Data
  const isTops = category === "tops";
  const isBottoms = category === "bottoms";
  const isKids = category === "kids";
  const isShoes = category === "shoes";

  let dataToRender = [];
  if (isTops) dataToRender = topsSizes;
  else if (isBottoms) dataToRender = bottomsSizes;
  else if (isKids) dataToRender = kidsSizes;
  else dataToRender = shoeSizes;

  // Título Dinámico
  const getCategoryTitle = () => {
    if (isTops) return "Partes de Arriba (Tops)";
    if (isBottoms) return "Partes de Abajo (Pantalones)";
    if (isKids) return "Calzado Niños";
    return "Calzado Adultos";
  };

  // Instrucciones Dinámicas
  const getInstructions = () => {
    if (isTops) {
      return [
        "Pecho: Mide alrededor de la parte más ancha del pecho, debajo de las axilas.",
        "Largo: Mide desde el hombro hasta el borde inferior de la prenda.",
        "Si buscas un ajuste oversize, elige una talla más grande.",
      ];
    }
    if (isBottoms) {
      return [
        "Cintura: Mide alrededor de tu cintura natural (la parte más estrecha).",
        "Cadera: Mide alrededor de la parte más ancha de tus caderas.",
        "Tiro/Largo: Mide desde la entrepierna hasta el final de la pierna.",
      ];
    }
    return [
      "Pega con cinta adhesiva un trozo de papel a una superficie plana.",
      "Párate sobre el papel con el peso equilibrado uniformemente.",
      "Marca la punta del dedo gordo y la parte más externa del talón.",
      "Mide la distancia y compárala con la tabla.",
    ];
  };

  return (
    <div className="absolute inset-0 z-[70] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-black z-10"
      >
        <X size={20} />
      </button>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Guía de tallas
            </h2>
            <p className="text-zinc-500 text-sm mt-1 uppercase font-bold tracking-wider">
              {getCategoryTitle()}
            </p>
          </div>

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

        {/* TABLA DINÁMICA */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm mb-12">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] tracking-wider border-b">
              <tr>
                {/* --- HEADERS TOPS --- */}
                {isTops && (
                  <>
                    <th className="py-4 px-4">Talla</th>
                    <th className="py-4 px-4">Pecho ({unit})</th>
                    <th className="py-4 px-4">Largo ({unit})</th>
                  </>
                )}

                {/* --- HEADERS BOTTOMS --- */}
                {isBottoms && (
                  <>
                    <th className="py-4 px-4">Talla</th>
                    <th className="py-4 px-4">Cintura ({unit})</th>
                    <th className="py-4 px-4">Cadera ({unit})</th>
                  </>
                )}

                {/* --- HEADERS SHOES --- */}
                {(isShoes || isKids) && (
                  <>
                    <th className="py-4 px-4 whitespace-nowrap">
                      {isKids ? "US (Niño)" : "US (Hombre)"}
                    </th>
                    {!isKids && <th className="py-4 px-4">US (Mujer)</th>}
                    <th className="py-4 px-4">RU</th>
                    <th className="py-4 px-4">UE</th>
                    <th className="py-4 px-4">Largo ({unit})</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {dataToRender.map((row: any, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  {/* --- ROWS TOPS --- */}
                  {isTops && (
                    <>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {row.size}
                      </td>
                      <td className="py-4 px-4 text-zinc-600">
                        {unit === "in" ? row.chestIn : row.chestCm}
                      </td>
                      <td className="py-4 px-4 text-zinc-600">
                        {unit === "in" ? row.lengthIn : row.lengthCm}
                      </td>
                    </>
                  )}

                  {/* --- ROWS BOTTOMS --- */}
                  {isBottoms && (
                    <>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {row.size}
                      </td>
                      <td className="py-4 px-4 text-zinc-600">
                        {unit === "in" ? row.waistIn : row.waistCm}
                      </td>
                      <td className="py-4 px-4 text-zinc-600">
                        {unit === "in" ? row.hipsIn : row.hipsCm}
                      </td>
                    </>
                  )}

                  {/* --- ROWS SHOES --- */}
                  {(isShoes || isKids) && (
                    <>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {isKids ? row.us : row.usM}
                      </td>
                      {!isKids && (
                        <td className="py-4 px-4 text-zinc-600">{row.usW}</td>
                      )}
                      <td className="py-4 px-4 text-zinc-600">{row.uk}</td>
                      <td className="py-4 px-4 text-zinc-600">{row.ue}</td>
                      <td className="py-4 px-4 font-bold text-black bg-zinc-50/30">
                        {unit === "in" ? row.in : row.cm}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-gray-900 mb-8">
            Cómo tomar las medidas
          </h3>
          <div className="grid gap-x-12 gap-y-6 sm:grid-cols-1">
            {getInstructions().map((text, i) => (
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
