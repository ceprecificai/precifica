"use client";

import React, { useState } from "react";
import { CaretRight, DotsThree } from "@phosphor-icons/react";

type Props = {
  path: string[];
};

export default function CostLocation({ path }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (path.length === 0) return null;

  const last = path[path.length - 1];
  const rest = path.slice(0, -1);

  return (
    <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
      {expanded &&
        rest.length > 0 &&
        rest.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            <span className="cursor-default text-neutral-500 transition-colors hover:text-neutral-300">
              {item}
            </span>
            <CaretRight className="h-3 w-3 text-neutral-700" aria-hidden="true" />
          </React.Fragment>
        ))}

      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Ocultar caminho completo" : "Mostrar caminho completo"}
          title={expanded ? "Ocultar caminho" : "Mostrar caminho completo"}
          className="
            flex h-5 w-5 items-center justify-center
            text-neutral-600 transition-colors
            hover:text-[var(--accent-blue)]
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]
          "
        >
          <DotsThree className="h-3.5 w-3.5" weight="bold" />
        </button>
      )}

      {rest.length > 0 && (
        <CaretRight className="h-3 w-3 text-neutral-700" aria-hidden="true" />
      )}

      <span className="font-medium text-white">{last}</span>
    </div>
  );
}
