import React, { useState } from "react";
import { ShieldCheck, HelpCircle, AlertCircle, Cpu, Coins, Search, ExternalLink, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { CryptoInvoice } from "../types";

interface PaywallTabProps {
  currentTier: string;
  invoices: CryptoInvoice[];
  onSubmitTxHash: (txHash: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onToggleTierDirectly: () => Promise<void>;
}

export default function PaywallTab({
  currentTier,
  invoices,
  onSubmitTxHash,
  onToggleTierDirectly
}: PaywallTabProps) {
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const MERCHANT_WALLET = "TUQmwudzUbo2e1EiUJLtmpupdrstJzLZHD";

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(MERCHANT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutofillMock = () => {
    setTxHash("MOCK_PREMIUM_TX_HASH_1001");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) return;

    setSubmitting(true);
    setResultMsg(null);
    try {
      const res = await onSubmitTxHash(txHash);
      if (res.success) {
        setResultMsg({
          text: res.message || "Payment verified! Upgraded to premium successfully.",
          isError: false
        });
        setTxHash("");
      } else {
        setResultMsg({
          text: res.error || "Failed to verify transaction.",
          isError: true
        });
      }
    } catch (err: any) {
      setResultMsg({
        text: "Error connecting to validation engine.",
        isError: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Switch Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pricing Plan Details */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Coins className="h-5 w-5 text-yellow-400" />
              <h3 className="text-base font-bold text-white">Direct TRC-20 Subscription Paywall</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Our billing engine runs directly on the TRON blockchain. We collect zero custody fees, have no middleman, and charges zero processor fees. Setup once, benefit forever.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg bg-black/40 p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <span className="block text-xs text-slate-400">Hybrid Freemium Tier</span>
                  <span className="block text-sm font-bold text-white">Up to 50 Store Orders/Mo</span>
                </div>
                <span className="text-xs font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded text-slate-300">ACTIVE FREE TIER</span>
              </div>

              <div className="rounded-lg bg-cyan-950/20 p-4 border border-cyan-500/30 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs text-cyan-400 font-bold uppercase tracking-widest">Premium SaaS License</span>
                    <span className="rounded bg-cyan-500 px-1 py-0.5 text-[8px] font-black text-black uppercase">Uncapped</span>
                  </div>
                  <span className="block text-sm font-bold text-white mt-1">Unlimited Store Audits & Full AI Access</span>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-black text-white font-mono">$15 <span className="text-xs text-cyan-400">USDT</span></span>
                  <span className="block text-[9px] text-slate-400 font-medium">per month</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <h5 className="text-xs font-bold text-slate-300">Automatic Premium Features:</h5>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Direct multi-language Gemini 1.5/3.5 Flash recommendations</li>
                <li>Real-time custom store inventory scraping and parsing</li>
                <li>Glow, Glassmorphism, and custom styling animations</li>
                <li>Priority support & instant custom analytics integration</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to test immediately?</span>
            <button
              onClick={onToggleTierDirectly}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all"
            >
              <Cpu className="h-3.5 w-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
              Developer Bypass (Toggle {currentTier === "premium" ? "FREE" : "PREMIUM"})
            </button>
          </div>
        </div>

        {/* Payment Checkout Frame */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cryptocurrency Subscription</h3>
              <p className="text-[10px] text-slate-400">P2P checkout on the TRC-20 Blockchain</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure P2P Node
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-center bg-black/40 p-4 rounded-lg border border-white/5">
            {/* Payment QR Code */}
            <div className="h-32 w-32 bg-white p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
              {/* Generate a clean static mock QR code pointing to the USDT payment details */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=tron:TUQmwudzUbo2e1EiUJLtmpupdrstJzLZHD?amount=15&token=USDT" 
                alt="USDT TRON Payment Address" 
                className="h-full w-full object-contain"
              />
            </div>

            <div className="space-y-2.5 w-full">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">USDT Transfer Amount:</span>
                <span className="text-lg font-black font-mono text-white">15.00 <span className="text-xs text-yellow-500">USDT (TRC-20)</span></span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recipient TRON Address:</span>
                <div className="flex gap-1.5 items-center mt-1">
                  <code className="text-xs font-mono font-bold bg-slate-900 px-2 py-1 rounded text-cyan-300 truncate max-w-[150px] sm:max-w-none">
                    {MERCHANT_WALLET}
                  </code>
                  <button 
                    onClick={handleCopyWallet}
                    className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all flex-shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Form */}
          <form onSubmit={handleVerify} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Transaction Hash (TxHash)</label>
                <button
                  type="button"
                  onClick={handleAutofillMock}
                  className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Autofill Test TxHash
                </button>
              </div>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste TRON TxHash (64-character hex string)"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !txHash.trim()}
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-yellow-500 text-[#030712] hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(234,179,8,0.25)] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  CONSULTING TRONGRID BLOCKCHAIN...
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  SUBMIT TRANSACTION FOR AI AUDITING
                </>
              )}
            </button>

            {/* Verification Response Notification */}
            {resultMsg && (
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                resultMsg.isError 
                  ? "bg-red-950/20 border-red-500/30 text-red-400" 
                  : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              }`}>
                {resultMsg.isError ? <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                <div>{resultMsg.text}</div>
              </div>
            )}
          </form>

        </div>
      </div>

      {/* Historic Transaction Invoices */}
      <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">Payment Invoices Audit History</h3>
        {invoices.length === 0 ? (
          <p className="text-xs text-slate-500">No transactions audited yet. Send a transaction and input the TxHash above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-2 font-semibold">Invoice ID</th>
                  <th className="pb-2 font-semibold">TxHash Reference</th>
                  <th className="pb-2 font-semibold">USDT Value</th>
                  <th className="pb-2 font-semibold">Timestamp</th>
                  <th className="pb-2 font-semibold">Audit Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {invoices.map(inv => (
                  <tr key={inv.id} className="text-slate-300">
                    <td className="py-3 font-semibold font-mono">{inv.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <span className="truncate max-w-[120px]">{inv.payment_reference}</span>
                        {inv.payment_reference !== "MOCK_PREMIUM_TX_HASH_1001" && (
                          <a 
                            href={`https://tronscan.org/#/transaction/${inv.payment_reference}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-0.5 rounded hover:bg-white/5 text-slate-500 hover:text-cyan-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-bold font-mono text-white">{inv.amount_usdt} USDT</td>
                    <td className="py-3 text-slate-500">{new Date(inv.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        inv.status === "SUCCESS" 
                          ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                          : inv.status === "PENDING"
                            ? "bg-yellow-950/40 border border-yellow-500/20 text-yellow-400"
                            : "bg-red-950/40 border border-red-500/20 text-red-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
