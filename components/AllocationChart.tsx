"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface AllocationData {
  type: string;
  marketValueMYR: number;
  percentage: number;
}

interface AllocationChartProps {
  data: AllocationData[];
}

const COLORS = {
  stock: ["#007aff", "#0a84ff"], // iOS Blue
  etf: ["#34c759", "#30d158"], // iOS Green
  fund: ["#af52de", "#bf5af2"], // iOS Purple
};

const TYPE_LABELS: Record<string, string> = {
  stock: "股票 / 股票基金",
  etf: "交易型开放式指数基金 (ETF)",
  fund: "互惠基金 / 信托",
};

export function AllocationChart({ data }: AllocationChartProps) {
  // Filter out zero allocations to make the chart look nice
  const activeData = data.filter((item) => item.marketValueMYR > 0);

  const totalValue = activeData.reduce((acc, curr) => acc + curr.marketValueMYR, 0);

  const formattedData = activeData.map((item) => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.marketValueMYR,
    percentage: item.percentage,
    rawType: item.type,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg border border-cardBorder text-xs text-foreground">
          <p className="font-semibold mb-1">{dataPoint.name}</p>
          <div className="flex justify-between gap-4 font-medium text-foreground/75">
            <span>市值 (MYR):</span>
            <span className="font-bold">RM {dataPoint.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between gap-4 font-medium text-foreground/75 mt-0.5">
            <span>配置占比:</span>
            <span className="font-bold">{dataPoint.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="font-semibold text-lg">资产配置结构</h3>
        <p className="text-xs text-foreground/50">各类资产占比分布与多元化配置权重</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
        {formattedData.length === 0 ? (
          <div className="text-sm text-foreground/40">暂无资产配置数据</div>
        ) : (
          <>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">总市值</span>
              <span className="text-lg font-bold text-foreground mt-0.5">
                RM {totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {formattedData.map((entry, index) => {
                    const type = entry.rawType as keyof typeof COLORS;
                    const colors = COLORS[type] || COLORS.stock;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[0]}
                        stroke="var(--card-bg)"
                        strokeWidth={2}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {formattedData.length > 0 && (
        <div className="space-y-2 border-t border-cardBorder pt-4 mt-2">
          {formattedData.map((item, index) => {
            const type = item.rawType as keyof typeof COLORS;
            const colors = COLORS[type] || COLORS.stock;
            return (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colors[0] }}
                  />
                  <span className="text-foreground/75 font-medium">{item.name}</span>
                </div>
                <div className="font-bold flex items-center gap-2">
                  <span>RM {item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  <span className="text-foreground/40 text-[10px]">({item.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
