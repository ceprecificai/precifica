"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpinnerGap, X, CaretDown, Check } from "@phosphor-icons/react";
import {
  CostFilters as CostFiltersType,
  DEFAULT_COST_FILTERS,
  NCM_OPTIONS,
  SITUACAO_OPTIONS,
  Situacao,
} from "@/components/costs/hooks/types";

type Props = {
  /** Prefixo dos IDs do DOM (ex.: "desktop" ou "mobile") para evitar IDs duplicados. */
  idPrefix?: string;

  filters: CostFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<CostFiltersType>>;

  allBrands: string[];
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;

  onApplyFilters: () => void;
  onClearFilters: () => void;

  isLoading?: boolean;
};

function FieldLabel({ label, htmlFor }: { label: string; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
    >
      {label}
    </label>
  );
}

const inputClass = `
  h-10 w-full
  rounded-none
  border border-neutral-200
  bg-white
  text-sm text-neutral-900
  shadow-none
  placeholder:text-neutral-400
  transition-colors
  focus-visible:border-neutral-900
  focus-visible:ring-1 focus-visible:ring-neutral-900/10
  focus-visible:ring-offset-0
`;

const selectTriggerClass = `
  h-10 w-full cursor-pointer rounded-none
  border border-neutral-200 bg-white
  px-3 text-left text-sm text-neutral-900
  outline-none transition-colors
  hover:border-neutral-400
  focus:border-neutral-900 focus:ring-0
  focus-visible:ring-1 focus-visible:ring-neutral-900/10
`;

const norm = (v: string) => v.trim().toLocaleLowerCase("pt-BR");

