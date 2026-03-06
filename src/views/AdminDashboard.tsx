import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon, 
  LogOut, Plus, Trash2, Edit, Save, Upload, CheckCircle, XCircle, 
  Search, Filter, ExternalLink, MessageSquare, Truck, CreditCard,
  Menu, X, Smartphone, Monitor, Palette, Users, DollarSign,
  Ticket, Gift, Ghost, BarChart3, AlertTriangle
} from "lucide-react";
import { useStore } from "../contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { generateText, AIConfig } from "../services/aiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getHeaders = (extra = {}) => ({
  "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
  "x-tenant-id": localStorage.getItem("current_tenant_id") || "1",
  ...extra
});

export function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const tenantId = localStorage.getItem("current_tenant_id") || "1";

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: BarChart3, label: "Relatórios", path: "/admin/relatorios" },
    { icon: Package, label: "Produtos", path: "/admin/produtos" },
    { icon: ShoppingBag, label: "Pedidos", path: "/admin/pedidos" },
    { icon: Ghost, label: "Carrinhos", path: "/admin/carrinhos" },
    { icon: Ticket, label: "Cupons", path: "/admin/cupons" },
    { icon: Users, label: "Afiliados", path: "/admin/afiliados" },
    { icon: SettingsIcon, label: "Configurações", path: "/admin/configuracoes" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tighter text-cyan-600">SUPERLOJAS</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map(item => (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  location.pathname === item.path ? "bg-cyan-50 text-cyan-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all",
        isSidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className={cn("p-2 hover:bg-zinc-100 rounded-full lg:hidden", isSidebarOpen && "hidden")}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/" target="_blank" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-cyan-600 transition-colors">
              <ExternalLink size={16} /> Ver Loja
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/relatorios" element={<AdvancedReports />} />
            <Route path="/produtos" element={<ProductManagement />} />
            <Route path="/pedidos" element={<OrderManagement />} />
            <Route path="/carrinhos" element={<AbandonedCarts />} />
            <Route path="/cupons" element={<CouponManagement />} />
            <Route path="/afiliados" element={<AffiliateManagement />} />
            <Route path="/configuracoes" element={<SettingsManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 });
  const [reportData, setReportData] = useState<any>(null);
  const { products } = useStore();

  useEffect(() => {
    fetch("/api/admin/orders", {
      headers: getHeaders()
    }).then(res => res.json()).then(orders => {
      const revenue = orders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
      setStats({ orders: orders.length, products: products.length, revenue });
    });

    fetch("/api/admin/reports", {
      headers: getHeaders()
    }).then(res => res.json()).then(setReportData);
  }, [products]);

  const cards = [
    { label: "Total de Pedidos", value: stats.orders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Produtos Ativos", value: stats.products, icon: Package, color: "bg-cyan-500" },
    { label: "Receita Total", value: `R$ ${stats.revenue.toFixed(2)}`, icon: CreditCard, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl text-white", card.color)}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg">Vendas Recentes</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData.salesByDay.slice().reverse()}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(val) => `R$ ${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [`R$ ${val.toFixed(2)}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg">Top Produtos</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sales_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Pedidos Recentes</h2>
        <OrderManagement limit={5} />
      </div>
    </div>
  );
}

