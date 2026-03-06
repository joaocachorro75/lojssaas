import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import axios from "axios";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "vibestore-secret-key";
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const db = new Database("database.db");

// Database Migrations
const tablesToMigrate = [
  "settings", "coupons", "loyalty_points", "abandoned_carts", 
  "affiliates", "affiliate_commissions", "categories", 
  "products", "customers", "orders", "admins"
];

tablesToMigrate.forEach(table => {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    const hasTenantId = info.some(col => col.name === "tenant_id");
    if (!hasTenantId) {
      console.log(`Migrating table ${table}: adding tenant_id column`);
      db.prepare(`ALTER TABLE ${table} ADD COLUMN tenant_id INTEGER DEFAULT 1`).run();
    }
    
    if (table === "settings") {
      const settingsCols = [
        { name: "ai_provider", type: "TEXT DEFAULT 'gemini'" },
        { name: "ai_api_key", type: "TEXT" },
        { name: "ai_model", type: "TEXT" },
        { name: "upsell_enabled", type: "INTEGER DEFAULT 0" },
        { name: "upsell_title", type: "TEXT DEFAULT 'Aproveite também!'" },
        { name: "upsell_product_id", type: "INTEGER" }
      ];
      settingsCols.forEach(col => {
        if (!info.some(c => c.name === col.name)) {
          console.log(`Migrating table settings: adding ${col.name} column`);
          db.prepare(`ALTER TABLE settings ADD COLUMN ${col.name} ${col.type}`).run();
        }
      });
    }

    if (table === "admins") {
      if (info.some(c => c.name === "username") && !info.some(c => c.name === "whatsapp")) {
        console.log(`Migrating table admins: renaming username to whatsapp`);
        db.prepare(`ALTER TABLE admins RENAME COLUMN username TO whatsapp`).run();
      }
    }
  } catch (e) {
    console.error(`Error migrating table ${table}:`, e);
  }
});

// Separate migration for super_admins since it's not in tablesToMigrate
try {
  const info = db.prepare(`PRAGMA table_info(super_admins)`).all() as any[];
  if (info.some(c => c.name === "username") && !info.some(c => c.name === "whatsapp")) {
    console.log(`Migrating table super_admins: renaming username to whatsapp`);
    db.prepare(`ALTER TABLE super_admins RENAME COLUMN username TO whatsapp`).run();
  }
} catch (e) {
  console.error(`Error migrating table super_admins:`, e);
}

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    max_products INTEGER DEFAULT 50,
    features_json TEXT, -- JSON array of features
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- used for subdomain or path
    plan_id INTEGER,
    status TEXT DEFAULT 'active', -- 'active', 'suspended', 'pending'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans (id)
  );

  CREATE TABLE IF NOT EXISTS super_admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER UNIQUE NOT NULL,
    store_name TEXT DEFAULT 'Minha Loja',
    store_description TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#06b6d4',
    secondary_color TEXT DEFAULT '#164e63',
    layout_type TEXT DEFAULT 'modern',
    whatsapp_number TEXT,
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    evolution_instance TEXT,
    mercadopago_public_key TEXT,
    mercadopago_access_token TEXT,
    melhorenvio_token TEXT,
    melhorenvio_sandbox INTEGER DEFAULT 1,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    pix_key TEXT,
    affiliate_system_enabled INTEGER DEFAULT 0,
    default_commission_percent REAL DEFAULT 10,
    loyalty_system_enabled INTEGER DEFAULT 0,
    points_per_real REAL DEFAULT 1,
    points_value_per_point REAL DEFAULT 0.05,
    low_stock_threshold INTEGER DEFAULT 5,
    ai_provider TEXT DEFAULT 'gemini',
    ai_api_key TEXT,
    ai_model TEXT,
    upsell_enabled INTEGER DEFAULT 0,
    upsell_title TEXT DEFAULT 'Aproveite também!',
    upsell_product_id INTEGER,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'percentage',
    value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    active INTEGER DEFAULT 1,
    expires_at DATETIME,
    UNIQUE(tenant_id, code),
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS loyalty_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    customer_id INTEGER,
    order_id INTEGER,
    points REAL NOT NULL,
    type TEXT DEFAULT 'earned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
  );

  CREATE TABLE IF NOT EXISTS abandoned_carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    customer_json TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total_amount REAL NOT NULL,
    recovered INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    pix_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, whatsapp),
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    affiliate_id INTEGER,
    order_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    FOREIGN KEY (affiliate_id) REFERENCES affiliates (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    UNIQUE(tenant_id, slug),
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    weight REAL DEFAULT 0,
    length REAL DEFAULT 0,
    width REAL DEFAULT 0,
    height REAL DEFAULT 0,
    category_id INTEGER,
    image_url TEXT,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    total_points REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, whatsapp),
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    customer_id INTEGER,
    affiliate_id INTEGER,
    coupon_id INTEGER,
    total_amount REAL NOT NULL,
    shipping_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    points_used REAL DEFAULT 0,
    points_earned REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_id TEXT,
    shipping_method TEXT,
    tracking_code TEXT,
    items_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (affiliate_id) REFERENCES affiliates (id),
    FOREIGN KEY (coupon_id) REFERENCES coupons (id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    whatsapp TEXT NOT NULL,
    password TEXT NOT NULL,
    UNIQUE(tenant_id, whatsapp),
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
  );
