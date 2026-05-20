"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  changeType?: "percent" | "amount";
  icon: LucideIcon;
  iconBgColor?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({
  title,
  value,
  subValue,
  change,
  changeType = "percent",
  icon: Icon,
  iconBgColor = "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
  trend,
}: MetricCardProps) {
  const isPositive = trend === "up" || (change !== undefined && change > 0);
  const isNegative = trend === "down" || (change !== undefined && change < 0);

  let trendColor = "text-foreground/50";
  let TrendIcon = null;

  if (isPositive) {
    trendColor = "text-profit";
    TrendIcon = ArrowUpRight;
  } else if (isNegative) {
    trendColor = "text-loss";
    TrendIcon = ArrowDownRight;
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
    >
      {/* Sparkle background details */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-foreground/2 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground/60">{title}</span>
        <div className={`p-2.5 rounded-2xl ${iconBgColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground leading-none">
          {value}
        </h2>
        {subValue && (
          <p className="text-xs text-foreground/40 font-medium">
            {subValue}
          </p>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-3 border-t border-cardBorder flex items-center gap-1.5">
          {TrendIcon && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
          <span className={`text-xs font-bold ${trendColor}`}>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
            {changeType === "percent" ? "%" : ""}
          </span>
          <span className="text-[10px] text-foreground/40">相较于成本基准</span>
        </div>
      )}
    </motion.div>
  );
}
