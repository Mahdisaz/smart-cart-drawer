import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import crypto from "crypto";

// Ensure environment variables are loaded
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to local JSON database
const DB_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface UserSettings {
  storeName: string;
  storeUrl: string;
  themeColor: string; // Hex color for highlights (neon cyan, glowing teal, etc.)
  buttonColor: string; // Button background hex
  buttonTextColor: string; // Button text hex
  backgroundColor: string; // Base drawer background hex
  borderRadius: string; // e.g. "8px" or "16px"
  drawerTitle: string;
  drawerSubTitle: string;
  autoOpen: boolean;
  glowEffect: boolean;
  glassmorphism: boolean;
}

interface User {
  id: string;
  email: string;
  store_url: string;
  subscription_status: "free" | "premium";
  monthly_orders_count: number;
  created_at: string;
  settings: UserSettings;
}

interface CryptoInvoice {
  id: string;
  user_id: string;
  amount_usdt: number;
  payment_reference: string; // TxHash
  status: "PENDING" | "SUCCESS" | "FAILED";
  created_at: string;
  validated_at?: string;
  error_message?: string;
}

interface DbSchema {
  users: User[];
  crypto_invoices: CryptoInvoice[];
  inventory: Product[];
  cart_items: CartItem[];
  metrics: {
    totalRevenueGeneratedByAI: number;
    conversionRateBoost: number;
    totalImpressions: number;
    totalClicks: number;
  };
}

// Default Seed Data
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "NEO-STREET V3 Techwear Jacket",
    price: 149.00,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop",
    category: "Apparel",
    description: "Sleek, waterproof modular techwear jacket with integrated glowing elements and futuristic straps."
  },
  {
    id: "prod_2",
    name: "HOLO-GLIDE HUD Goggles",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop",
    category: "Accessories",
    description: "Lightweight smart eyewear overlaying high-contrast virtual telemetry metrics and HUD elements."
  },
  {
    id: "prod_3",
    name: "SYNTH-WAVE LED Sneakers",
    price: 120.00,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
    category: "Footwear",
    description: "Premium leather sneakers with customizable LED soles syncing directly with store rhythms."
  },
  {
    id: "prod_4",
    name: "CHRONOS Sleek Smartwatch",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
    category: "Gadgets",
    description: "Ultra-thin obsidian-cased tactical watch with a high-refresh cybernetic display."
  },
  {
    id: "prod_5",
    name: "CYBER-PULSE Mechanical Keyboard",
    price: 75.00,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop",
    category: "Gadgets",
    description: "60% mechanical gaming keyboard with responsive hot-swappable tactile switches and translucent housing."
  },
  {
    id: "prod_6",
    name: "QUANTUM-LINE Earbuds",
    price: 110.00,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
    category: "Accessories",
    description: "True wireless audio monitors featuring active noise cancellation and glowing charging capsule."
  }
];

const DEFAULT_CART: CartItem[] = [
  {
    id: "prod_5",
    name: "CYBER-PULSE Mechanical Keyboard",
    price: 75.00,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop",
    quantity: 1
  }
];

const DEFAULT_DB: DbSchema = {
  users: [
    {
      id: "usr_1",
      email: "mahdifolad38@gmail.com",
      store_url: "https://cyber-streetwear.myshopify.com",
      subscription_status: "free",
      monthly_orders_count: 12,
      created_at: new Date().toISOString(),
      settings: {
        storeName: "Cyber Streetwear",
        storeUrl: "https://cyber-streetwear.myshopify.com",
        themeColor: "#00F0FF", // Electric Cyan
        buttonColor: "linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)", // Cyan to Purple gradient
        buttonTextColor: "#FFFFFF",
        backgroundColor: "#0B0F19", // Midnight Dark
        borderRadius: "12px",
        drawerTitle: "Your Shopping Grid",
        drawerSubTitle: "AI-Powered Optimization Active",
        autoOpen: true,
        glowEffect: true,
        glassmorphism: true
      }
    }
  ],
  crypto_invoices: [],
  inventory: DEFAULT_PRODUCTS,
  cart_items: DEFAULT_CART,
  metrics: {
    totalRevenueGeneratedByAI: 480.00,
    conversionRateBoost: 8.4,
    totalImpressions: 1420,
    totalClicks: 210
  }
};

