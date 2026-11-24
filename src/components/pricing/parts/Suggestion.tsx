"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass } from "@phosphor-icons/react";

type Sugestao = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
  inativo?: boolean;
};

type SuggestionDropdownProps = {
  isActive: boolean;
  sugestoes: Sugestao[];
  listaRef: React.RefObject<HTMLDivElement>;
  indiceSelecionado: number;
  onSelect: (
    codigo: string,
    custo: number,
    produto?: string,
    marca?: string
  ) => void;
  termoBusca?: string;
  isLoading?: boolean;
  onHoverIndex?: (index: number) => void;
  onClose?: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
};

// ---------- Helpers ----------

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const HighlightedText: React.FC<{ text: string; term?: string }> = ({
  text,
  term,
}) => {
  const cleanTerm = term?.trim();

  if (!cleanTerm) return <>{text}</>;

  let regex: RegExp;
  try {
    regex = new RegExp(`(${escapeRegExp(cleanTerm)})`, "gi");
  } catch {
    return <>{text}</>;
  }

  const parts = text.split(regex);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === cleanTerm.toLowerCase() ? (
          <mark
            key={i}
            className="rounded-sm bg-neutral-900 px-0.5 text-white"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

const SkeletonRow: React.FC = () => (
  <div className="flex items-center justify-between gap-3 px-3 py-3">
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
      <div className="h-2.5 w-40 max-w-full animate-pulse rounded bg-neutral-100" />
    </div>
    <div className="h-4 w-16 shrink-0 animate-pulse rounded bg-neutral-100" />
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500">
      <MagnifyingGlass className="h-4 w-4" />
    </div>
    <div className="text-sm font-semibold text-neutral-900">
      Nenhum produto encontrado
    </div>
    <div className="text-xs text-neutral-500">
      Verifique o código ou tente outro termo
    </div>
  </div>
);

const KBD_CLASS =
  "rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.04)]";

// ---------- Componente principal ----------

export const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  isActive,
  sugestoes,
  listaRef,
  indiceSelecionado,
  onSelect,
  termoBusca,
  isLoading = false,
  onHoverIndex,
  onClose,
  anchorRef,
}) => {
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const internalWrapperRef = React.useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const target =
        anchorRef?.current ||
        (internalWrapperRef.current?.parentElement as HTMLElement | null);

      if (!target) return;

      const rect = target.getBoundingClientRect();

      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isActive, anchorRef]);

  React.useEffect(() => {
    itemRefs.current[indiceSelecionado]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [indiceSelecionado]);

  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClose]);

  const showSkeleton = isActive && isLoading;
  const showEmpty = isActive && !isLoading && sugestoes.length === 0;
  const showResults = isActive && !isLoading && sugestoes.length > 0;

  if (!mounted) return null;
  if (!showSkeleton && !showEmpty && !showResults) return null;
  if (!coords) return null;

  const dropdownContent = (
    <AnimatePresence>
      <motion.div
        ref={(el) => {
          internalWrapperRef.current = el;
          if (listaRef && "current" in listaRef) {
            (listaRef as React.MutableRefObject<HTMLDivElement | null>).current =
              el;
          }
        }}
        layout
        initial={{ opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        style={{ top: coords.top, left: coords.left, width: coords.width }}
        className="fixed z-[130] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
      >
        <div className="max-h-80 overflow-y-auto p-1.5">
          {showSkeleton && (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {showEmpty && <EmptyState />}

          {showResults &&
            sugestoes.map((s, i) => {
              const isSelected = i === indiceSelecionado;
              const isInativo = Boolean(s.inativo);

              return (
                <motion.button
                  key={`${s.codigo}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12, delay: i * 0.02 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(s.codigo, s.custo, s.produto, s.marca);
                  }}
                  onMouseEnter={() => onHoverIndex?.(i)}
                  className={[
                    "relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isSelected ? "bg-neutral-100" : "hover:bg-neutral-50",
                    isInativo ? "opacity-60" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="suggestion-indicator"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-neutral-900"
                      transition={{ duration: 0.15 }}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-neutral-900">
                        <HighlightedText text={s.codigo} term={termoBusca} />
                      </span>

                      {isInativo && (
                        <span className="shrink-0 rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                          Inativo
                        </span>
                      )}
                    </div>

                    {(s.produto || s.marca) && (
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
                        {s.produto && (
                          <span className="min-w-0 truncate">
                            <HighlightedText text={s.produto} term={termoBusca} />
                          </span>
                        )}

                        {s.produto && s.marca && (
                          <span className="shrink-0 text-neutral-300">·</span>
                        )}

                        {s.marca && (
                          <span className="shrink-0 font-medium text-neutral-600">
                            {s.marca}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                    R$ {formatBRL(s.custo)}
                  </span>
                </motion.button>
              );
            })}
        </div>

        {showResults && (
          <div className="flex items-center gap-4 border-t border-neutral-100 bg-neutral-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <kbd className={KBD_CLASS}>↑↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <kbd className={KBD_CLASS}>↵</kbd>
              Selecionar
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <kbd className={KBD_CLASS}>ESC</kbd>
              Fechar
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(dropdownContent, document.body);
};
