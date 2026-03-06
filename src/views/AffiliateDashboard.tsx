import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingBag, CreditCard, LogOut, 
  Copy, CheckCircle, TrendingUp, DollarSign, Package, MessageCircle
} from "lucide-react";
import { useStore } from "../contexts/StoreContext";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AffiliateDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("affiliate_token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("affiliate_user") || "{}");
    } catch (e) {
      return {};
    }
  })();
  const { settings } = useStore();

  useEffect(() => {
    if (!token) {
      navigate("/afiliados/login");
      return;
    }

    const tenantId = localStorage.getItem("current_tenant_id") || "1";
    fetch("/api/affiliate/dashboard", {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "x-tenant-id": tenantId
      }
    })
    .then(res => res.json())
    .then(data => {
      setStats(data.stats);
      setCommissions(data.commissions);
      setLoading(false);
    })
    .catch(e => {
      console.error(e);
      localStorage.removeItem("affiliate_token");
      navigate("/afiliados/login");
    });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_user");
    navigate("/afiliados/login");
  };

  const affiliateLink = `${window.location.origin}/?aff=${user.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    alert("Link copiado!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  const cards = [
    { label: "Total de Vendas", value: stats?.total_sales || 0, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Volume de Vendas", value: `R$ ${(stats?.total_volume || 0).toFixed(2)}`, icon: TrendingUp, color: "bg-purple-500" },
    { label: "Comissões Pendentes", value: `R$ ${(stats?.pending_commissions || 0).toFixed(2)}`, icon: DollarSign, color: "bg-yellow-500" },
    { label: "Comissões Pagas", value: `R$ ${(stats?.paid_commissions || 0).toFixed(2)}`, icon: CheckCircle, color: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tighter text-cyan-600">SUPERLOJAS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500 hidden md:block">Afiliado: {user.name}</span>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Affiliate Link Section */}
        <section className="bg-cyan-600 text-white p-8 rounded-3xl shadow-lg shadow-cyan-100 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Seu Link de Afiliado</h2>
            <p className="text-cyan-100">Compartilhe este link para ganhar comissões em cada venda.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-sm truncate">
              {affiliateLink}
            </div>
            <button 
              onClick={copyLink}
              className="bg-white text-cyan-600 px-8 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={20} /> Copiar Link
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commissions Table */}
          <section className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Relatório de Comissões</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-widest">
                <TrendingUp size={14} /> Atualizado em tempo real
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Venda</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Comissão</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {commissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                          Nenhuma comissão registrada ainda.
                        </td>
                      </tr>
                    ) : (
                      commissions.map(c => (
                        <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-zinc-500">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-medium">R$ {c.order_total.toFixed(2)}</td>
                          <td className="px-6 py-4 font-bold text-cyan-600">R$ {c.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              c.status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-cyan-100 text-cyan-600"
                            )}>
                              {c.status === 'pending' ? "Pendente" : "Pago"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-zinc-100">
                {commissions.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400">Nenhuma comissão registrada ainda.</div>
                ) : (
                  commissions.map(c => (
                    <div key={c.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          c.status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-cyan-100 text-cyan-600"
                        )}>
                          {c.status === 'pending' ? "Pendente" : "Pago"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-zinc-500">Venda</p>
                          <p className="font-bold">R$ {c.order_total.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Comissão</p>
                          <p className="font-bold text-cyan-600">R$ {c.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Tips & Techniques */}
          <section className="space-y-6">
            <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle size={24} className="text-cyan-400" /> Dicas de Vendas
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-cyan-400">WhatsApp é Poder</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">Envie seu link para listas de transmissão ou grupos segmentados. O contato direto converte 3x mais.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-cyan-400">Instagram Stories</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">Faça um "unboxing" ou mostre o produto em uso e coloque o link na figurinha de link.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-cyan-400">Prova Social</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">Compartilhe depoimentos de clientes que já compraram. Isso gera confiança imediata.</p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 p-8 rounded-3xl border border-cyan-100 space-y-4">
              <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
                <CheckCircle size={24} className="text-cyan-600" /> Suporte VIP
              </h2>
              <p className="text-sm text-cyan-700">Dúvidas sobre pagamentos ou produtos? Fale diretamente com nosso gerente de afiliados.</p>
              <a 
                href={`https://wa.me/${settings?.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold text-center block hover:bg-cyan-700 transition-colors"
              >
                Chamar no WhatsApp
              </a>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Copy size={24} className="text-zinc-400" /> Material de Apoio
              </h2>
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Texto para Copiar</p>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600 italic">
                  "Olha que incrível essa loja que eu encontrei! Tem produtos de alta qualidade e o atendimento é nota 10. Confira aqui: {affiliateLink}"
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Olha que incrível essa loja que eu encontrei! Tem produtos de alta qualidade e o atendimento é nota 10. Confira aqui: ${affiliateLink}`);
                    alert("Texto copiado!");
                  }}
                  className="w-full text-xs font-bold text-cyan-600 hover:underline"
                >
                  Copiar Texto de Venda
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