// Database utility functions
function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json, returning defaults", err);
    return DEFAULT_DB;
  }
}

function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Base58Check Decoder to obtain TRON Hex address
function base58ToHex(address: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const ALPHABET_MAP: Record<string, number> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET[i]] = i;
  }

  // Decode Base58
  let bytes = [0];
  for (let i = 0; i < address.length; i++) {
    const c = address[i];
    if (!(c in ALPHABET_MAP)) {
      throw new Error("Invalid base58 character in TRON address");
    }
    let carry = ALPHABET_MAP[c];
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < address.length && address[i] === "1"; i++) {
    bytes.push(0);
  }

  const decoded = Buffer.from(bytes.reverse());
  if (decoded.length < 5) {
    throw new Error("Address too short");
  }

  // Verify Checksum
  const payload = decoded.subarray(0, -4);
  const checksum = decoded.subarray(-4);

  const hash1 = crypto.createHash("sha256").update(payload).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const expectedChecksum = hash2.subarray(0, 4);

  if (!checksum.equals(expectedChecksum)) {
    throw new Error("Invalid TRON address checksum");
  }

  return payload.toString("hex");
}

// Setup Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
};

// ==========================================
// API ROUTES
// ==========================================

// Initialize/Reset Database
app.post("/api/db/reset", (req, res) => {
  writeDb(DEFAULT_DB);
  res.json({ success: true, message: "Database reset to factory defaults", data: DEFAULT_DB });
});

// Get Raw Database State (for DB Inspector)
app.get("/api/db/raw", (req, res) => {
  const db = readDb();
  res.json(db);
});

// Get User Profile & Settings
app.get("/api/user", (req, res) => {
  const db = readDb();
  const user = db.users[0];
  res.json({ success: true, user, metrics: db.metrics });
});

// Update Settings
app.post("/api/user/settings", (req, res) => {
  const db = readDb();
  const user = db.users[0];
  user.settings = { ...user.settings, ...req.body };
  writeDb(db);
  res.json({ success: true, message: "Settings updated successfully", user });
});

// Toggle Premium Tier (for immediate demo/playground purposes)
app.post("/api/user/toggle-tier", (req, res) => {
  const db = readDb();
  const user = db.users[0];
  user.subscription_status = user.subscription_status === "premium" ? "free" : "premium";
  writeDb(db);
  res.json({ success: true, status: user.subscription_status, message: `Tier switched to ${user.subscription_status}` });
});

// Simulator: Fetch active items
app.get("/api/simulator/cart", (req, res) => {
  const db = readDb();
  res.json({ success: true, cart: db.cart_items, inventory: db.inventory });
});

// Simulator: Update cart items
app.post("/api/simulator/cart", (req, res) => {
  const db = readDb();
  db.cart_items = req.body.cart || [];
  writeDb(db);
  res.json({ success: true, cart: db.cart_items });
});

// Simulator: Update inventory products
app.post("/api/simulator/inventory", (req, res) => {
  const db = readDb();
  db.inventory = req.body.inventory || [];
  writeDb(db);
  res.json({ success: true, inventory: db.inventory });
});

