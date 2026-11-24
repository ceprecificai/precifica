import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Storefront,
  ShoppingBag,
  Handshake,
  Check,
  X,
  Copy,
  Checks,
  ArrowCircleUp,
} from "@phosphor-icons/react";
import { ClearAndDownloadActions } from "./Clear";
import { AcrescimosSection } from "./Acrescimos";
import { AnimatedNumber } from "./Animatednumber";
import type { Calculo } from "../Pricingcalculator";
import { CHANNELS, getChannelDef } from "@/components/costs/hooks/channelsconfig";
import type { ChannelKey } from "@/components/costs/hooks/channelsconfig";
import type { BrandOverrides, ManualFlags } from "@/components/costs/hooks/usechannelpricing";

type Empresa = "pikot" | "sobaquetas";

const ACCENT = "#000000";

const MagaluLogo = () => {
  return (
    <span className="select-none text-[10px] font-black leading-none tracking-tight text-white">
      Magalu
    </span>
  );
};

const TiktokLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="currentColor"
        d="M33.5 6.5c1.4 3.6 4.4 6.4 8.1 7.2v6.4c-2.9 0-5.7-.8-8.1-2.2v13.4c0 6.9-5.6 12.6-12.5 12.6S8.5 37.2 8.5 30.3c0-6.5 5.1-11.9 11.5-12.5v6.5c-2.9.6-5 3.1-5 6.1 0 3.4 2.7 6.1 6.1 6.1s6.1-2.7 6.1-6.1V4h6.3c0 .9.1 1.7.3 2.5Z"
      />
    </svg>
  );
};

type ChannelVisual = {
  icon: React.ReactNode;
  iconClassName: string;
  dotClassName: string;
  priceClassName: string;
  shortLabel: string;
};

const CHANNEL_VISUAL: Record<ChannelKey, ChannelVisual> = {
  loja: {
    icon: <Storefront className="h-5 w-5 text-white" />,
    iconClassName: "border-[#1a8ceb] bg-[#1a8ceb]",
    dotClassName: "bg-[#1a8ceb]",
    priceClassName: "text-neutral-900",
    shortLabel: "Loja",
  },
  shopee: {
    icon: <ShoppingBag className="h-5 w-5 text-white" />,
    iconClassName: "border-orange-500 bg-orange-500",
    dotClassName: "bg-orange-500",
    priceClassName: "text-orange-600",
    shortLabel: "Shopee",
  },
  magalu: {
    icon: <MagaluLogo />,
    iconClassName: "border-[#1a8ceb] bg-[#1a8ceb]",
    dotClassName: "bg-[#1a8ceb]",
    priceClassName: "text-neutral-900",
    shortLabel: "Magalu",
  },
  mlClassico: {
    icon: <Handshake className="h-5 w-5 text-white" />,
    iconClassName: "border-yellow-500 bg-yellow-500",
    dotClassName: "bg-yellow-500",
    priceClassName: "text-yellow-700",
    shortLabel: "Clássico",
  },
  mlPremium: {
    icon: <Handshake className="h-5 w-5 text-white" />,
    iconClassName: "border-yellow-500 bg-yellow-500",
    dotClassName: "bg-yellow-500",
    priceClassName: "text-yellow-700",
    shortLabel: "Premium",
  },
  tiktok: {
    icon: <TiktokLogo className="h-5 w-5 text-white" />,
    iconClassName: "border-neutral-900 bg-neutral-900",
    dotClassName: "bg-neutral-900",
    priceClassName: "text-neutral-900",
    shortLabel: "TikTok",
  },
};

const STORAGE_KEY = "pricing.visibleBlocks.v6";

const fields: Array<{
  key: keyof Calculo;
  label: string;
  suffix?: string;
  unit: string;
}> = [
  { key: "desconto", label: "Desconto", suffix: "%", unit: "(%)" },
  { key: "embalagem", label: "Embalagem", suffix: "R$", unit: "(R$)" },
  { key: "frete", label: "Frete", suffix: "R$", unit: "(R$)" },
  { key: "imposto", label: "Imposto", suffix: "%", unit: "(%)" },
  { key: "comissao", label: "Comissão", suffix: "%", unit: "(%)" },
  { key: "margem", label: "Margem de Lucro", suffix: "%", unit: "(%)" },
  { key: "marketing", label: "Marketing", suffix: "%", unit: "(%)" },
];