`);

// Insert default plans if none exist
const planCount = db.prepare("SELECT COUNT(*) as count FROM plans").get() as any;
if (planCount.count === 0) {
  db.prepare("INSERT INTO plans (name, price, max_products, features_json) VALUES (?, ?, ?, ?)").run("Básico", 49.90, 50, JSON.stringify(["Até 50 produtos", "Suporte via Email"]));
  db.prepare("INSERT INTO plans (name, price, max_products, features_json) VALUES (?, ?, ?, ?)").run("Pro", 99.90, 500, JSON.stringify(["Até 500 produtos", "Suporte via WhatsApp", "Sistema de Afiliados"]));
  db.prepare("INSERT INTO plans (name, price, max_products, features_json) VALUES (?, ?, ?, ?)").run("Enterprise", 199.90, 9999, JSON.stringify(["Produtos Ilimitados", "Suporte Prioritário", "Customização Total"]));
}

// Insert default super admin if not exists
const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM super_admins").get() as any;
if (superAdminCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("superadmin123", 10);
  db.prepare("INSERT INTO super_admins (whatsapp, password) VALUES (?, ?)").run("5511999999999", hashedPassword);
}

// Insert initial tenant if none exist (for backward compatibility/initial setup)
const tenantCount = db.prepare("SELECT COUNT(*) as count FROM tenants").get() as any;
if (tenantCount.count === 0) {
  const result = db.prepare("INSERT INTO tenants (name, slug, plan_id) VALUES (?, ?, ?)").run("Minha Loja", "loja1", 1);
  const tenantId = result.lastInsertRowid;
  
  db.prepare("INSERT INTO settings (tenant_id) VALUES (?)").run(tenantId);
  
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO admins (tenant_id, whatsapp, password) VALUES (?, ?, ?)").run(tenantId, "5511888888888", hashedPassword);
  
  db.prepare("INSERT INTO categories (tenant_id, name, slug) VALUES (?, ?, ?)").run(tenantId, "Eletrônicos", "eletronicos");
  db.prepare("INSERT INTO categories (tenant_id, name, slug) VALUES (?, ?, ?)").run(tenantId, "Roupas", "roupas");
  
  db.prepare(`
    INSERT INTO products (tenant_id, name, description, price, stock, weight, length, width, height, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(tenantId, "Smartphone Vibe X", "O melhor smartphone do mercado.", 2999.90, 10, 0.5, 15, 7, 1, 1, "https://picsum.photos/seed/phone/800/800");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Auth Middleware
const authenticateSuperAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!(decoded as any).isSuperAdmin) throw new Error();
    req.superAdminId = (decoded as any).id;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid super admin token" });
  }
};

