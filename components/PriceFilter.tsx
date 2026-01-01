"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceFilterProps {
  maxPrice?: number; // Hacemos el máximo dinámico (opcional, default 500)
}

export function PriceFilter({ maxPrice = 500 }: PriceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local para visualización instantánea (sin afectar la URL todavía)
  const [localValue, setLocalValue] = useState<number>(maxPrice);

  // Sincronizar el estado local con la URL al cargar
  useEffect(() => {
    const currentPriceParam = searchParams.get("price");
    if (currentPriceParam) {
      setLocalValue(parseInt(currentPriceParam));
    } else {
      setLocalValue(maxPrice);
    }
  }, [searchParams, maxPrice]);

  // Función para actualizar la URL (Solo cuando soltamos el slider o damos Enter)
  const updateURL = (val: number) => {
    const params = new URLSearchParams(searchParams.toString());

    // Si el valor es igual al máximo, mejor quitamos el filtro para limpiar la URL
    if (val === maxPrice) {
      params.delete("price");
    } else {
      params.set("price", val.toString());
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Manejadores
  const handleSliderChange = (val: number[]) => {
    setLocalValue(val[0]); // Actualiza solo el número visualmente
  };

  const handleSliderCommit = (val: number[]) => {
    updateURL(val[0]); // Actualiza la URL y hace el fetch
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= maxPrice) {
      setLocalValue(val);
    }
  };

  const handleInputBlur = () => {
    updateURL(localValue); // Al salir del input, actualizamos
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateURL(localValue);
    }
  };

  const clearFilter = () => {
    setLocalValue(maxPrice);
    updateURL(maxPrice);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* HEADER DEL FILTRO */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Rango de Precio
        </span>
        {localValue < maxPrice && (
          <button
            onClick={clearFilter}
            className="text-[9px] font-bold uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1"
          >
            <X size={10} /> Reset
          </button>
        )}
      </div>

      {/* INPUT MANUAL + DISPLAY */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
          <Input
            type="number"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="h-9 pl-6 text-sm font-bold bg-zinc-50 border-zinc-200 focus:bg-white focus:border-black transition-all text-right pr-2"
            max={maxPrice}
            min={0}
          />
        </div>
        <span className="text-xs font-medium text-zinc-400">de</span>
        <div className="h-9 px-3 flex items-center justify-center bg-zinc-100 rounded border border-zinc-200 text-xs font-bold text-zinc-500 w-16">
          ${maxPrice}
        </div>
      </div>

      {/* SLIDER */}
      <div className="px-1 py-2">
        <Slider
          value={[localValue]}
          max={maxPrice}
          step={5} // Pasos de $5 para que sea más fácil
          onValueChange={handleSliderChange} // Fluidez visual
          onValueCommit={handleSliderCommit} // Acción real
          className="cursor-pointer"
        />
      </div>

      {/* BARRA DE PROGRESO VISUAL (Opcional, estilo 'rango') */}
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-300">
        <span>Barato</span>
        <span>Premium</span>
      </div>
    </div>
  );
}
