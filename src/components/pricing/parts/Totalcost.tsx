import React from "react";
import { AnimatedNumber } from "./Animatednumber";

type TotalCostCardProps = {
  custoTotal: number | string;
};

export const TotalCostCard: React.FC<TotalCostCardProps> = ({ custoTotal }) => (
  <div className="mt-3 flex items-center justify-between rounded-none bg-neutral-900 px-5 py-4 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] sm:px-6">
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      Custo Total
    </span>

    <span className="flex items-baseline gap-1.5 tabular-nums">
      <span className="text-sm font-medium text-neutral-400">R$</span>
      <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        <AnimatedNumber value={Number(custoTotal)} />
      </span>
    </span>
  </div>
);