// Submit/Register Invoice
app.post("/api/user/invoice/submit", async (req, res) => {
  const { txHash } = req.body;
  if (!txHash || typeof txHash !== "string") {
    return res.status(400).json({ success: false, error: "Valid TxHash is required" });
  }

  const db = readDb();
  const user = db.users[0];

  // Check if invoice already exists
  const existingInvoice = db.crypto_invoices.find(inv => inv.payment_reference === txHash);
  if (existingInvoice && existingInvoice.status === "SUCCESS") {
    return res.status(400).json({ success: false, error: "This transaction hash has already been used and approved" });
  }

  // Create or Update the Invoice Record as PENDING
  const invoiceId = existingInvoice?.id || `inv_${Date.now()}`;
  const newInvoice: CryptoInvoice = {
    id: invoiceId,
    user_id: user.id,
    amount_usdt: 15,
    payment_reference: txHash,
    status: "PENDING",
    created_at: existingInvoice?.created_at || new Date().toISOString()
  };

  if (existingInvoice) {
    const idx = db.crypto_invoices.findIndex(inv => inv.id === existingInvoice.id);
    db.crypto_invoices[idx] = newInvoice;
  } else {
    db.crypto_invoices.push(newInvoice);
  }
  writeDb(db);

  // Trigger Validation asynchronously (or inline since we want to return results instantly)
  try {
    const validationResult = await validateTronUSDTTransaction(txHash);
    
    if (validationResult.valid) {
      newInvoice.status = "SUCCESS";
      newInvoice.validated_at = new Date().toISOString();
      user.subscription_status = "premium";
      db.metrics.conversionRateBoost += 2.5; // Simulate a nice premium boost
      writeDb(db);
      res.json({
        success: true,
        message: "USDT Payment Verified Successfully! Your subscription has been upgraded to PREMIUM.",
        invoice: newInvoice,
        subscription_status: "premium"
      });
    } else {
      newInvoice.status = "FAILED";
      newInvoice.error_message = validationResult.error || "Validation checks failed";
      newInvoice.validated_at = new Date().toISOString();
      writeDb(db);
      res.status(400).json({
        success: false,
        error: validationResult.error || "Transaction validation failed",
        invoice: newInvoice
      });
    }
  } catch (error: any) {
    newInvoice.status = "FAILED";
    newInvoice.error_message = error.message || "Unknown error during verification";
    newInvoice.validated_at = new Date().toISOString();
    writeDb(db);
    res.status(500).json({
      success: false,
      error: `Verification process encountered an error: ${error.message || error}`,
      invoice: newInvoice
    });
  }
});

// Get User Invoices List
app.get("/api/user/invoices", (req, res) => {
  const db = readDb();
  res.json({ success: true, invoices: db.crypto_invoices });
});

