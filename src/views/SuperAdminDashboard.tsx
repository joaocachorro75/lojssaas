import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, CreditCard, Settings, LogOut, 
  Plus, Search, CheckCircle, XCircle, ExternalLink, 
  Shield, Globe, BarChart3, Package, ArrowUpRight, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("tenants");
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    slug: "",
    plan_id: 1,
    admin_username: "admin",
    admin_password: ""
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("super_token");

  useEffect(() => {
    if (!token) navigate("/super/login");
    else fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [tenantsRes, plansRes] = await Promise.all([
        fetch("/api/super/tenants", { headers }),
        fetch("/api/super/plans", { headers })
      ]);
      
      if (tenantsRes.ok) setTenants(await tenantsRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (error) {
      console.error("Error fetching super data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/super/tenants", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTenant)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setNewTenant({ name: "", slug: "", plan_id: 1, admin_username: "admin", admin_password: "" });
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Erro ao criar loja");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("super_token");
    navigate("/super/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-emerald-500" />
          <span className="font-bold">VibeSaaS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-zinc-800 rounded-full">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">VibeSaaS</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Super Admin</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-zinc-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab("tenants"); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === "tenants" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Globe size={20} /> Lojas (Tenants)
          </button>
          <button 
            onClick={() => { setActiveTab("plans"); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === "plans" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <CreditCard size={20} /> Planos & Preços
          </button>
          <button 
            onClick={() => { setActiveTab("stats"); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === "stats" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <BarChart3 size={20} /> Estatísticas Globais
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {activeTab === "tenants" && "Gerenciamento de Lojas"}
              {activeTab === "plans" && "Planos da Plataforma"}
              {activeTab === "stats" && "Visão Geral do SaaS"}
            </h2>
            <p className="text-zinc-500 text-sm md:text-base">Controle total sobre o ecossistema VibeStore</p>
          </div>
          
          {activeTab === "tenants" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus size={20} /> Nova Loja
            </button>
          )}
        </header>

        {activeTab === "tenants" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <motion.div 
                key={tenant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                    <Globe className="text-zinc-400" size={24} />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    tenant.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {tenant.status === 'active' ? 'Ativa' : 'Suspensa'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{tenant.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">Slug: <span className="text-zinc-300">/{tenant.slug}</span></p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 bg-zinc-800/50 rounded-2xl p-3 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Plano</p>
                    <p className="font-bold text-emerald-500">{tenant.plan_name}</p>
                  </div>
                  <div className="flex-1 bg-zinc-800/50 rounded-2xl p-3 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Criada em</p>
                    <p className="font-bold text-zinc-300">{new Date(tenant.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={`/?tenant=${tenant.id}`} 
                    target="_blank" 
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Ver Loja <ExternalLink size={14} />
                  </a>
                  <button className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition-all">
                    <Settings size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-emerald-500">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-zinc-500">/mês</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-zinc-400">
                    <CheckCircle size={18} className="text-emerald-500" /> Até {plan.max_products} produtos
                  </li>
                  {JSON.parse(plan.features_json || "[]").map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-400">
                      <CheckCircle size={18} className="text-emerald-500" /> {feature}
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-all">
                  Editar Plano
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Tenant Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Criar Nova Loja</h3>
              
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Minha Loja"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Slug (URL)</label>
                    <input
                      type="text"
                      value={newTenant.slug}
                      onChange={(e) => setNewTenant({...newTenant, slug: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="ex-loja"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Plano</label>
                  <select
                    value={newTenant.plan_id}
                    onChange={(e) => setNewTenant({...newTenant, plan_id: Number(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-zinc-800 mt-4">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-4">Credenciais do Administrador</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Usuário</label>
                      <input
                        type="text"
                        value={newTenant.admin_username}
                        onChange={(e) => setNewTenant({...newTenant, admin_username: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Senha</label>
                      <input
                        type="password"
                        value={newTenant.admin_password}
                        onChange={(e) => setNewTenant({...newTenant, admin_password: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Criar Loja
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