function ProductManagement() {
  const { categories, settings, refreshData } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, stock: 0, 
    weight: 0, length: 0, width: 0, height: 0, 
    category_id: "", active: 1
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const generateAIDescription = async () => {
    if (!formData.name) {
      alert("Digite o nome do produto primeiro!");
      return;
    }
    if (!settings.ai_api_key) {
      alert("Configure sua API Key nas configurações da loja!");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Crie uma descrição profissional e persuasiva para um produto de e-commerce chamado "${formData.name}". A descrição deve ser curta, focada em benefícios e usar gatilhos mentais.`;
      const config: AIConfig = {
        provider: settings.ai_provider as any,
        apiKey: settings.ai_api_key,
        model: settings.ai_model
      };
      const result = await generateText(prompt, config);
      setFormData({ ...formData, description: result });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchProducts = () => {
    fetch("/api/admin/products", {
      headers: getHeaders()
    }).then(res => res.json()).then(setProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));
    if (imageFile) data.append("image", imageFile);

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: getHeaders(),
      body: data
    });

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: 0, stock: 0, weight: 0, length: 0, width: 0, height: 0, category_id: "", active: 1 });
    setImageFile(null);
    fetchProducts();
    refreshData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    fetchProducts();
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition-colors"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover bg-zinc-100" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{p.category_name}</td>
                  <td className="px-6 py-4 font-bold text-cyan-600">R$ {p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{p.stock} un</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      p.active ? "bg-cyan-100 text-cyan-600" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }}
                        className="p-2 text-zinc-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-zinc-100">
          {products.map(p => (
            <div key={p.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover bg-zinc-100" />
                  <div>
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-xs text-zinc-500">{p.category_name}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  p.active ? "bg-cyan-100 text-cyan-600" : "bg-zinc-100 text-zinc-400"
                )}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-zinc-500">Preço</p>
                  <p className="font-bold text-cyan-600">R$ {p.price.toFixed(2)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-zinc-500">Estoque</p>
                  <p className="font-bold">{p.stock} un</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-50 text-zinc-600 rounded-xl font-bold text-sm"
                >
                  <Edit size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium">Nome do Produto</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Descrição</label>
                      <button 
                        type="button"
                        onClick={generateAIDescription}
                        disabled={aiLoading}
                        className="text-[10px] font-bold text-cyan-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <Ghost size={12} /> {aiLoading ? "Gerando..." : "Gerar com IA"}
                      </button>
                    </div>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 h-24" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Preço (R$)</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Estoque</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Categoria</label>
                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Imagem</label>
                    <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Peso (kg)</label>
                    <input type="number" step="0.001" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Comp (cm)</label>
                    <input type="number" value={formData.length} onChange={e => setFormData({...formData, length: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Larg (cm)</label>
                    <input type="number" value={formData.width} onChange={e => setFormData({...formData, width: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Alt (cm)</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 transition-colors">Salvar Produto</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderManagement({ limit }: { limit?: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = () => {
    fetch("/api/admin/orders", {
      headers: getHeaders()
    }).then(res => res.json()).then(data => setOrders(limit ? data.slice(0, limit) : data));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status })
    });
    fetchOrders();
    setSelectedOrder(null);
  };

  const shareOrder = (order: any) => {
    const text = `Olá ${order.customer_name}, seu pedido #${order.id} na VibeStore foi atualizado para: ${order.status.toUpperCase()}.`;
    window.open(`https://wa.me/${order.customer_whatsapp}?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="space-y-6">
      {!limit && <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{o.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{o.customer_name}</span>
                      <span className="text-xs text-zinc-400">{o.customer_whatsapp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">R$ {o.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      o.status === 'pending' && "bg-yellow-100 text-yellow-600",
                      o.status === 'paid' && "bg-cyan-100 text-cyan-600",
                      o.status === 'shipped' && "bg-blue-100 text-blue-600",
                      o.status === 'delivered' && "bg-purple-100 text-purple-600",
                      o.status === 'cancelled' && "bg-red-100 text-red-600",
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 text-zinc-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"><Edit size={18} /></button>
                      <button onClick={() => shareOrder(o)} className="p-2 text-zinc-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"><MessageSquare size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-zinc-100">
          {orders.map(o => (
            <div key={o.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-zinc-400">#{o.id}</p>
                  <h3 className="font-bold">{o.customer_name}</h3>
                  <p className="text-xs text-zinc-500">{o.customer_whatsapp}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  o.status === 'pending' && "bg-yellow-100 text-yellow-600",
                  o.status === 'paid' && "bg-cyan-100 text-cyan-600",
                  o.status === 'shipped' && "bg-blue-100 text-blue-600",
                  o.status === 'delivered' && "bg-purple-100 text-purple-600",
                  o.status === 'cancelled' && "bg-red-100 text-red-600",
                )}>
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Total</p>
                <p className="font-bold text-lg">R$ {o.total_amount.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => setSelectedOrder(o)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-50 text-zinc-600 rounded-xl font-bold text-sm"
                >
                  <Edit size={16} /> Status
                </button>
                <button 
                  onClick={() => shareOrder(o)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-50 text-cyan-600 rounded-xl font-bold text-sm"
                >
                  <MessageSquare size={16} /> WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold">Atualizar Pedido #{selectedOrder.id}</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status do Pedido</label>
                  <select 
                    value={selectedOrder.status} 
                    onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-full bg-zinc-100 text-zinc-600 py-3 rounded-xl font-bold">Fechar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdvancedReports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/reports", {
      headers: getHeaders()
    }).then(res => res.json()).then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Relatórios Avançados</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
          <h2 className="font-bold flex items-center gap-2"><BarChart3 size={20} className="text-cyan-500" /> Vendas (Últimos 30 dias)</h2>
          <div className="space-y-2">
            {data.salesByDay.map((day: any) => (
              <div key={day.day} className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{new Date(day.day).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{day.count} pedidos</span>
                  <span className="font-bold">R$ {day.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Package size={20} className="text-cyan-500" /> Produtos Mais Vendidos</h2>
          <div className="space-y-2">
            {data.topProducts.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{p.name}</span>
                <span className="font-bold">{p.sales_count} vendas</span>
              </div>
            ))}
          </div>
        </div>

        {data.lowStock.length > 0 && (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm space-y-4 md:col-span-2">
            <h2 className="font-bold flex items-center gap-2 text-red-600"><AlertTriangle size={20} /> Alerta de Estoque Baixo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.lowStock.map((p: any) => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-red-100 flex justify-between items-center">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-sm font-bold text-red-600">{p.stock} em estoque</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/abandoned-carts", {
      headers: getHeaders()
    }).then(res => res.json()).then(setCarts);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carrinhos Abandonados</h1>
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {carts.map(cart => {
              let customer = { name: "N/A", whatsapp: "N/A" };
              try {
                customer = JSON.parse(cart.customer_json || "{}");
              } catch (e) {
                console.error("Error parsing customer_json:", e);
              }
              return (
                <tr key={cart.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{customer.name}</span>
                      <span className="text-xs text-zinc-400">{customer.whatsapp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">R$ {cart.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(cart.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={`https://wa.me/${customer.whatsapp}?text=Olá ${customer.name}, vimos que você deixou alguns itens no carrinho em nossa loja. Gostaria de finalizar sua compra?`}
                      target="_blank"
                      className="text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Recuperar
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponManagement() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    code: "", type: "percentage", value: 0, min_purchase: 0, expires_at: ""
  });

  const fetchCoupons = () => {
    fetch("/api/admin/coupons", {
      headers: getHeaders()
    }).then(res => res.json()).then(setCoupons);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(formData)
    });
    setIsAdding(false);
    fetchCoupons();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Excluir cupom?")) return;
    await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cupons de Desconto</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition-all"
        >
          <Plus size={20} /> Novo Cupom
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Criar Novo Cupom</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Código</label>
              <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border rounded-xl" placeholder="EX: VERAO10" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Valor</label>
              <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Compra Mínima (R$)</label>
              <input type="number" value={formData.min_purchase} onChange={e => setFormData({...formData, min_purchase: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expira em</label>
              <input type="date" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 transition-all">Salvar Cupom</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Desconto</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Mínimo</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Expiração</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-bold">{coupon.code}</td>
                <td className="px-6 py-4 text-sm">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 text-sm">R$ {coupon.min_purchase.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Nunca"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}

function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'affiliates' | 'commissions'>('affiliates');

  const fetchAffiliates = () => {
    fetch("/api/admin/affiliates", {
      headers: getHeaders()
    }).then(res => res.json()).then(setAffiliates);
  };

  const fetchCommissions = () => {
    fetch("/api/admin/commissions", {
      headers: getHeaders()
    }).then(res => res.json()).then(setCommissions);
  };

  useEffect(() => {
    fetchAffiliates();
    fetchCommissions();
  }, []);

  const updateAffiliateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/affiliates/${id}/status`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status })
    });
    fetchAffiliates();
  };

  const updateCommissionStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/commissions/${id}/status`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status })
    });
    fetchCommissions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sistema de Afiliados</h1>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('affiliates')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'affiliates' ? "bg-white shadow-sm text-cyan-600" : "text-zinc-500")}
          >Afiliados</button>
          <button 
            onClick={() => setActiveTab('commissions')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'commissions' ? "bg-white shadow-sm text-cyan-600" : "text-zinc-500")}
          >Comissões</button>
        </div>
      </div>

      {activeTab === 'affiliates' ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">PIX</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {affiliates.map(a => (
                <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-bold">{a.name}</td>
                  <td className="px-6 py-4 text-sm">{a.whatsapp}</td>
                  <td className="px-6 py-4 text-sm font-mono">{a.pix_key}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      a.status === 'active' ? "bg-cyan-100 text-cyan-600" : "bg-yellow-100 text-yellow-600"
                    )}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === 'pending' ? (
                      <button 
                        onClick={() => updateAffiliateStatus(a.id, 'active')}
                        className="text-cyan-600 hover:bg-cyan-50 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >Aprovar</button>
                    ) : (
                      <button 
                        onClick={() => updateAffiliateStatus(a.id, 'pending')}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >Bloquear</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Venda</th>
                  <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Comissão</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {commissions.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{c.affiliate_name}</span>
                      <span className="text-xs text-zinc-400">{c.affiliate_whatsapp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">R$ {c.order_total.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-cyan-600">R$ {c.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      c.status === 'paid' ? "bg-cyan-100 text-cyan-600" : "bg-yellow-100 text-yellow-600"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.status === 'pending' && (
                      <button 
                        onClick={() => updateCommissionStatus(c.id, 'paid')}
                        className="text-cyan-600 hover:bg-cyan-50 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >Marcar como Pago</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
}

function SettingsManagement() {
  const { settings, refreshData } = useStore();
  const [formData, setFormData] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value.toString());
    });
    if (logoFile) data.append("logo", logoFile);

    await fetch("/api/admin/settings", {
      method: "POST",
      headers: getHeaders(),
      body: data
    });
    
    await refreshData();
    setLoading(false);
    alert("Configurações salvas com sucesso!");
  };

  if (!formData) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configurações da Loja</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Settings */}
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2"><Palette size={20} className="text-cyan-500" /> Identidade Visual</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome da Loja</label>
              <input value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Logo da Loja</label>
              <div className="flex items-center gap-4">
                {formData.logo_url && <img src={formData.logo_url} className="h-12 w-auto object-contain bg-zinc-50 p-2 rounded-lg" />}
                <input type="file" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cor Primária</label>
                <input type="color" value={formData.primary_color} onChange={e => setFormData({...formData, primary_color: e.target.value})} className="w-full h-10 p-1 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cor Secundária</label>
                <input type="color" value={formData.secondary_color} onChange={e => setFormData({...formData, secondary_color: e.target.value})} className="w-full h-10 p-1 border rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Modelo de Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {['modern', 'minimal', 'electronics', 'fashion', 'brutalist'].map(l => (
                  <button 
                    key={l}
                    type="button"
                    onClick={() => setFormData({...formData, layout_type: l})}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-2 transition-all",
                      formData.layout_type === l ? "border-cyan-500 bg-cyan-50 text-cyan-600" : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2"><Smartphone size={20} className="text-cyan-500" /> WhatsApp & Notificações</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Número WhatsApp (com DDD)</label>
              <input value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="5511999999999" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Evolution API URL (Opcional)</label>
              <input value={formData.evolution_api_url || ""} onChange={e => setFormData({...formData, evolution_api_url: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Evolution API Key</label>
              <input type="password" value={formData.evolution_api_key || ""} onChange={e => setFormData({...formData, evolution_api_key: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><CreditCard size={20} className="text-cyan-500" /> Pagamentos</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Chave PIX</label>
              <input value={formData.pix_key || ""} onChange={e => setFormData({...formData, pix_key: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mercado Pago Public Key</label>
              <input value={formData.mercadopago_public_key || ""} onChange={e => setFormData({...formData, mercadopago_public_key: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mercado Pago Access Token</label>
              <input type="password" value={formData.mercadopago_access_token || ""} onChange={e => setFormData({...formData, mercadopago_access_token: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><Users size={20} className="text-cyan-500" /> Sistema de Afiliados</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Habilitar Sistema de Afiliados</label>
              <input 
                type="checkbox" 
                checked={formData.affiliate_system_enabled === 1} 
                onChange={e => setFormData({...formData, affiliate_system_enabled: e.target.checked ? 1 : 0})} 
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Comissão Padrão (%)</label>
              <input 
                type="number" 
                value={formData.default_commission_percent} 
                onChange={e => setFormData({...formData, default_commission_percent: Number(e.target.value)})} 
                className="w-full px-4 py-2 border rounded-xl" 
              />
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><Gift size={20} className="text-cyan-500" /> Sistema de Fidelidade</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Habilitar Sistema de Pontos</label>
              <input 
                type="checkbox" 
                checked={formData.loyalty_system_enabled === 1} 
                onChange={e => setFormData({...formData, loyalty_system_enabled: e.target.checked ? 1 : 0})} 
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Pontos por R$ 1,00</label>
                <input type="number" value={formData.points_per_real} onChange={e => setFormData({...formData, points_per_real: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Valor de 1 Ponto (R$)</label>
                <input type="number" step="0.01" value={formData.points_value_per_point} onChange={e => setFormData({...formData, points_value_per_point: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><AlertTriangle size={20} className="text-cyan-500" /> Alertas</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Limite de Estoque Baixo</label>
              <input type="number" value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><Ghost size={20} className="text-cyan-500" /> Inteligência Artificial</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Provedor de IA</label>
              <select value={formData.ai_provider} onChange={e => setFormData({...formData, ai_provider: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                <option value="gemini">Google Gemini (Recomendado)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="openrouter">OpenRouter</option>
                <option value="groq">Groq (Llama 3)</option>
                <option value="modal">Modal (Custom Endpoint)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">API Key</label>
              <input type="password" value={formData.ai_api_key || ""} onChange={e => setFormData({...formData, ai_api_key: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="sk-..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Modelo (Opcional)</label>
              <input value={formData.ai_model || ""} onChange={e => setFormData({...formData, ai_model: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="ex: gpt-4o, gemini-3-flash-preview" />
            </div>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2 pt-4 border-t"><ShoppingBag size={20} className="text-cyan-500" /> Upsell no Checkout</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Habilitar Upsell</label>
              <input 
                type="checkbox" 
                checked={formData.upsell_enabled === 1} 
                onChange={e => setFormData({...formData, upsell_enabled: e.target.checked ? 1 : 0})} 
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Título do Upsell</label>
              <input value={formData.upsell_title} onChange={e => setFormData({...formData, upsell_title: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Produto de Upsell</label>
              <select value={formData.upsell_product_id || ""} onChange={e => setFormData({...formData, upsell_product_id: e.target.value ? Number(e.target.value) : null})} className="w-full px-4 py-2 border rounded-xl">
                <option value="">Selecione um produto...</option>
                {useStore().products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 flex items-center justify-center gap-2"
          >
            <Save size={24} /> {loading ? "Salvando..." : "Salvar Todas as Configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
