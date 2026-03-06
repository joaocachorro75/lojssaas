import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./contexts/StoreContext";
import { Storefront } from "./views/Storefront";
import { AdminDashboard } from "./views/AdminDashboard";
import { AdminLogin } from "./views/AdminLogin";
import { AffiliateAuth } from "./views/AffiliateAuth";
import { AffiliateDashboard } from "./views/AffiliateDashboard";
import { SuperAdminLogin } from "./views/SuperAdminLogin";
import { SuperAdminDashboard } from "./views/SuperAdminDashboard";
import { useEffect } from "react";
import { XCircle } from "lucide-react";

function AppContent() {
  const { settings, loading } = useStore();
  const location = useLocation();

  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty("--primary", settings.primary_color);
      document.documentElement.style.setProperty("--secondary", settings.secondary_color);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!settings && !location.pathname.startsWith("/super")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <XCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Loja não encontrada</h1>
        <p className="text-zinc-500 max-w-md">Não conseguimos carregar as configurações desta loja. Verifique o link ou entre em contato com o suporte.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          Tentar Novamente
        </button>
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
