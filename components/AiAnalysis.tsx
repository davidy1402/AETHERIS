"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { AnalysisResult } from "@/lib/types";

interface AiAnalysisProps {
  initialData: AnalysisResult | null;
  onRefresh: () => Promise<AnalysisResult | null>;
}

export function AiAnalysis({ initialData, onRefresh }: AiAnalysisProps) {
  const [data, setData] = useState<AnalysisResult | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onRefresh();
      if (result) {
        setData(result);
      } else {
        setError("Unable to retrieve AI analysis.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400",
          glow: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]",
          icon: CheckCircle,
          label: "积极 / 乐观",
        };
      case "negative":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400",
          glow: "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]",
          icon: AlertTriangle,
          label: "警惕 / 下行",
        };
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400",
          glow: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
          icon: HelpCircle,
          label: "中立 / 观望",
        };
    }
  };

  const sentiment = data?.sentiment || "neutral";
  const styles = getSentimentStyles(sentiment);
  const SentimentIcon = styles.icon;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI 智能风控简报</h3>
            <p className="text-xs text-foreground/50">由 Google Gemini AI 提供深度市场与汇率风险剖析</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-xl border border-cardBorder hover:bg-foreground/5 active:scale-95 disabled:opacity-50 transition-all duration-200"
          title="刷新分析"
        >
          <RefreshCw className={`w-4 h-4 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-foreground/60 animate-pulse">正在整合持仓，并连线 Google Gemini AI 分析新闻与风控指标...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">AI 分析暂时不可用</h4>
            <p className="text-xs text-rose-500/80 mt-1">{error}</p>
            <p className="text-[11px] text-foreground/40 mt-2">
              请检查您的服务器环境变量是否配置了有效的 <code className="bg-foreground/5 px-1 py-0.2 rounded">GEMINI_API_KEY</code> 与
              <code className="bg-foreground/5 px-1 py-0.2 rounded">EXCHANGE_RATE_API_KEY</code>。
            </p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {/* Sentiment Ring Indicator */}
            <div className="relative shrink-0 mt-1">
              <div className={`w-3.5 h-3.5 rounded-full ${styles.glow} animate-pulse`} />
              <div className={`absolute -inset-1 rounded-full border border-current opacity-25 ${styles.bg}`} />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">市场情绪姿态:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${styles.bg} flex items-center gap-1`}>
                  <SentimentIcon className="w-3.5 h-3.5" />
                  {styles.label}
                </span>
              </div>
              <p className="text-base text-foreground/90 font-medium leading-relaxed">
                {data.brief}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-foreground/40 text-right">
            分析生成时间: {new Date(data.generatedAt).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-foreground/50">
          暂无 AI 分析数据。请点击右上角刷新按钮生成。
        </div>
      )}
    </div>
  );
}