const getTenantId = (req: any) => {
  // In a real SaaS, this would come from subdomain or a specific header
  // For this demo, we'll use a header 'x-tenant-id' or default to the first tenant
  const tenantId = req.headers['x-tenant-id'];
  return tenantId ? Number(tenantId) : 1;
};

const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = (decoded as any).id;
    req.tenantId = (decoded as any).tenantId;
    
    // Verify if admin belongs to the current tenant context if provided
    const headerTenantId = getTenantId(req);
    if (req.tenantId !== headerTenantId) {
       // In some cases we might want to allow this, but usually they should match
    }
    
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const authenticateAffiliate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.affiliateId = (decoded as any).id;
    req.tenantId = (decoded as any).tenantId;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Super Admin Auth
app.post("/api/super/login", (req, res) => {
  const { whatsapp, password } = req.body;
  const admin = db.prepare("SELECT * FROM super_admins WHERE whatsapp = ?").get(whatsapp) as any;
  if (admin && bcrypt.compareSync(password, admin.password)) {
    const token = jwt.sign({ id: admin.id, isSuperAdmin: true }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Super Admin Tenant Management
app.get("/api/super/tenants", authenticateSuperAdmin, (req, res) => {
  const tenants = db.prepare(`
    SELECT t.*, p.name as plan_name 
    FROM tenants t 
    LEFT JOIN plans p ON t.plan_id = p.id
  `).all();
  res.json(tenants);
});

app.post("/api/super/tenants", authenticateSuperAdmin, (req, res) => {
  const { name, slug, plan_id, admin_whatsapp, admin_password } = req.body;
  try {
    const result = db.prepare("INSERT INTO tenants (name, slug, plan_id) VALUES (?, ?, ?)").run(name, slug, plan_id);
    const tenantId = result.lastInsertRowid;
    
    db.prepare("INSERT INTO settings (tenant_id, store_name) VALUES (?, ?)").run(tenantId, name);
    
    const hashedPassword = bcrypt.hashSync(admin_password, 10);
    db.prepare("INSERT INTO admins (tenant_id, whatsapp, password) VALUES (?, ?, ?)").run(tenantId, admin_whatsapp, hashedPassword);
    
    res.json({ success: true, tenantId });
  } catch (e) {
    res.status(400).json({ error: "Slug já em uso ou erro ao criar loja" });
  }
});

app.put("/api/super/tenants/:id", authenticateSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { name, status, plan_id } = req.body;
  db.prepare("UPDATE tenants SET name = ?, status = ?, plan_id = ? WHERE id = ?").run(name, status, plan_id, id);
  res.json({ success: true });
});

app.get("/api/super/plans", authenticateSuperAdmin, (req, res) => {
  const plans = db.prepare("SELECT * FROM plans").all();
  res.json(plans);
});

app.post("/api/super/plans", authenticateSuperAdmin, (req, res) => {
  const { name, price, max_products, features_json } = req.body;
  db.prepare("INSERT INTO plans (name, price, max_products, features_json) VALUES (?, ?, ?, ?)").run(name, price, max_products, features_json);
  res.json({ success: true });
});

// --- API ROUTES ---

// Affiliate Auth
app.post("/api/affiliate/register", (req, res) => {
  const tenantId = getTenantId(req);
  const { name, whatsapp, email, password, pix_key } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    db.prepare("INSERT INTO affiliates (tenant_id, name, whatsapp, email, password, pix_key) VALUES (?, ?, ?, ?, ?, ?)").run(tenantId, name, whatsapp, email, hashedPassword, pix_key);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: "WhatsApp ou Email já cadastrado nesta loja" });
  }
});

