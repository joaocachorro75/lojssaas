import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./contexts/StoreContext";
import { Storefront } from "./views/Storefront";
import { AdminDashboard } from "./views/AdminDashboard";
import { AdminLogin } from "./views/AdminLogin";
import { AffiliateAuth } from "./views/AffiliateAuth";
import { AffiliateDashboard } from "./views/AffiliateDashboard";
import { SuperAdminLogin } from "./views/SuperAdminLogin";
import { SuperAdminDashboard } from "./views/SuperAdminDashboard";
import { LandingPage } from "./views/LandingPage";
import { useEffect } from "react";
import { XCircle, ShoppingBag } from "lucide-react";

function AppContent() {
  const { settings, loading } = useStore();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tenantId = params.get("tenant");

  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty("--primary", settings.primary_color);
      document.documentElement.style.setProperty("--secondary", settings.secondary_color);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // If no tenant is specified and we are at root, show SaaS Landing Page
  if (!tenantId && location.pathname === "/") {
    return <LandingPage />;
  }

  const isAuthRoute = location.pathname.startsWith("/admin") || 
                     location.pathname.startsWith("/afiliados") || 
                     location.pathname.startsWith("/super");

  if (!settings && !isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Bem-vindo ao SuperLojas</h1>
        <p className="text-zinc-500 max-w-md">Parece que você está tentando acessar uma loja sem especificar o identificador. Use ?tenant=ID na URL ou crie sua própria loja.</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            Ir para Home
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-zinc-900 border border-zinc-200 px-8 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<Storefront />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/afiliados/login" element={<AffiliateAuth />} />
      <Route path="/afiliados/painel" element={<AffiliateDashboard />} />
      
      {/* Super Admin Routes */}
      <Route path="/super/login" element={<SuperAdminLogin />} />
      <Route path="/super/*" element={<SuperAdminDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
}
