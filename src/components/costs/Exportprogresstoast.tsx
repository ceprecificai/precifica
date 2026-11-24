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
        rounded-none border border-neutral-200 bg-white
        px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {done ? (
            <CheckCircle
              size={20}
              weight="fill"
              className="text-emerald-600"
            />
          ) : (
            <SpinnerGap
              size={20}
              className="animate-spin text-neutral-900"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-neutral-900">
            {done ? "Exportação concluída!" : title}
          </p>

          {message && (
            <p className="mt-0.5 text-xs text-neutral-500">{message}</p>
          )}

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-none bg-neutral-100">
            <div
              className="h-full rounded-none bg-neutral-900 transition-all duration-150 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>

          <p className="mt-1 text-[11px] font-medium text-neutral-400">{percent}%</p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
