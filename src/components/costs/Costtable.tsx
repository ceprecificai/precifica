"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  PencilSimple as EditIcon,
  SpinnerGap,
  Trash as TrashIcon,
} from "@phosphor-icons/react";
import { Custo } from "@/components/costtable/types";
import { formatBR } from "@/components/costtable/utils";

type Props = {
  rows: Custo[];
  loading: boolean;
  selectedRows: Custo[];
  setSelectedRows: React.Dispatch<React.SetStateAction<Custo[]>>;
  copiedId: string | null;
  handleCopy: (text: string, key: string) => void;
  openEdit: (row: Custo) => void;
  openDeleteOne: (row: Custo) => void;
  openCostEditor: (row: Custo, e: React.MouseEvent) => void;
};

const getCostKey = (row: any) => {
  return String(row?.["Código"] ?? row?.codigo ?? row?.id ?? "").trim();
};

const LINK_CLASS =
  "text-neutral-900 font-medium underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900";

const CHECKBOX_CLASS =
  "h-3.5 w-3.5 cursor-pointer accent-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900";

function IconBtn({
  onClick,
  variant,
  children,
}: {
  onClick: () => void;
  variant: "edit" | "delete";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex h-8 w-8 items-center justify-center
        border border-transparent
        text-neutral-400
        transition-colors
        hover:border-neutral-200 hover:bg-neutral-100
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
        ${
          variant === "edit"
            ? "hover:text-neutral-900"
            : "hover:text-[var(--destructive)]"
        }
      `}
    >
      {children}
    </button>
  );
}

function CopyBtn({
  value,
  copyKey,
  copiedId,
  handleCopy,
}: {
  value: string;
  copyKey: string;
  copiedId: string | null;
  handleCopy: (text: string, key: string) => void;
}) {
  if (!value) return null;

  return (
    <button
      type="button"
      onClick={() => handleCopy(value, copyKey)}
      className="shrink-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
      aria-label="Copiar"
    >
      <Copy
        weight="regular"
        className={`h-3 w-3 transition-colors ${
          copiedId === copyKey
            ? "text-emerald-600"
            : "text-neutral-400 hover:text-neutral-900"
        }`}
      />
    </button>
  );
}

export default function CostDataTable({
  rows,
  loading,
  selectedRows,
  setSelectedRows,
  copiedId,
  handleCopy,
  openEdit,
  openDeleteOne,
  openCostEditor,
}: Props) {
  const isRowSelected = (row: Custo) => {
    const rowKey = getCostKey(row);
    return selectedRows.some((selected) => getCostKey(selected) === rowKey);
  };

  const toggleSelectedRow = (row: Custo, checked: boolean) => {
    const rowKey = getCostKey(row);

    if (!rowKey) return;

    setSelectedRows((prev) => {
      if (checked) {
        const alreadySelected = prev.some(
          (selected) => getCostKey(selected) === rowKey
        );

        if (alreadySelected) return prev;

        return [...prev, row];
      }

      return prev.filter((selected) => getCostKey(selected) !== rowKey);
    });
  };

  return (
    <>
      {/* MOBILE */}
      <div className="space-y-2 px-2 pb-4 md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <SpinnerGap
              weight="regular"
              className="h-6 w-6 animate-spin text-neutral-500"
            />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">
            Nenhum registro encontrado
          </div>
        ) : (
          rows.map((c, i) => {
            const isSelected = isRowSelected(c);

            return (
              <div
                key={`${c["Código"]}-${i}`}
                className={`border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      {c["Marca"] || "-"}
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-neutral-900">
                      <span className="truncate">{c["Produto"] || "-"}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleSelectedRow(c, e.target.checked)}
                    className={`mt-1 shrink-0 ${CHECKBOX_CLASS}`}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-neutral-500">
                  <div className="min-w-0 rounded-none border border-neutral-200 bg-neutral-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Código
                    </div>
                    <div className="mt-1 truncate font-medium text-neutral-900">
                      {c["Código"] || "-"}
                    </div>
                  </div>

                  <div className="min-w-0 rounded-none border border-neutral-200 bg-neutral-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      NCM
                    </div>
                    <div className="mt-1 truncate font-medium text-neutral-900">
                      {c["NCM"] || "-"}
                    </div>
                  </div>

                  <div className="min-w-0 rounded-none border border-neutral-200 bg-neutral-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Custo Atual
                    </div>
                    <button
                      type="button"
                      onClick={(e) => openCostEditor(c, e)}
                      className={`mt-1 block truncate ${LINK_CLASS}`}
                    >
                      R$ {formatBR(c["Custo Atual"])}
                    </button>
                  </div>

                  <div className="min-w-0 rounded-none border border-neutral-200 bg-neutral-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Custo Antigo
                    </div>
                    <div className="mt-1 truncate font-medium text-neutral-900">
                      R$ {formatBR(c["Custo Antigo"])}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-1">
                  <IconBtn variant="edit" onClick={() => openEdit(c)}>
                    <EditIcon weight="regular" className="h-3.5 w-3.5" />
                  </IconBtn>

                  <IconBtn variant="delete" onClick={() => openDeleteOne(c)}>
                    <TrashIcon weight="regular" className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto lg:overflow-visible">
          <Table className="min-w-[1188px] table-fixed">
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex items-center justify-center py-16">
                      <SpinnerGap
                        weight="regular"
                        className="h-6 w-6 animate-spin text-neutral-500"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-neutral-500"
                  >
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c, i) => {
                  const isSelected = isRowSelected(c);

                  return (
                    <TableRow
                      key={`${c["Código"]}-${i}`}
                      className={`group border-b border-neutral-100 transition-colors ${
                        isSelected
                          ? "bg-neutral-50 hover:bg-neutral-100"
                          : "hover:bg-neutral-50/70"
                      }`}
                    >
                      <TableCell className="w-[48px] text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectedRow(c, e.target.checked)}
                          className={CHECKBOX_CLASS}
                        />
                      </TableCell>

                      <TableCell className="w-[140px] text-left font-mono text-[13px] text-neutral-900">
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <span className="truncate font-medium">{c["Código"]}</span>
                          <CopyBtn
                            value={c["Código"] || ""}
                            copyKey={`codigo-${i}`}
                            copiedId={copiedId}
                            handleCopy={handleCopy}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="w-[160px] text-left text-[13px] text-neutral-600">
                        <span className="truncate">{c["Marca"]}</span>
                      </TableCell>

                      <TableCell className="min-w-[280px] text-left text-[13px] text-neutral-700">
                        <div className="inline-flex max-w-full min-w-0 items-center gap-1.5">
                          <span className="truncate">{c["Produto"]}</span>
                          <CopyBtn
                            value={c["Produto"] || ""}
                            copyKey={`produto-${i}`}
                            copiedId={copiedId}
                            handleCopy={handleCopy}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="w-[150px] text-right font-mono text-[13px] tabular-nums">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => openCostEditor(c, e)}
                            className={LINK_CLASS}
                          >
                            R$ {formatBR(c["Custo Atual"])}
                          </button>

                          <CopyBtn
                            value={`R$ ${formatBR(c["Custo Atual"])}`}
                            copyKey={`custo-${i}`}
                            copiedId={copiedId}
                            handleCopy={handleCopy}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="w-[150px] text-right font-mono text-[13px] tabular-nums text-neutral-500">
                        R$ {formatBR(c["Custo Antigo"])}
                      </TableCell>

                      <TableCell className="w-[140px] text-left text-[13px] text-neutral-600">
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <span className="truncate">{c["NCM"]}</span>
                          <CopyBtn
                            value={c["NCM"] || ""}
                            copyKey={`ncm-${i}`}
                            copiedId={copiedId}
                            handleCopy={handleCopy}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="w-[100px]">
                        <div className="flex justify-center gap-1">
                          <IconBtn variant="edit" onClick={() => openEdit(c)}>
                            <EditIcon weight="regular" className="h-3.5 w-3.5" />
                          </IconBtn>

                          <IconBtn
                            variant="delete"
                            onClick={() => openDeleteOne(c)}
                          >
                            <TrashIcon weight="regular" className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
