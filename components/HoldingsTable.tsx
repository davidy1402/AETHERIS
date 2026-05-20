"use client";

import React from "react";
import { PortfolioAssetSnapshot } from "@/lib/types";
import { TrendingUp, Award, Layers } from "lucide-react";

interface HoldingsTableProps {
  assets: PortfolioAssetSnapshot[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: PortfolioAssetSnapshot) => void;
}

export function HoldingsTable({ assets, selectedAssetId, onSelectAsset }: HoldingsTableProps) {
  // Renders a small SVG sparkline for 30d history
  const renderSparkline = (history: { date: string; close: number }[], isPositive: boolean) => {
    if (!history || history.length < 2) {
      return <div className="text-[10px] text-foreground/30">N/A</div>;
    }

    const prices = history.map((pt) => pt.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;

    const width = 80;
    const height = 24;
    const padding = 2;

    const points = history
      .map((pt, index) => {
        const x = (index / (history.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((pt.close - min) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
      })
      .join(" ");

    const strokeColor = isPositive ? "#30d158" : "#ff453a";

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-cardBorder">
      <div className="p-6 border-b border-cardBorder">
        <h3 className="font-semibold text-lg">资产持仓明细</h3>
        <p className="text-xs text-foreground/50">点击特定资产可在上方查看其30天历史趋势图</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cardBorder text-[10px] font-bold uppercase tracking-wider text-foreground/40 bg-foreground/[0.01]">
              <th className="py-4 px-6">资产名称 / 标的</th>
              <th className="py-4 px-4 text-center">资产类别</th>
              <th className="py-4 px-4 text-right">持有数量</th>
              <th className="py-4 px-4 text-right">成本 / 现价</th>
              <th className="py-4 px-4 text-right">当前市值 (MYR)</th>
              <th className="py-4 px-4 text-center">30日走势</th>
              <th className="py-4 px-4 text-right">盈亏 / ROI</th>
              <th className="py-4 px-6 text-right">今日涨跌</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cardBorder/50">
            {assets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const isProfit = asset.profitLossNative >= 0;
              const isDayUp = asset.dayChangePercent >= 0;

              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className={`cursor-pointer transition-all duration-150 group hover:bg-foreground/[0.02] ${
                    isSelected ? "bg-foreground/[0.03] border-l-2 border-l-indigo-500" : ""
                  }`}
                >
                  {/* Name and Symbol */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {asset.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-foreground/40">{asset.id}</span>
                      <span className="text-[9px] px-1 rounded bg-foreground/5 text-foreground/50 font-medium">
                        {asset.exchange}
                      </span>
                    </div>
                  </td>

                  {/* Asset Type */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-cardBorder bg-foreground/[0.02] text-foreground/60">
                      {asset.type === "stock" ? (
                        <>
                          <Award className="w-3.5 h-3.5 text-blue-500" /> 股票
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5 text-emerald-500" /> ETF
                        </>
                      )}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4 text-right font-mono text-xs font-semibold">
                    {asset.quantity.toLocaleString()}
                  </td>

                  {/* Cost vs. Current Price */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono text-xs font-semibold">
                      {asset.currency === "USD" ? "$" : "RM"} {asset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="font-mono text-[10px] text-foreground/40 mt-0.5">
                      成本: {asset.currency === "USD" ? "$" : "RM"} {asset.costPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  {/* Market Value in MYR */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono text-xs font-bold text-foreground">
                      RM {asset.marketValueMYR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    {asset.currency === "USD" && (
                      <div className="font-mono text-[9px] text-foreground/40 mt-0.5">
                        $ {asset.marketValueUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>

                  {/* 30-Day Trend Sparkline */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      {renderSparkline(asset.history30d, isProfit)}
                    </div>
                  </td>

                  {/* Profit Loss / ROI */}
                  <td className="py-4 px-4 text-right">
                    <div className={`font-mono text-xs font-bold ${isProfit ? "text-profit" : "text-loss"}`}>
                      RM {isProfit ? "+" : ""}{asset.profitLossMYR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`font-mono text-[10px] font-bold mt-0.5 ${isProfit ? "text-profit" : "text-loss"}`}>
                      {isProfit ? "+" : ""}{asset.roiPercent.toFixed(2)}%
                    </div>
                  </td>

                  {/* Day Change */}
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isDayUp ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                      }`}
                    >
                      <TrendingUp className={`w-3.5 h-3.5 ${!isDayUp ? "rotate-180" : ""}`} />
                      {isDayUp ? "+" : ""}
                      {asset.dayChangePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
