"use client";

import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  defaultValue: number;
  resolvedSearchParams: any;
}

export function PriceFilter({
  defaultValue,
  resolvedSearchParams,
}: PriceFilterProps) {
  return (
    <div className="pt-4 px-1">
      <Slider
        defaultValue={[defaultValue]}
        max={500}
        step={10}
        onValueCommit={(v) => (window.location.href = `?price=${v[0]}`)}
      />
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mt-4 italic">
        <span>$0</span>
        <span>${defaultValue}</span>
      </div>
    </div>
  );
}
