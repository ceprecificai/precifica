"use client";

import React from "react";
import { CheckCircle, X, SpinnerGap } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  percent: number;
  title?: string;
  message?: string;
  onClose?: () => void;
};

export default function ExportProgressToast({
  open,
  percent,
  title = "Exportando planilha...",
  message,
  onClose,
}: Props) {
  if (!open) return null;

  const done = percent >= 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed left-1/2 top-6 z-[100] w-[92vw] max-w-md
        -translate-x-1/2
        border border-neutral-800 bg-[#0a0a0a]
        px-4 py-3 shadow-2xl
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {done ? (
            <CheckCircle
              size={20}
              weight="fill"
              className="text-emerald-500"
            />
          ) : (
            <SpinnerGap
              size={20}
              className="animate-spin text-[var(--accent-blue)]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {done ? "Exportação concluída!" : title}
          </p>

          {message && (
            <p className="mt-0.5 text-xs text-neutral-400">{message}</p>
          )}

          <div className="mt-2 h-1.5 w-full overflow-hidden bg-neutral-900">
            <div
              className="h-full bg-[var(--accent-blue)] transition-all duration-150 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>

          <p className="mt-1 text-[11px] text-neutral-500">{percent}%</p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-neutral-500 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
