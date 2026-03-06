import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";
import { ShoppingCart, Menu, X, Search, ChevronRight, MessageCircle, Package, CreditCard, CheckCircle, Gift, ShoppingBag, Users, ExternalLink, DollarSign, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Storefront() {
  const { settings, products, cart, cartCount, cartTotal } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const affId = params.get("aff");
    if (affId) {
      localStorage.setItem("affiliate_id", affId);
    }
  }, [location]);

  if (!settings) return null;

  const layout = settings.layout_type || 'modern';

  return (
    <div className={cn(
      "min-h-screen bg-zinc-50 font-sans text-zinc-900",
      layout === 'brutalist' && "bg-white font-mono",
      layout === 'minimal' && "bg-stone-50 font-serif"
    )}>
      {/* Navbar */}
      <nav className={cn(
        "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200",
        layout === 'brutalist' && "border-4 border-black bg-yellow-400 backdrop-blur-none",
        layout === 'minimal' && "bg-stone-50/80 border-stone-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.store_name} className="h-10 w-auto object-contain" />
            ) : (
              <span className={cn(
                "text-xl font-bold tracking-tight",
                layout === 'brutalist' && "text-3xl uppercase italic"
              )}>{settings.store_name}</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Início</Link>
            <Link to="/produtos" className="hover:text-cyan-600 transition-colors">Produtos</Link>
            {settings.affiliate_system_enabled === 1 && (
              <Link to="/afiliados" className="hover:text-cyan-600 transition-colors">Afiliados</Link>
            )}
            {settings.loyalty_system_enabled === 1 && (
              <Link to="/fidelidade" className="hover:text-cyan-600 transition-colors">Fidelidade</Link>
            )}
            <Link to="/rastreio" className="hover:text-cyan-600 transition-colors">Rastreio</Link>
            <Link to="/contato" className="hover:text-cyan-600 transition-colors">Contato</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<ProductList />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/rastreio" element={<OrderTracking />} />
          <Route path="/pedido-sucesso" element={<OrderSuccess />} />
          <Route path="/afiliados" element={<AffiliateInfo />} />
          <Route path="/fidelidade" element={<LoyaltyInfo />} />
          <Route path="/contato" element={<Contact />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-zinc-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.</p>
            <Link to="/admin/login" className="text-[10px] opacity-20 hover:opacity-100 transition-opacity">Painel Administrativo</Link>
          </div>
          <p className="flex items-center gap-1">
            Desenvolvido por <a href="https://site.to-ligado.com" target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-600 hover:underline">To-Ligado.com</a>
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href={`https://wa.me/${settings.whatsapp_number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </a>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 flex items-center justify-around h-16 px-4 pb-safe">
        <Link to="/" className={cn(
          "flex flex-col items-center gap-1 text-zinc-500",
          location.pathname === "/" && "text-cyan-600"
        )}>
          <ShoppingBag size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link to="/produtos" className={cn(
          "flex flex-col items-center gap-1 text-zinc-500",
          location.pathname === "/produtos" && "text-cyan-600"
        )}>
          <Package size={20} />
          <span className="text-[10px] font-medium">Produtos</span>
        </Link>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-zinc-500"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Carrinho</span>
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-zinc-500"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-[280px] bg-white z-[90] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-cyan-600">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                  <ShoppingBag size={20} /> Início
                </Link>
                <Link to="/produtos" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                  <Package size={20} /> Produtos
                </Link>
                {settings.affiliate_system_enabled === 1 && (
                  <Link to="/afiliados" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                    <Users size={20} /> Afiliados
                  </Link>
                )}
                {settings.loyalty_system_enabled === 1 && (
                  <Link to="/fidelidade" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                    <Gift size={20} /> Fidelidade
                  </Link>
                )}
                <Link to="/rastreio" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                  <Search size={20} /> Rastrear Pedido
                </Link>
                <Link to="/contato" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                  <MessageCircle size={20} /> Contato
                </Link>
              </div>
              <div className="p-4 border-t bg-zinc-50">
                <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-zinc-400 text-xs hover:text-cyan-600 transition-colors">
                  <ExternalLink size={16} /> Painel Admin
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">Seu Carrinho</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                    <ShoppingCart size={64} strokeWidth={1} />
                    <p>Seu carrinho está vazio</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-cyan-600 font-medium underline"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <CartItemComponent key={item.id} item={item} />
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t bg-zinc-50 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <Link 
                    to="/checkout" 
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-center block hover:bg-cyan-700 transition-colors"
                  >
                    Finalizar Pedido
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Home() {
  const { settings, products } = useStore();
  if (!settings) return null;

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className={cn(
        "relative rounded-3xl overflow-hidden bg-zinc-900 text-white p-8 md:p-16 min-h-[400px] flex flex-col justify-center",
        settings.layout_type === 'brutalist' && "rounded-none border-4 border-black bg-pink-500 text-black",
        settings.layout_type === 'minimal' && "bg-stone-100 text-stone-900 rounded-none border-y border-stone-200"
      )}>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className={cn(
            "text-4xl md:text-6xl font-bold leading-tight",
            settings.layout_type === 'brutalist' && "text-7xl uppercase italic",
            settings.layout_type === 'minimal' && "font-serif italic"
          )}>
            {settings.store_description || "Bem-vindo à nossa loja virtual!"}
          </h1>
          <p className="text-lg opacity-80">
            Confira nossas ofertas exclusivas e produtos de alta qualidade.
          </p>
          <Link 
            to="/produtos"
            className={cn(
              "inline-block bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-cyan-600 transition-colors",
              settings.layout_type === 'brutalist' && "bg-black text-white rounded-none border-2 border-white hover:bg-white hover:text-black"
            )}
          >
            Ver Produtos
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-cyan-500 to-transparent" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Destaques</h2>
          <Link to="/produtos" className="text-cyan-600 font-medium flex items-center gap-1 hover:underline">
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductList() {
  const { products, categories } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Nossos Produtos</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selectedCategory === null ? "bg-cyan-500 text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50"
          )}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat.id ? "bg-cyan-500 text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: any) {
  const { addToCart, settings } = useStore();
  const layout = settings?.layout_type || 'modern';

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm group",
        layout === 'brutalist' && "rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        layout === 'minimal' && "rounded-none border-stone-200 bg-stone-50"
      )}
    >
      <Link to={`/produto/${product.id}`} className="block aspect-square overflow-hidden bg-zinc-100">
        <img 
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="p-4 space-y-2">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{product.category_name}</p>
        <Link to={`/produto/${product.id}`} className="block font-bold text-zinc-900 hover:text-cyan-600 transition-colors line-clamp-1">
          {product.name}
        </Link>
        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold text-cyan-600">R$ {product.price.toFixed(2)}</span>
          <button 
            onClick={() => addToCart(product)}
            className={cn(
              "p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors",
              layout === 'brutalist' && "rounded-none border-2 border-black bg-yellow-400 text-black font-bold"
            )}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CartItemComponent({ item }: any) {
  const { updateCartQuantity, removeFromCart } = useStore();
  return (
    <div className="flex gap-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
        <img src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
        <p className="text-cyan-600 font-bold">R$ {item.price.toFixed(2)}</p>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button 
              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 hover:bg-zinc-100"
            >-</button>
            <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
            <button 
              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 hover:bg-zinc-100"
            >+</button>
          </div>
          <button 
            onClick={() => removeFromCart(item.id)}
            className="text-xs text-red-500 font-medium hover:underline"
          >Remover</button>
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useLocation().pathname.split("/").pop() as any;
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === Number(id));

  if (!product) return <div>Produto não encontrado</div>;

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200">
        <img src={product.image_url || `https://picsum.photos/seed/${product.id}/800/800`} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-cyan-600 font-bold uppercase tracking-widest text-sm">{product.category_name}</p>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-zinc-900">R$ {product.price.toFixed(2)}</p>
        </div>
        <div className="prose prose-zinc">
          <p className="text-zinc-600 leading-relaxed">{product.description}</p>
        </div>
        <div className="pt-6 space-y-4">
          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={24} /> Adicionar ao Carrinho
          </button>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-100 rounded-xl flex flex-col items-center gap-2">
              <Package size={24} className="text-zinc-400" />
              <span className="text-xs font-medium text-zinc-500">Frete para todo Brasil</span>
            </div>
            <div className="p-4 bg-zinc-100 rounded-xl flex flex-col items-center gap-2">
              <CreditCard size={24} className="text-zinc-400" />
              <span className="text-xs font-medium text-zinc-500">Pagamento via PIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkout() {
  const { cart, cartTotal, clearCart, settings } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    address_zip: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    paymentMethod: "pix"
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [customerPoints, setCustomerPoints] = useState(0);

  useEffect(() => {
    if (formData.whatsapp.length >= 10) {
      const tenantId = localStorage.getItem("current_tenant_id") || "1";
    fetch(`/api/customers/${formData.whatsapp}/points`, {
      headers: { "x-tenant-id": tenantId }
    })
        .then(res => res.json())
        .then(data => setCustomerPoints(data.points));
    }
  }, [formData.whatsapp]);

  const applyCoupon = async () => {
    try {
      const tenantId = localStorage.getItem("current_tenant_id") || "1";
    const res = await fetch(`/api/coupons/${couponCode}`, {
      headers: { "x-tenant-id": tenantId }
    });
      const data = await res.json();
      if (res.ok) {
        if (cartTotal < data.min_purchase) {
          alert(`Compra mínima para este cupom: R$ ${data.min_purchase.toFixed(2)}`);
          return;
        }
        setAppliedCoupon(data);
      } else {
        alert(data.error || "Cupom inválido");
      }
    } catch (e) {
      alert("Erro ao aplicar cupom");
    }
  };

  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (cartTotal * appliedCoupon.value) / 100 : appliedCoupon.value)
    : 0;

  const pointsDiscount = usePoints && settings?.loyalty_system_enabled
    ? customerPoints * settings.points_value_per_point
    : 0;

  const finalTotal = cartTotal - discount - pointsDiscount;

  const upsellProduct = settings.upsell_enabled && settings.upsell_product_id 
    ? useStore().products.find(p => p.id === settings.upsell_product_id)
    : null;

  const handleNext = async () => {
    if (step === 1) {
      // Track abandoned cart
      const tenantId = localStorage.getItem("current_tenant_id") || "1";
      fetch("/api/abandoned-carts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenantId
        },
        body: JSON.stringify({ customer: formData, items: cart, total: cartTotal })
      });
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    const affiliateId = localStorage.getItem("affiliate_id");
    try {
      const tenantId = localStorage.getItem("current_tenant_id") || "1";
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenantId
        },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          total: cartTotal,
          shipping: 0,
          paymentMethod: formData.paymentMethod,
          affiliateId: affiliateId ? Number(affiliateId) : null,
          couponId: appliedCoupon?.id,
          pointsUsed: usePoints ? customerPoints : 0
        })
      });
      const data = await res.json();
      if (data.pixData) {
        setPixData(data.pixData);
        setStep(3);
        localStorage.removeItem("affiliate_id");
      } else {
        localStorage.removeItem("affiliate_id");
        window.location.href = "/pedido-sucesso";
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step < 3) return <Navigate to="/" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map(s => (
          <div key={s} className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            step >= s ? "bg-cyan-500" : "bg-zinc-200"
          )} />
        ))}
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package size={24} className="text-cyan-500" /> Dados de Entrega
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-zinc-500">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500">WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500">CEP</label>
                <input 
                  type="text" 
                  value={formData.address_zip}
                  onChange={e => setFormData({...formData, address_zip: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-zinc-500">Rua / Logradouro</label>
                <input 
                  type="text" 
                  value={formData.address_street}
                  onChange={e => setFormData({...formData, address_street: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500">Número</label>
                <input 
                  type="text" 
                  value={formData.address_number}
                  onChange={e => setFormData({...formData, address_number: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500">Cidade</label>
                <input 
                  type="text" 
                  value={formData.address_city}
                  onChange={e => setFormData({...formData, address_city: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold hover:bg-cyan-700 transition-colors"
            >
              Continuar para Pagamento
            </button>
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Resumo do Pedido</h2>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                            {upsellProduct && !cart.some(item => item.id === upsellProduct.id) && (
                <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100 space-y-3">
                  <p className="text-xs font-bold text-cyan-800 uppercase tracking-wider">{settings.upsell_title}</p>
                  <div className="flex gap-3">
                    <img src={upsellProduct.image_url} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{upsellProduct.name}</p>
                      <p className="text-xs text-cyan-600 font-bold">Por apenas R$ {upsellProduct.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => useStore().addToCart(upsellProduct)}
                      className="bg-cyan-600 text-white px-3 py-1 rounded-lg text-xs font-bold self-center"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium">R$ {cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-cyan-600">
                    <span>Desconto (Cupom)</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-cyan-600">
                    <span>Desconto (Pontos)</span>
                    <span>- R$ {pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
                {settings?.loyalty_system_enabled && (
                  <div className="bg-cyan-50 p-3 rounded-xl text-xs text-cyan-700 font-medium flex items-center gap-2">
                    <Gift size={16} /> Você ganhará {Math.floor(finalTotal * settings.points_per_real)} pontos nesta compra!
                  </div>
                )}
              </div>      </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-md mx-auto space-y-6 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="text-center space-y-2">
            <CreditCard size={48} className="mx-auto text-cyan-500" />
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Cupom de Desconto</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO"
                  className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button 
                  onClick={applyCoupon}
                  className="px-6 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {settings?.loyalty_system_enabled && customerPoints > 0 && (
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="text-cyan-500" size={20} />
                    <span className="text-sm font-bold">Usar meus pontos</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={usePoints}
                    onChange={e => setUsePoints(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500"
                  />
                </div>
                <p className="text-xs text-zinc-500">Você tem {customerPoints} pontos (R$ {(customerPoints * settings.points_value_per_point).toFixed(2)} de desconto)</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-700">Escolha o Pagamento</p>
              <button 
                onClick={() => setFormData({...formData, paymentMethod: 'pix'})}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                  formData.paymentMethod === 'pix' ? "border-cyan-500 bg-cyan-50" : "border-zinc-100 hover:border-zinc-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-bold">PIX</div>
                  <div className="text-left">
                    <p className="font-bold">PIX</p>
                    <p className="text-xs text-zinc-500">Aprovação imediata</p>
                  </div>
                </div>
                {formData.paymentMethod === 'pix' && <CheckCircle size={20} className="text-cyan-500" />}
              </button>
            </div>

            <button 
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 disabled:opacity-50"
            >
              {loading ? "Processando..." : `Finalizar Pedido - R$ ${finalTotal.toFixed(2)}`}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-zinc-400 font-medium hover:text-zinc-600">Voltar</button>
          </div>
        </div>
      )}

      {step === 3 && pixData && (
        <div className="max-w-md mx-auto space-y-6 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center">
          <h2 className="text-2xl font-bold">Pague com PIX</h2>
          <p className="text-zinc-500">Escaneie o QR Code abaixo ou copie o código para pagar.</p>
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 inline-block mx-auto">
            <img src={pixData.qrCode} alt="PIX QR Code" className="w-64 h-64 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Código PIX</p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={pixData.payload} 
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs font-mono truncate"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pixData.payload);
                  alert("Código copiado!");
                }}
                className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >Copiar</button>
            </div>
          </div>
          <Link 
            to="/pedido-sucesso" 
            onClick={clearCart}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold block hover:bg-cyan-700 transition-colors"
          >
            Já realizei o pagamento
          </Link>
        </div>
      )}
    </div>
  );
}

function OrderTracking() {
  const [whatsapp, setWhatsapp] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const tenantId = localStorage.getItem("current_tenant_id") || "1";
      const res = await fetch(`/api/orders/track?whatsapp=${whatsapp}&orderId=${orderId}`, {
        headers: { "x-tenant-id": tenantId }
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.error || "Pedido não encontrado.");
      }
    } catch (err) {
      setError("Erro ao buscar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Rastrear Pedido</h1>
        <p className="text-zinc-500">Acompanhe o status da sua entrega em tempo real.</p>
      </div>

      <form onSubmit={handleTrack} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Seu WhatsApp</label>
            <input 
              required 
              value={whatsapp} 
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="5511999999999"
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Número do Pedido</label>
            <input 
              required 
              value={orderId} 
              onChange={e => setOrderId(e.target.value)}
              placeholder="#123"
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 transition-all disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Rastrear Agora"}
        </button>
      </form>

      {error && <p className="text-center text-red-500 font-medium">{error}</p>}

      {order && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-bold">Status do Pedido</p>
              <h3 className="text-xl font-bold text-cyan-600 uppercase">{order.status}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 uppercase font-bold">Data do Pedido</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold">Itens do Pedido</h4>
            <div className="divide-y">
              {JSON.parse(order.items_json).map((item: any) => (
                <div key={item.id} className="py-2 flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.tracking_code && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <p className="text-xs font-bold text-blue-800 uppercase">Código de Rastreio</p>
              <p className="text-lg font-mono font-bold text-blue-900">{order.tracking_code}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function OrderSuccess() {
  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="w-24 h-24 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={64} />
      </div>
      <h1 className="text-3xl font-bold">Pedido Recebido!</h1>
      <p className="text-zinc-500 leading-relaxed">
        Seu pedido foi registrado com sucesso. Você receberá atualizações sobre o status do seu pedido via WhatsApp.
      </p>
      <div className="pt-6">
        <Link to="/" className="inline-block bg-cyan-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-cyan-700 transition-colors">
          Voltar para a Loja
        </Link>
      </div>
    </div>
  );
}

function AffiliateInfo() {
  const { settings } = useStore();
  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Programa de Afiliados</h1>
        <p className="text-xl text-zinc-500">Ganhe dinheiro indicando nossos produtos!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users size={32} />
          </div>
          <h3 className="font-bold text-lg">1. Cadastre-se</h3>
          <p className="text-sm text-zinc-500">Crie sua conta de afiliado em poucos minutos e aguarde a aprovação.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ExternalLink size={32} />
          </div>
          <h3 className="font-bold text-lg">2. Divulgue</h3>
          <p className="text-sm text-zinc-500">Compartilhe seu link exclusivo nas redes sociais, blogs ou WhatsApp.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <DollarSign size={32} />
          </div>
          <h3 className="font-bold text-lg">3. Ganhe</h3>
          <p className="text-sm text-zinc-500">Receba uma comissão de <strong>{settings.default_commission_percent}%</strong> por cada venda realizada através do seu link.</p>
        </div>
      </div>

      <div className="bg-zinc-900 text-white p-12 rounded-[40px] text-center space-y-8">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <p className="text-zinc-400 max-w-xl mx-auto">Junte-se ao nosso time de parceiros e comece a faturar hoje mesmo com a {settings.store_name}.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link to="/afiliados/login" className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-cyan-600 transition-colors w-full md:w-auto">
            Quero me cadastrar
          </Link>
          <Link to="/afiliados/login" className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors w-full md:w-auto">
            Já sou afiliado
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoyaltyInfo() {
  const { settings } = useStore();
  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Programa de Fidelidade</h1>
        <p className="text-xl text-zinc-500">Suas compras valem pontos que viram descontos!</p>
      </div>

      <div className="bg-cyan-600 text-white p-12 rounded-[40px] relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Como funciona?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">1</div>
                <p>A cada <strong>R$ 1,00</strong> em compras, você ganha <strong>{settings.points_per_real} ponto(s)</strong>.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">2</div>
                <p>Cada ponto acumulado vale <strong>R$ {settings.points_value_per_point.toFixed(2)}</strong> de desconto real.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">3</div>
                <p>Você pode usar seus pontos para abater o valor de qualquer pedido no checkout.</p>
              </li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center space-y-4">
            <Gift size={64} className="mx-auto text-cyan-300" />
            <p className="text-lg font-medium">Exemplo: Uma compra de R$ 100,00 gera {100 * settings.points_per_real} pontos, que valem R$ {(100 * settings.points_per_real * settings.points_value_per_point).toFixed(2)} de desconto!</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Como participar?</h2>
        <p className="text-zinc-500">Basta realizar suas compras informando seu WhatsApp no checkout. Seus pontos são vinculados automaticamente ao seu número!</p>
        <Link to="/produtos" className="inline-block bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-colors">
          Começar a comprar agora
        </Link>
      </div>
    </div>
  );
}

function Contact() {
  const { settings } = useStore();
  if (!settings) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Fale Conosco</h1>
        <p className="text-zinc-500">Estamos aqui para tirar suas dúvidas e ajudar no que for preciso.</p>
      </div>

      <div className="grid gap-6">
        <a 
          href={`https://wa.me/${settings.whatsapp_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:border-cyan-500 transition-all group"
        >
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <MessageCircle size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">WhatsApp</h3>
            <p className="text-zinc-500">Atendimento rápido e direto.</p>
          </div>
        </a>

        <div className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center justify-center">
            <Smartphone size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Telefone</h3>
            <p className="text-zinc-500">{settings.whatsapp_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navigate({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}
