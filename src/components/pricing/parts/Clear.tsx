import React from "react";
import { motion } from "framer-motion";
import {
  DownloadSimple,
  Trash,
  SlidersHorizontal,
} from "@phosphor-icons/react";

type ClearAndDownloadActionsProps = {
  handleDownload: () => void;
  handleClearAll: () => void;
  isClearing: boolean;
  clicks: number;
  onToggleLayout: () => void;
};

export const ClearAndDownloadActions: React.FC<ClearAndDownloadActionsProps> = ({
  handleDownload,
  handleClearAll,
  isClearing,
  clicks,
  onToggleLayout,
}) => (
  <div className="clear-actions">
    {/* CONFIGURAR LAYOUT */}
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onToggleLayout}
      title="Configurar layout dos blocos"
      className="icon-action"
      type="button"
    >
      <SlidersHorizontal size={16} className="icon-action-icon" />
    </motion.button>

    {/* DOWNLOAD */}
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleDownload}
      title="Baixar planilha Excel"
      className="icon-action"
      type="button"
    >
      <DownloadSimple size={16} className="icon-action-icon" />
    </motion.button>

    {/* LIMPAR */}
    <motion.button
      whileTap={{ scale: 0.92, rotate: -12 }}
      onClick={handleClearAll}
      disabled={isClearing && clicks >= 5}
      title={
        clicks >= 5
          ? "Botão bloqueado temporariamente após muitos cliques"
          : "Limpar todos os dados"
      }
      type="button"
      className={`icon-action ${
        isClearing ? "icon-action--clearing" : "icon-action--danger"
      }`}
    >
      <Trash
        size={16}
        className={`icon-action-icon ${isClearing ? "icon-action-pulse" : ""}`}
      />
    </motion.button>
  </div>
);
