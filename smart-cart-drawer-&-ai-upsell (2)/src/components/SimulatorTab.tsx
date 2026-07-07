import React, { useState, useEffect } from "react";
import { ShoppingBag, Sparkles, RefreshCw, Plus, Trash2, Cpu, Eye, Smartphone, AlertTriangle } from "lucide-react";
import { Product, CartItem, UserSettings } from "../types";

interface SimulatorTabProps {
  settings: UserSettings;
  userTier: string;
  cart: CartItem[];
  inventory: Product[];
  onUpdateCart: (newCart: CartItem[]) => Promise<void>;
  onTriggerMetricClick: (price: number) => Promise<void>;
}

export default function SimulatorTab({
  settings,
  userTier,
  cart,
  inventory,
  onUpdateCart,
  onTriggerMetricClick
}: SimulatorTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiWarning, setAiWarning] = useState("");

  // Auto-fetch upsells when drawer opens or cart changes
  useEffect(() => {
    if (drawerOpen && cart.length > 0) {
      fetchUpsells();
    } else {
      setRecommendations([]);
    }
  }, [drawerOpen, cart]);

  const fetchUpsells = async () => {
    setLoadingAI(true);
    setAiWarning("");
    try {
      const res = await fetch("/api/cart/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, inventory })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
        if (data.warning) {
          setAiWarning(data.warning);
        }
      }
    } catch (err) {
      console.error("AI recommendations fetch failed", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    let updatedCart: CartItem[] = [];
    if (existing) {
      updatedCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    await onUpdateCart(updatedCart);
    // Auto trigger open drawer if configured
    if (settings.autoOpen) {
      setDrawerOpen(true);
    }
  };

  const handleRemoveFromCart = async (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    await onUpdateCart(updatedCart);
  };

  const handleAddUpsell = async (upsellProd: any) => {
    // Record client click metric
    await onTriggerMetricClick(upsellProd.price);
    
    // Add to cart
    const existing = cart.find(item => item.id === upsellProd.id);
    let updatedCart: CartItem[] = [];
    if (existing) {
      updatedCart = cart.map(item =>
        item.id === upsellProd.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...upsellProd, quantity: 1 }];
    }
    await onUpdateCart(updatedCart);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartQtyCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
      {/* Product Catalog Column */}
      <div className="xl:col-span-7 space-y-6">
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-cyan-400" />
                Live Shop Simulator Frontend
              </h3>
              <p className="text-xs text-slate-400">Add products to cart to simulate shopper interactions.</p>
            </div>
            <button
              onClick={() => onUpdateCart([])}
              className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              CLEAR CART
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map(product => {
              const isAdded = cart.some(item => item.id === product.id);
              return (
                <div key={product.id} className="group rounded-lg border border-white/5 bg-black/40 p-3 hover:border-white/10 transition-all duration-300 flex gap-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-900">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-slate-400 uppercase font-mono">
                      {product.category}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-all line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold font-mono text-cyan-400">${product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="rounded bg-white/5 border border-white/10 p-1 hover:bg-cyan-400 hover:border-cyan-500 hover:text-black transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Cart state indicator inside dashboard */}
        <div className="rounded-xl border border-white/5 bg-[#0e1322]/40 p-5 backdrop-blur-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cart State Audit</h4>
          {cart.length === 0 ? (
            <p className="text-xs text-slate-500">Shopper cart is empty.</p>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-white/[0.01] p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">x{item.quantity}</span>
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/5 pt-3 mt-3 flex justify-between text-xs font-bold">
                <span className="text-slate-400">ESTIMATED ORDER SUBTOTAL:</span>
                <span className="text-cyan-400 font-mono text-sm">${cartSubtotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Mobile Device Frame Preview Column */}
      <div className="xl:col-span-5 flex justify-center">
        <div className="relative w-full max-w-[360px] rounded-[40px] border-[6px] border-slate-800 bg-[#070b13] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] aspect-[9/18.5] flex flex-col justify-between overflow-hidden">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
            <span className="w-12 h-1 bg-black rounded-full" />
          </div>

          {/* Interactive Screen Container */}
          <div className="relative h-full w-full flex flex-col justify-between pt-5 z-10">
            {/* Storefront Navigation Header inside phone */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{settings.storeName}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDrawerOpen(true)}
                  className="relative p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {cartQtyCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                      {cartQtyCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Store Main Content view */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-600 mb-2.5" />
              <h5 className="text-xs font-bold text-white">Simulated Mobile Storefront</h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Click the shopping bag icon or add items on the left to activate the dynamic Smart Drawer.
              </p>
              
              <button 
                onClick={() => setDrawerOpen(true)}
                className="mt-4 px-4 py-1.5 rounded text-[10px] font-bold text-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                style={{ background: settings.buttonColor, color: settings.buttonTextColor }}
              >
                <Eye className="h-3.5 w-3.5" />
                MANUALLY TEST DRAWER
              </button>
            </div>

            {/* Bottom Bar indicator */}
            <div className="w-20 h-1 bg-white/20 rounded-full mx-auto mt-2" />

            {/* ============================================== */}
            {/* THE ACTUAL CAR DRAWER WIDGET OVERLAY PREVIEW */}
            {/* ============================================== */}
            <div 
              className={`absolute inset-0 bg-black/70 backdrop-blur-sm z-40 transition-all duration-300 ${
                drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setDrawerOpen(false)}
            />

            <div 
              className="absolute top-0 bottom-0 right-0 w-[85%] z-50 flex flex-col justify-between transition-transform duration-300 border-l border-white/10"
              style={{ 
                transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
                backgroundColor: settings.backgroundColor,
                backdropFilter: settings.glassmorphism ? "blur(12px)" : "none",
                boxShadow: settings.glowEffect ? `-5px 0 20px ${settings.themeColor}33` : "none"
              }}
            >
              {/* Widget Header */}
              <div 
                className="p-3.5 border-b border-white/5 flex justify-between items-center relative"
                style={{ borderBottomColor: settings.glowEffect ? `${settings.themeColor}33` : "rgba(255,255,255,0.05)" }}
              >
                <div>
                  <div 
                    className="text-xs font-extrabold uppercase tracking-tight text-white"
                    style={{ textShadow: settings.glowEffect ? `0 0 8px ${settings.themeColor}` : "none" }}
                  >
                    {settings.drawerTitle}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{settings.drawerSubTitle}</div>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)} 
                  className="text-slate-400 hover:text-red-400 font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              {/* Widget Content Section */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-[10px] text-slate-500">
                    Your shopping grid is unpopulated.
                  </div>
                ) : (
                  <>
                    {/* Cart Items list */}
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-2 bg-white/[0.02] p-2 rounded border border-white/5">
                          <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded bg-slate-900 flex-shrink-0" />
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <span className="text-[10px] font-bold text-white truncate">{item.name}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px]" style={{ color: settings.themeColor }}>${item.price.toFixed(2)}</span>
                              <span className="text-[8px] text-slate-400">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Upsell Panel Container */}
                    <div className="rounded p-2.5 border border-dashed border-white/10 bg-white/[0.01] space-y-2 relative overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase px-1 rounded text-black" style={{ backgroundColor: settings.themeColor }}>
                          {userTier === "premium" ? "AI CHIP ACTIVE" : "AI OPTIMIZED"}
                        </span>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
                          Upsell Suggestions
                        </span>
                      </div>

                      {/* AI Call warning / note */}
                      {aiWarning && (
                        <div className="text-[8px] text-yellow-500 flex items-center gap-1">
                          <AlertTriangle className="h-2 w-2" />
                          <span>{aiWarning}</span>
                        </div>
                      )}

                      {loadingAI ? (
                        <div className="py-4 text-center text-[9px] text-slate-400 flex flex-col items-center justify-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                          <span>Gemini Flash is computing recommendations...</span>
                        </div>
                      ) : recommendations.length === 0 ? (
                        <div className="text-center text-[8px] text-slate-500">
                          No further complimentary upgrades found.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {recommendations.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="bg-black/60 p-1.5 rounded border border-white/[0.02] flex gap-2 items-center hover:border-cyan-500/20 transition-all">
                              <img src={item.image} alt={item.name} className="h-8 w-8 object-cover rounded bg-slate-900 flex-shrink-0" />
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="text-[9px] font-bold text-white truncate">{item.name}</div>
                                <div className="text-[8px] text-slate-300 italic line-clamp-2 leading-relaxed font-serif">"{item.hook}"</div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-[9px] font-mono text-cyan-400">${item.price.toFixed(2)}</span>
                                  <button 
                                    onClick={() => handleAddUpsell(item)}
                                    className="px-2 py-0.5 rounded text-[8px] font-black"
                                    style={{ background: settings.buttonColor, color: settings.buttonTextColor }}
                                  >
                                    + ADD
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Widget Footer Section */}
              <div className="p-3 border-t border-white/5 bg-black/30 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Estimated Subtotal</span>
                  <span className="font-bold text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                <button 
                  className="w-full py-2 rounded text-[10px] font-extrabold tracking-widest text-center"
                  style={{ 
                    background: settings.buttonColor, 
                    color: settings.buttonTextColor,
                    boxShadow: settings.glowEffect ? `0 2px 10px ${settings.themeColor}4d` : "none" 
                  }}
                  onClick={() => alert("Simulation purchase successful!")}
                >
                  PROCEED TO SECURE CHECKOUT
                </button>
              </div>

            </div>
            {/* ============================================== */}

          </div>
        </div>
      </div>
    </div>
  );
}