app.post("/api/affiliate/login", (req, res) => {
  const tenantId = getTenantId(req);
  const { whatsapp, password } = req.body;
  const affiliate = db.prepare("SELECT * FROM affiliates WHERE whatsapp = ? AND tenant_id = ?").get(whatsapp, tenantId) as any;
  if (affiliate && bcrypt.compareSync(password, affiliate.password)) {
    if (affiliate.status !== 'active') {
      return res.status(403).json({ error: "Sua conta ainda não foi aprovada" });
    }
    const token = jwt.sign({ id: affiliate.id, tenantId: affiliate.tenant_id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, affiliate: { id: affiliate.id, name: affiliate.name } });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

app.get("/api/affiliate/dashboard", authenticateAffiliate, (req: any, res) => {
  const affiliateId = req.affiliateId;
  const tenantId = req.tenantId;
  const stats = db.prepare(`
    SELECT 
      COUNT(o.id) as total_sales,
      SUM(o.total_amount) as total_volume,
      (SELECT SUM(amount) FROM affiliate_commissions WHERE affiliate_id = ? AND tenant_id = ? AND status = 'paid') as paid_commissions,
      (SELECT SUM(amount) FROM affiliate_commissions WHERE affiliate_id = ? AND tenant_id = ? AND status = 'pending') as pending_commissions
    FROM orders o
    WHERE o.affiliate_id = ? AND o.tenant_id = ?
  `).get(affiliateId, tenantId, affiliateId, tenantId, affiliateId, tenantId) as any;

  const commissions = db.prepare(`
    SELECT ac.*, o.total_amount as order_total, o.created_at as order_date
    FROM affiliate_commissions ac
    JOIN orders o ON ac.order_id = o.id
    WHERE ac.affiliate_id = ? AND ac.tenant_id = ?
    ORDER BY ac.created_at DESC
  `).all(affiliateId, tenantId);

  res.json({ stats, commissions });
});

// Admin Affiliate Management
app.get("/api/admin/affiliates", authenticateAdmin, (req: any, res) => {
  const affiliates = db.prepare("SELECT * FROM affiliates WHERE tenant_id = ? ORDER BY created_at DESC").all(req.tenantId);
  res.json(affiliates);
});

app.put("/api/admin/affiliates/:id/status", authenticateAdmin, (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.prepare("UPDATE affiliates SET status = ? WHERE id = ? AND tenant_id = ?").run(status, id, req.tenantId);
  res.json({ success: true });
});

app.get("/api/admin/commissions", authenticateAdmin, (req: any, res) => {
  const commissions = db.prepare(`
    SELECT ac.*, af.name as affiliate_name, af.whatsapp as affiliate_whatsapp, o.total_amount as order_total
    FROM affiliate_commissions ac
    JOIN affiliates af ON ac.affiliate_id = af.id
    JOIN orders o ON ac.order_id = o.id
    WHERE ac.tenant_id = ?
    ORDER BY ac.created_at DESC
  `).all(req.tenantId);
  res.json(commissions);
});

app.put("/api/admin/commissions/:id/status", authenticateAdmin, (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.prepare("UPDATE affiliate_commissions SET status = ? WHERE id = ? AND tenant_id = ?").run(status, id, req.tenantId);
  res.json({ success: true });
});

// Coupons
app.get("/api/coupons/:code", (req, res) => {
  const tenantId = getTenantId(req);
  const { code } = req.params;
  const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND tenant_id = ? AND active = 1").get(code, tenantId) as any;
  if (!coupon) return res.status(404).json({ error: "Cupom inválido" });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return res.status(400).json({ error: "Cupom expirado" });
  }
  res.json(coupon);
});

app.get("/api/admin/coupons", authenticateAdmin, (req: any, res) => {
  const coupons = db.prepare("SELECT * FROM coupons WHERE tenant_id = ?").all(req.tenantId);
  res.json(coupons);
});

app.post("/api/admin/coupons", authenticateAdmin, (req: any, res) => {
  const { code, type, value, min_purchase, expires_at } = req.body;
  db.prepare("INSERT INTO coupons (tenant_id, code, type, value, min_purchase, expires_at) VALUES (?, ?, ?, ?, ?, ?)").run(req.tenantId, code, type, value, min_purchase, expires_at);
  res.json({ success: true });
});

app.delete("/api/admin/coupons/:id", authenticateAdmin, (req: any, res) => {
  db.prepare("DELETE FROM coupons WHERE id = ? AND tenant_id = ?").run(req.params.id, req.tenantId);
  res.json({ success: true });
});

// Abandoned Carts
app.post("/api/abandoned-carts", (req, res) => {
  const tenantId = getTenantId(req);
  const { customer, items, total } = req.body;
  db.prepare("INSERT INTO abandoned_carts (tenant_id, customer_json, items_json, total_amount) VALUES (?, ?, ?, ?)").run(tenantId, JSON.stringify(customer), JSON.stringify(items), total);
  res.json({ success: true });
});

app.get("/api/admin/abandoned-carts", authenticateAdmin, (req: any, res) => {
  const carts = db.prepare("SELECT * FROM abandoned_carts WHERE tenant_id = ? AND recovered = 0 ORDER BY created_at DESC").all(req.tenantId);
  res.json(carts);
});

// Loyalty Points
app.get("/api/customers/:whatsapp/points", (req, res) => {
  const tenantId = getTenantId(req);
  const customer = db.prepare("SELECT total_points FROM customers WHERE whatsapp = ? AND tenant_id = ?").get(req.params.whatsapp, tenantId) as any;
  res.json({ points: customer ? customer.total_points : 0 });
});

// Advanced Reports
app.get("/api/admin/reports", authenticateAdmin, (req: any, res) => {
  const tenantId = req.tenantId;
  const salesByDay = db.prepare(`
    SELECT date(created_at) as day, SUM(total_amount) as total, COUNT(id) as count
    FROM orders
    WHERE status != 'cancelled' AND tenant_id = ?
    GROUP BY day
    ORDER BY day DESC
    LIMIT 30
  `).all(tenantId);

  const topProducts = db.prepare(`
    SELECT p.name, COUNT(o.id) as sales_count
    FROM products p
    JOIN orders o ON o.items_json LIKE '%' || p.name || '%'
    WHERE o.status != 'cancelled' AND o.tenant_id = ? AND p.tenant_id = ?
    GROUP BY p.id
    ORDER BY sales_count DESC
    LIMIT 10
  `).all(tenantId, tenantId);

  const lowStock = db.prepare(`
    SELECT p.*, s.low_stock_threshold
    FROM products p
    JOIN settings s ON s.tenant_id = p.tenant_id
    WHERE p.stock <= s.low_stock_threshold AND p.tenant_id = ?
  `).all(tenantId);

  res.json({ salesByDay, topProducts, lowStock });
});

// Admin Auth
app.post("/api/admin/login", (req, res) => {
  const tenantId = getTenantId(req);
  const { whatsapp, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE whatsapp = ? AND tenant_id = ?").get(whatsapp, tenantId) as any;
  if (admin && bcrypt.compareSync(password, admin.password)) {
    const token = jwt.sign({ id: admin.id, tenantId: admin.tenant_id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Settings
app.get("/api/settings", (req, res) => {
  const tenantId = getTenantId(req);
  const settings = db.prepare("SELECT * FROM settings WHERE tenant_id = ?").get(tenantId);
  res.json(settings);
});

app.get("/api/orders/track", (req, res) => {
  const { whatsapp, orderId } = req.query;
  const tenantId = getTenantId(req);
  const cleanId = orderId?.toString().replace("#", "");
  
  const order = db.prepare(`
    SELECT o.*, c.whatsapp as customer_whatsapp
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ? AND c.whatsapp = ? AND o.tenant_id = ?
  `).get(cleanId, whatsapp, tenantId);
  
  if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
  res.json(order);
});

app.post("/api/admin/settings", authenticateAdmin, upload.single("logo"), (req: any, res) => {
  const data = req.body;
  const tenantId = req.tenantId;
  if (req.file) {
    data.logo_url = `/uploads/${req.file.filename}`;
  }
  
  const keys = Object.keys(data).filter(k => k !== "id" && k !== "tenant_id");
  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => data[k]);
  
  db.prepare(`UPDATE settings SET ${setClause} WHERE tenant_id = ?`).run(...values, tenantId);
  res.json({ success: true });
});

// Categories
app.get("/api/categories", (req, res) => {
  const tenantId = getTenantId(req);
  const categories = db.prepare("SELECT * FROM categories WHERE tenant_id = ?").all(tenantId);
  res.json(categories);
});

app.post("/api/admin/categories", authenticateAdmin, (req: any, res) => {
  const { name, slug } = req.body;
  db.prepare("INSERT INTO categories (tenant_id, name, slug) VALUES (?, ?, ?)").run(req.tenantId, name, slug);
  res.json({ success: true });
});

// Products
app.get("/api/products", (req, res) => {
  const tenantId = getTenantId(req);
  const products = db.prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = 1 AND p.tenant_id = ?").all(tenantId);
  res.json(products);
});

app.get("/api/admin/products", authenticateAdmin, (req: any, res) => {
  const products = db.prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.tenant_id = ?").all(req.tenantId);
  res.json(products);
});

app.post("/api/admin/products", authenticateAdmin, upload.single("image"), (req: any, res) => {
  const data = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  db.prepare(`
    INSERT INTO products (tenant_id, name, description, price, stock, weight, length, width, height, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.tenantId, data.name, data.description, data.price, data.stock, 
    data.weight, data.length, data.width, data.height, 
    data.category_id, imageUrl
  );
  res.json({ success: true });
});

app.put("/api/admin/products/:id", authenticateAdmin, upload.single("image"), (req: any, res) => {
  const { id } = req.params;
  const data = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.image_url;

  db.prepare(`
    UPDATE products SET 
    name = ?, description = ?, price = ?, stock = ?, 
    weight = ?, length = ?, width = ?, height = ?, 
    category_id = ?, image_url = ?, active = ?
    WHERE id = ? AND tenant_id = ?
  `).run(
    data.name, data.description, data.price, data.stock, 
    data.weight, data.length, data.width, data.height, 
    data.category_id, imageUrl, data.active, id, req.tenantId
  );
  res.json({ success: true });
});

app.delete("/api/admin/products/:id", authenticateAdmin, (req: any, res) => {
  db.prepare("DELETE FROM products WHERE id = ? AND tenant_id = ?").run(req.params.id, req.tenantId);
  res.json({ success: true });
});

// Orders
app.post("/api/orders", async (req, res) => {
  const tenantId = getTenantId(req);
  const { customer, items, total, shipping, paymentMethod, affiliateId, couponId, pointsUsed } = req.body;
  
  const settings = db.prepare("SELECT * FROM settings WHERE tenant_id = ?").get(tenantId) as any;
  
  // Find or create customer
  let customerId;
  let currentPoints = 0;
  const existingCustomer = db.prepare("SELECT id, total_points FROM customers WHERE whatsapp = ? AND tenant_id = ?").get(customer.whatsapp, tenantId) as any;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    currentPoints = existingCustomer.total_points;
    db.prepare(`
      UPDATE customers SET 
      name = ?, email = ?, address_zip = ?, address_street = ?, address_number = ?, 
      address_complement = ?, address_neighborhood = ?, address_city = ?, address_state = ?
      WHERE id = ? AND tenant_id = ?
    `).run(
      customer.name, customer.email, customer.address_zip, customer.address_street, 
      customer.address_number, customer.address_complement, customer.address_neighborhood, 
      customer.address_city, customer.address_state, customerId, tenantId
    );
  } else {
    const result = db.prepare(`
      INSERT INTO customers (tenant_id, name, whatsapp, email, address_zip, address_street, address_number, address_complement, address_neighborhood, address_city, address_state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tenantId, customer.name, customer.whatsapp, customer.email, customer.address_zip, customer.address_street, 
      customer.address_number, customer.address_complement, customer.address_neighborhood, 
      customer.address_city, customer.address_state
    );
    customerId = result.lastInsertRowid;
  }

  // Calculate Discount from Coupon
  let discountAmount = 0;
  if (couponId) {
    const coupon = db.prepare("SELECT * FROM coupons WHERE id = ? AND tenant_id = ?").get(couponId, tenantId) as any;
    if (coupon) {
      if (coupon.type === 'percentage') {
        discountAmount = (total * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }
    }
  }

  // Calculate Loyalty Discount
  let pointsDiscount = 0;
  if (pointsUsed && settings.loyalty_system_enabled) {
    if (pointsUsed <= currentPoints) {
      pointsDiscount = pointsUsed * settings.points_value_per_point;
    }
  }

  const finalTotal = total + shipping - discountAmount - pointsDiscount;
  const pointsEarned = settings.loyalty_system_enabled ? Math.floor(finalTotal * settings.points_per_real) : 0;

  const result = db.prepare(`
    INSERT INTO orders (tenant_id, customer_id, total_amount, shipping_amount, discount_amount, points_used, points_earned, payment_method, items_json, affiliate_id, coupon_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(tenantId, customerId, finalTotal, shipping, discountAmount, pointsUsed || 0, pointsEarned, paymentMethod, JSON.stringify(items), affiliateId || null, couponId || null);
  
  const orderId = result.lastInsertRowid;

  // Update Customer Points
  if (settings.loyalty_system_enabled) {
    const newTotalPoints = currentPoints - (pointsUsed || 0) + pointsEarned;
    db.prepare("UPDATE customers SET total_points = ? WHERE id = ? AND tenant_id = ?").run(newTotalPoints, customerId, tenantId);
    
    if (pointsUsed) {
      db.prepare("INSERT INTO loyalty_points (tenant_id, customer_id, order_id, points, type) VALUES (?, ?, ?, ?, 'spent')").run(tenantId, customerId, orderId, pointsUsed);
    }
    db.prepare("INSERT INTO loyalty_points (tenant_id, customer_id, order_id, points, type) VALUES (?, ?, ?, ?, 'earned')").run(tenantId, customerId, orderId, pointsEarned);
  }

  // Update Product Stock
  items.forEach((item: any) => {
    db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND tenant_id = ?").run(item.quantity, item.id, tenantId);
  });

  // Handle Affiliate Commission
  if (affiliateId) {
    if (settings.affiliate_system_enabled) {
      const commissionAmount = (finalTotal * settings.default_commission_percent) / 100;
      db.prepare("INSERT INTO affiliate_commissions (tenant_id, affiliate_id, order_id, amount) VALUES (?, ?, ?, ?)").run(tenantId, affiliateId, orderId, commissionAmount);
    }
  }

  // Generate PIX if needed
  let pixData = null;
  if (paymentMethod === "pix") {
    const pixPayload = `00020126330014BR.GOV.BCB.PIX0111${settings.pix_key}520400005303986540${finalTotal.toFixed(2)}5802BR5913VibeStore6008SaoPaulo62070503***6304`;
    const qrCode = await QRCode.toDataURL(pixPayload);
    pixData = { payload: pixPayload, qrCode };
  }

  res.json({ orderId, pixData });
});

app.get("/api/admin/orders", authenticateAdmin, (req: any, res) => {
  const orders = db.prepare(`
    SELECT o.*, c.name as customer_name, c.whatsapp as customer_whatsapp 
    FROM orders o 
    JOIN customers c ON o.customer_id = c.id
    WHERE o.tenant_id = ?
    ORDER BY o.created_at DESC
  `).all(req.tenantId);
  res.json(orders);
});

app.put("/api/admin/orders/:id/status", authenticateAdmin, (req: any, res) => {
  const { id } = req.params;
  const { status, tracking_code } = req.body;
  db.prepare("UPDATE orders SET status = ?, tracking_code = ? WHERE id = ? AND tenant_id = ?").run(status, tracking_code || null, id, req.tenantId);
  res.json({ success: true });
});

// Shipping Calculation (Proxy)
app.post("/api/shipping/calculate", async (req, res) => {
  const tenantId = getTenantId(req);
  const { zip, items } = req.body;
  const settings = db.prepare("SELECT * FROM settings WHERE tenant_id = ?").get(tenantId) as any;

  // Mock calculation for demo
  // In real implementation, call Melhor Envio or Correios API
  const mockRates = [
    { id: "sedex", name: "Correios SEDEX", price: 25.50, deadline: 3 },
    { id: "pac", name: "Correios PAC", price: 15.90, deadline: 8 },
  ];
  
  res.json(mockRates);
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
