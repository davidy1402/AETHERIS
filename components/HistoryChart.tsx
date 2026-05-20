"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PricePoint, Currency } from "@/lib/types";
import { TrendingUp, Calendar } from "lucide-react";

interface HistoryChartProps {
  assetName: string;
  assetTicker: string;
  currency: Currency;
  history: PricePoint[];
  currentPrice: number;
  dayChangePercent: number;
}

export function HistoryChart({
  assetName,
  assetTicker,
  currency,
  history,
  currentPrice,
  dayChangePercent,
}: HistoryChartProps) {
  const isPositive = dayChangePercent >= 0;
  const gradientColor = isPositive ? "#30d158" : "#ff453a";

  const formattedHistory = history.map((pt) => ({
    ...pt,
    // Format date from YYYY-MM-DD to e.g. "May 12"
    formattedDate: new Date(pt.date).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }),
  }));

  const prices = history.map((h) => h.close);
  const minPrice = prices.length ? Math.min(...prices) * 0.98 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.02 : 100;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg border border-cardBorder text-xs text-foreground">
          <p className="font-semibold text-foreground/50 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {dataPoint.date}
          </p>
          <div className="flex justify-between gap-4 font-bold text-sm">
            <span>收盘价:</span>
            <span>{currency === "USD" ? "$" : "RM"} {dataPoint.close.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 h-[360px] flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl -z-10 opacity-30 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${gradientColor}15 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-foreground/40">历史趋势线</span>
          <h3 className="font-semibold text-lg flex items-center gap-1.5 mt-0.5">
            {assetName} <span className="text-xs text-foreground/40 font-mono">({assetTicker})</span>
          </h3>
          <p className="text-xs text-foreground/50">30天历史收盘价格趋势一览</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono">
            {currency === "USD" ? "$" : "RM"} {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className={`text-xs font-bold mt-0.5 flex items-center justify-end gap-1 ${isPositive ? "text-profit" : "text-loss"}`}>
            <TrendingUp className={`w-3.5 h-3.5 ${!isPositive ? "rotate-180" : ""}`} />
            {isPositive ? "+" : ""}
            {dayChangePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] mt-4 flex items-end">
        {formattedHistory.length === 0 ? (
          <div className="w-full text-center text-sm text-foreground/40 py-12">
            该资产暂无可用历史价格点（数据可能在加载中或不支持历史展示）
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={formattedHistory} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--foreground)", opacity: 0.4, fontSize: 10 }}
                dy={10}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--foreground)", opacity: 0.4, fontSize: 10 }}
                dx={-10}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={gradientColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
