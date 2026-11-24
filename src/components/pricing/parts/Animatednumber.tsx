"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

const safe = (v: number) => (Number.isFinite(v) ? v : 0);

const formatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = "",
}) => {
  const spring = useSpring(0, {
    stiffness: 120,
    damping: 20,
    mass: 0.6,
  });

  const formatted = useTransform(spring, (latest) => formatter.format(latest));

  useEffect(() => {
    spring.set(safe(value));
  }, [value, spring]);

  return (
    <motion.span className={`tabular-nums ${className}`}>{formatted}</motion.span>
  );
};
