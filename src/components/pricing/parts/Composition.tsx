import React from "react";
import { Info } from "@phosphor-icons/react";
import { CostItemRow } from "./Costrow";
import { AddCostButton } from "./Addcostbutton";
import { TotalCostCard } from "./Totalcost";

type Sugestao = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
};

type CostCompositionProps = {
  composicao: any[];
  setComposicao: (items: any[]) => void;
  custoTotal: number | string;
  adicionarItem: () => void;
  removerItem: (idx: number) => void;

  // Sugestões
  sugestoes: Sugestao[];
  campoAtivo: number | null;
  indiceSelecionado: number;
  listaRef: React.RefObject<HTMLDivElement>;
  buscarSugestoesDebounced: (termo: string, idx: number) => void;
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
  confirmarSugestaoPrimeira: (
    idx: number,
    codigo: string,
    custo: number,
    produto?: string,
    marca?: string
  ) => void;

  // Navegação
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
};

export const CostComposition: React.FC<CostCompositionProps> = ({
  composicao,
  setComposicao,
  custoTotal,
  adicionarItem,
  removerItem,
  sugestoes,
  campoAtivo,
  indiceSelecionado,
  listaRef,
  buscarSugestoesDebounced,
  handleSugestoesKeys,
  selecionarSugestao,
  confirmarSugestaoPrimeira,
  inputRefs,
  handleGridNav,
  isEditing,
  setEditing,
  toDisplay,
  toInternal,
}) => {
  const hasManyItems = composicao.length > 8;

  const listScrollClass = hasManyItems
    ? campoAtivo !== null
      ? "max-h-[300px] overflow-visible pr-1"
      : "max-h-[300px] overflow-y-auto pr-1 overscroll-contain scrollbar-thin"
    : "overflow-visible";

  return (
    <section className="rounded-none border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-none bg-neutral-900 px-2 font-mono text-xs font-semibold tabular-nums text-white">
            02
          </span>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900">
            Composição de Custo
          </h2>
        </div>
      </header>

      <div className={`divide-y divide-neutral-100 ${listScrollClass}`}>
        {composicao.length > 0 ? (
          composicao.map((item, idx) => (
            <CostItemRow
              key={`${item.codigo || "item"}-${idx}`}
              item={item}
              idx={idx}
              composicao={composicao}
              setComposicao={setComposicao}
              removerItem={removerItem}
              campoAtivo={campoAtivo}
              sugestoes={sugestoes}
              indiceSelecionado={indiceSelecionado}
              listaRef={listaRef}
              buscarSugestoesDebounced={buscarSugestoesDebounced}
              handleSugestoesKeys={handleSugestoesKeys}
              selecionarSugestao={selecionarSugestao}
              confirmarSugestaoPrimeira={confirmarSugestaoPrimeira}
              inputRefs={inputRefs}
              handleGridNav={handleGridNav}
              isEditing={isEditing}
              setEditing={setEditing}
              toDisplay={toDisplay}
              toInternal={toInternal}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 rounded-none border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-neutral-900">
              Nenhum custo adicionado
            </p>
            <p className="text-xs text-neutral-500">
              Adicione produtos para calcular o custo total.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <AddCostButton onClick={adicionarItem} />
      </div>

      <div className="mt-3">
        <TotalCostCard custoTotal={custoTotal} />
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-none border border-neutral-200 bg-neutral-50 p-3.5">
        <Info size={16} weight="regular" className="mt-0.5 shrink-0 text-neutral-500" />
        <p className="text-xs leading-relaxed text-neutral-500">
          Os valores de impostos e comissões podem variar conforme as
          políticas de cada marketplace.
        </p>
      </div>
    </section>
  );
};
