import React, { useState } from "react";
import { Save, Sparkles, RefreshCw, Sliders } from "lucide-react";
import { UserSettings } from "../types";

interface CustomizerTabProps {
  settings: UserSettings;
  onSave: (updated: Partial<UserSettings>) => Promise<void>;
}

const PRESETS = [
  {
    name: "Cyberpunk Cyan (Default)",
    themeColor: "#00F0FF",
    buttonColor: "linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)",
    backgroundColor: "#0B0F19",
    borderRadius: "12px",
    glowEffect: true,
    glassmorphism: true
  },
  {
    name: "Acid Neon Green",
    themeColor: "#39FF14",
    buttonColor: "linear-gradient(135deg, #39FF14 0%, #006611 100%)",
    backgroundColor: "#050B05",
    borderRadius: "4px",
    glowEffect: true,
    glassmorphism: false
  },
  {
    name: "Hot Crimson Pink",
    themeColor: "#FF007F",
    buttonColor: "linear-gradient(135deg, #FF007F 0%, #7A001E 100%)",
    backgroundColor: "#0D050A",
    borderRadius: "20px",
    glowEffect: true,
    glassmorphism: true
  },
  {
    name: "Midnight Royal Gold",
    themeColor: "#FFD700",
    buttonColor: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
    backgroundColor: "#080810",
    borderRadius: "8px",
    glowEffect: false,
    glassmorphism: true
  }
];

export default function CustomizerTab({ settings, onSave }: CustomizerTabProps) {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm(prev => ({
      ...prev,
      ...preset
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await onSave(form);
      setMsg("Settings successfully pushed to live widget pipeline!");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg("Failed to update merchant settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Controls */}
      <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Visual Customizer Settings</h3>
        </div>

        {/* Quick Style Presets */}
        <div className="mb-6">
          <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Quick Luxury Style Presets
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-left text-xs font-semibold hover:border-cyan-500/50 hover:bg-white/10 transition-all text-slate-200"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.themeColor }} />
                  <span className="truncate">{preset.name}</span>
                </div>
                <div className="h-1.5 w-full rounded-sm" style={{ background: preset.buttonColor }} />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store URL</label>
              <input
                type="text"
                name="storeUrl"
                value={form.storeUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="https://my-store.myshopify.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store Display Name</label>
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="e.g. Cyber Streetwear"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drawer Header Title</label>
              <input
                type="text"
                name="drawerTitle"
                value={form.drawerTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drawer Header Subtitle</label>
              <input
                type="text"
                name="drawerSubTitle"
                value={form.drawerSubTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Theme Neon Accent</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="themeColor"
                  value={form.themeColor}
                  onChange={handleChange}
                  className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-black/40 p-1"
                />
                <input
                  type="text"
                  name="themeColor"
                  value={form.themeColor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white uppercase focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drawer Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="backgroundColor"
                  value={form.backgroundColor}
                  onChange={handleChange}
                  className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-black/40 p-1"
                />
                <input
                  type="text"
                  name="backgroundColor"
                  value={form.backgroundColor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white uppercase focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Border Roundness</label>
              <select
                name="borderRadius"
                value={form.borderRadius}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="0px">Sharp Cyber (0px)</option>
                <option value="4px">Subtle (4px)</option>
                <option value="8px">Regular (8px)</option>
                <option value="12px">Curved (12px)</option>
                <option value="20px">Glass Oval (20px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Button Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="buttonTextColor"
                  value={form.buttonTextColor}
                  onChange={handleChange}
                  className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-black/40 p-1"
                />
                <input
                  type="text"
                  name="buttonTextColor"
                  value={form.buttonTextColor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Button Accent Color / CSS Gradient</label>
            <input
              type="text"
              name="buttonColor"
              value={form.buttonColor}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-white/5 bg-white/[0.01] p-3 hover:bg-white/[0.03]">
              <input
                type="checkbox"
                name="autoOpen"
                checked={form.autoOpen}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="block text-xs font-bold text-white">Auto-Open Trigger</span>
                <span className="block text-[10px] text-slate-400">Slides open after load</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-white/5 bg-white/[0.01] p-3 hover:bg-white/[0.03]">
              <input
                type="checkbox"
                name="glowEffect"
                checked={form.glowEffect}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="block text-xs font-bold text-white">Neon Glow Effects</span>
                <span className="block text-[10px] text-slate-400">Renders visual drop shadows</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-white/5 bg-white/[0.01] p-3 hover:bg-white/[0.03]">
              <input
                type="checkbox"
                name="glassmorphism"
                checked={form.glassmorphism}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="block text-xs font-bold text-white">Glassmorphism</span>
                <span className="block text-[10px] text-slate-400">Frosted backdrop filter</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            {msg && (
              <span className="text-xs font-semibold text-cyan-400 animate-pulse">{msg}</span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-[#030712] hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  PULSING GRID...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  PUSH LIVE SETTINGS
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Integration Widget Guide card */}
      <div className="rounded-xl border border-white/5 bg-[#0e1322]/60 p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Live Store Injector Script</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Connect this Smart Cart Drawer & AI Upsell directly to your Shopify, custom HTML, WooCommerce, or Webflow site. Copy the line below and place it before the closing <code className="text-cyan-300 font-mono text-[11px]">&lt;/body&gt;</code> tag.
          </p>

          <div className="rounded-lg bg-black/60 p-4 border border-white/10 font-mono text-xs select-all text-slate-300 break-all space-y-2">
            <span className="text-slate-500">&lt;!-- Smart Cart Drawer Injector --&gt;</span>
            <div className="text-cyan-300">
              {`&lt;script src="${window.location.origin}/widget.js" defer&gt;&lt;/script&gt;`}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Served through dynamic edge server</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>Gzip compressed lightweight package (&lt;4KB)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              <span>Syncs automatically when config changes</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="rounded-lg bg-cyan-950/20 p-3 border border-cyan-500/20 text-xs text-cyan-300">
            <strong>Pro Tip:</strong> Changing options on the left instantly updates your site's client script cache. Try testing this in the live simulator tab!
          </div>
        </div>
      </div>
    </div>
  );
}
