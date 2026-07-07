import React from "react";
import { TrendingUp, DollarSign, Eye, ArrowUpRight, ShieldCheck, Flame, Cpu } from "lucide-react";
import { Metrics, User } from "../types";

interface AnalyticsHubProps {
  metrics: Metrics;
  user: User;
}

export default function AnalyticsHub({ metrics, user }: AnalyticsHubProps) {
  const clickThroughRate = metrics.totalImpressions > 0 
    ? ((metrics.totalClicks / metrics.totalImpressions) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-purple-950/40 p-6 backdrop-blur-md">
        <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-500/5 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">System Status: Active</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white tracking-tight">
              Welcome back to your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Optimization Grid</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Connected to <code className="text-cyan-300 font-mono text-xs">{user.store_url}</code>. Currently optimizing cart average order values with Gemini Flash intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active Tier</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                user.subscription_status === "premium" 
                  ? "text-cyan-400 text-shadow-cyan" 
                  : "text-slate-400"
              }`}>
                {user.subscription_status === "premium" ? (
                  <>
                    <Cpu className="h-3 w-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                    PREMIUM AI
                  </>
                ) : (
                  "FREE TIER"
                )}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Usage Log</span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {user.monthly_orders_count} / 50 Orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0e1322]/80 p-5 hover:border-cyan-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/[0.02] rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Boost Revenue</span>
            <div className="rounded-lg bg-cyan-950/50 p-2 border border-cyan-500/20">
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white font-mono tracking-tight">${metrics.totalRevenueGeneratedByAI.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.4% this cycle</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0e1322]/80 p-5 hover:border-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/[0.02] rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Conversion Boost</span>
            <div className="rounded-lg bg-purple-950/50 p-2 border border-purple-500/20">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white font-mono tracking-tight">+{metrics.conversionRateBoost.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Industry High AOV</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0e1322]/80 p-5 hover:border-blue-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/[0.02] rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Impressions</span>
            <div className="rounded-lg bg-blue-950/50 p-2 border border-blue-500/20">
              <Eye className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white font-mono tracking-tight">{metrics.totalImpressions}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
              <span>Drawer open events</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0e1322]/80 p-5 hover:border-pink-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/[0.02] rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">CTR Efficiency</span>
            <div className="rounded-lg bg-pink-950/50 p-2 border border-pink-500/20">
              <Flame className="h-4 w-4 text-pink-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white font-mono tracking-tight">{clickThroughRate}%</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <span>{metrics.totalClicks} Total Add Clicks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graphs / Optimization Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">AI Conversion Trend</h3>
              <p className="text-xs text-slate-400">Comparison of AOV optimization across weekly order cohorts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                With AI Upsell
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                Standard Store
              </span>
            </div>
          </div>

          {/* Simple Vector Graph */}
          <div className="mt-6 h-56 w-full relative">
            <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
              
              {/* Standard Line */}
              <path 
                d="M 0 35 Q 20 32, 40 33 T 80 32 T 100 30" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="0.8" 
                strokeDasharray="1,1"
              />
              
              {/* With AI Line */}
              <path 
                d="M 0 35 Q 20 25, 40 18 T 80 12 T 100 8" 
                fill="none" 
                stroke="url(#gradient-cyan)" 
                strokeWidth="1.2" 
                className="drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]"
              />

              {/* Area under With AI Line */}
              <path 
                d="M 0 35 Q 20 25, 40 18 T 80 12 T 100 8 L 100 40 L 0 40 Z" 
                fill="url(#gradient-fill)" 
                opacity="0.1"
              />

              {/* Definition of Gradients */}
              <defs>
                <linearGradient id="gradient-cyan" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-500">
              <div className="text-right">AOV Max ($185)</div>
              <div className="text-right">Baseline ($110)</div>
            </div>
            <div className="absolute bottom-[-15px] left-0 right-0 flex justify-between text-[9px] font-mono text-slate-500">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4 (AI Active)</span>
            </div>
          </div>
        </div>

        {/* Neural Network Upsell Recommendations Feed */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              SaaS Engine Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of merchant integrations</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
                <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <div className="text-xs">
                  <span className="font-semibold text-white">USDT Payment System:</span> Ready to parse TronGrid block records automatically.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
                <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <div className="text-xs">
                  <span className="font-semibold text-white">Gemini Flash Node:</span> Model <code className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-cyan-300">gemini-3.5-flash</code> is listening for payload recommendations.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
                <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="text-xs">
                  <span className="font-semibold text-white">Widget Server:</span> Script compiling dynamic assets via <code className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-pink-300">/widget.js</code>.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total orders audited</span>
            <span className="font-mono font-bold text-white">356</span>
          </div>
        </div>
      </div>
    </div>
  );
}
