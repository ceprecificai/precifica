import React from "react";
import { X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { SuggestionDropdown } from "./Suggestion";

type Sugestao = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
};

type CostItemRowProps = {
  item: any;
  idx: number;
  composicao: any[];
  setComposicao: (items: any[]) => void;
  removerItem: (idx: number) => void;

  // Sugestões / Supabase
  campoAtivo: number | null;
  sugestoes: Sugestao[];
  indiceSelecionado: number;
  listaRef: React.RefObject<HTMLDivElement>;
  buscarSugestoesDebounced: any;
  handleSugestoesKeys: (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => void;
  selecionarSugestao: (
    codigo: string,
    custo: number,
    idx: number,
    produto?: string,
    marca?: string
  ) => void;

  // Navegação / refs
  inputRefs: React.MutableRefObject<HTMLInputElement[][]>;
  handleGridNav: (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => void;

  // Formatação / edição
  isEditing: (key: string) => boolean;
  setEditing: (key: string, editing: boolean) => void;
  toDisplay: (v: string) => string;
  toInternal: (v: string) => string;

  // Opcionais: permitem fechar o dropdown ao limpar o campo
  setSugestoes?: (value: Sugestao[]) => void;
  setCampoAtivo?: (value: number | null) => void;
};

const getRowDescription = (item: any): string => {
  if (item?.produto) return item.produto;
  if (item?.descricao) return item.descricao;
  if (item?.nome) return item.nome;
  return "";
};

const isPercentItem = (item: any) => {
  const tipo = String(item?.tipo || item?.codigo || "").toLowerCase();

  return (
    tipo.includes("imposto") ||
    tipo.includes("comissao") ||
    tipo.includes("comissão") ||
    tipo.includes("marketing") ||
    tipo.includes("margem")
  );
};

const INPUT_CLASS =
  "h-9 rounded-none border-0 border-b border-neutral-200 bg-transparent px-2 text-sm text-neutral-900 shadow-none placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-0 focus-visible:ring-offset-0";

export const CostItemRow: React.FC<CostItemRowProps> = ({
  item,
  idx,
  composicao,
  setComposicao,
  removerItem,
  campoAtivo,
  sugestoes,
  indiceSelecionado,
  listaRef,
  buscarSugestoesDebounced,
  handleSugestoesKeys,
  selecionarSugestao,
  inputRefs,
  handleGridNav,
  isEditing,
  setEditing,
  toDisplay,
  toInternal,
  setSugestoes,
  setCampoAtivo,
}) => {
  const description = getRowDescription(item);
  const percent = isPercentItem(item);
  const codigoTexto = String(item?.codigo || "");
  const temTexto = codigoTexto.trim() !== "";

  return (
    <div className="group flex items-center gap-2 py-1.5">
      {/* Código (busca) + descrição */}
      <div className="relative min-w-0 flex-1">
        <div className="relative">
          <Input
            ref={(el) => {
              if (!inputRefs.current[idx]) inputRefs.current[idx] = [];
              inputRefs.current[idx][0] = el!;
            }}
            type="text"
            inputMode="text"
            placeholder="Código do custo"
            value={codigoTexto}
            onChange={(e) => {
              const value = e.target.value;

              const novo = [...composicao];
              novo[idx] = { ...novo[idx], codigo: value };
              setComposicao(novo);

              if (value.trim() === "") {
                buscarSugestoesDebounced.cancel?.();
                setSugestoes?.([]);
                setCampoAtivo?.(null);
                return;
              }

              buscarSugestoesDebounced(value, idx);
              setCampoAtivo?.(idx);
            }}
            onKeyDown={(e) => {
              handleSugestoesKeys(e, idx);
              handleGridNav(e, idx, 0);
            }}
            className={INPUT_CLASS}
          />

          <SuggestionDropdown
            isActive={campoAtivo === idx && temTexto}
            sugestoes={sugestoes}
            listaRef={listaRef}
            indiceSelecionado={indiceSelecionado}
            onSelect={(codigo, custo, produto, marca) =>
              selecionarSugestao(codigo, custo, idx, produto, marca)
            }
            termoBusca={codigoTexto}
          />
        </div>

        {description && (
          <span className="mt-0.5 block truncate whitespace-nowrap px-2 text-xs text-neutral-500">
            {description}
          </span>
        )}
      </div>

      {/* Quantidade */}
      <div className="flex w-16 shrink-0 flex-col sm:w-20">
        <label className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 sm:hidden">
          Qtd
        </label>
        <Input
          ref={(el) => {
            if (!inputRefs.current[idx]) inputRefs.current[idx] = [];
            inputRefs.current[idx][1] = el!;
          }}
          type="text"
          inputMode="decimal"
          placeholder="1"
          value={item.quantidade || ""}
          onChange={(e) => {
            const novo = [...composicao];
            novo[idx] = { ...novo[idx], quantidade: toInternal(e.target.value) };
            setComposicao(novo);
          }}
          onKeyDown={(e) => handleGridNav(e, idx, 1)}
          className={`${INPUT_CLASS} text-center`}
        />
      </div>

      {/* Custo unitário */}
      <div className="flex w-28 shrink-0 flex-col sm:w-32">
        <label className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 sm:hidden">
          Custo
        </label>
        <div className="relative">
          {!percent && (
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
              R$
            </span>
          )}

          <Input
            ref={(el) => {
              if (!inputRefs.current[idx]) inputRefs.current[idx] = [];
              inputRefs.current[idx][2] = el!;
            }}
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={isEditing(`c-${idx}`) ? item.custo : toDisplay(item.custo)}
            onFocus={() => setEditing(`c-${idx}`, true)}
            onBlur={(e) => {
              setEditing(`c-${idx}`, false);

              const novo = [...composicao];
              novo[idx] = { ...novo[idx], custo: toInternal(e.target.value) };
              setComposicao(novo);
            }}
            onChange={(e) => {
              const novo = [...composicao];
              novo[idx] = { ...novo[idx], custo: toInternal(e.target.value) };
              setComposicao(novo);
            }}
            onKeyDown={(e) => handleGridNav(e, idx, 2)}
            className={`${INPUT_CLASS} text-right tabular-nums ${
              percent ? "pr-6" : "pl-7"
            }`}
          />

          {percent && (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
              %
            </span>
          )}
        </div>
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={() => removerItem(idx)}
        aria-label="Remover item"
        title="Remover item"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  );
};