function BrandMultiSelect({
  inputId,
  allBrands,
  selectedBrands,
  setSelectedBrands,
}: {
  inputId: string;
  allBrands: string[];
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addBrand = React.useCallback(
    (brand: string) => {
      const trimmed = brand.trim();
      if (!trimmed) return;

      const official = allBrands.find((b) => norm(b) === norm(trimmed));
      if (!official) return;

      setSelectedBrands((prev) => {
        const exists = prev.some((b) => norm(b) === norm(official));
        if (exists) return prev;
        return [...prev, official];
      });
    },
    [allBrands, setSelectedBrands]
  );

  const removeBrand = React.useCallback(
    (brand: string) => {
      setSelectedBrands((prev) => prev.filter((b) => norm(b) !== norm(brand)));
    },
    [setSelectedBrands]
  );

  const clearAllBrands = React.useCallback(() => {
    setSelectedBrands([]);
  }, [setSelectedBrands]);

  const toggleBrand = React.useCallback(
    (brand: string) => {
      const already = selectedBrands.some((b) => norm(b) === norm(brand));
      if (already) {
        removeBrand(brand);
      } else {
        addBrand(brand);
      }
    },
    [selectedBrands, addBrand, removeBrand]
  );

  const visibleBrands = React.useMemo(() => {
    const term = norm(searchTerm);
    if (!term) return allBrands;
    return allBrands.filter((b) => norm(b).includes(term));
  }, [allBrands, searchTerm]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (visibleBrands.length === 1) {
        addBrand(visibleBrands[0]);
        setSearchTerm("");
      }
      return;
    }

    if (e.key === "Backspace" && searchTerm === "" && selectedBrands.length > 0) {
      removeBrand(selectedBrands[selectedBrands.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={`
          flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5
          rounded-none border bg-white px-2 py-1.5
          transition-colors
          ${open ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}
        `}
      >
        {selectedBrands.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeBrand(brand);
            }}
            title={`Remover ${brand}`}
            aria-label={`Remover ${brand}`}
            className="
              flex cursor-pointer items-center gap-1 border border-neutral-300
              bg-neutral-100 px-2 py-0.5 text-[12px] text-neutral-900 transition-colors hover:bg-neutral-200
            "
          >
            {brand}
          </button>
        ))}

        <input
          id={inputId}
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedBrands.length === 0 ? "Ex: Liverpool, SKP" : ""}
          className="min-w-[80px] flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
        />

        {selectedBrands.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearAllBrands();
            }}
            aria-label="Limpar marcas"
            className="shrink-0 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <CaretDown
          className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto border border-neutral-200 bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
        >
          {visibleBrands.length > 0 ? (
            visibleBrands.map((brand) => {
              const checked = selectedBrands.some((b) => norm(b) === norm(brand));

              return (
                <button
                  type="button"
                  key={brand}
                  role="option"
                  aria-selected={checked}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBrand(brand);
                  }}
                  className={`
                    flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-[13px]
                    transition-colors hover:bg-neutral-50
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
                    ${checked ? "font-medium text-neutral-900" : "text-neutral-600"}
                  `}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className={`h-3 w-3 shrink-0 border ${
                        checked
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-300"
                      }`}
                    />
                    <span className="truncate">{brand}</span>
                  </span>
                  {checked && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-3 text-center text-xs text-neutral-500">
              Nenhuma marca encontrada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CostFilters({
  idPrefix = "filtro",
  filters,
  setFilters,
  allBrands,
  selectedBrands,
  setSelectedBrands,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}: Props) {
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // IDs únicos por instância (desktop/mobile não colidem no DOM)
  const fid = (name: string) => `${idPrefix}-${name}`;

  const updateFilter = (key: keyof CostFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateSituacao = (value: Situacao) => {
    setFilters((prev) => ({ ...prev, situacao: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApplyFilters();
  };

  // Enter no trigger do Select aplica os filtros (em vez de abrir a lista)
  const handleSituacaoTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // Compara com o padrão real, não com uma string fixa
  const hasActiveFilters =
    filters.situacao !== DEFAULT_COST_FILTERS.situacao ||
    filters.codigo.trim() !== "" ||
    filters.produto.trim() !== "" ||
    selectedBrands.length > 0 ||
    filters.ncm !== DEFAULT_COST_FILTERS.ncm;

  const itemClass = (isActive: boolean) => `
    relative cursor-pointer rounded-none py-2 pl-3 pr-3 text-sm
    transition-colors
    focus:bg-neutral-100
    data-[state=checked]:font-medium
    [&_svg]:hidden
    ${
      isActive
        ? "font-medium text-neutral-900 data-[state=checked]:text-neutral-900"
        : "text-neutral-600 hover:text-neutral-900"
    }
  `;

  const selectContentClass = `
    min-w-[180px] rounded-none
    border border-neutral-200 bg-white
    p-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]
  `;

  return (
    <div className="border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <FieldLabel label="Código" htmlFor={fid("codigo")} />
              <Input
                id={fid("codigo")}
                placeholder="Ex: TN 5AM, Q10 MK2"
                value={filters.codigo}
                onChange={(e) => updateFilter("codigo", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel label="Nome do Produto" htmlFor={fid("produto")} />
              <Input
                id={fid("produto")}
                placeholder="Ex: Baqueta 5A, Caixa de Som"
                value={filters.produto}
                onChange={(e) => updateFilter("produto", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel label="Marca" htmlFor={fid("marca")} />
              <BrandMultiSelect
                inputId={fid("marca")}
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
              />
            </div>

            <div>
              <FieldLabel label="NCM" htmlFor={fid("ncm")} />
              <Select value={filters.ncm} onValueChange={(v) => updateFilter("ncm", v)}>
                <SelectTrigger id={fid("ncm")} className={selectTriggerClass}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent position="popper" sideOffset={4} className={selectContentClass}>
                  {NCM_OPTIONS.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className={itemClass(filters.ncm === option)}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FieldLabel label="Situação" htmlFor={fid("situacao")} />
              <Select value={filters.situacao} onValueChange={(v) => updateSituacao(v as Situacao)}>
                <SelectTrigger
                  id={fid("situacao")}
                  onKeyDown={handleSituacaoTriggerKeyDown}
                  className={selectTriggerClass}
                >
                  <SelectValue placeholder="Ativos" />
                </SelectTrigger>

                <SelectContent position="popper" sideOffset={4} className={selectContentClass}>
                  {SITUACAO_OPTIONS.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className={itemClass(filters.situacao === option)}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                disabled={isLoading}
                aria-label="Limpar filtros"
                className="
                  flex h-9 cursor-pointer items-center gap-1.5 px-3
                  text-[13px] text-neutral-500
                  transition-colors hover:text-neutral-900
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Limpar
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              aria-label="Aplicar filtros"
              className="
                flex h-9 min-w-[120px] cursor-pointer items-center justify-center gap-2
                rounded-none
                border border-neutral-900 bg-neutral-900
                px-5 text-sm font-medium text-white
                transition-colors duration-150
                hover:bg-neutral-700 hover:border-neutral-700
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isLoading ? (
                <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Filtrar"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
