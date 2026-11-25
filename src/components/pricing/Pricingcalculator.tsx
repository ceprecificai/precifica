"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePrecificacao } from "@/hooks/useprecificacao";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/createnotification";

import { ProductSection } from "./parts/Product";
import { CostComposition } from "./parts/Composition";
import { PriceCalculationSection } from "./parts/Pricecalcalculation";
import { CHANNELS, EMBALAGEM_PADRAO } from "@/components/costs/hooks/channelsconfig";
import type { ChannelKey } from "@/components/costs/hooks/channelsconfig";
import { useChannelPricing } from "@/components/costs/hooks/usechannelpricing";

export type Calculo = {
  desconto: string;
  imposto: string;
  margem: string;
  frete: string;
  comissao: string;
  marketing: string;
  embalagem?: string;
};

type Sugestao = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
};

type TipoBuscaProduto = "codigo" | "descricao";

type ProdutoSelecionado = {
  codigo: string;
  custo: number;
  produto?: string;
  marca?: string;
};

// Empresa/loja ativa, usada pelas regras de imposto (PriceCalculationSection).
type Empresa = "pikot" | "sobaquetas";
const EMPRESA_STORAGE_KEY = "pricing.empresaSelecionada.v1";

// Termos com menos de 2 caracteres geram queries muito genéricas
// (batem em quase toda a tabela). Abaixo disso, não busca.
const MIN_CHARS_BUSCA = 2;

// Cache de buscas recentes: evita repetir a mesma query se o usuário
// digitar/apagar e voltar ao mesmo termo dentro do TTL.
const CACHE_TTL_MS = 30_000;

const toInternal = (v: string): string => {
  if (!v) return "";

  let s = v.replace(/\s+/g, "");

  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  }

  s = s.replace(/[^\d.-]/g, "");

  const parts = s.split(".");

  if (parts.length > 2) {
    s = parts.shift()! + "." + parts.join("");
  }

  return s;
};

const toDisplay = (v: string): string => {
  if (!v) return "";

  const num = Number(v);

  if (!isFinite(num)) return v;

  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => clearTimeout(timer);

  return debounced as T & { cancel: () => void };
}

function resolveMarcaAtiva(composicao: any[]): string {
  const item = composicao.find((i: any) => String(i?.marca || "").trim());
  return item?.marca || "";
}

// Mapeia preço/frete calculado de cada canal para os campos legados
// consumidos por `acrescimos` (mantido para não quebrar consumidores externos).
const ACRESCIMO_PRICE_FIELD: Record<ChannelKey, string> = {
  loja: "precoLoja",
  shopee: "precoShopee",
  magalu: "precoMagalu",
  mlClassico: "precoMercadoLivreClassico",
  mlPremium: "precoMercadoLivrePremium",
  tiktok: "precoTiktok",
};

const ACRESCIMO_FRETE_FIELD: Partial<Record<ChannelKey, string>> = {
  mlClassico: "freteMercadoLivreClassico",
  mlPremium: "freteMercadoLivrePremium",
};

const mapResultados = (data: any[] | null): Sugestao[] =>
  data?.map((item) => ({
    codigo: item.code,
    custo: Number(item.current_cost) || 0,
    produto: item.product || "",
    marca: item.mark || "",
  })) || [];

// =====================
// Cache client-side de buscas recentes (Map em módulo — sobrevive
// entre re-renders, é limpo naturalmente pelo TTL).
// =====================
type CacheEntry = { data: Sugestao[]; ts: number };
const searchCacheRef = { current: new Map<string, CacheEntry>() };