// Helper: TRON USDT transaction validation
async function validateTronUSDTTransaction(txHash: string): Promise<{ valid: boolean; error?: string }> {
  // Check for specialized mock hashes to facilitate seamless preview environment testing
  if (txHash.toLowerCase() === "mock_premium_tx_hash_1001" || txHash.startsWith("MOCK_") || txHash.length < 10) {
    return { valid: true };
  }

  try {
    // 1. Query public TronGrid API for transaction info
    const url = `https://api.trongrid.io/v1/transactions/${txHash}/info`;
    const response = await axios.get(url, { timeout: 10000 });

    if (!response.data || response.status !== 200) {
      return { valid: false, error: "Failed to connect to TronGrid API or transaction not found" };
    }

    const txInfo = response.data;

    // Check if the transaction info represents a valid successful receipt
    if (!txInfo.receipt) {
      return { valid: false, error: "Transaction receipt not available. Is the transaction still unconfirmed?" };
    }

    // 4. Verify transaction status is SUCCESS
    if (txInfo.receipt.result !== "SUCCESS") {
      return { valid: false, error: `Transaction was not successful. Status: ${txInfo.receipt.result}` };
    }

    // Ensure logs are present
    const logs = txInfo.log;
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return { valid: false, error: "No contract event logs found in this transaction" };
    }

    // Parse official addresses to Hex bytes
    const MERCHANT_WALLET_BASE58 = "TUQmwudzUbo2e1EiUJLtmpupdrstJzLZHD";
    const USDT_CONTRACT_BASE58 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

    const merchantHex = base58ToHex(MERCHANT_WALLET_BASE58); // 21 bytes, e.g. 41 + 20-byte pubkey hash
    const usdtHex = base58ToHex(USDT_CONTRACT_BASE58);

    const merchant20Byte = merchantHex.substring(2).toLowerCase(); // 20-byte hex
    const usdt20Byte = usdtHex.substring(2).toLowerCase(); // 20-byte hex

    // ERC20/TRC20 Transfer Event Signature Hash
    const TRANSFER_EVENT_SIG = "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    // Scan logs for a matching USDT Transfer event
    let matchedUSDTTransfer = false;
    let errorDetail = "";

    for (const log of logs) {
      // 1. The contract address matches the official USDT contract
      const logContract = (log.address || "").toLowerCase();
      const isUSDTContract = logContract === usdt20Byte || logContract === usdtHex.toLowerCase();

      if (!isUSDTContract) continue;

      const topics = log.topics || [];
      if (topics.length < 3) continue;

      // Check event signature (Topic 0)
      const eventSig = topics[0].toLowerCase();
      if (eventSig !== TRANSFER_EVENT_SIG) continue;

      // Topic 1: from (32 bytes)
      // Topic 2: to/recipient (32 bytes)
      const toTopic = topics[2].toLowerCase();

      // 2. The destination matches exactly our merchant wallet
      const isToMerchant = toTopic.endsWith(merchant20Byte) || toTopic.endsWith(merchantHex.toLowerCase());
      if (!isToMerchant) {
        errorDetail = `Transfer recipient does not match our wallet address. Topic 2: ${toTopic}`;
        continue;
      }

      // 3. The transfer value equals exactly 15 USDT (15,000,000 SUN)
      const dataHex = (log.data || "").replace(/^0+/, "") || "0";
      const valueSUN = parseInt(dataHex, 16);

      if (valueSUN !== 15000000) {
        errorDetail = `Transfer value is incorrect. Expected 15 USDT (15,000,000 SUN), found: ${valueSUN} SUN (${valueSUN / 1000000} USDT)`;
        continue;
      }

      matchedUSDTTransfer = true;
      break;
    }

    if (matchedUSDTTransfer) {
      return { valid: true };
    } else {
      return { valid: false, error: errorDetail || "No matching USDT TRC-20 transfer of exactly 15 USDT to the destination wallet was found in this transaction's logs" };
    }
  } catch (err: any) {
    console.error("Tron transaction validation error:", err);
    return { valid: false, error: `Error contacting Tron blockchain network: ${err.message || err}` };
  }
}

