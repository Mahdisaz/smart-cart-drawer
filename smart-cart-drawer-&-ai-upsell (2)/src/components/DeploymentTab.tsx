import React from "react";
import { Github, Settings, Cloud, Server, Sparkles, AlertCircle, HelpCircle, HardDrive } from "lucide-react";

export default function DeploymentTab() {
  return (
    <div className="space-y-6">
      
      {/* Blueprint Intro Banner */}
      <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl" />
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cloud className="h-5 w-5 text-purple-400" />
          SaaS Production-Ready Deployment Blueprint
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Smart Cart Drawer & AI Upsell is fully architected to exist on 100% permanently free hosting tiers. By connecting this codebase to Vercel and Supabase, you establish an uncapped, autonomous business infrastructure with $0 running costs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1: Database Setup */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-bold text-cyan-400 font-mono">1</span>
            <h4 className="text-sm font-bold text-white">Supabase Free Postgres</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Provision your persistent, lightning-fast PostgreSQL database in under 2 minutes:
          </p>

          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">supabase.com</a>.</li>
            <li>Launch a new project (e.g. <code className="text-slate-300 font-mono">smart-cart-drawer</code>).</li>
            <li>Open the <strong>SQL Editor</strong> tab inside the Supabase console.</li>
            <li>Paste the DDL script found in our <strong>Database SQL DDL</strong> tab.</li>
            <li>Click <strong>Run</strong> to compile the tables and constraints instantly.</li>
          </ol>
        </div>

        {/* Step 2: Hosting Configuration */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-bold text-cyan-400 font-mono">2</span>
            <h4 className="text-sm font-bold text-white">Vercel Free Full-Stack Hosting</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Vercel serves your front-end layout and serverless Express routes for free:
          </p>

          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Push this repository code to your private/public <strong>GitHub</strong> account.</li>
            <li>Sign up for a free Hobby account on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">vercel.com</a>.</li>
            <li>Import this repository as a new project on Vercel.</li>
            <li>Configure the <strong>Environment Variables</strong> as detailed on the right.</li>
            <li>Click <strong>Deploy</strong>. Vercel compiles and exposes your live SaaS domain.</li>
          </ol>
        </div>

        {/* Step 3: API & Secrets Configuration */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-bold text-cyan-400 font-mono">3</span>
            <h4 className="text-sm font-bold text-white">Required Env Secrets</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Provide these variables in the Vercel project configuration dashboard:
          </p>

          <div className="space-y-3 font-mono text-[10px] bg-black/40 p-3 rounded-lg border border-white/5 text-slate-300">
            <div>
              <span className="block text-slate-500"># Google AI Studio key</span>
              <span className="font-bold text-cyan-400">GEMINI_API_KEY</span>
              <span className="block text-slate-400 mt-0.5">"your_api_key_here"</span>
            </div>
            
            <div>
              <span className="block text-slate-500"># SaaS Live URL</span>
              <span className="font-bold text-purple-400">APP_URL</span>
              <span className="block text-slate-400 mt-0.5">"https://your-project.vercel.app"</span>
            </div>

            <div>
              <span className="block text-slate-500"># Optional Supabase integration keys</span>
              <span className="font-bold text-pink-400">SUPABASE_URL</span>
              <span className="block text-slate-500">SUPABASE_ANON_KEY</span>
            </div>
          </div>
        </div>

      </div>

      {/* Security Architecture Box */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.01] p-5 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">Secure Environment Warning</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your Gemini API Key is stored safely as a server-side environment variable. All calls to Gemini Flash are proxies securely through the Vercel serverless Express routes (<code className="text-slate-300">/api/cart/upsell</code>) so that no shoppers or public users can ever view or compromise your secrets in browser Developer Console logs.
          </p>
        </div>
      </div>

    </div>
  );
}
