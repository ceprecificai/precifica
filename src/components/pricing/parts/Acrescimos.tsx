import React from "react";
import { Copy, Checks, Handshake } from "@phosphor-icons/react";
import { AnimatedNumber } from "./Animatednumber";

type AcrescimosSectionProps = {
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
  statusAcrescimo: any;
};

type CardVariant = "classico" | "premium" | "magalu";
type CardTone = "yellow" | "blue";

type AcrescimoCardProps = {
  variant: CardVariant;
  title: string;
  percent: number;
  difference: number;
  copied: boolean;
  onCopy: () => void;
};

/* Cores por canal — classes completas para o Tailwind gerar o CSS */
const TONE_CLASSES: Record<
  CardTone,
  { border: string; iconBg: string; value: string }
> = {
  yellow: {
    border: "border-yellow-500/50",
    iconBg: "bg-yellow-500",
    value: "text-yellow-700",
  },
  blue: {
    border: "border-[#1a8ceb]/50",
    iconBg: "bg-[#1a8ceb]",
    value: "text-[#1a8ceb]",
  },
};

const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";

const parseBR = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value).trim();

  if (!raw) return 0;

  if (raw.includes(",")) {
    return Number(raw.replace(/\./g, "").replace(",", ".")) || 0;
  }

  return Number(raw) || 0;
};

const getPercent = (price: number, base: number) => {
  if (!base || !price) return 0;

  return (price / base - 1) * 100;
};

const formatPercentForCopy = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0;

  return Math.abs(safeValue).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getTone = (variant: CardVariant): CardTone =>
  variant === "magalu" ? "blue" : "yellow";

const MagaluLogo = () => (
  <span className="select-none text-[10px] font-black leading-none tracking-tight text-white">
    Magalu
  </span>
);

const AcrescimoCard: React.FC<AcrescimoCardProps> = ({
  variant,
  title,
  percent,
  difference,
  copied,
  onCopy,
}) => {
  const tone = getTone(variant);
  const t = TONE_CLASSES[tone];

  return (
    <div
      className={`group relative rounded-none border bg-white p-4 transition-colors hover:bg-neutral-50/60 ${t.border}`}
    >
      <button
        type="button"
        onClick={onCopy}
        title="Copiar acréscimo"
        aria-label={`Copiar acréscimo ${title}`}
        className={`absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-none transition-all hover:bg-neutral-100 ${
          copied
            ? "text-emerald-600"
            : "text-neutral-400 opacity-0 hover:text-neutral-900 group-hover:opacity-100"
        }`}
      >
        {copied ? (
          <Checks className="h-3.5 w-3.5" weight="bold" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="flex items-center gap-3 pr-8">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none shadow-sm ${t.iconBg}`}
        >
          {variant === "magalu" ? (
            <MagaluLogo />
          ) : (
            <Handshake className="h-5 w-5 text-white" weight="fill" />
          )}
        </div>

        <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-neutral-900">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
        <div className="grid grid-cols-[84px_1fr] items-baseline gap-3">
          <span className={LABEL_CLASS}>Acréscimo</span>

          <span
            className={`text-2xl font-bold tabular-nums tracking-tight ${t.value}`}
          >
            {percent > 0 ? "+" : ""}
            <AnimatedNumber value={Number(percent || 0)} />%
          </span>
        </div>

        <div className="grid grid-cols-[84px_1fr] items-baseline gap-3">
          <span className={LABEL_CLASS}>Diferença</span>

          <span className={`text-lg font-bold tabular-nums ${t.value}`}>
            {difference < 0 ? "-" : ""}
            R$ <AnimatedNumber value={Math.abs(Number(difference || 0))} />
          </span>
        </div>
      </div>
    </div>
  );
};

export const AcrescimosSection: React.FC<AcrescimosSectionProps> = ({
  acrescimos,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<CardVariant | null>(null);

  const precoLoja = parseBR(acrescimos.precoLoja);

  const precoClassico = parseBR(acrescimos.precoMercadoLivreClassico);
  const freteClassico = parseBR(acrescimos.freteMercadoLivreClassico);
  const baseClassico = precoLoja + freteClassico;
  const acrescimoClassico = getPercent(precoClassico, baseClassico);
  const diferencaClassico = precoClassico - baseClassico;

  const precoPremium = parseBR(acrescimos.precoMercadoLivrePremium);
  const fretePremium = parseBR(acrescimos.freteMercadoLivrePremium);
  const basePremium = precoLoja + fretePremium;
  const acrescimoPremium = getPercent(precoPremium, basePremium);
  const diferencaPremium = precoPremium - basePremium;

  const precoMagalu = parseBR(acrescimos.precoMagalu);
  const acrescimoMagalu = getPercent(precoMagalu, precoLoja);
  const diferencaMagalu = precoMagalu - precoLoja;

  const copyCard = async (key: CardVariant, percent: number) => {
    const text = formatPercentForCopy(percent);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  return (
    <section className="min-w-0 rounded-none border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-none bg-neutral-900 px-2 font-mono text-xs font-semibold tabular-nums text-white">
            04
          </span>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900">
            Acréscimo sobre o Preço da Loja Própria
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AcrescimoCard
          variant="classico"
          title="Mercado Livre Clássico"
          percent={acrescimoClassico}
          difference={diferencaClassico}
          copied={copiedKey === "classico"}
          onCopy={() => copyCard("classico", acrescimoClassico)}
        />

        <AcrescimoCard
          variant="premium"
          title="Mercado Livre Premium"
          percent={acrescimoPremium}
          difference={diferencaPremium}
          copied={copiedKey === "premium"}
          onCopy={() => copyCard("premium", acrescimoPremium)}
        />

        <AcrescimoCard
          variant="magalu"
          title="Magalu"
          percent={acrescimoMagalu}
          difference={diferencaMagalu}
          copied={copiedKey === "magalu"}
          onCopy={() => copyCard("magalu", acrescimoMagalu)}
        />
      </div>
    </section>
  );
};