function getCached(cacheKey: string): Sugestao[] | null {
  const entry = searchCacheRef.current.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    searchCacheRef.current.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCached(cacheKey: string, data: Sugestao[]) {
  searchCacheRef.current.set(cacheKey, { data, ts: Date.now() });
}

/**
 * Busca de custos na tabela `public.costs`, a mesma usada pela tela de custos.
 * Retorna no formato bruto das linhas (code, product, mark, current_cost).
 * Resultado é cacheado por até `CACHE_TTL_MS`.
 */
async function buscarPorColuna(
  coluna: "code" | "product" | "mark",
  raw: string,
  limit: number,
  signal: AbortSignal
): Promise<{ data: any[] | null; error: any }> {
  const cacheKey = `${coluna}:${raw}:${limit}`;
  const cached = getCached(cacheKey);

  if (cached) {
    return {
      data: cached.map((s) => ({
        code: s.codigo,
        current_cost: s.custo,
        product: s.produto,
        mark: s.marca,
      })),
      error: null,
    };
  }

  const { data: rows, error } = await supabase
    .schema("public")
    .from("costs")
    .select("code, product, mark, current_cost")
    .is("deleted_at", null)
    .ilike(coluna, `%${raw}%`)
    .order(coluna, { ascending: true })
    .limit(limit)
    .abortSignal(signal);

  if (error && !signal.aborted) {
    console.error("[pricing] busca de custos falhou:", error);
  }

  const data =
    rows?.map((r: any) => ({
      code: r.code,
      product: r.product,
      mark: r.mark,
      current_cost: r.current_cost,
    })) ?? null;

  if (!error && data) {
    setCached(cacheKey, mapResultados(data));
  }

  return { data, error };
}

export default function PricingCalculatorModern() {
  const {
    composicao,
    setComposicao,
    acrescimos,
    setAcrescimos,
    custoTotal,
    statusAcrescimo,
    adicionarItem,
    removerItem,
  } = usePrecificacao();

  const [produtoMarca, setProdutoMarca] = useState("");

  // Marca ativa sempre derivada da composição atual.
  useEffect(() => {
    setProdutoMarca(resolveMarcaAtiva(composicao));
  }, [composicao]);

  // =====================
  // Empresa/loja ativa (Pikot Shop / Sóbaquetas).
  // =====================
  const [empresa, setEmpresa] = useState<Empresa>("pikot");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EMPRESA_STORAGE_KEY);
      if (raw === "pikot" || raw === "sobaquetas") {
        setEmpresa(raw);
      }
    } catch {
      // Ignora erros de acesso ao localStorage.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(EMPRESA_STORAGE_KEY, empresa);
    } catch {
      // Ignora erros de acesso ao localStorage.
    }
  }, [empresa]);

  // =====================
  // Seção 1 — Produto (código / descrição / sugestões)
  // =====================
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [produtoSugestoes, setProdutoSugestoes] = useState<Sugestao[]>([]);
  const [produtoCampoAtivo, setProdutoCampoAtivo] =
    useState<TipoBuscaProduto | null>(null);
  const [indiceProduto, setIndiceProduto] = useState<number>(-1);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoSelecionado | null>(null);

  const produtoListaRef = useRef<HTMLDivElement>(null);
  const produtoAbortRef = useRef<AbortController | null>(null);
  const ultimaBuscaProdutoRef = useRef("");

  const fecharSugestoesProduto = useCallback(() => {
    setProdutoSugestoes([]);
    setProdutoCampoAtivo(null);
    setIndiceProduto(-1);
  }, []);

  const buscarProdutos = async (termo: string, tipo: TipoBuscaProduto) => {
    const raw = termo.trim();
    const chave = `${tipo}:${raw}`;
    ultimaBuscaProdutoRef.current = chave;

    if (!raw || raw.length < MIN_CHARS_BUSCA) {
      setProdutoSugestoes([]);
      setProdutoCampoAtivo(null);
      return;
    }

    produtoAbortRef.current?.abort();
    const controller = new AbortController();
    produtoAbortRef.current = controller;

    const { data, error } = await buscarPorColuna(
      tipo === "codigo" ? "code" : "product",
      raw,
      6,
      controller.signal
    );

    if (ultimaBuscaProdutoRef.current !== chave) return;
    if (error) return; // inclui abort — ignorado silenciosamente

    setProdutoCampoAtivo(tipo);
    setProdutoSugestoes(mapResultados(data));
    setIndiceProduto(0);
  };

  const buscarProdutosDebounced = useRef(
    debounce(buscarProdutos, 60)
  ).current;

  const selecionarProdutoSugestao = (
    codigoSel: string,
    custoSel: number,
    produtoSel?: string,
    marcaSel?: string
  ) => {
    setCodigo(codigoSel);
    setDescricao(produtoSel || codigoSel);
    setProdutoSelecionado({
      codigo: codigoSel,
      custo: Number(custoSel) || 0,
      produto: produtoSel,
      marca: marcaSel,
    });
    fecharSugestoesProduto();
  };

  const handleProdutoSugestoesKeys = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!produtoSugestoes.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceProduto((prev) =>
        prev < produtoSugestoes.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceProduto((prev) =>
        prev > 0 ? prev - 1 : produtoSugestoes.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const index = indiceProduto >= 0 ? indiceProduto : 0;
      const s = produtoSugestoes[index];
      if (s) {
        selecionarProdutoSugestao(s.codigo, s.custo, s.produto, s.marca);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      fecharSugestoesProduto();
    }
  };

  const adicionarProdutoNaComposicao = () => {
    const codigoLimpo = codigo.trim();
    const descricaoLimpa = descricao.trim();

    if (!codigoLimpo && !descricaoLimpa) return;

    const origem = produtoSelecionado;

    const novoItem = {
      codigo: origem?.codigo || codigoLimpo,
      produto: origem?.produto || descricaoLimpa,
      descricao: origem?.produto || descricaoLimpa,
      quantidade: "1",
      custo: (origem?.custo ?? 0).toFixed(2),
      embalagem: "",
      marca: origem?.marca || "",
    };

    setComposicao([...composicao, novoItem]);

    setCodigo("");
    setDescricao("");
    setProdutoSelecionado(null);
    fecharSugestoesProduto();
  };

  // Fecha as sugestões de produto ao clicar fora do painel e dos inputs.
  useEffect(() => {
    if (produtoCampoAtivo === null) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".suggestion-panel")) return;
      if (target.tagName === "INPUT") return;
      fecharSugestoesProduto();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [produtoCampoAtivo, fecharSugestoesProduto]);

  useEffect(() => {
    return () => {
      buscarProdutosDebounced.cancel();
      produtoAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================
  // Sugestões Supabase da Composição
  // =====================
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [campoAtivo, setCampoAtivo] = useState<number | null>(null);
  const [indiceSelecionado, setIndiceSelecionado] = useState<number>(-1);

  const listaRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<HTMLInputElement[][]>([]);
  const acrescimosRefs = useRef<HTMLInputElement[]>([]);

  // AbortControllers para cancelar requisições de busca em voo quando
  // uma nova busca é disparada (digitação rápida).
  const buscaAbortControllerRef = useRef<AbortController | null>(null);

  // Refs de navegação por canal — Record<ChannelKey, ref>.
  const channelRefsMapRef = useRef<Record<ChannelKey, HTMLInputElement[]>>(
    Object.fromEntries(CHANNELS.map((c) => [c.key, []])) as Record<
      ChannelKey,
      HTMLInputElement[]
    >
  );

  // =====================
  // Controle de edição
  // =====================
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());

  const setEditing = (key: string, editing: boolean) => {
    setEditingFields((prev) => {
      const next = new Set(prev);
      if (editing) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const isEditing = (key: string) => editingFields.has(key);

  // =====================
  // Cálculo de preço (usa composicao do escopo do componente)
  // =====================
  const calcularPreco = useCallback(
    (dados: Calculo) => {
      const custo = composicao.reduce(
        (sum, item) =>
          sum +
          (parseFloat(item.custo) || 0) * (parseFloat(item.quantidade) || 0),
        0
      );

      const desconto = (parseFloat(dados.desconto) || 0) / 100;
      const imposto = (parseFloat(dados.imposto) || 0) / 100;
      const margem = (parseFloat(dados.margem) || 0) / 100;
      const comissao = (parseFloat(dados.comissao) || 0) / 100;
      const marketing = (parseFloat(dados.marketing) || 0) / 100;
      const frete = parseFloat(dados.frete) || 0;

      const embalagemManual = parseFloat(dados.embalagem || "");

      const embalagem =
        !isNaN(embalagemManual) && dados.embalagem
          ? embalagemManual
          : parseFloat(EMBALAGEM_PADRAO);

      const custoLiquido = custo * (1 - desconto);
      const divisor = 1 - (imposto + margem + comissao + marketing);

      const preco =
        divisor > 0 ? (custoLiquido + frete + embalagem) / divisor : 0;

      return isFinite(preco) ? preco : 0;
    },
    [composicao]
  );

  // =====================
  // Motor único de canais
  // =====================
  const {
    calculos,
    setCalculo,
    setCalculos,
    manualFlags,
    setManualFlag,
    brandOverrides,
    precos,
    resetAll: resetChannelsAll,
    resetManualState,
    refetchDbRules,
  } = useChannelPricing(produtoMarca, calcularPreco);

  // =====================
  // calcularPrecoLojaItem (usado só na exportação do Excel)
  // =====================
  const calcularPrecoLojaItem = (
    custoUnitario: number,
    quantidade: number
  ) => {
    const calculoLoja = calculos.loja;
    const custoItem = custoUnitario * quantidade;

    const desconto = (parseFloat(toInternal(calculoLoja.desconto)) || 0) / 100;
    const imposto = (parseFloat(toInternal(calculoLoja.imposto)) || 0) / 100;
    const margem = (parseFloat(toInternal(calculoLoja.margem)) || 0) / 100;
    const comissao = (parseFloat(toInternal(calculoLoja.comissao)) || 0) / 100;
    const marketing =
      (parseFloat(toInternal(calculoLoja.marketing)) || 0) / 100;
    const frete = parseFloat(toInternal(calculoLoja.frete)) || 0;

    const embalagemManual = parseFloat(
      toInternal(calculoLoja.embalagem || "")
    );

    const embalagem =
      !isNaN(embalagemManual) && calculoLoja.embalagem
        ? embalagemManual
        : parseFloat(EMBALAGEM_PADRAO);

    const custoLiquido = custoItem * (1 - desconto);
    const divisor = 1 - (imposto + margem + comissao + marketing);

    const preco =
      divisor > 0 ? (custoLiquido + frete + embalagem) / divisor : 0;

    return isFinite(preco) ? preco : 0;
  };

  // =====================
  // Reset da trava manual a cada alteração na composição ou marca.
  // =====================
  const isFirstRenderComposicaoRef = useRef(true);
  const lastComposicaoSnapshotRef = useRef<string>("");

  useEffect(() => {
    const snapshot = JSON.stringify({
      itens: composicao.map((item: any) => ({
        codigo: item.codigo,
        custo: item.custo,
        quantidade: item.quantidade,
        marca: item.marca,
      })),
      marca: produtoMarca,
    });

    if (isFirstRenderComposicaoRef.current) {
      isFirstRenderComposicaoRef.current = false;
      lastComposicaoSnapshotRef.current = snapshot;
      return;
    }

    if (snapshot !== lastComposicaoSnapshotRef.current) {
      lastComposicaoSnapshotRef.current = snapshot;
      resetManualState();
    }
  }, [composicao, produtoMarca, resetManualState]);

  // =====================
  // Sincroniza acrescimos (preços/fretes calculados) para consumo
  // externo, mantendo os nomes de campo legados.
  // =====================
  useEffect(() => {
    setAcrescimos((prev: any) => {
      const next = { ...prev };

      CHANNELS.forEach((def) => {
        next[ACRESCIMO_PRICE_FIELD[def.key]] = precos[def.key].toFixed(2);

        const freteField = ACRESCIMO_FRETE_FIELD[def.key];
        if (freteField) {
          next[freteField] = calculos[def.key].frete || "0";
        }
      });

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precos, calculos.mlClassico.frete, calculos.mlPremium.frete, setAcrescimos]);

  // =====================
  // Fechar sugestões da composição ao clicar fora.
  // Apenas fecha a lista: nunca grava automaticamente a primeira sugestão.
  // =====================
  useEffect(() => {
    if (campoAtivo === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      const listaEl = listaRef.current;
      const inputEl = inputRefs.current[campoAtivo]?.[0];
      const target = e.target as Node;

      const clickDentroLista = Boolean(listaEl && listaEl.contains(target));
      const clickNoInputAtivo = Boolean(inputEl && inputEl.contains(target));

      if (clickDentroLista || clickNoInputAtivo) return;

      setSugestoes([]);
      setCampoAtivo(null);
      setIndiceSelecionado(-1);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [campoAtivo]);

  useEffect(() => {
    if (listaRef.current && indiceSelecionado >= 0) {
      const element = listaRef.current.children[
        indiceSelecionado
      ] as HTMLElement;
      element?.scrollIntoView({ block: "nearest" });
    }
  }, [indiceSelecionado]);

  const ultimaBuscaRef = useRef("");

  /**
   * Busca de sugestões da COMPOSIÇÃO — consulta `public.costs` por código.
   */
  const buscarSugestoes = async (termo: string, idx: number) => {
    const raw = termo.trim();
    ultimaBuscaRef.current = raw;

    if (!raw || raw.length < MIN_CHARS_BUSCA) {
      setSugestoes([]);
      return;
    }

    buscaAbortControllerRef.current?.abort();
    const controller = new AbortController();
    buscaAbortControllerRef.current = controller;

    const { data, error } = await buscarPorColuna(
      "code",
      raw,
      5,
      controller.signal
    );

    if (ultimaBuscaRef.current !== raw) return;
    if (error) return; // inclui abort — ignorado silenciosamente

    setCampoAtivo(idx);
    setSugestoes(mapResultados(data));
    setIndiceSelecionado(0);
  };

  const buscarSugestoesDebounced = useRef(
    debounce(buscarSugestoes, 60)
  ).current;

  // Cancela debounces pendentes e requisições em voo ao desmontar o
  // componente — evita setState em componente desmontado.
  useEffect(() => {
    return () => {
      buscarSugestoesDebounced.cancel();
      buscaAbortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Grava o item selecionado na composição.
   * Usa a forma funcional do setState para não depender de um
   * `composicao` capturado em closure (que pode estar desatualizado).
   */
  const confirmarSugestaoPrimeira = (
    idx: number,
    codigo: string,
    custo: number,
    produto?: string,
    marca?: string
  ) => {
    setComposicao((prev: any[]) => {
      const novo = [...prev];

      novo[idx] = {
        ...novo[idx],
        codigo,
        produto: produto || novo[idx]?.produto || "",
        descricao: produto || novo[idx]?.descricao || "",
        custo: (Number(custo) || 0).toFixed(2),
        marca: marca !== undefined ? marca : novo[idx]?.marca || "",
        quantidade: novo[idx]?.quantidade || "1",
      };

      return novo;
    });
  };

  const selecionarSugestao = (
    codigo: string,
    custo: number,
    idx: number,
    produto?: string,
    marca?: string
  ) => {
    confirmarSugestaoPrimeira(idx, codigo, custo, produto, marca);

    setSugestoes([]);
    setCampoAtivo(null);
    setIndiceSelecionado(-1);

    setTimeout(() => {
      inputRefs.current[idx]?.[0]?.focus();
    }, 50);
  };

  const handleSugestoesKeys = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (!sugestoes.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSelecionado((prev) =>
        prev < sugestoes.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSelecionado((prev) =>
        prev > 0 ? prev - 1 : sugestoes.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const index = indiceSelecionado >= 0 ? indiceSelecionado : 0;
      const sugestao = sugestoes[index];
      if (!sugestao) return;

      selecionarSugestao(
        sugestao.codigo,
        sugestao.custo,
        idx,
        sugestao.produto,
        sugestao.marca
      );
    } else if (e.key === "Tab") {
      e.preventDefault();
      const index = indiceSelecionado >= 0 ? indiceSelecionado : 0;
      const sugestao = sugestoes[index];
      if (!sugestao) return;

      confirmarSugestaoPrimeira(
        idx,
        sugestao.codigo,
        sugestao.custo,
        sugestao.produto,
        sugestao.marca
      );

      setSugestoes([]);
      setCampoAtivo(null);
      setIndiceSelecionado(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSugestoes([]);
      setCampoAtivo(null);
      setIndiceSelecionado(-1);
    }
  };

  const handleGridNav = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    if (sugestoes.length && campoAtivo === row) return;

    const totalRows = composicao.length;

    const goNext = () => {
      const nextRow = row + 1 < totalRows ? row + 1 : 0;
      inputRefs.current[nextRow]?.[col]?.focus();
    };

    const goPrev = () => {
      const prevRow = row - 1 >= 0 ? row - 1 : totalRows - 1;
      inputRefs.current[prevRow]?.[col]?.focus();
    };

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goPrev();
    }
  };

  const handleLinearNav = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    refs: React.MutableRefObject<HTMLInputElement[]>,
    total: number
  ) => {
    const next = () => refs.current[(index + 1) % total]?.focus();
    const prev = () => refs.current[(index - 1 + total) % total]?.focus();

    if (
      e.key === "ArrowDown" ||
      e.key === "Enter" ||
      (e.key === "Tab" && !e.shiftKey)
    ) {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      prev();
    }
  };

  // =====================
  // Desconto: a Loja sempre dirige o desconto de todos os canais.
  // =====================
  const syncDescontoFromLoja = (descontoInternal: string) => {
    CHANNELS.forEach((def) => {
      setCalculo(def.key, (prev) => ({ ...prev, desconto: descontoInternal }));
    });
  };

  // =====================
  // Embalagem: canais com sharesEmbalagem=true recebem o valor
  // global (editado pela Loja). Canais com sharesEmbalagem=false
  // (ex: Shopee) têm campo próprio e travam manualmente ao editar.
  // -----------------------------------------------------------------
  // Qualquer edição — incluindo "0" — marca manualFlags[...].embalagem
  // = true. Sem isso, o engine de embalagem (useChannelPricing) vê a
  // flag ainda em "false" e sobrescreve o "0" digitado de volta pro
  // valor fixo (EMBALAGEM_PADRAO) no próximo render.
  // =====================
  const handleEmbalagemChangeShared = (raw: string) => {
    const value = toInternal(raw);

    CHANNELS.forEach((def) => {
      if (!def.sharesEmbalagem) return;

      setManualFlag(def.key, "embalagem", true);
      setCalculo(def.key, (prev) => ({ ...prev, embalagem: value }));
    });
  };

  const handleEmbalagemBlurShared = (raw: string) => {
    const value = toInternal(raw || "");

    CHANNELS.forEach((def) => {
      if (!def.sharesEmbalagem) return;

      if (!value) {
        // Campo ficou vazio no blur → volta pro modo automático (fixo).
        setManualFlag(def.key, "embalagem", false);
      } else {
        setManualFlag(def.key, "embalagem", true);
      }

      setCalculo(def.key, (prev) => ({ ...prev, embalagem: value }));
    });
  };

  const handleEmbalagemChangeChannel = (key: ChannelKey, raw: string) => {
    setManualFlag(key, "embalagem", true);

    const value = toInternal(raw);
    setCalculo(key, (prev) => ({ ...prev, embalagem: value }));
  };

  const handleEmbalagemBlurChannel = (key: ChannelKey, raw: string) => {
    const internal = toInternal(raw || "");

    if (!internal) {
      setManualFlag(key, "embalagem", false);
    }

    setCalculo(key, (prev) => ({ ...prev, embalagem: internal }));
  };

  // =====================
  // Limpar tudo
  // =====================
  const [isClearing, setIsClearing] = useState(false);
  const [clicks, setClicks] = useState(0);

  const handleClearAll = () => {
    const newCount = clicks + 1;
    setClicks(newCount);

    if (newCount >= 5) {
      setIsClearing(true);
      console.warn("Botão de limpar bloqueado após 5 cliques.");
      return;
    }

    setIsClearing(true);
    setComposicao([]);

    setProdutoMarca("");

    setCodigo("");
    setDescricao("");
    setProdutoSelecionado(null);
    fecharSugestoesProduto();

    resetChannelsAll();

    setAcrescimos({
      precoLoja: "",
      precoShopee: "",
      precoMagalu: "",
      precoMercadoLivreClassico: "",
      precoMercadoLivrePremium: "",
      precoTiktok: "",
      freteMercadoLivreClassico: "",
      freteMercadoLivrePremium: "",
      acrescimoClassico: 0,
      acrescimoPremium: 0,
    });

    isFirstRenderComposicaoRef.current = true;
    lastComposicaoSnapshotRef.current = "";

    setTimeout(() => setIsClearing(false), 300);
  };

  useEffect(() => {
    if (clicks === 0) return;
    const timer = setTimeout(() => setClicks(0), 5000);
    return () => clearTimeout(timer);
  }, [clicks]);

  const handleDownload = async () => {
    const now = new Date();
    const dataFormatada = now.toLocaleDateString("pt-BR").replace(/\//g, "-");

    const horaFormatada = `${now
      .getHours()
      .toString()
      .padStart(2, "0")}h${now.getMinutes().toString().padStart(2, "0")}m`;

    const fileName = `PRECIFICACAO - ${dataFormatada}-${horaFormatada}.xlsx`;

    const composicaoRows: (string | number)[][] = [
      ["Composição de Custos"],
      ["Gerado em", now.toLocaleString("pt-BR")],
      [],
      ["Código", "Descrição", "Quantidade", "Preço de Venda (R$)"],
      ...composicao.map((item: any) => {
        const custoUnitario = parseFloat(toInternal(item.custo)) || 0;
        const quantidade = parseFloat(toInternal(item.quantidade)) || 0;

        return [
          item.codigo || "",
          item.produto || item.descricao || "",
          item.quantidade || "",
          calcularPrecoLojaItem(custoUnitario, quantidade).toFixed(2),
        ];
      }),
    ];

    const composicaoSheet = XLSX.utils.aoa_to_sheet(composicaoRows);

    const headerStyle = {
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: { rgb: "1A8CEB" },
      },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } },
      },
      alignment: { horizontal: "center", vertical: "center" },
    } as const;

    const applyHeaderStyle = (sheet: any, headerRow: number, cols: number) => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      for (let index = 0; index < cols; index++) {
        const cellRef = `${letters[index]}${headerRow}`;
        if (sheet[cellRef]) sheet[cellRef].s = headerStyle;
      }
    };

    applyHeaderStyle(composicaoSheet, 4, 4);

    composicaoSheet["!cols"] = [
      { wch: 24 },
      { wch: 44 },
      { wch: 16 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, composicaoSheet, "Composição");

    const workbookOutput = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([workbookOutput], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);

    await createNotification({
      title: "Precificação exportada",
      message: `A planilha "${fileName}" foi exportada com ${composicao.length} item(ns) na composição.`,
      action: "status",
      entityType: "pricing_calculator_export",
      link: "/dashboard/precificacao",
    });
  };

  return (
    <div className="w-full overflow-x-hidden bg-neutral-100 px-3 pb-24 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div
            className={`min-w-0 space-y-5 lg:col-span-3 ${
              campoAtivo !== null || produtoCampoAtivo !== null
                ? "z-[120]"
                : "z-0"
            }`}
          >
            <ProductSection
              codigo={codigo}
              setCodigo={setCodigo}
              descricao={descricao}
              setDescricao={setDescricao}
              sugestoesProduto={produtoSugestoes}
              produtoSugestaoAtiva={produtoCampoAtivo !== null}
              indiceProdutoSelecionado={indiceProduto}
              listaProdutoRef={produtoListaRef}
              buscarSugestoesProdutoDebounced={buscarProdutosDebounced}
              handleProdutoSugestoesKeys={handleProdutoSugestoesKeys}
              selecionarProdutoSugestao={selecionarProdutoSugestao}
              onAdicionarProduto={adicionarProdutoNaComposicao}
              onHoverProdutoIndex={setIndiceProduto}
              onCloseSugestoesProduto={fecharSugestoesProduto}
              store={empresa}
              setCalculo={setCalculo}
              setManualFlag={setManualFlag}
            />

            <CostComposition
              composicao={composicao}
              setComposicao={setComposicao}
              custoTotal={custoTotal}
              adicionarItem={adicionarItem}
              removerItem={removerItem}
              sugestoes={sugestoes}
              campoAtivo={campoAtivo}
              indiceSelecionado={indiceSelecionado}
              listaRef={listaRef}
              inputRefs={inputRefs}
              buscarSugestoesDebounced={buscarSugestoesDebounced}
              handleSugestoesKeys={handleSugestoesKeys}
              handleGridNav={handleGridNav}
              selecionarSugestao={selecionarSugestao}
              confirmarSugestaoPrimeira={confirmarSugestaoPrimeira}
              isEditing={isEditing}
              setEditing={setEditing}
              toDisplay={toDisplay}
              toInternal={toInternal}
            />
          </div>

          <div className="min-w-0 lg:col-span-9">
            <PriceCalculationSection
              calculos={calculos}
              precos={precos}
              manualFlags={manualFlags}
              setManualFlag={setManualFlag}
              brandOverrides={brandOverrides}
              setCalculo={setCalculo}
              channelRefsMap={channelRefsMapRef.current}
              acrescimos={acrescimos}
              setAcrescimos={setAcrescimos}
              isEditing={isEditing}
              setEditing={setEditing}
              toDisplay={toDisplay}
              toInternal={toInternal}
              handleLinearNav={handleLinearNav}
              acrescimosRefs={acrescimosRefs}
              handleEmbalagemBlurShared={handleEmbalagemBlurShared}
              handleEmbalagemChangeShared={handleEmbalagemChangeShared}
              handleEmbalagemChangeChannel={handleEmbalagemChangeChannel}
              handleEmbalagemBlurChannel={handleEmbalagemBlurChannel}
              handleDownload={handleDownload}
              handleClearAll={handleClearAll}
              isClearing={isClearing}
              clicks={clicks}
              statusAcrescimo={statusAcrescimo}
              syncDescontoFromLoja={syncDescontoFromLoja}
              refetchDbRules={refetchDbRules}
              empresa={empresa}
              setEmpresa={setEmpresa}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
