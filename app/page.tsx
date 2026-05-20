"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  Wallet,
  DollarSign,
  Percent,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import { PortfolioSnapshot, PortfolioAssetSnapshot, AnalysisResult } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { AllocationChart } from "@/components/AllocationChart";
import { HistoryChart } from "@/components/HistoryChart";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AiAnalysis } from "@/components/AiAnalysis";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  
  const [errorPrices, setErrorPrices] = useState<any | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAssetSnapshot | null>(null);

  // Suppress hydration warning mismatch by only mounting on client
  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingPrices(true);
    setErrorPrices(null);
    try {
      // 1. Fetch live portfolio snapshot
      const pricesRes = await fetch("/api/prices");
      const pricesData = await pricesRes.json();

      if (!pricesRes.ok) {
        throw pricesData.error || { message: "Failed to fetch portfolio data." };
      }

      setSnapshot(pricesData);

      // Select first asset by default for history chart
      if (pricesData.assets && pricesData.assets.length > 0) {
        setSelectedAsset(pricesData.assets[0]);
      }
    } catch (err: any) {
      console.error("[Dashboard Load Error]:", err);
      setErrorPrices(err);
    } finally {
      setLoadingPrices(false);
    }

    // 2. Fetch AI analysis in parallel
    setLoadingAnalysis(true);
    try {
      const analysisRes = await fetch("/api/analysis", { method: "POST" });
      const analysisData = await analysisRes.json();

      if (analysisRes.ok) {
        setAnalysis(analysisData);
      } else {
        console.warn("AI Analysis load failed:", analysisData.error?.message);
      }
    } catch (err) {
      console.error("Failed to load initial AI analysis:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRefreshAnalysis = async (): Promise<AnalysisResult | null> => {
    const analysisRes = await fetch("/api/analysis", { method: "POST" });
    const analysisData = await analysisRes.json();

    if (!analysisRes.ok) {
      throw new Error(analysisData.error?.message || "Failed to generate AI analysis.");
    }

    setAnalysis(analysisData);
    return analysisData;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative pb-16 transition-colors duration-300">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-cardBorder/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-extrabold shadow-md tracking-wider">
            Æ
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-foreground">AETHERIS</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Smart Portfolio Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl border border-cardBorder hover:bg-foreground/5 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loadingPrices}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background font-medium text-xs hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? "animate-spin" : ""}`} />
            刷新数据
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {errorPrices ? (
          /* Error Card for Pricing/Exchange Rate Config */
          <div className="glass-card rounded-3xl p-8 border-rose-500/20 bg-rose-500/5 flex flex-col md:flex-row items-start gap-6 max-w-3xl mx-auto my-12 shadow-lg">
            <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="font-bold text-xl text-rose-500">投资组合加载失败</h2>
                <p className="text-sm text-foreground/60 mt-1">服务器在处理数据时遇到了错误。</p>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-cardBorder">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground/50">错误代码:</span>
                  <span className="font-mono bg-rose-500/10 px-2 py-0.5 rounded text-rose-500 font-bold">{errorPrices.code || "UNKNOWN"}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-2 font-medium leading-relaxed">
                  {errorPrices.message || "未知系统异常。"}
                </p>
              </div>

              {/* Troubleshooting Tips based on Code */}
              <div className="text-xs text-foreground/50 space-y-2">
                <p className="font-semibold text-foreground/60">排查建议:</p>
                {errorPrices.code === "PORTFOLIO_FILE_NOT_FOUND" && (
                  <p>• 请确认根目录下是否创建了 <code className="font-mono bg-foreground/5 px-1 py-0.2 rounded">data/portfolio.json</code> 文件，并且该文件可被 Node.js 进程读取。</p>
                )}
                {errorPrices.code === "PORTFOLIO_JSON_INVALID" && (
                  <p>• 请确认您的 <code className="font-mono bg-foreground/5 px-1 py-0.2 rounded">portfolio.json</code> 语法是否正确，格式不能有尾随逗号，且符合 JSON 标准规范。</p>
                )}
                {errorPrices.code === "PORTFOLIO_SCHEMA_INVALID" && (
                  <p>• 请验证每个持仓对象是否包含 <code className="font-mono bg-foreground/5 px-1 py-0.2 rounded">id, name, type, exchange, currency, costPrice, quantity</code> 等属性，且成本及数量必须大于 0。</p>
                )}
                {errorPrices.code === "EXCHANGE_RATE_API_KEY_MISSING" && (
                  <p>• 请在您的环境变量配置文件中配置有效的 <code className="font-mono bg-foreground/5 px-1 py-0.2 rounded">EXCHANGE_RATE_API_KEY</code> （来自 ExchangeRate-API 服务）。</p>
                )}
                {errorPrices.code === "EXCHANGE_RATE_UNAVAILABLE" && (
                  <p>• 服务器无法与 ExchangeRate-API 服务通信。请检查本地网络连接，或确认 API 额度是否用尽。</p>
                )}
              </div>

              <button
                onClick={fetchData}
                className="px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs active:scale-95 hover:opacity-90 transition-all duration-200"
              >
                重试加载
              </button>
            </div>
          </div>
        ) : loadingPrices ? (
          /* Loading Skeletons */
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-3xl h-[160px] bg-foreground/5" />
              ))}
            </div>
            <div className="glass-card rounded-3xl h-[120px] bg-foreground/5" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 glass-card rounded-3xl h-[360px] bg-foreground/5" />
              <div className="lg:col-span-3 glass-card rounded-3xl h-[360px] bg-foreground/5" />
            </div>
            <div className="glass-card rounded-3xl h-[300px] bg-foreground/5" />
          </div>
        ) : snapshot ? (
          /* Real Dashboard UI */
          <>
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="总资产净值"
                value={`RM ${snapshot.totals.marketValueMYR.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                subValue={`等值 $ ${snapshot.totals.marketValueUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                icon={Wallet}
                iconBgColor="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400"
              />
              <MetricCard
                title="累计投资盈亏"
                value={`RM ${snapshot.totals.profitLossMYR >= 0 ? "+" : ""}${snapshot.totals.profitLossMYR.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                subValue={`等值 $ ${snapshot.totals.profitLossUSD >= 0 ? "+" : ""}${snapshot.totals.profitLossUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                icon={DollarSign}
                iconBgColor={snapshot.totals.profitLossMYR >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}
                trend={snapshot.totals.profitLossMYR >= 0 ? "up" : "down"}
              />
              <MetricCard
                title="投资组合收益率 (ROI)"
                value={`${snapshot.totals.roiPercent >= 0 ? "+" : ""}${snapshot.totals.roiPercent.toFixed(2)}%`}
                change={snapshot.totals.roiPercent}
                icon={Percent}
                iconBgColor="bg-sky-500/10 text-sky-500 dark:text-sky-400"
                trend={snapshot.totals.roiPercent >= 0 ? "up" : "down"}
              />
            </div>

            {/* AI Wind Control Panel */}
            <AiAnalysis initialData={analysis} onRefresh={handleRefreshAnalysis} />

            {/* Visualizations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Allocation Donut */}
              <div className="lg:col-span-2">
                <AllocationChart data={snapshot.allocation} />
              </div>

              {/* History Spark Chart */}
              <div className="lg:col-span-3">
                {selectedAsset ? (
                  <HistoryChart
                    assetName={selectedAsset.name}
                    assetTicker={selectedAsset.id}
                    currency={selectedAsset.currency}
                    history={selectedAsset.history30d}
                    currentPrice={selectedAsset.currentPrice}
                    dayChangePercent={selectedAsset.dayChangePercent}
                  />
                ) : (
                  <div className="glass-card rounded-3xl p-6 h-[360px] flex items-center justify-center text-sm text-foreground/40">
                    请选择资产查看走势
                  </div>
                )}
              </div>
            </div>

            {/* Holdings Detail Table */}
            <HoldingsTable
              assets={snapshot.assets}
              selectedAssetId={selectedAsset?.id || null}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
            />

            {/* FX Status Information Footer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-cardBorder/40 bg-foreground/[0.01] text-[11px] text-foreground/50">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>美元对马币基准汇率 (USD/MYR): <span className="font-bold font-mono">{snapshot.exchangeRate.usdToMyr}</span></span>
                <span className="text-foreground/20">|</span>
                <span>马币对美元基准汇率 (MYR/USD): <span className="font-bold font-mono">{snapshot.exchangeRate.myrToUsd.toFixed(6)}</span></span>
              </div>
              <div>
                数据更新时间: {new Date(snapshot.updatedAt).toLocaleString()}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
