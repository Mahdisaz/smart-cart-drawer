import React, { useState, useEffect } from "react";
import { Database, FileText, Code2, RefreshCw, Copy, Check, Table, HelpCircle } from "lucide-react";
import { DbState } from "../types";

interface DatabaseTabProps {
  dbState: DbState | null;
  onResetDb: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function DatabaseTab({ dbState, onResetDb, onRefresh }: DatabaseTabProps) {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const DDL_SQL_SCRIPT = `-- ==========================================
-- SMART CART DRAWER & AI UPSELL
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create USERS Table (Store Merchants)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    store_url VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
    monthly_orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb
);

-- 2. Create CRYPTO_INVOICES Table (TRON P2P USDT Payments)
CREATE TABLE IF NOT EXISTS public.crypto_invoices (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
    amount_usdt NUMERIC(10, 2) NOT NULL,
    payment_reference VARCHAR(255) UNIQUE NOT NULL, -- TxHash reference
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_invoices ENABLE ROW LEVEL SECURITY;

-- Create basic non-restrictive policy for developer simplicity
CREATE POLICY "Allow public read-write for demo merchant setup"
ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public read-write for demo invoices"
ON public.crypto_invoices FOR ALL USING (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(DDL_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetDb();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top DDL Code Presentation */}
      <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Supabase PostgreSQL Schema</h3>
              <p className="text-xs text-slate-400">Complete SQL DDL script to generate required database tables on your Supabase project.</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all self-start md:self-center"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                SQL SCRIPT COPIED
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                COPY DDL SQL SCRIPT
              </>
            )}
          </button>
        </div>

        {/* Syntax container */}
        <pre className="rounded-lg bg-black/60 p-4 border border-white/10 font-mono text-xs overflow-x-auto text-cyan-300 max-h-60 leading-relaxed select-all">
          {DDL_SQL_SCRIPT}
        </pre>
      </div>

      {/* Database State Table Explorer */}
      <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Live SQLite/JSON Tables Auditor</h3>
              <p className="text-xs text-slate-400">Auditing active records saved dynamically in the local server database file.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={onRefresh}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync DB Grid
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="rounded-lg bg-red-950/20 border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-50"
            >
              Reset Seed Data
            </button>
          </div>
        </div>

        {dbState ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Table 1: users */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Table className="h-4 w-4 text-cyan-400" />
                TABLE: users ({dbState.users.length} Row)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="p-2.5 font-semibold">id</th>
                      <th className="p-2.5 font-semibold">email</th>
                      <th className="p-2.5 font-semibold">store_url</th>
                      <th className="p-2.5 font-semibold">subscription_status</th>
                      <th className="p-2.5 font-semibold">monthly_orders_count</th>
                      <th className="p-2.5 font-semibold">created_at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbState.users.map(u => (
                      <tr key={u.id} className="border-b border-white/[0.03] text-slate-300 hover:bg-white/[0.01]">
                        <td className="p-2.5 font-mono font-semibold text-white">{u.id}</td>
                        <td className="p-2.5 text-cyan-300 font-mono">{u.email}</td>
                        <td className="p-2.5 text-slate-400 font-mono truncate max-w-[150px]">{u.store_url}</td>
                        <td className="p-2.5">
                          <span className={`rounded-full px-2 py-0.5 font-bold ${
                            u.subscription_status === "premium" 
                              ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20" 
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {u.subscription_status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-center font-bold text-white">{u.monthly_orders_count}</td>
                        <td className="p-2.5 text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: crypto_invoices */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Table className="h-4 w-4 text-yellow-400" />
                TABLE: crypto_invoices ({dbState.crypto_invoices.length} Rows)
              </h4>
              {dbState.crypto_invoices.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
                  Table state is empty. Go to paywall and trigger validation to populate records.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/5">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="p-2.5 font-semibold">id</th>
                        <th className="p-2.5 font-semibold">user_id</th>
                        <th className="p-2.5 font-semibold">amount_usdt</th>
                        <th className="p-2.5 font-semibold">payment_reference</th>
                        <th className="p-2.5 font-semibold">status</th>
                        <th className="p-2.5 font-semibold">created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbState.crypto_invoices.map(inv => (
                        <tr key={inv.id} className="border-b border-white/[0.03] text-slate-300 hover:bg-white/[0.01]">
                          <td className="p-2.5 font-mono font-semibold text-white">{inv.id}</td>
                          <td className="p-2.5 text-slate-400 font-mono">{inv.user_id}</td>
                          <td className="p-2.5 font-mono font-bold text-yellow-400">{inv.amount_usdt}</td>
                          <td className="p-2.5 font-mono text-slate-500 truncate max-w-[120px]">{inv.payment_reference}</td>
                          <td className="p-2.5">
                            <span className={`rounded-full px-2 py-0.5 font-bold text-[10px] ${
                              inv.status === "SUCCESS" 
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                                : inv.status === "PENDING"
                                  ? "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20"
                                  : "bg-red-950/40 text-red-400 border border-red-500/20"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500">{new Date(inv.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
            <span>Connecting to tables inspector pipeline...</span>
          </div>
        )}
      </div>
    </div>
  );
}