/**
 * "0" nunca é tratado como vazio. Só é vazio quando a string está
 * realmente vazia ou não é um número válido.
 */
const isEmpty = (value: string) => {
  const normalized = (value || "").trim();

  if (normalized === "") return true;

  return !isFinite(Number(normalized));
};

const ChannelIcon = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none border shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

type FieldInputProps = {
  value: string | undefined;
  fieldKey: keyof Calculo;
  editingKey: string;
  suffix?: string;
  inputRef: (element: HTMLInputElement | null) => void;
  navIndex: number;
  totalFields: number;
  refs: React.MutableRefObject<HTMLInputElement[]>;
  onChange: (key: keyof Calculo, value: string) => void;
  onBlur: (key: keyof Calculo, value: string) => void;
  isEditing: (key: string) => boolean;
  setEditing: (key: string, editing: boolean) => void;
  toDisplay: (value: string) => string;
  toInternal: (value: string) => string;
  handleLinearNav: (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    refs: React.MutableRefObject<HTMLInputElement[]>,
    total: number
  ) => void;
};

/**
 * Memoizado: 6 canais x 7 campos = 42 instâncias. Digitar em um campo
 * não re-renderiza os outros.
 *
 * BUFFER LOCAL: enquanto o campo está em foco, exibe `localValue`, para
 * que os engines automáticos não sobrescrevam o que o usuário digita.
 */
