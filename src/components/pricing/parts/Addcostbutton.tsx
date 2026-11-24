import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react";

type AddCostButtonProps = {
  onClick: () => void;
};

export const AddCostButton: React.FC<AddCostButtonProps> = ({ onClick }) => (
  <Button type="button" onClick={onClick} variant="outline" className="btn-add-cost">
    <Plus size={14} weight="bold" className="btn-add-cost-icon" />
    Incluir Custos
  </Button>
);
