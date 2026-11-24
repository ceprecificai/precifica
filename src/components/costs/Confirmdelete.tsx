"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SpinnerGap, Warning, ClipboardText } from "@phosphor-icons/react";

type Severity = "danger" | "warning";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
  title?: string;
  itemLabel?: string;
  itemLabelPlural?: string;
  items?: string[];
  severity?: Severity;
  requireExtraConfirmThreshold?: number;
  errorMessage?: string | null;
};

// Tokens do globals.css (--destructive / --warning)
const SEVERITY_COLOR: Record<Severity, string> = {
  danger: "var(--destructive)",
  warning: "var(--warning)",
};

/** Componente cabeçalho das seções (idêntico ao ConfirmImportModal) */
function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center border border-neutral-200 bg-white text-neutral-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-900">{title}</p>
        <p className="text-[10px] text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

/** Caixa de alerta (mesmo padrão do ConfirmImportModal) */
function AlertBox({
  color,
  title,
  message,
}: {
  color: string;
  title: string;
  message: string;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="border border-neutral-200 bg-white p-3"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div className="flex gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center border border-neutral-200 bg-white"
          style={{ color }}
        >
          <Warning className="h-3.5 w-3.5" />
        </div>
        <div>
          <strong className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color }}>
            {title}
          </strong>
          <p className="mt-1.5 text-[11px] text-neutral-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmDelete({
  open,
  onOpenChange,
  count,
  onConfirm,
  loading,
  title = "Excluir Produto(s)",
  itemLabel = "produto selecionado",
  itemLabelPlural = "produtos selecionados",
  items,
  severity = "danger",
  requireExtraConfirmThreshold = 20,
  errorMessage,
}: Props) {
  const ACCENT = SEVERITY_COLOR[severity];

  const needsExtraConfirm = count >= requireExtraConfirmThreshold;
  const [extraConfirmed, setExtraConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isBusy = loading || submitting;

  useEffect(() => {
    if (!open) {
      setExtraConfirmed(false);
      setSubmitting(false);
    }
  }, [open]);

  const confirmDisabled = isBusy || (needsExtraConfirm && !extraConfirmed);

  const handleConfirm = async () => {
    if (confirmDisabled) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  const previewItems = items?.slice(0, 3);
  const remainingCount = items ? Math.max(items.length - 3, 0) : 0;
  const targetLabel = `${count} ${count === 1 ? itemLabel : itemLabelPlural}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isBusy) return;
        onOpenChange(v);
      }}
    >
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        onEscapeKeyDown={(e) => isBusy && e.preventDefault()}
        onInteractOutside={(e) => isBusy && e.preventDefault()}
        data-testid="confirm-delete-dialog"
        className="bg-white border border-neutral-200 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] rounded-none w-[calc(100vw-16px)] max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] sm:max-w-md sm:w-[90%] flex flex-col overflow-hidden p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] [&>button]:hidden"
      >
        {/* Cabeçalho */}
        <DialogHeader className="shrink-0 border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Warning className="h-4 w-4" style={{ color: ACCENT }} />
            <DialogTitle className="text-base font-semibold text-neutral-900 sm:text-lg">{title}</DialogTitle>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">{targetLabel}</p>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 mt-4">
          {/* Resumo */}
          <div>
            <SectionHeader
              icon={<ClipboardText className="h-3.5 w-3.5" />}
              title="Resumo da exclusão"
              description="Confira os itens antes de confirmar."
            />
            <div className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2">
              <span className="text-[11px] text-neutral-500">Deseja excluir</span>
              <span
                className="border px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  borderColor: `color-mix(in srgb, ${ACCENT} 25%, transparent)`,
                  color: ACCENT,
                  backgroundColor: `color-mix(in srgb, ${ACCENT} 8%, transparent)`,
                }}
              >
                {count} {count === 1 ? itemLabel : itemLabelPlural}
              </span>
            </div>
          </div>

          {/* Preview de itens */}
          {previewItems && previewItems.length > 0 && (
            <>
              <div className="my-5 h-px bg-neutral-200" />
              <div>
                <SectionHeader
                  icon={<ClipboardText className="h-3.5 w-3.5" />}
                  title="Itens selecionados"
                  description="Amostra dos itens que serão excluídos"
                />
                <div className="border border-neutral-200 bg-white p-2">
                  <ul className="space-y-1 text-[11px] text-neutral-700">
                    {previewItems.map((name, i) => (
                      <li key={i} className="truncate">• {name}</li>
                    ))}
                    {remainingCount > 0 && (
                      <li className="text-neutral-500">
                        e mais {remainingCount} {remainingCount === 1 ? "item" : "itens"}...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Alerta de permanência */}
          <div className="my-5 h-px bg-neutral-200" />
          <AlertBox
            color={ACCENT}
            title="Atenção"
            message="Esta ação é permanente e não poderá ser desfeita."
          />

          {/* Confirmação extra */}
          {needsExtraConfirm && (
            <>
              <div className="my-5 h-px bg-neutral-200" />
              <label className="flex items-start gap-2 text-[13px] text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraConfirmed}
                  onChange={(e) => setExtraConfirmed(e.target.checked)}
                  disabled={isBusy}
                  className="mt-0.5 h-4 w-4 accent-[var(--destructive)]"
                />
                Confirmo que quero excluir esses {count} itens em massa.
              </label>
            </>
          )}

          {/* Erro */}
          {errorMessage && (
            <>
              <div className="my-5 h-px bg-neutral-200" />
              <AlertBox color="var(--destructive)" title="Erro" message={errorMessage} />
            </>
          )}
        </div>

        {/* Botões */}
        <DialogFooter className="mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            className="flex h-11 w-full items-center justify-center rounded-none border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-auto sm:px-6"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={(e) => {
              e.stopPropagation();
              void handleConfirm();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-none border text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 sm:h-10 sm:w-auto sm:px-6 cursor-pointer"
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            {isBusy ? (
              <>
                <SpinnerGap className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
