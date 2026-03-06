import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export function AdminLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tenantId = new URLSearchParams(window.location.search).get("tenant") || localStorage.getItem("current_tenant_id") || "1";
      const endpoint = isLogin ? "/api/admin/login" : "/api/admin/register";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenantId
        },
        body: JSON.stringify({ storeName, whatsapp, password })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        if (data.tenantId) {
          localStorage.setItem("current_tenant_id", data.tenantId);
        }
        navigate("/admin");
      } else {
        setError(data.error || "Credenciais inválidas");
      }
    } catch (e) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tighter uppercase">
            {isLogin ? "Superlojas Admin" : "Criar Minha Loja"}
          </h1>
          <p className="text-zinc-500">
            {isLogin ? "Faça login para gerenciar sua loja virtual" : "Comece sua jornada no e-commerce hoje"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700">Nome da Loja</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input 
                    type="text" 
                    required
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    placeholder="Ex: Minha Loja Inc"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">WhatsApp</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  required
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="5511999999999"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="Sua senha"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition-all disabled:opacity-50 shadow-lg shadow-cyan-200"
          >
            {loading ? "Processando..." : (isLogin ? "Entrar no Painel" : "Criar Minha Loja")}
          </button>

          <div className="pt-6 border-t border-zinc-100 text-center space-y-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full py-3 border-2 border-cyan-600 text-cyan-600 rounded-xl font-bold hover:bg-cyan-50 transition-all"
            >
              {isLogin ? "Quero Criar uma Loja" : "Já Tenho uma Loja"}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium text-zinc-500 hover:text-cyan-600 transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
