import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, MessageCircle, Mail, CreditCard, ChevronLeft } from "lucide-react";

export function AffiliateAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    pix_key: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/affiliate/login" : "/api/affiliate/register";
    
    try {
      const tenantId = new URLSearchParams(window.location.search).get("tenant") || localStorage.getItem("current_tenant_id") || "1";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenantId
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("affiliate_token", data.token);
          localStorage.setItem("affiliate_user", JSON.stringify(data.affiliate));
          navigate("/afiliados/painel");
        } else {
          alert("Cadastro realizado! Aguarde a aprovação do administrador.");
          setIsLogin(true);
        }
      } else {
        setError(data.error || "Erro ao processar solicitação");
      }
    } catch (e) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-cyan-600 transition-colors">
        <ChevronLeft size={20} /> Voltar para a loja
      </Link>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900">Programa de Afiliados</h1>
          <p className="text-zinc-500">
            {isLogin ? "Entre na sua conta para gerenciar seus ganhos" : "Cadastre-se para começar a ganhar comissões"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">WhatsApp</label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                required
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="5511999999999"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                required
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Sua senha"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Chave PIX (para recebimento)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  required
                  type="text"
                  value={formData.pix_key}
                  onChange={e => setFormData({...formData, pix_key: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="CPF, Email ou Aleatória"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition-all disabled:opacity-50"
          >
            {loading ? "Processando..." : (isLogin ? "Entrar" : "Cadastrar")}
          </button>
        </form>

        <div className="pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
          </p>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-3 border-2 border-cyan-600 text-cyan-600 rounded-xl font-bold hover:bg-cyan-50 transition-all"
          >
            {isLogin ? "Criar Conta de Afiliado" : "Fazer Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