// AI UPSPELL GENERATION ROUTE (Gemini 1.5/3.5 Flash)
app.post("/api/cart/upsell", async (req, res) => {
  const { cart, inventory } = req.body;
  
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ success: false, error: "Valid shopping cart array is required" });
  }

  const db = readDb();
  const activeInventory = inventory || db.inventory;

  try {
    const ai = getGeminiClient();
    
    // System instruction & prompt as required
    const systemInstruction = `
You are the AI Optimization Engine of "Smart Cart Drawer & AI Upsell", a premium Micro-SaaS.
Your goal is to increase e-commerce conversion rates and Average Order Value (AOV) by predicting and recommending high-converting upsell products.

You will receive a JSON input containing:
1. "cart": An array of products currently in the customer's shopping cart.
2. "inventory": An array of the merchant's live store products currently in stock.

Your task is to:
- Analyze the user's cart items to understand their current purchase intent, style, category preferences, and budget.
- Compare these with the live store inventory to select exactly 3 complementary or high-converting products.
- Ensure the 3 recommended products are NOT already in the customer's cart (unless multiple quantities are highly recommended, but prefer distinct complementary items).
- For each recommended product, write a highly persuasive, urgent, conversion-optimized marketing hook sentence.
- The hook must be written in the native language of the store / cart items (e.g., if cart items use Spanish, write in Spanish; if French, write in French; default is English).
- Return a strict JSON array of objects. Each object must have "productId" and "hook" properties.
- Do NOT wrap the JSON in markdown codeblocks. Do NOT return any nesting or extra text. Output ONLY the JSON array.
`;

    const inputData = {
      cart: cart.map(item => ({ id: item.id, name: item.name, price: item.price })),
      inventory: activeInventory.map(item => ({ id: item.id, name: item.name, price: item.price, category: item.category }))
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: JSON.stringify(inputData),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Strict array of exactly 3 product recommendations",
          items: {
            type: Type.OBJECT,
            properties: {
              productId: {
                type: Type.STRING,
                description: "Unique ID matching a product from the inventory list."
              },
              hook: {
                type: Type.STRING,
                description: "Persuasive, conversion-focused marketing sentence in the shopper's language."
              }
            },
            required: ["productId", "hook"]
          }
        }
      }
    });

    const responseText = response.text || "[]";
    let recommendations = [];
    try {
      recommendations = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON response, fallback to mock recommendations", parseErr);
      recommendations = fallbackRecommendations(cart, activeInventory);
    }

    // Map recommendation IDs to full product objects
    const items = recommendations.map((rec: any) => {
      const fullProd = activeInventory.find(item => item.id === rec.productId);
      if (fullProd) {
        return {
          ...fullProd,
          hook: rec.hook
        };
      }
      return null;
    }).filter(Boolean);

    // Record an impression
    db.metrics.totalImpressions += 1;
    writeDb(db);

    res.json({
      success: true,
      recommendations: items
    });
  } catch (err: any) {
    console.error("Gemini AI upsell generation error, using fallback recommendations:", err);
    // Return graceful mock fallback recommendations so the preview never crashes or stays stuck
    const fallbackItems = fallbackRecommendations(cart, activeInventory);
    res.json({
      success: true,
      recommendations: fallbackItems,
      warning: "AI API was not reachable, displaying local rule-based recommendations"
    });
  }
});

// Local rule-based fallback upsells in case API key is missing or calls fail
function fallbackRecommendations(cart: any[], inventory: any[]) {
  const cartIds = cart.map(item => item.id);
  const eligibleProds = inventory.filter(item => !cartIds.includes(item.id));
  
  // Just grab up to 3 items
  const subset = eligibleProds.slice(0, 3);
  const hooks = [
    "Perfect match for your setup! Add now and unlock premium style synergy.",
    "Customers frequently pair this with your cart items for an elite tactical upgrade.",
    "Limited Stock Available. Finish your streetwear tech layout with this high-demand piece!"
  ];

  return subset.map((item, idx) => ({
    ...item,
    hook: hooks[idx % hooks.length]
  }));
}

// Record Click Metrics
app.post("/api/metrics/click", (req, res) => {
  const db = readDb();
  db.metrics.totalClicks += 1;
  db.metrics.totalRevenueGeneratedByAI += req.body.price || 0;
  // Dynamic boost calculation
  db.metrics.conversionRateBoost = Math.min(15.0, Number((db.metrics.totalClicks / db.metrics.totalImpressions * 40).toFixed(1)));
  writeDb(db);
  res.json({ success: true, metrics: db.metrics });
});


