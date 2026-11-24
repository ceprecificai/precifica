import React from "react";
import { Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuggestionDropdown } from "./Suggestion";

type SugestaoProduto = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
};

type TipoBuscaProduto = "codigo" | "descricao";

type ProductSectionProps = {
  codigo: string;
  setCodigo: (value: string) => void;

  descricao: string;
  setDescricao: (value: string) => void;

  sugestoesProduto?: SugestaoProduto[];
  produtoSugestaoAtiva?: boolean;
  indiceProdutoSelecionado?: number;
  listaProdutoRef?: React.RefObject<HTMLDivElement>;

  buscarSugestoesProdutoDebounced?: (
    termo: string,
    tipo: TipoBuscaProduto
  ) => void;

  handleProdutoSugestoesKeys?: (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => void;

  selecionarProdutoSugestao?: (
    codigo: string,
    custo: number,
    produto?: string,
    marca?: string
  ) => void;

  onAdicionarProduto?: () => void;

  onHoverProdutoIndex?: (index: number) => void;
  onCloseSugestoesProduto?: () => void;
};

const LABEL_CLASS =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";

const FIELD_WRAPPER_CLASS =
  "group flex h-12 items-center rounded-none border border-neutral-200 bg-white pr-1.5 transition-all duration-200 hover:border-neutral-400 focus-within:border-neutral-900 focus-within:ring-4 focus-within:ring-neutral-900/5";

const INPUT_CLASS =
  "h-full flex-1 min-w-0 border-0 bg-transparent px-4 text-sm font-medium text-neutral-900 shadow-none outline-none placeholder:font-normal placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0";

export const ProductSection: React.FC<ProductSectionProps> = ({
  codigo,
  setCodigo,
  descricao,
  setDescricao,

  sugestoesProduto = [],
  produtoSugestaoAtiva = false,
  indiceProdutoSelecionado = -1,
  listaProdutoRef,

  buscarSugestoesProdutoDebounced,
  handleProdutoSugestoesKeys,
  selecionarProdutoSugestao,

  onAdicionarProduto,

  onHoverProdutoIndex,
  onCloseSugestoesProduto,
}) => {
  const fallbackListaRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = listaProdutoRef || fallbackListaRef;

  // Refs de âncora, usadas pelo portal do SuggestionDropdown
  // para calcular a posição correta (fixed) fora da árvore com overflow.
  const codigoWrapperRef = React.useRef<HTMLDivElement>(null);
  const descricaoWrapperRef = React.useRef<HTMLDivElement>(null);

  const [campoBuscaAtivo, setCampoBuscaAtivo] =
    React.useState<TipoBuscaProduto | null>(null);

  const [isSearching, setIsSearching] = React.useState(false);
  const loadingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const canAdd = codigo.trim() !== "" || descricao.trim() !== "";

  const termoBuscaAtivo =
    campoBuscaAtivo === "codigo"
      ? codigo
      : campoBuscaAtivo === "descricao"
        ? descricao
        : "";

  React.useEffect(() => {
    setIsSearching(false);
  }, [sugestoesProduto]);

  React.useEffect(() => {
    if (!produtoSugestaoAtiva) {
      setIsSearching(false);
    }
  }, [produtoSugestaoAtiva]);

  React.useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const dispararLoading = () => {
    setIsSearching(true);

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 4000);
  };

  const handleCodigoChange = (value: string) => {
    setCodigo(value);
    setCampoBuscaAtivo("codigo");

    if (value.trim()) {
      dispararLoading();
    } else {
      setIsSearching(false);
    }

    buscarSugestoesProdutoDebounced?.(value, "codigo");
  };

  const handleCodigoFocus = () => {
    setCampoBuscaAtivo("codigo");

    if (codigo.trim()) {
      buscarSugestoesProdutoDebounced?.(codigo, "codigo");
    }
  };

  const handleDescricaoChange = (value: string) => {
    setDescricao(value);
    setCampoBuscaAtivo("descricao");

    if (value.trim()) {
      dispararLoading();
    } else {
      setIsSearching(false);
    }

    buscarSugestoesProdutoDebounced?.(value, "descricao");
  };

  const handleDescricaoFocus = () => {
    setCampoBuscaAtivo("descricao");

    if (descricao.trim()) {
      buscarSugestoesProdutoDebounced?.(descricao, "descricao");
    }
  };

  const handleSelect = (
    codigoSelecionado: string,
    custoSelecionado: number,
    produtoSelecionado?: string,
    marcaSelecionada?: string
  ) => {
    setIsSearching(false);

    selecionarProdutoSugestao?.(
      codigoSelecionado,
      custoSelecionado,
      produtoSelecionado,
      marcaSelecionada
    );
  };

  const handleClose = () => {
    setIsSearching(false);
    onCloseSugestoesProduto?.();
  };

  return (
    <section className="rounded-none border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-none bg-neutral-900 px-2 font-mono text-xs font-semibold tabular-nums text-white">
            01
          </span>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900">
            Produto
          </h2>
        </div>
      </header>

      <div className="space-y-5">
        <div className="relative">
          <label className={LABEL_CLASS}>Código / SKU</label>

          <div ref={codigoWrapperRef} className={FIELD_WRAPPER_CLASS}>
            <Input
              value={codigo}
              onChange={(e) => handleCodigoChange(e.target.value)}
              onFocus={handleCodigoFocus}
              onKeyDown={handleProdutoSugestoesKeys}
              placeholder="Ex: TN 5AM"
              className={INPUT_CLASS}
            />

            <Button
              type="button"
              onClick={onAdicionarProduto}
              disabled={!canAdd}
              variant="ghost"
              title="Adicionar na composição"
              aria-label="Adicionar na composição"
              className="
                flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center
                rounded-none bg-neutral-900 p-0 text-white
                transition-all duration-200
                hover:bg-neutral-700
                active:scale-95
                disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400
              "
            >
              <Plus className="h-4 w-4" weight="bold" />
            </Button>
          </div>

          <SuggestionDropdown
            isActive={produtoSugestaoAtiva && campoBuscaAtivo === "codigo"}
            sugestoes={sugestoesProduto}
            listaRef={dropdownRef}
            indiceSelecionado={indiceProdutoSelecionado}
            onSelect={handleSelect}
            termoBusca={campoBuscaAtivo === "codigo" ? termoBuscaAtivo : ""}
            isLoading={campoBuscaAtivo === "codigo" && isSearching}
            onHoverIndex={onHoverProdutoIndex}
            onClose={handleClose}
            anchorRef={codigoWrapperRef}
          />
        </div>

        <div className="relative">
          <label className={LABEL_CLASS}>Descrição</label>

          <div ref={descricaoWrapperRef} className={FIELD_WRAPPER_CLASS}>
            <Input
              value={descricao}
              onChange={(e) => handleDescricaoChange(e.target.value)}
              onFocus={handleDescricaoFocus}
              onKeyDown={handleProdutoSugestoesKeys}
              placeholder="Ex: TENNESSEE 5A MARFIM MADEIRA"
              className={INPUT_CLASS}
            />
          </div>

          <SuggestionDropdown
            isActive={produtoSugestaoAtiva && campoBuscaAtivo === "descricao"}
            sugestoes={sugestoesProduto}
            listaRef={dropdownRef}
            indiceSelecionado={indiceProdutoSelecionado}
            onSelect={handleSelect}
            termoBusca={campoBuscaAtivo === "descricao" ? termoBuscaAtivo : ""}
            isLoading={campoBuscaAtivo === "descricao" && isSearching}
            onHoverIndex={onHoverProdutoIndex}
            onClose={handleClose}
            anchorRef={descricaoWrapperRef}
          />
        </div>
      </div>
    </section>
  );
};
