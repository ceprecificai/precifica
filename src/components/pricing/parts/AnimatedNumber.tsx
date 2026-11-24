"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

const safe = (v: number) => (Number.isFinite(v) ? v : 0);

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = "",
}) => {
  const motionValue = useMotionValue(0);

  const formatted = useTransform(motionValue, (latest) =>
    latest.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    const controls = animate(motionValue, safe(value), {
      duration: 0.8,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <motion.span className={`tabular-nums ${className}`}>{formatted}</motion.span>
  );
};