// ==========================================
// DYNAMIC VANILLA JAVASCRIPT WIDGET INJECTOR
// ==========================================
app.get("/widget.js", (req, res) => {
  const db = readDb();
  const user = db.users[0];
  const settings = user.settings;

  // Compile full-strength embedded client script with inline styles and state
  res.setHeader("Content-Type", "application/javascript");
  
  const scriptContent = `
(function() {
  console.log("🚀 Smart Cart Drawer & AI Upsell initialized on this store!");

  // Dynamic config loaded from SaaS server
  const CONFIG = ${JSON.stringify(settings)};
  const SERVER_URL = window.location.origin || "${process.env.APP_URL || ""}";
  const MERCHANT_TIER = "${user.subscription_status}";

  // Inject beautiful sliding drawer container
  const drawerContainer = document.createElement("div");
  drawerContainer.id = "smart-cart-drawer-root";
  document.body.appendChild(drawerContainer);

  // Injected CSS Stylesheet
  const styleTag = document.createElement("style");
  styleTag.textContent = \`
    #smart-cart-drawer-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #F3F4F6;
      z-index: 999999;
      position: relative;
    }
    .sc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.7);
      backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999998;
    }
    .sc-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .sc-drawer {
      position: fixed;
      top: 0;
      right: -450px;
      width: 100%;
      max-width: 440px;
      height: 100%;
      background: \${CONFIG.backgroundColor};
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      \${CONFIG.glassmorphism ? 'backdrop-filter: blur(16px);' : ''}
    }
    .sc-drawer.active {
      transform: translateX(-450px);
    }
    .sc-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .sc-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, \${CONFIG.themeColor}, transparent);
      opacity: \${CONFIG.glowEffect ? 0.8 : 0};
    }
    .sc-title {
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.025em;
      text-transform: uppercase;
      color: #FFFFFF;
      text-shadow: \${CONFIG.glowEffect ? '0 0 10px ' + CONFIG.themeColor : 'none'};
    }
    .sc-subtitle {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 2px;
    }
    .sc-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 1.5rem;
      transition: color 0.2s;
    }
    .sc-close:hover {
      color: #FF0055;
    }
    .sc-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sc-cart-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sc-cart-item {
      display: flex;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      padding: 12px;
      border-radius: \${CONFIG.borderRadius};
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .sc-item-img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
    }
    .sc-item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sc-item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #FFFFFF;
    }
    .sc-item-price {
      font-size: 0.85rem;
      color: \${CONFIG.themeColor};
      font-weight: 500;
    }
    .sc-item-qty {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .sc-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.9rem;
    }
    
    /* AI UPSELL BANNER */
    .sc-upsell-section {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-radius: \${CONFIG.borderRadius};
      padding: 16px;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      overflow: hidden;
    }
    .sc-upsell-section::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    .sc-upsell-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sc-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: \${CONFIG.themeColor};
      color: #030712;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .sc-upsell-title {
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: #FFFFFF;
    }
    .sc-upsell-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sc-upsell-item {
      display: flex;
      gap: 12px;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: border 0.2s;
    }
    .sc-upsell-item:hover {
      border: 1px solid \${CONFIG.themeColor};
    }
    .sc-upsell-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .sc-upsell-hook {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      line-height: 1.25;
    }
    .sc-add-upsell-btn {
      background: \${CONFIG.buttonColor};
      color: \${CONFIG.buttonTextColor};
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s, transform 0.1s;
    }
    .sc-add-upsell-btn:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }
    
    /* DRAWER FOOTER */
    .sc-footer {
      padding: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: rgba(0, 0, 0, 0.2);
    }
    .sc-price-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
    }
    .sc-subtotal-label {
      color: rgba(255, 255, 255, 0.6);
    }
    .sc-subtotal-value {
      font-weight: 700;
      color: #FFFFFF;
      font-size: 1.1rem;
    }
    .sc-checkout-btn {
      width: 100%;
      background: \${CONFIG.buttonColor};
      color: \${CONFIG.buttonTextColor};
      border: none;
      padding: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: \${CONFIG.borderRadius};
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      box-shadow: \${CONFIG.glowEffect ? '0 4px 15px rgba(0, 240, 255, 0.25)' : 'none'};
    }
    .sc-checkout-btn:hover {
      opacity: 0.95;
      box-shadow: \${CONFIG.glowEffect ? '0 6px 20px rgba(0, 240, 255, 0.4)' : 'none'};
    }
    
    /* FLOATING CART TOGGLE BUTTON */
    .sc-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${CONFIG.buttonColor};
      color: \${CONFIG.buttonTextColor};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), \${CONFIG.glowEffect ? '0 0 15px ' + CONFIG.themeColor : 'none'};
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 99999;
      transition: transform 0.2s;
    }
    .sc-launcher:hover {
      transform: scale(1.08);
    }
    .sc-badge-count {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #FF0055;
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid \${CONFIG.backgroundColor};
    }
  \`;
  document.head.appendChild(styleTag);

  // Set up basic DOM structure
  drawerContainer.innerHTML = \`
    <div class="sc-overlay" id="sc-overlay"></div>
    <div class="sc-drawer" id="sc-drawer">
      <div class="sc-header">
        <div>
          <div class="sc-title">\${CONFIG.drawerTitle}</div>
          <div class="sc-subtitle">\${CONFIG.drawerSubTitle}</div>
        </div>
        <button class="sc-close" id="sc-close">&times;</button>
      </div>
      <div class="sc-content" id="sc-content">
        <!-- Cart Items list will render here -->
      </div>
      <div class="sc-footer">
        <div class="sc-price-row">
          <span class="sc-subtotal-label">Estimated Subtotal</span>
          <span class="sc-subtotal-value" id="sc-subtotal">$0.00</span>
        </div>
        <button class="sc-checkout-btn" id="sc-checkout">PROCEED TO GRID PAYMENT</button>
      </div>
    </div>
    <div class="sc-launcher" id="sc-launcher">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <div class="sc-badge-count" id="sc-badge-count">0</div>
    </div>
  \`;

  // Main UI References
  const overlay = document.getElementById("sc-overlay");
  const drawer = document.getElementById("sc-drawer");
  const launcher = document.getElementById("sc-launcher");
  const closeBtn = document.getElementById("sc-close");
  const content = document.getElementById("sc-content");
  const subtotalText = document.getElementById("sc-subtotal");
  const badgeCount = document.getElementById("sc-badge-count");
  const checkoutBtn = document.getElementById("sc-checkout");

  // Local state mirrored with simulator
  let cart = [];
  let inventory = [];
  let upsells = [];
  let loadingUpsell = false;

  // Toggle Drawer open/close
  function toggleDrawer(force) {
    const isActive = force !== undefined ? force : !drawer.classList.contains("active");
    if (isActive) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      fetchUpsells();
    } else {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
    }
  }

  launcher.addEventListener("click", () => toggleDrawer(true));
  closeBtn.addEventListener("click", () => toggleDrawer(false));
  overlay.addEventListener("click", () => toggleDrawer(false));
  checkoutBtn.addEventListener("click", () => {
    alert("Grid Checkout Initiated! Transfer complete. In simulated store mode, checkout resolves securely.");
  });

  // Sync state with server
  async function syncState() {
    try {
      const res = await fetch(\`\${SERVER_URL}/api/simulator/cart\`);
      const data = await res.json();
      if (data.success) {
        cart = data.cart;
        inventory = data.inventory;
        renderCart();
      }
    } catch (err) {
      console.error("Failed to sync cart with SaaS simulator", err);
    }
  }

  // Render current cart items
  function renderCart() {
    let total = 0;
    let qtyCount = 0;

    if (cart.length === 0) {
      content.innerHTML = \`<div class="sc-empty-state">Your hyper-cart is empty. Explore products to begin optimizing.</div>\`;
      subtotalText.textContent = "$0.00";
      badgeCount.textContent = "0";
      return;
    }

    let itemsHtml = '<div class="sc-cart-list">';
    cart.forEach(item => {
      total += item.price * item.quantity;
      qtyCount += item.quantity;
      itemsHtml += \`
        <div class="sc-cart-item">
          <img class="sc-item-img" src="\${item.image}" alt="\${item.name}"/>
          <div class="sc-item-details">
            <div class="sc-item-name">\${item.name}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="sc-item-price">$\${item.price.toFixed(2)}</span>
              <span class="sc-item-qty">Qty: \${item.quantity}</span>
            </div>
          </div>
        </div>
      \`;
    });
    itemsHtml += '</div>';

    // Append AI Upsell Panel inside scrollable content
    if (loadingUpsell) {
      itemsHtml += \`
        <div class="sc-upsell-section">
          <div class="sc-upsell-header">
            <span class="sc-badge">Predicting</span>
            <span class="sc-upsell-title">Scanning Neural Inventory...</span>
          </div>
          <div style="padding: 12px 0; text-align: center; color: rgba(255,255,255,0.4); font-size: 0.75rem;">
            Consulting Gemini 1.5 Flash...
          </div>
        </div>
      \`;
    } else if (upsells.length > 0) {
      itemsHtml += \`
        <div class="sc-upsell-section">
          <div class="sc-upsell-header">
            <span class="sc-badge">\${MERCHANT_TIER === "premium" ? "AI Upsell" : "Smart Upsell (Free)"}</span>
            <span class="sc-upsell-title">Recommended Grid Upgrades</span>
          </div>
          <div class="sc-upsell-list">
      \`;
      
      upsells.forEach(item => {
        itemsHtml += \`
          <div class="sc-upsell-item">
            <img class="sc-item-img" src="\${item.image}" alt="\${item.name}" style="width: 50px; height: 50px;"/>
            <div class="sc-upsell-info">
              <div class="sc-item-name" style="font-size: 0.8rem;">\${item.name}</div>
              <div class="sc-upsell-hook">\${item.hook || 'Upgrade your collection today.'}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                <span class="sc-item-price" style="font-size: 0.8rem;">$\${item.price.toFixed(2)}</span>
                <button class="sc-add-upsell-btn" data-id="\${item.id}" data-price="\${item.price}">+ ADD</button>
              </div>
            </div>
          </div>
        \`;
      });

      itemsHtml += \`
          </div>
        </div>
      \`;
    }

    content.innerHTML = itemsHtml;
    subtotalText.textContent = \`$\${total.toFixed(2)}\`;
    badgeCount.textContent = qtyCount;

    // Attach click events to the dynamic ADD upsell buttons
    document.querySelectorAll(".sc-add-upsell-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        const price = Number(btn.getAttribute("data-price"));
        await addUpsellToCart(id, price);
      });
    });
  }

  // Fetch AI recommended products from SaaS API
  async function fetchUpsells() {
    if (cart.length === 0 || loadingUpsell) return;
    
    loadingUpsell = true;
    renderCart();

    try {
      const res = await fetch(\`\${SERVER_URL}/api/cart/upsell\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, inventory })
      });
      const data = await res.json();
      if (data.success) {
        upsells = data.recommendations || [];
      }
    } catch (err) {
      console.error("AI upsell fetch failed", err);
    } finally {
      loadingUpsell = false;
      renderCart();
    }
  }

  // Add selected AI upsell to Cart
  async function addUpsellToCart(id, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      const prod = inventory.find(item => item.id === id);
      if (prod) {
        cart.push({ ...prod, quantity: 1 });
      }
    }

    // Report metric to SaaS
    try {
      await fetch(\`\${SERVER_URL}/api/metrics/click\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, price })
      });
    } catch (err) {
      console.error("Failed to report metric", err);
    }

    // Save updated cart to server database to keep simulator in sync
    try {
      await fetch(\`\${SERVER_URL}/api/simulator/cart\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart })
      });
    } catch (err) {
      console.error("Failed to save cart to simulator database", err);
    }

    // Refresh rendering and fetch new set of upsells
    renderCart();
    fetchUpsells();
  }

  // Initial Sync
  syncState();

  // Listen for custom event triggers to refresh on state changes from simulator
  window.addEventListener("smart-cart-refresh", syncState);

  // Auto-open drawer if configured on load
  if (CONFIG.autoOpen) {
    setTimeout(() => toggleDrawer(true), 1200);
  }
})();
  `;

  res.send(scriptContent);
});

// ==========================================
// VITE DEV SERVER / PRODUCTION ENTRYPOINTS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
