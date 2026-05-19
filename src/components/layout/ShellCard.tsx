"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function ShellCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "executive-surface rounded-[30px] shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_32px_90px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
