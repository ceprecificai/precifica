"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  DownloadSimple,
  FileXls,
  FilePlus,
  CaretDown,
  CaretUp,
  UploadSimple,
  Plus,
  Power,
  PowerIcon,
} from "@phosphor-icons/react";
import { unlockAudio } from "@/utils/sound";
import TableInfoCard from "@/components/ui/Tableinfocard";

type Props = {
  exporting: boolean;
  handleExport: () => void | Promise<void>;
  onOpenCreate: () => void | Promise<void>;
  onExportModeloInclusao: () => void | Promise<void>;
  onExportModeloAlteracao: () => void | Promise<void>;
  onExportRenomeacaoCodigos: () => void | Promise<void>;
  onImportInclusao: (file: File) => void | Promise<void>;
  onImportAlteracao: (file: File) => void | Promise<void>;
  onImportRenomeacaoCodigos: (file: File) => void | Promise<void>;
  totalCount: number;
  selectedCount?: number;
  togglingActive?: boolean;
  onDeactivateSelected?: () => void | Promise<void>;
  onReactivateSelected?: () => void | Promise<void>;
};

function ActionTextButton({
  icon,
  label,
  onClick,
  disabled = false,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  primary?: boolean;
}) {
  const handleClick = () => void onClick();

  if (primary) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
        className="
          flex h-11 w-full items-center justify-start gap-2
          border border-neutral-900
          bg-neutral-900
          px-3
          text-sm font-semibold text-white
          transition-colors duration-150
          hover:border-neutral-700 hover:bg-neutral-700
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
          active:scale-[0.99]
          enabled:cursor-pointer disabled:opacity-40
        "
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      className="
        group flex w-full items-start gap-2.5
        border border-transparent
        px-2.5 py-2.5
        text-left text-[13px] text-neutral-600
        transition-colors duration-150
        hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
        active:scale-[0.99]
        disabled:cursor-not-allowed disabled:opacity-40
      "
    >
      <span className="mt-0.5 shrink-0 text-neutral-500 group-hover:text-neutral-900">
        {icon}
      </span>
      <span className="leading-5">{label}</span>
    </button>
  );
}

const STORAGE_KEY = "cost-actions-show-more-options";

export default function CostActions({
  exporting,
  handleExport,
  onOpenCreate,
  onExportModeloInclusao,
  onExportModeloAlteracao,
  onExportRenomeacaoCodigos,
  onImportInclusao,
  onImportAlteracao,
  onImportRenomeacaoCodigos,
  totalCount,
  selectedCount = 0,
  togglingActive = false,
  onDeactivateSelected,
  onReactivateSelected,
}: Props) {
  const inputInclusaoRef = useRef<HTMLInputElement | null>(null);
  const inputAlteracaoRef = useRef<HTMLInputElement | null>(null);
  const inputRenomeacaoCodigosRef = useRef<HTMLInputElement | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setShowMoreOptions(saved !== null ? saved === "true" : true);
    } catch {
      setShowMoreOptions(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(showMoreOptions));
    } catch {}
  }, [showMoreOptions, hydrated]);

  const handleFileChange =
    (callback: (file: File) => void | Promise<void>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void callback(file);
      event.target.value = "";
    };

  const triggerFileInput = async (ref: React.RefObject<HTMLInputElement | null>) => {
    await unlockAudio();
    ref.current?.click();
  };

  if (!hydrated) return null;

  const hasSelection = selectedCount > 0;
  const showStatusActions = Boolean(onDeactivateSelected || onReactivateSelected);

  return (
    <div className="w-full bg-transparent px-3 py-2 sm:px-4">
      <input type="file" ref={inputInclusaoRef} className="hidden" accept=".xlsx,.csv" aria-label="Importar dados de inclusão" onChange={handleFileChange(onImportInclusao)} />
      <input type="file" ref={inputAlteracaoRef} className="hidden" accept=".xlsx,.csv" aria-label="Importar dados de alteração" onChange={handleFileChange(onImportAlteracao)} />
      <input type="file" ref={inputRenomeacaoCodigosRef} className="hidden" accept=".xlsx,.csv" aria-label="Importar renomeação de códigos" onChange={handleFileChange(onImportRenomeacaoCodigos)} />

      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="space-y-1.5">
          <ActionTextButton icon={<Plus className="h-4 w-4" />} label="Novo Custo" onClick={onOpenCreate} primary />
          <ActionTextButton icon={<DownloadSimple className="h-4 w-4" />} label="Exportar dados para planilha" onClick={handleExport} disabled={exporting} />

          {showStatusActions && (
            <div className="mt-3 border-t border-neutral-200 pt-3">
              <div className="mb-1 px-2.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Status dos selecionados{hasSelection ? ` (${selectedCount})` : ""}
              </div>

              <div className="space-y-0.5">
                {onDeactivateSelected && (
                  <ActionTextButton
                    icon={<PowerIcon className="h-4 w-4" />}
                    label={togglingActive ? "Desativando..." : "Desativar selecionados"}
                    onClick={onDeactivateSelected}
                    disabled={!hasSelection || togglingActive || exporting}
                  />
                )}
                {onReactivateSelected && (
                  <ActionTextButton
                    icon={<Power className="h-4 w-4" />}
                    label={togglingActive ? "Reativando..." : "Reativar selecionados"}
                    onClick={onReactivateSelected}
                    disabled={!hasSelection || togglingActive || exporting}
                  />
                )}
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-neutral-200 pt-3">
            <button
              type="button"
              onClick={() => setShowMoreOptions((prev) => !prev)}
              aria-expanded={showMoreOptions}
              aria-label={showMoreOptions ? "Ocultar mais opções" : "Mostrar mais opções"}
              className="
                mb-2 flex w-full cursor-pointer items-center justify-between
                px-2.5 py-1
                text-[11px] font-semibold uppercase tracking-[0.15em]
                text-neutral-500
                transition-colors
                hover:text-neutral-900
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
              "
            >
              Mais opções
              {showMoreOptions ? <CaretUp className="h-3.5 w-3.5" /> : <CaretDown className="h-3.5 w-3.5" />}
            </button>

            {showMoreOptions && (
              <div className="space-y-0.5">
                <div className="mb-1 px-2.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Planilhas
                </div>

                <ActionTextButton icon={<FilePlus className="h-4 w-4" />} label="Baixar planilha modelo de inclusão" onClick={onExportModeloInclusao} />
                <ActionTextButton icon={<FileXls className="h-4 w-4" />} label="Baixar planilha modelo de alteração" onClick={onExportModeloAlteracao} />
                <ActionTextButton icon={<FileXls className="h-4 w-4" />} label="Exportar planilha para renomear códigos" onClick={onExportRenomeacaoCodigos} disabled={exporting} />

                <div className="my-1 border-t border-neutral-200" />

                <ActionTextButton icon={<UploadSimple className="h-4 w-4" />} label="Importar dados de inclusão" onClick={() => triggerFileInput(inputInclusaoRef)} />
                <ActionTextButton icon={<UploadSimple className="h-4 w-4" />} label="Importar dados de alteração" onClick={() => triggerFileInput(inputAlteracaoRef)} />
                <ActionTextButton icon={<UploadSimple className="h-4 w-4" />} label="Importar renomeação de códigos" onClick={() => triggerFileInput(inputRenomeacaoCodigosRef)} />
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-neutral-200 pt-3">
            <TableInfoCard label="Quantidade de Produtos" value={totalCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
