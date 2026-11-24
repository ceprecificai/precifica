"use client";

import React from "react";

import { Controls } from "@/components/costs/Controls";
import NewCost from "@/components/costs/Newcost";
import ConfirmDelete from "@/components/costs/Confirmdelete";
import ConfirmImport from "@/components/costs/Confirmimport";
import CostFilters from "@/components/costs/Costfilters";
import CostActions from "@/components/costs/Costactions";
import CostAdjustmentsModal from "@/components/costs/Costadjustmentsmodal";
import CostLocation from "@/components/costs/Costlocation";
import CostTable from "@/components/costs/Costdatatable";
import { FloatingEditor } from "@/components/costs/Floatingeditor";
import ExportProgressToast from "@/components/costs/Exportprogresstoast";

import { useCosts } from "@/components/costs/hooks/usecosts";

import { Check as CheckIcon, X as XIcon, List as Menu, SlidersHorizontal } from "@phosphor-icons/react";

export default function Costs() {
  const {
    rows,
    totalItems,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    filters,
    setFilters,
    allBrands,
    selectedBrands,
    setSelectedBrands,
    applyingFilters,
    handleApplyFilters,
    handleClearFilters,
    appliedFilters,
    setAppliedFilters,

    handleSituacaoChange,

    ordem,
    handleOrdemChange,

    sortColumn,
    sortDirection,
    handleSortColumn,

    selectedRows,
    setSelectedRows,
    setSelectedRowsUnique,
    allSelected,
    handleToggleSelectAll,
    handleSelectAllFiltered,
    selectingAll,
    copiedId,
    handleCopy,

    openNew,
    setOpenNew,
    mode,
    form,
    setForm,
    openCreate,
    openEdit,
    saveForm,

    editing,
    setEditing,
    savingEdit,
    openCostEditor,
    confirmCostEdit,
    cancelCostEdit,

    openDelete,
    setOpenDelete,
    deleting,
    deleteSelected,

    togglingActive,
    restoring,
    handleDeactivateSelected,
    handleReactivateSelected,
    handleRestoreSelected,

    exporting,
    handleExport,
    handleExportModeloInclusao,
    handleExportModeloAlteracao,
    handleExportRenomeacaoCodigos,
    exportProgressOpen,
    setExportProgressOpen,
    exportProgress,
    exportProgressCount,
    cancelExportRef,

    openImport,
    setOpenImport,
    importCount,
    previewRows,
    importing,
    warnings,
    importTipo,
    handleImportInclusao,
    handleImportAlteracao,
    confirmImport,

    renamingCodes,
    openRenamePreview,
    setOpenRenamePreview,
    renameRows,
    setRenameRows,
    renameWarnings,
    setRenameWarnings,
    renameErrors,
    setRenameErrors,
    renameFileName,
    setRenameFileName,
    handleImportRenomeacaoCodigos,
    confirmRenomeacaoCodigos,

    openAdjustments,
    setOpenAdjustments,
    applyingAdjustments,
    handleApplyAdjustments,

    openFiltersMobile,
    setOpenFiltersMobile,
    openActionsMobile,
    setOpenActionsMobile,
  } = useCosts();

  const statusBusy = togglingActive || restoring;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 selection:bg-neutral-900/10">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Conteúdo principal */}
        <section className="min-w-0">
          {/* Cabeçalho: breadcrumb + mobile actions */}
          <div className="border-b border-neutral-200 bg-white px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between gap-2">
              <CostLocation path={["Dashboard", "Precificação", "Custos"]} />

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setOpenFiltersMobile(true)}
                  aria-label="Abrir filtros"
                  className="flex h-9 items-center gap-2 border border-neutral-200 bg-white px-3 text-xs font-medium uppercase tracking-wide text-neutral-700 transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-900" />
                  Filtros
                </button>

                <button
                  type="button"
                  onClick={() => setOpenActionsMobile(true)}
                  aria-label="Abrir ações"
                  className="flex h-9 items-center gap-2 border border-neutral-200 bg-white px-3 text-xs font-medium uppercase tracking-wide text-neutral-700 transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
                >
                  <Menu className="h-3.5 w-3.5 text-neutral-900" />
                  Ações
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 lg:px-6">
            {/* Filtros (desktop) */}
            <div className="hidden lg:block">
              <CostFilters
                idPrefix="desktop"
                filters={filters}
                setFilters={setFilters}
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isLoading={loading || applyingFilters}
              />
            </div>

            {/* Card unificado: header + tabela + controls */}
            <div className="mt-3 overflow-hidden border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:mt-0 lg:border-t-0">
              <CostTable
                rows={rows}
                loading={loading}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRowsUnique}
                copiedId={copiedId}
                handleCopy={handleCopy}
                openEdit={openEdit}
                openCostEditor={openCostEditor}
                openDeleteOne={(row) => {
                  setSelectedRows([row]);
                  setOpenDelete(true);
                }}
                allSelected={allSelected}
                situacao={appliedFilters.situacao}
                ordem={ordem}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSelectAll={handleToggleSelectAll}
                onOrdemChange={handleOrdemChange}
                onSituacaoChange={handleSituacaoChange}
                onSort={handleSortColumn}
                onDeleteSelected={() => setOpenDelete(true)}
                onOpenAdjustments={() => setOpenAdjustments(true)}
                onClearSelection={() => setSelectedRows([])}
                onSelectAllTable={handleSelectAllFiltered}
                selectingAll={selectingAll}
                togglingActive={statusBusy}
                onDeactivateSelected={handleDeactivateSelected}
                onRestoreSelected={handleRestoreSelected}
              />

              <div className="border-t border-neutral-200 pb-24 lg:pb-0">
                <Controls
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={(p) => setCurrentPage(p)}
                  onItemsPerPageChange={(v) => {
                    setItemsPerPage(v);
                    setCurrentPage(1);
                  }}
                  selectedCount={selectedRows.length}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar direita: Ações */}
        <aside className="relative hidden lg:block border-l border-neutral-200">
          <div className="fixed right-0 top-0 h-screen w-[280px] overflow-y-auto bg-neutral-100 pt-24">
            <div className="px-5 pb-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Ações
              </span>
            </div>

            <CostActions
              exporting={exporting || renamingCodes}
              handleExport={handleExport}
              onOpenCreate={openCreate}
              onExportModeloInclusao={handleExportModeloInclusao}
              onExportModeloAlteracao={handleExportModeloAlteracao}
              onExportRenomeacaoCodigos={handleExportRenomeacaoCodigos}
              onImportInclusao={handleImportInclusao}
              onImportAlteracao={handleImportAlteracao}
              onImportRenomeacaoCodigos={handleImportRenomeacaoCodigos}
              totalCount={totalItems}
              selectedCount={selectedRows.length}
              togglingActive={togglingActive}
              onDeactivateSelected={handleDeactivateSelected}
              onReactivateSelected={handleReactivateSelected}
            />
          </div>
        </aside>
      </div>

      {/* Botão flutuante de ações no mobile */}
      <button
        type="button"
        onClick={() => setOpenActionsMobile(true)}
        aria-label="Abrir ações"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center border border-neutral-900 bg-neutral-900 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] active:scale-95 lg:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Painel de filtros - mobile */}
      {openFiltersMobile && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpenFiltersMobile(false)}
            aria-label="Fechar filtros"
          />

          <div className="absolute left-0 top-0 h-full w-[92vw] max-w-[420px] overflow-y-auto border-r border-neutral-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Refinar busca
                </p>
                <h2 className="text-lg font-semibold text-neutral-900">Filtros</h2>
              </div>

              <button
                type="button"
                onClick={() => setOpenFiltersMobile(false)}
                aria-label="Fechar filtros"
                className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <CostFilters
              idPrefix="mobile"
              filters={filters}
              setFilters={setFilters}
              allBrands={allBrands}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              isLoading={loading || applyingFilters}
            />
          </div>
        </div>
      )}

      {/* Painel de ações - mobile */}
      {openActionsMobile && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpenActionsMobile(false)}
            aria-label="Fechar ações"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[86dvh] overflow-y-auto border-t border-neutral-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-4 py-4">
              <div className="mx-auto mb-3 h-1 w-10 bg-neutral-200" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Central de ações
                  </p>
                  <h2 className="text-lg font-semibold text-neutral-900">Ações</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenActionsMobile(false)}
                  aria-label="Fechar ações"
                  className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <CostActions
                exporting={exporting || renamingCodes}
                handleExport={handleExport}
                onOpenCreate={() => {
                  setOpenActionsMobile(false);
                  openCreate();
                }}
                onExportModeloInclusao={handleExportModeloInclusao}
                onExportModeloAlteracao={handleExportModeloAlteracao}
                onExportRenomeacaoCodigos={handleExportRenomeacaoCodigos}
                onImportInclusao={(file) => {
                  setOpenActionsMobile(false);
                  handleImportInclusao(file);
                }}
                onImportAlteracao={(file) => {
                  setOpenActionsMobile(false);
                  handleImportAlteracao(file);
                }}
                onImportRenomeacaoCodigos={(file) => {
                  setOpenActionsMobile(false);
                  handleImportRenomeacaoCodigos(file);
                }}
                totalCount={totalItems}
                selectedCount={selectedRows.length}
                togglingActive={togglingActive}
                onDeactivateSelected={handleDeactivateSelected}
                onReactivateSelected={handleReactivateSelected}
              />
            </div>
          </div>
        </div>
      )}

      <NewCost
        open={openNew}
        onOpenChange={setOpenNew}
        mode={mode}
        form={form}
        setForm={setForm}
        onSave={saveForm}
      />

      <ConfirmDelete
        open={openDelete}
        onOpenChange={setOpenDelete}
        count={selectedRows.length}
        onConfirm={deleteSelected}
        loading={deleting}
      />

      <ConfirmImport
        open={openImport}
        onOpenChange={setOpenImport}
        count={importCount}
        onConfirm={confirmImport}
        loading={importing}
        preview={previewRows}
        warnings={warnings}
        tipo={importTipo}
      />

      {/* Preview/confirmação de Renomeação de Códigos */}
      <ConfirmImport
        open={openRenamePreview}
        onOpenChange={(v) => {
          setOpenRenamePreview(v);
          if (!v) {
            setRenameRows([]);
            setRenameWarnings([]);
            setRenameErrors([]);
            setRenameFileName("");
          }
        }}
        count={renameRows.length}
        onConfirm={confirmRenomeacaoCodigos}
        loading={renamingCodes}
        preview={renameRows}
        warnings={renameWarnings}
        errors={renameErrors}
        tipo="alteracao"
        customTitle="Confirmar Renomeação de Códigos"
        customText={
          renameFileName
            ? `Arquivo: ${renameFileName}. Você está prestes a RENOMEAR códigos de custo existentes.`
            : "Você está prestes a RENOMEAR códigos de custo existentes."
        }
      />

      <CostAdjustmentsModal
        open={openAdjustments}
        onOpenChange={setOpenAdjustments}
        selectedRows={selectedRows}
        onApply={handleApplyAdjustments}
        applying={applyingAdjustments}
      />

      <ExportProgressToast
        open={exportProgressOpen}
        percent={exportProgress}
        message={
          exportProgressCount > 0
            ? `${exportProgressCount} custo(s)`
            : undefined
        }
        onClose={() => {
          cancelExportRef.current = true;
          setExportProgressOpen(false);
        }}
      />

      {editing && (
        <FloatingEditor anchorRect={editing.anchorRect} onClose={cancelCostEdit}>
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-neutral-200 px-2.5 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {editing.field}
              </span>
              <span className="text-[10px] text-neutral-400">Enter ↵ · Esc</span>
            </div>

            <div className="p-1.5">
              {(() => {
                const num = parseFloat(editing.value.replace(",", "."));
                const isValid = editing.value.trim() === "" || Number.isFinite(num);

                return (
                  <>
                    <div className="flex items-center gap-1">
                      <div
                        className={`
                          flex h-8 flex-1 items-center gap-1.5 border bg-white px-1.5
                          transition-colors
                          ${
                            isValid
                              ? "border-neutral-200 focus-within:border-neutral-900"
                              : "border-red-500 focus-within:border-red-600"
                          }
                        `}
                      >
                        <span className="shrink-0 text-[11px] font-semibold text-neutral-500">
                          R$
                        </span>

                        <input
                          autoFocus
                          inputMode="decimal"
                          disabled={savingEdit}
                          aria-label={`Editar ${editing.field}`}
                          aria-invalid={!isValid}
                          className="h-full flex-1 min-w-0 bg-transparent text-sm text-neutral-900 outline-none disabled:opacity-50"
                          value={editing.value}
                          onChange={(e) => {
                            let cleaned = e.target.value.replace(/[^0-9.,]/g, "");
                            const firstSep = cleaned.search(/[.,]/);

                            if (firstSep !== -1) {
                              const before = cleaned.slice(0, firstSep + 1);
                              const after = cleaned
                                .slice(firstSep + 1)
                                .replace(/[.,]/g, "");
                              cleaned = before + after;
                            }

                            setEditing((prev) =>
                              prev ? { ...prev, value: cleaned } : prev
                            );
                          }}
                          onBlur={() => {
                            const n = parseFloat(editing.value.replace(",", "."));
                            if (Number.isFinite(n)) {
                              setEditing((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      value: n.toFixed(2).replace(".", ","),
                                    }
                                  : prev
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && isValid) confirmCostEdit();
                            if (e.key === "Escape") cancelCostEdit();
                          }}
                        />
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          title="Cancelar"
                          aria-label="Cancelar edição"
                          onClick={cancelCostEdit}
                          disabled={savingEdit}
                          className="
                            flex h-8 w-8 items-center justify-center
                            border border-neutral-200 bg-white
                            text-neutral-500
                            transition-colors
                            hover:border-red-300 hover:bg-red-50 hover:text-red-600
                            disabled:cursor-not-allowed disabled:opacity-40
                            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500
                          "
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Confirmar"
                          aria-label="Confirmar edição"
                          onClick={confirmCostEdit}
                          disabled={savingEdit || !isValid}
                          className="
                            flex h-8 w-8 items-center justify-center
                            border border-neutral-900 bg-neutral-900
                            text-white
                            transition-colors
                            hover:border-neutral-700 hover:bg-neutral-700
                            disabled:cursor-not-allowed disabled:opacity-40
                            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900
                          "
                        >
                          {savingEdit ? (
                            <span className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <CheckIcon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p
                      role="status"
                      aria-live="polite"
                      className={`mt-1.5 pl-0.5 text-[11px] ${
                        !isValid ? "text-red-600" : "text-neutral-500"
                      }`}
                    >
                      {!isValid
                        ? "Valor inválido"
                        : editing.value.trim() !== ""
                        ? num.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Digite um valor"}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </FloatingEditor>
      )}
    </div>
  );
}
