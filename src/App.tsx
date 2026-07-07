import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Sliders, 
  ShoppingBag, 
  Coins, 
  Database, 
  BookOpen, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";

import { User, UserSettings, CryptoInvoice, Product, CartItem, DbState } from "./types";

// Import modular components
import AnalyticsHub from "./components/AnalyticsHub";
import CustomizerTab from "./components/CustomizerTab";
import SimulatorTab from "./components/SimulatorTab";
import PaywallTab from "./components/PaywallTab";
import DatabaseTab from "./components/DatabaseTab";
import DeploymentTab from "./components/DeploymentTab";

type TabId = "analytics" | "customizer" | "simulator" | "paywall" | "database" | "deployment";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  
  // App-wide state
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [invoices, setInvoices] = useState<CryptoInvoice[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [dbState, setDbState] = useState<DbState | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch User Profile, Settings and Metrics
      const userRes = await fetch("/api/user");
      if (!userRes.ok) {
        throw new Error(`Failed to load user profile: ${userRes.status} ${userRes.statusText}`);
      }
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
        setMetrics(userData.metrics);
      } else {
        throw new Error(userData.error || "Failed to load user data");
      }

      // 2. Fetch Invoices
      const invRes = await fetch("/api/user/invoices");
      if (!invRes.ok) {
        throw new Error(`Failed to load invoices: ${invRes.status} ${invRes.statusText}`);
      }
      const invData = await invRes.json();
      if (invData.success) {
        setInvoices(invData.invoices);
      }

      // 3. Fetch Simulator Cart and Inventory
      const simRes = await fetch("/api/simulator/cart");
      if (!simRes.ok) {
        throw new Error(`Failed to load cart: ${simRes.status} ${simRes.statusText}`);
      }
      const simData = await simRes.json();
      if (simData.success) {
        setCart(simData.cart);
        setInventory(simData.inventory);
      }

      // 4. Fetch Raw Database State
      const dbRes = await fetch("/api/db/raw");
      if (!dbRes.ok) {
        throw new Error(`Failed to load raw db state: ${dbRes.status} ${dbRes.statusText}`);
      }
      const dbData = await dbRes.json();
      setDbState(dbData);

    } catch (err: any) {
      console.error("Failed to load initial SaaS dashboard data", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Sync DB Inspector state separately when needed
  const fetchDbState = async () => {
    try {
      const dbRes = await fetch("/api/db/raw");
      const dbData = await dbRes.json();
      setDbState(dbData);
      
      const userRes = await fetch("/api/user");
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
        setMetrics(userData.metrics);
      }
    } catch (err) {
      console.error("DB State fetch failed", err);
    }
  };

  // Callback to update merchant settings
  const handleSaveSettings = async (updatedSettings: Partial<UserSettings>) => {
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await fetchDbState();
        
        // Notify the client widget preview
        window.dispatchEvent(new CustomEvent("smart-cart-refresh"));
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      throw err;
    }
  };

  // Callback to update cart inside simulation
  const handleUpdateCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      await fetch("/api/simulator/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: newCart })
      });
      await fetchDbState();
      
      // Notify client script
      window.dispatchEvent(new CustomEvent("smart-cart-refresh"));
    } catch (err) {
      console.error("Failed to sync cart", err);
    }
  };

  // Callback when P2P payment gets submitted
  const handleSubmitTxHash = async (txHash: string) => {
    try {
      const res = await fetch("/api/user/invoice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash })
      });
      const data = await res.json();
      
      // Refresh local caches
      const invRes = await fetch("/api/user/invoices");
      const invData = await invRes.json();
      if (invData.success) {
        setInvoices(invData.invoices);
      }
      await fetchDbState();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.error("TxHash submit failed", err);
      return { success: false, error: err.message || "Failed to contact payment engine" };
    }
  };

  // Toggle tier instantly for sandbox/testing purposes
  const handleToggleTierDirectly = async () => {
    try {
      const res = await fetch("/api/user/toggle-tier", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchInitialData();
        window.dispatchEvent(new CustomEvent("smart-cart-refresh"));
      }
    } catch (err) {
      console.error("Failed to toggle tier", err);
    }
  };

  // Reset entire database to default seeds
  const handleResetDb = async () => {
    try {
      const res = await fetch("/api/db/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchInitialData();
        window.dispatchEvent(new CustomEvent("smart-cart-refresh"));
      }
    } catch (err) {
      console.error("Reset DDL failed", err);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b13] text-red-400 font-mono flex-col p-6 gap-6 max-w-md mx-auto text-center">
        <div className="relative h-12 w-12 rounded-lg bg-red-500/10 p-2 flex items-center justify-center border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Cpu className="h-6 w-6 animate-pulse text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-black tracking-wider uppercase text-red-500">Connection Failed</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The dashboard could not establish a connection to the backend API services.
          </p>
        </div>
        <div className="w-full bg-red-950/20 border border-red-500/10 rounded-lg p-3 text-left">
          <span className="block text-[10px] text-red-400/50 uppercase tracking-widest font-bold mb-1">Diagnostic Log</span>
          <code className="text-xs break-all text-slate-300">{error}</code>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={fetchInitialData}
            className="flex-1 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Retry Connection
          </button>
          <button
            onClick={async () => {
              try {
                setError(null);
                setLoading(true);
                await fetch("/api/db/reset", { method: "POST" });
                await fetchInitialData();
              } catch (e: any) {
                setError(`Reset failed: ${e.message}`);
              }
            }}
            className="py-2 px-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Reset Database
          </button>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b13] text-cyan-400 font-mono flex-col gap-4">
        <Cpu className="h-10 w-10 animate-spin text-cyan-400" />
        <span className="text-sm tracking-wider uppercase">Loading Cyber Smart-SaaS Hub...</span>
      </div>
    );
  }

  return (
    <div id="saas-drawer-app-container" className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Dynamic Cyberpunk Header Nav */}
      <header className="border-b border-white/5 bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Cpu className="h-5 w-5 text-[#070b13] font-bold" />
            </div>
            <div>
              <span className="block text-sm font-black uppercase tracking-widest text-white">Smart Cart Drawer</span>
              <span className="block text-[10px] text-cyan-400 font-mono font-bold tracking-tight uppercase">AI Upsell & Crypto SaaS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-cyan-500/10 bg-cyan-950/20 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-mono">P2P Crypto Subscription Engine Ready</span>
            </div>
            
            {/* Sync trigger */}
            <button
              onClick={fetchInitialData}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
              title="Sync SaaS Dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-white/5 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Analytics Hub
          </button>

          <button
            onClick={() => setActiveTab("customizer")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "customizer"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Visual Customizer
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "simulator"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Live Shop Simulator
          </button>

          <button
            onClick={() => setActiveTab("paywall")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "paywall"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Coins className="h-4 w-4" />
            Direct USDT Payments
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "database"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Database className="h-4 w-4" />
            Database SQL DDL
          </button>

          <button
            onClick={() => setActiveTab("deployment")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap ${
              activeTab === "deployment"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Deployment Blueprints
          </button>
        </div>

        {/* Tab Panel Display */}
        <div className="flex-1">
          {activeTab === "analytics" && (
            <AnalyticsHub metrics={metrics} user={user} />
          )}

          {activeTab === "customizer" && (
            <CustomizerTab settings={user.settings} onSave={handleSaveSettings} />
          )}

          {activeTab === "simulator" && (
            <SimulatorTab 
              settings={user.settings} 
              userTier={user.subscription_status}
              cart={cart}
              inventory={inventory}
              onUpdateCart={handleUpdateCart}
              onTriggerMetricClick={async (price) => {
                // Increment click metric on server
                try {
                  const res = await fetch("/api/metrics/click", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ price })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setMetrics(data.metrics);
                    await fetchDbState();
                  }
                } catch (err) {
                  console.error("Metric click write failed", err);
                }
              }}
            />
          )}

          {activeTab === "paywall" && (
            <PaywallTab 
              currentTier={user.subscription_status}
              invoices={invoices}
              onSubmitTxHash={handleSubmitTxHash}
              onToggleTierDirectly={handleToggleTierDirectly}
            />
          )}

          {activeTab === "database" && (
            <DatabaseTab 
              dbState={dbState} 
              onResetDb={handleResetDb} 
              onRefresh={fetchDbState}
            />
          )}

          {activeTab === "deployment" && (
            <DeploymentTab />
          )}
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-white/5 bg-[#0e1322]/20 py-4 mt-12 text-center text-[10px] text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Smart Cart Drawer & AI Upsell Inc. All rights reserved on-chain.</span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Cpu className="h-3.5 w-3.5" />
            Uncapped Free Infrastructure Architect v3.0
          </span>
        </div>
      </footer>

    </div>
  );
}