const FieldInput = React.memo(
  ({
    value,
    fieldKey,
    editingKey,
    suffix,
    inputRef,
    navIndex,
    totalFields,
    refs,
    onChange,
    onBlur,
    isEditing,
    setEditing,
    toDisplay,
    toInternal,
    handleLinearNav,
  }: FieldInputProps) => {
    const rawValue = value || "";
    const editing = isEditing(editingKey);

    const [localValue, setLocalValue] = React.useState(rawValue);

    React.useEffect(() => {
      if (!editing) {
        setLocalValue(rawValue);
      }
    }, [rawValue, editing]);

    const displayValue = editing ? localValue : toDisplay(rawValue);

    return (
      <div className="mx-auto flex h-11 w-full max-w-[112px] items-center rounded-none border border-neutral-200 bg-neutral-50 px-2.5 transition-all duration-200 hover:border-neutral-400 focus-within:border-neutral-900 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/5">
        <input
          ref={inputRef}
          value={displayValue}
          inputMode="decimal"
          onFocus={() => {
            setLocalValue(rawValue);
            setEditing(editingKey, true);
          }}
          onBlur={(event) => {
            setEditing(editingKey, false);

            const internalValue = toInternal(event.target.value);

            onBlur(fieldKey, internalValue);
          }}
          onChange={(event) => {
            setLocalValue(event.target.value);

            const internalValue = toInternal(event.target.value);

            onChange(fieldKey, internalValue);
          }}
          onKeyDown={(event) =>
            handleLinearNav(event, navIndex, refs, totalFields)
          }
          className="h-full w-full min-w-0 bg-transparent text-center text-sm font-semibold tabular-nums text-neutral-900 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 focus-visible:outline-none"
        />

        {suffix && (
          <span className="ml-1 shrink-0 text-xs font-medium text-neutral-500">
            {suffix}
          </span>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.fieldKey === next.fieldKey &&
      prev.editingKey === next.editingKey &&
      prev.suffix === next.suffix &&
      prev.navIndex === next.navIndex &&
      prev.totalFields === next.totalFields &&
      prev.isEditing(prev.editingKey) === next.isEditing(next.editingKey)
    );
  }
);

FieldInput.displayName = "FieldInput";

type PriceCalculationSectionProps = {
  calculos: Record<ChannelKey, Calculo>;
  precos: Record<ChannelKey, number>;

  manualFlags: Record<ChannelKey, ManualFlags>;
  setManualFlag: (
    key: ChannelKey,
    field: keyof ManualFlags,
    value: boolean
  ) => void;

  brandOverrides: Record<ChannelKey, BrandOverrides>;

  setCalculo: (
    key: ChannelKey,
    updater: (prev: Calculo) => Calculo
  ) => void;

  channelRefsMap: Record<ChannelKey, HTMLInputElement[]>;

  acrescimos: any;
  setAcrescimos: (value: any) => void;

  isEditing: (key: string) => boolean;
  setEditing: (key: string, editing: boolean) => void;
  toDisplay: (v: string) => string;
  toInternal: (v: string) => string;

  handleLinearNav: (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    refs: React.MutableRefObject<HTMLInputElement[]>,
    total: number
  ) => void;

  acrescimosRefs: React.MutableRefObject<HTMLInputElement[]>;

  handleEmbalagemBlurShared: (raw: string) => void;
  handleEmbalagemChangeShared: (raw: string) => void;
  handleEmbalagemChangeChannel: (key: ChannelKey, raw: string) => void;
  handleEmbalagemBlurChannel: (key: ChannelKey, raw: string) => void;

  handleDownload: () => void;
  handleClearAll: () => void;
  isClearing: boolean;
  clicks: number;

  statusAcrescimo: any;

  syncDescontoFromLoja: (descontoInternal: string) => void;

  refetchDbRules?: () => void;

  empresa: Empresa;
  setEmpresa: (value: Empresa) => void;
};

type ChannelRow = {
  key: ChannelKey;
  title: string;
  subtitle: string;
  visual: ChannelVisual;
  state: Calculo;
  preco: number;
  refs: React.MutableRefObject<HTMLInputElement[]>;
};

/* Grade compartilhada entre cabeçalho e linhas (desktop) */
const GRID_DESKTOP =
  "lg:grid-cols-[210px_repeat(7,minmax(104px,1fr))_180px]";

export const PriceCalculationSection: React.FC<
  PriceCalculationSectionProps
> = ({
  calculos,
  precos,

  manualFlags,
  setManualFlag,

  brandOverrides,

  setCalculo,
  channelRefsMap,

  acrescimos,
  setAcrescimos,

  isEditing,
  setEditing,
  toDisplay,
  toInternal,

  handleLinearNav,
  acrescimosRefs,

  handleEmbalagemBlurShared,
  handleEmbalagemChangeShared,
  handleEmbalagemChangeChannel,
  handleEmbalagemBlurChannel,

  handleDownload,
  handleClearAll,
  isClearing,
  clicks,

  statusAcrescimo,

  syncDescontoFromLoja,

  refetchDbRules,

  empresa,
  setEmpresa,
}) => {
  const defaultVisible: Record<ChannelKey, boolean> = React.useMemo(
    () =>
      Object.fromEntries(
        CHANNELS.map((c) => [c.key, true])
      ) as Record<ChannelKey, boolean>,
    []
  );

  const [visible, setVisible] =
    React.useState<Record<ChannelKey, boolean>>(defaultVisible);

  const [isLayoutOpen, setIsLayoutOpen] = React.useState(false);

  const [copiedKey, setCopiedKey] =
    React.useState<ChannelKey | null>(null);

  const [isEmpresaOpen, setIsEmpresaOpen] = React.useState(false);

  const pikotSnapshotRef = React.useRef<Record<
    ChannelKey,
    Calculo
  > | null>(null);

  // Imposto é constante fixa por empresa: 10% Sóbaquetas / 14% Pikot Shop.
  // Respeita manualFlags.imposto quando o usuário já editou manualmente.
  const applyEmpresaOverrides = React.useCallback(
    (emp: Empresa) => {
      const impostoFixo = emp === "sobaquetas" ? "10" : "14";

      CHANNELS.forEach((def) => {
        setCalculo(def.key, (previous) => {
          const jaEhManual = manualFlags[def.key]?.imposto;

          return {
            ...previous,
            imposto: jaEhManual ? previous.imposto : impostoFixo,
            ...(def.key === "loja" && emp === "sobaquetas"
              ? { comissao: "0" }
              : {}),
          };
        });
      });
    },
    [setCalculo, manualFlags]
  );

  const didApplyInitialOverridesRef = React.useRef(false);

  React.useEffect(() => {
    if (didApplyInitialOverridesRef.current) return;
    didApplyInitialOverridesRef.current = true;

    applyEmpresaOverrides(empresa);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEmpresa = (next: Empresa) => {
    if (next === empresa) {
      setIsEmpresaOpen(false);
      return;
    }

    if (next === "sobaquetas") {
      pikotSnapshotRef.current = { ...calculos };
    } else {
      const snapshot = pikotSnapshotRef.current;

      if (snapshot) {
        CHANNELS.forEach((def) => {
          setCalculo(def.key, () => snapshot[def.key]);
        });
      }
    }

    applyEmpresaOverrides(next);
    setEmpresa(next);
    setIsEmpresaOpen(false);
  };

  const closeEmpresaOnOutside = React.useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      if (target.closest?.("[data-empresa-dropdown]")) {
        return;
      }

      setIsEmpresaOpen(false);
    },
    []
  );

  React.useEffect(() => {
    if (!isEmpresaOpen) return;

    window.addEventListener("mousedown", closeEmpresaOnOutside);

    return () => {
      window.removeEventListener("mousedown", closeEmpresaOnOutside);
    };
  }, [isEmpresaOpen, closeEmpresaOnOutside]);

  const empresaColorClass =
    empresa === "sobaquetas" ? "text-orange-600" : "text-[#1a8ceb]";

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<
        Record<ChannelKey, boolean>
      >;

      const next: Record<ChannelKey, boolean> = {
        ...defaultVisible,
        ...parsed,
      };

      const visibleCount = Object.values(next).filter(Boolean).length;

      setVisible(
        visibleCount === 0
          ? {
              ...next,
              loja: true,
            }
          : next
      );
    } catch {
      // Ignora erros de acesso ao localStorage.
    }
  }, [defaultVisible]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
    } catch {
      // Ignora erros de acesso ao localStorage.
    }
  }, [visible]);

  const ensureAtLeastOneVisible = React.useCallback(
    (next: Record<ChannelKey, boolean>) => {
      const visibleCount = Object.values(next).filter(Boolean).length;

      if (visibleCount === 0) {
        return {
          ...next,
          loja: true,
        };
      }

      return next;
    },
    []
  );

  const hideBlock = React.useCallback(
    (key: ChannelKey) => {
      setVisible((previous) =>
        ensureAtLeastOneVisible({
          ...previous,
          [key]: false,
        })
      );
    },
    [ensureAtLeastOneVisible]
  );

  const toggleBlock = (key: ChannelKey) => {
    setVisible((previous) =>
      ensureAtLeastOneVisible({
        ...previous,
        [key]: !previous[key],
      })
    );
  };

  const restore = React.useCallback((key: ChannelKey) => {
    setVisible((previous) => ({
      ...previous,
      [key]: true,
    }));
  }, []);

  const hiddenBlocks = React.useMemo(
    () => CHANNELS.filter((c) => !visible[c.key]),
    [visible]
  );

  const closeLayoutOnOutside = React.useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      if (target.closest?.("[data-layout-dropdown]")) {
        return;
      }

      setIsLayoutOpen(false);
    },
    []
  );

  React.useEffect(() => {
    if (!isLayoutOpen) return;

    window.addEventListener("mousedown", closeLayoutOnOutside);

    return () => {
      window.removeEventListener("mousedown", closeLayoutOnOutside);
    };
  }, [isLayoutOpen, closeLayoutOnOutside]);

  const rows: ChannelRow[] = React.useMemo(
    () =>
      CHANNELS.map((def) => ({
        key: def.key,
        title: def.title,
        subtitle: def.subtitle,
        visual: CHANNEL_VISUAL[def.key],
        state: calculos[def.key],
        preco: precos[def.key],
        refs: {
          current: channelRefsMap[def.key],
        } as React.MutableRefObject<HTMLInputElement[]>,
      })),
    [calculos, precos, channelRefsMap]
  );

  const visibleRows = React.useMemo(
    () => rows.filter((row) => visible[row.key]),
    [rows, visible]
  );

  const totalFields = fields.length;

  const handleChange = React.useCallback(
    (row: ChannelRow, field: keyof Calculo, internalValue: string) => {
      const def = getChannelDef(row.key);

      if (field === "embalagem") {
        if (def.sharesEmbalagem) {
          handleEmbalagemChangeShared(internalValue);
        } else {
          handleEmbalagemChangeChannel(row.key, internalValue);
        }

        return;
      }

      if (row.key === "loja" && field === "desconto") {
        CHANNELS.forEach((c) => {
          if (getChannelDef(c.key).hasBrandOverrides) {
            brandOverrides[c.key].setEdited("desconto", true);
          }
        });
        syncDescontoFromLoja(internalValue);
        return;
      }

      if (
        def.hasBrandOverrides &&
        (field === "margem" || field === "marketing" || field === "desconto")
      ) {
        brandOverrides[row.key].setEdited(field, true);
      }

      if (field === "imposto") {
        setManualFlag(row.key, "imposto", true);
      }

      if (def.allowManualComissaoFrete && field === "comissao") {
        setManualFlag(row.key, "comissao", true);
      }

      if (def.allowManualComissaoFrete && field === "frete") {
        setManualFlag(row.key, "frete", true);
      }

      setCalculo(row.key, (previous) => ({
        ...previous,
        [field]: internalValue,
      }));
    },
    [
      handleEmbalagemChangeShared,
      handleEmbalagemChangeChannel,
      syncDescontoFromLoja,
      brandOverrides,
      setManualFlag,
      setCalculo,
    ]
  );

  const handleBlur = React.useCallback(
    (row: ChannelRow, field: keyof Calculo, internalValue: string) => {
      const def = getChannelDef(row.key);

      if (field === "embalagem") {
        if (def.sharesEmbalagem) {
          handleEmbalagemBlurShared(internalValue);
        } else {
          handleEmbalagemBlurChannel(row.key, internalValue);
        }

        return;
      }

      if (row.key === "loja" && field === "desconto") {
        if (isEmpty(internalValue)) {
          CHANNELS.forEach((c) => {
            if (getChannelDef(c.key).hasBrandOverrides) {
              brandOverrides[c.key].setEdited("desconto", false);
            }
          });
        }
        syncDescontoFromLoja(internalValue);
        return;
      }

      if (
        def.hasBrandOverrides &&
        (field === "margem" || field === "marketing" || field === "desconto") &&
        isEmpty(internalValue)
      ) {
        brandOverrides[row.key].setEdited(field, false);
      }

      if (field === "imposto" && isEmpty(internalValue)) {
        setManualFlag(row.key, "imposto", false);
      }

      if (
        def.allowManualComissaoFrete &&
        field === "comissao" &&
        isEmpty(internalValue)
      ) {
        setManualFlag(row.key, "comissao", false);
      }

      if (
        def.allowManualComissaoFrete &&
        field === "frete" &&
        isEmpty(internalValue)
      ) {
        setManualFlag(row.key, "frete", false);
      }

      setCalculo(row.key, (previous) => ({
        ...previous,
        [field]: internalValue,
      }));
    },
    [
      handleEmbalagemBlurShared,
      handleEmbalagemBlurChannel,
      syncDescontoFromLoja,
      brandOverrides,
      setManualFlag,
      setCalculo,
    ]
  );

  const formatCopyValue = React.useCallback((value: number) => {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const handleCopyPrice = React.useCallback(
    async (row: ChannelRow) => {
      const value = formatCopyValue(row.preco);

      try {
        await navigator.clipboard.writeText(value);

        setCopiedKey(row.key);

        setTimeout(() => {
          setCopiedKey(null);
        }, 1200);
      } catch {
        const textarea = document.createElement("textarea");

        textarea.value = value;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setCopiedKey(row.key);

        setTimeout(() => {
          setCopiedKey(null);
        }, 1200);
      }
    },
    [formatCopyValue]
  );

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section
        data-layout-dropdown
        data-empresa-dropdown
        className="relative min-w-0 rounded-none border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
      >
        {/* CABEÇALHO DA SEÇÃO */}
        <header className="relative mb-6 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-none px-2 font-mono text-xs font-semibold tabular-nums text-white"
              style={{ backgroundColor: ACCENT }}
            >
              03
            </span>

            <h2 className="text-base font-semibold tracking-tight text-neutral-900">
              Preço de Venda por Canal
            </h2>
          </div>

          <div
            className={[
              "pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-none border px-3 py-1 sm:flex",
              empresa === "sobaquetas"
                ? "border-orange-200 bg-orange-50"
                : "border-sky-200 bg-sky-50",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                empresa === "sobaquetas" ? "bg-orange-500" : "bg-[#1a8ceb]",
              ].join(" ")}
            />

            <span
              className={[
                "text-[11px] font-semibold uppercase tracking-[0.12em]",
                empresa === "sobaquetas" ? "text-orange-600" : "text-[#1a8ceb]",
              ].join(" ")}
            >
              {empresa === "pikot" ? "Pikot Shop" : "Sóbaquetas"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative mr-1" data-empresa-dropdown>
              <button
                type="button"
                onClick={() => setIsEmpresaOpen((current) => !current)}
                className={[
                  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-none transition-colors hover:bg-neutral-100",
                  empresaColorClass,
                ].join(" ")}
                title={empresa === "pikot" ? "Pikot Shop" : "Sóbaquetas"}
                aria-label="Selecionar loja / regras de taxas"
                aria-expanded={isEmpresaOpen}
              >
                <Storefront className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isEmpresaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-11 z-50 w-56 rounded-none border border-neutral-200 bg-white p-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectEmpresa("pikot")}
                      className={[
                        "relative flex w-full cursor-pointer items-center justify-between rounded-none px-3 py-2 text-sm transition-colors hover:bg-neutral-100",
                        empresa === "pikot"
                          ? "font-semibold text-[#1a8ceb]"
                          : "text-neutral-600",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        {empresa === "pikot" && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#1a8ceb]" />
                        )}
                        Pikot Shop
                      </span>

                      {empresa === "pikot" && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectEmpresa("sobaquetas")}
                      className={[
                        "relative flex w-full cursor-pointer items-center justify-between rounded-none px-3 py-2 text-sm transition-colors hover:bg-neutral-100",
                        empresa === "sobaquetas"
                          ? "font-semibold text-orange-600"
                          : "text-neutral-600",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        {empresa === "sobaquetas" && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-orange-500" />
                        )}
                        Sóbaquetas
                      </span>

                      {empresa === "sobaquetas" && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <div className="mt-1 border-t border-neutral-100 px-3 py-2 text-[11px] leading-snug text-neutral-500">
                      Os impostos e comissões variam de acordo com a loja selecionada.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ClearAndDownloadActions
              handleDownload={handleDownload}
              handleClearAll={handleClearAll}
              isClearing={isClearing}
              clicks={clicks}
              onToggleLayout={() => setIsLayoutOpen((current) => !current)}
            />
          </div>
        </header>

        {/* AJUSTE DE LAYOUT */}
        <AnimatePresence>
          {isLayoutOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute right-5 top-16 z-50 w-full max-w-[280px] rounded-none border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-xs font-semibold text-neutral-900">
                  Ajustar layout
                </div>

                <button
                  type="button"
                  onClick={() => setIsLayoutOpen(false)}
                  className="cursor-pointer rounded-none p-1 transition-colors hover:bg-neutral-100"
                  title="Fechar ajuste de layout"
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {CHANNELS.map((def) => {
                  const checked = visible[def.key];
                  const visual = CHANNEL_VISUAL[def.key];

                  return (
                    <button
                      key={def.key}
                      type="button"
                      onClick={() => toggleBlock(def.key)}
                      className="flex h-10 cursor-pointer items-center justify-between rounded-none px-2.5 transition-colors hover:bg-neutral-100"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${visual.dotClassName}`}
                        />

                        <span className="truncate text-xs font-medium text-neutral-900">
                          {def.title}
                        </span>

                        <span className="shrink-0 text-[10px] text-neutral-500">
                          ({visual.shortLabel})
                        </span>
                      </div>

                      <div
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-none border",
                          checked
                            ? "border-neutral-900 bg-neutral-900"
                            : "border-neutral-300 bg-white",
                        ].join(" ")}
                      >
                        {checked && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setVisible(defaultVisible)}
                className="mt-2 h-9 w-full cursor-pointer rounded-none border border-neutral-200 bg-white text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900"
              >
                Mostrar todos
              </button>

              <div className="mt-2 px-1 text-[11px] text-neutral-500">
                Suas escolhas ficam salvas automaticamente.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABELA — rolagem horizontal só dentro do wrapper */}
        <div className="-mx-1 overflow-x-auto rounded-none border border-neutral-200">
          <div className="min-w-[1080px] lg:min-w-[1180px]">
            {/* Cabeçalho */}
            <div
              className={`hidden ${GRID_DESKTOP} border-b border-neutral-200 bg-neutral-50 lg:grid`}
            >
              <div className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Canal
              </div>

              {fields.map((field) => (
                <div
                  key={field.key}
                  className="px-2 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500"
                >
                  {field.label}

                  <div className="mt-0.5 text-[10px] font-normal normal-case tracking-normal text-neutral-400">
                    {field.unit}
                  </div>
                </div>
              ))}

              <div className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Preço de Venda

                <div className="mt-0.5 text-[10px] font-normal normal-case tracking-normal text-neutral-400">
                  Calculado (R$)
                </div>
              </div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-neutral-100">
              {visibleRows.map((row) => (
                <div
                  key={row.key}
                  className={`group/row grid grid-cols-1 gap-3 bg-white p-4 transition-colors hover:bg-neutral-50/60 ${GRID_DESKTOP} lg:items-center lg:gap-0 lg:p-0`}
                >
                  <div className="flex items-center justify-between gap-3 lg:px-5 lg:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <ChannelIcon className={row.visual.iconClassName}>
                        {row.visual.icon}
                      </ChannelIcon>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-neutral-900">
                          {row.title}
                        </div>

                        <div className="mt-0.5 truncate text-xs text-neutral-500">
                          {row.subtitle}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => hideBlock(row.key)}
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-none text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-900 group-hover/row:opacity-100"
                      title={`Ocultar ${row.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={`${row.key}-${field.key}`}
                      className="lg:px-2 lg:py-5"
                    >
                      <div className="mb-1 text-xs font-medium text-neutral-500 lg:hidden">
                        {field.label}
                      </div>

                      <FieldInput
                        value={row.state[field.key]}
                        fieldKey={field.key}
                        editingKey={`${row.key}-${field.key}`}
                        suffix={field.suffix}
                        inputRef={(element) => {
                          row.refs.current[index] = element!;
                        }}
                        navIndex={index}
                        totalFields={totalFields}
                        refs={row.refs}
                        onChange={(key, value) => handleChange(row, key, value)}
                        onBlur={(key, value) => handleBlur(row, key, value)}
                        isEditing={isEditing}
                        setEditing={setEditing}
                        toDisplay={toDisplay}
                        toInternal={toInternal}
                        handleLinearNav={handleLinearNav}
                      />
                    </div>
                  ))}

                  <div className="group/price flex items-center justify-between border-t border-neutral-100 pt-3 lg:border-t-0 lg:px-4 lg:py-5">
                    <span className="text-xs font-medium text-neutral-500 lg:hidden">
                      Preço de Venda
                    </span>

                    <div className="flex w-full items-center justify-end gap-2">
                      <span
                        className={`text-xl font-bold tabular-nums tracking-tight ${row.visual.priceClassName}`}
                      >
                        R${" "}
                        <AnimatedNumber value={Number(row.preco || 0)} />
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyPrice(row)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-none text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-900 group-hover/price:opacity-100"
                        title="Copiar preço"
                      >
                        {copiedKey === row.key ? (
                          <Checks className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OCULTOS */}
        <AnimatePresence>
          {hiddenBlocks.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-none border border-neutral-200 bg-neutral-50 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Ocultos</span>

                {hiddenBlocks.map((def) => (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => restore(def.key)}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-none border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                    title={`Restaurar ${def.title}`}
                  >
                    <ArrowCircleUp className="h-4 w-4" />

                    {CHANNEL_VISUAL[def.key].shortLabel}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setVisible(defaultVisible)}
                className="h-8 cursor-pointer rounded-none px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900"
              >
                Restaurar todos
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AcrescimosSection
        acrescimos={acrescimos}
        setAcrescimos={setAcrescimos}
        isEditing={isEditing}
        setEditing={setEditing}
        toDisplay={toDisplay}
        toInternal={toInternal}
        handleLinearNav={handleLinearNav}
        acrescimosRefs={acrescimosRefs}
        statusAcrescimo={statusAcrescimo}
      />
    </div>
  );
};
