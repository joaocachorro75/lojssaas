import React from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Users, 
  Gift, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Layout, 
  Zap, 
  ShieldCheck, 
  BarChart3,
  Menu,
  X,
  Palette,
  Globe,
  Rocket,
  MousePointer2,
  Layers,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden bg-grid">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-cyan-500/20">
              <ShoppingBag size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              SUPER<span className="text-cyan-500">LOJAS</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-zinc-400">
            <a href="#recursos" className="hover:text-cyan-400 transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-cyan-400 transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-cyan-400 transition-colors">Planos</a>
            <Link to="/admin/login" className="hover:text-cyan-400 transition-colors">Entrar</Link>
            <Link 
              to="/admin/login" 
              className="bg-white text-zinc-950 px-6 py-2.5 rounded-full hover:bg-cyan-400 transition-all font-bold"
            >
              Criar Loja
            </Link>
          </div>

          <button className="md:hidden p-2 text-zinc-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-20 left-0 right-0 bg-zinc-900 border-b border-white/5 p-6 space-y-4 shadow-2xl overflow-hidden"
            >
              <a href="#recursos" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-300">Recursos</a>
              <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-300">Como Funciona</a>
              <a href="#planos" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-300">Planos</a>
              <Link to="/admin/login" className="block text-lg font-medium text-zinc-300">Entrar</Link>
              <Link to="/admin/login" className="block w-full bg-cyan-500 text-zinc-950 text-center py-4 rounded-2xl font-bold">
                Começar Agora
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-48 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/5 text-cyan-400 px-4 py-2 rounded-full text-xs font-mono font-bold border border-white/10 uppercase tracking-widest"
            >
              <Sparkles size={14} />
              <span>// SISTEMA_DE_VENDAS_V2.0</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-[120px] font-black tracking-tighter leading-[0.85] text-white uppercase"
            >
              VENDA MAIS <br />
              <span className="text-gradient">SEM LIMITES.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              A SuperLojas é a infraestrutura definitiva para o seu e-commerce. 
              Escalabilidade, design premium e conversão em uma única plataforma.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                to="/admin/login" 
                className="w-full sm:w-auto bg-cyan-500 text-zinc-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-cyan-500/40 active:scale-95"
              >
                CRIAR MINHA LOJA <ArrowRight size={20} />
              </Link>
              <a 
                href="#recursos" 
                className="w-full sm:w-auto glass text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all text-center border border-white/10"
              >
                VER RECURSOS
              </a>
            </motion.div>
          </div>

          {/* Floating Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 relative w-full max-w-5xl aspect-[16/9] glass rounded-[2.5rem] border border-white/10 p-4 shadow-2xl shadow-cyan-500/5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-full h-full bg-zinc-950/80 rounded-[2rem] border border-white/5 p-8 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-cyan-500/50" />
                </div>
                <div className="h-6 w-48 bg-white/5 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2">
                  <div className="h-3 w-12 bg-cyan-500/20 rounded-full" />
                  <div className="h-8 w-24 bg-white/10 rounded-lg" />
                </div>
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2">
                  <div className="h-3 w-12 bg-blue-500/20 rounded-full" />
                  <div className="h-8 w-24 bg-white/10 rounded-lg" />
                </div>
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2">
                  <div className="h-3 w-12 bg-purple-500/20 rounded-full" />
                  <div className="h-8 w-24 bg-white/10 rounded-lg" />
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-end px-8 pb-8 gap-4">
                  {[60, 40, 80, 50, 90, 70, 100, 60, 80, 40, 70, 90].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1 + (i * 0.1) }}
                      className="flex-1 bg-cyan-500/20 rounded-t-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Lojas Ativas", value: "15k+" },
              { label: "Vendas Totais", value: "R$ 50M+" },
              { label: "Taxa de Conversão", value: "4.8%" },
              { label: "Uptime", value: "99.9%" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-1">
                <p className="text-3xl md:text-5xl font-black text-white">{stat.value}</p>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white uppercase">3 PASSOS PARA O SUCESSO</h2>
            <p className="text-zinc-400 text-lg">Sem complicações técnicas. Focamos na tecnologia para você focar nas vendas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { 
                step: "01", 
                title: "Crie sua conta", 
                desc: "Escolha o nome da sua loja e defina seu acesso administrativo em segundos.",
                icon: <Users className="w-8 h-8" />
              },
              { 
                step: "02", 
                title: "Personalize tudo", 
                desc: "Adicione seus produtos, configure cores, logos e meios de pagamento sem código.",
                icon: <Palette className="w-8 h-8" />
              },
              { 
                step: "03", 
                title: "Comece a vender", 
                desc: "Compartilhe seu link exclusivo e receba pedidos diretamente no seu painel.",
                icon: <Rocket className="w-8 h-8" />
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass p-10 rounded-[2.5rem] relative group hover:border-cyan-500/50 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <div className="absolute top-10 right-10 text-6xl font-black text-white/5 group-hover:text-cyan-500/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section id="recursos" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em]">
                <Layers size={14} /> // RECURSOS_DO_SISTEMA
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                ENGENHARIA DE <br />
                <span className="text-gradient">ALTA PERFORMANCE</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Main Feature - Bento Large */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-4 glass p-10 rounded-[2.5rem] relative group overflow-hidden min-h-[400px] flex flex-col justify-end"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent -z-10" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-700" />
              
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-zinc-950 mb-6 shadow-xl shadow-cyan-500/20">
                  <Layout size={28} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Layouts de Conversão</h3>
                <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
                  Nossos temas são desenvolvidos com foco total em UX e psicologia de vendas. 
                  Cada pixel é pensado para transformar visitantes em clientes fiéis.
                </p>
                <div className="flex gap-2 pt-4">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-cyan-400 border border-white/5">#MOBILE_FIRST</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-cyan-400 border border-white/5">#ULTRA_FAST</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-cyan-400 border border-white/5">#SEO_READY</span>
                </div>
              </div>
            </motion.div>

            {/* Feature - Bento Small */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 glass p-10 rounded-[2.5rem] flex flex-col justify-between group hover:border-cyan-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                <Users size={24} />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Afiliados</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Sistema de indicações completo com painel exclusivo para seus parceiros.
                </p>
              </div>
            </motion.div>

            {/* Feature - Bento Small */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 glass p-10 rounded-[2.5rem] flex flex-col justify-between group hover:border-cyan-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                <Gift size={24} />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Fidelidade</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Gamificação e recompensas que fazem o cliente voltar sempre.
                </p>
              </div>
            </motion.div>

            {/* Feature - Bento Medium */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-4 glass p-10 rounded-[2.5rem] relative group overflow-hidden min-h-[300px] flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/5 to-transparent -z-10" />
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Inteligência de Dados</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                    Acompanhe métricas em tempo real e tome decisões baseadas em dados concretos da sua operação.
                  </p>
                </div>
                <div className="flex-1 w-full h-40 bg-zinc-950/50 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                  <div className="flex items-end gap-1 h-full">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + (i * 0.05), duration: 1 }}
                        className="flex-1 bg-cyan-500/40 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Highlight Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-[3rem] p-8 md:p-20 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full -z-10" />
            
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-widest">
                <Smartphone size={20} /> Experiência Mobile
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-white">
                Sua loja no bolso <br />
                <span className="text-cyan-500">do seu cliente.</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Nossa tecnologia PWA permite que seus clientes instalem sua loja como um aplicativo, 
                sem precisar da App Store. Notificações push, carregamento instantâneo e 
                experiência fluida.
              </p>
              <ul className="space-y-4">
                {[
                  "Instalação em um clique",
                  "Notificações Push ilimitadas",
                  "Checkout ultra-rápido",
                  "Funciona offline"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-300 font-medium">
                    <CheckCircle className="text-cyan-500" size={20} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 relative">
              <div className="relative z-10 bg-zinc-900 rounded-[3rem] p-4 border-8 border-zinc-800 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://picsum.photos/seed/mobile-app/400/800" 
                  alt="Mobile Experience" 
                  className="rounded-[2rem] w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">PLANOS <span className="text-cyan-500">SIMPLES</span></h2>
            <p className="text-zinc-400 text-lg">Escolha o plano ideal para o momento do seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Start", 
                price: "97", 
                desc: "Para quem está começando agora.",
                features: ["Até 50 produtos", "1 Usuário Admin", "Suporte via Email", "Checkout Padrão"],
                highlight: false
              },
              { 
                name: "Pro", 
                price: "197", 
                desc: "O plano mais popular para crescer.",
                features: ["Produtos Ilimitados", "5 Usuários Admin", "Suporte via WhatsApp", "Sistema de Afiliados", "Programa de Fidelidade"],
                highlight: true
              },
              { 
                name: "Enterprise", 
                price: "497", 
                desc: "Para grandes operações e agências.",
                features: ["Multi-Lojas (até 5)", "Usuários Ilimitados", "Gerente de Conta", "API de Integração", "Customização Total"],
                highlight: false
              }
            ].map((plan, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-10 rounded-[2.5rem] flex flex-col transition-all duration-500",
                  plan.highlight 
                    ? "bg-cyan-500 text-zinc-950 scale-105 shadow-2xl shadow-cyan-500/20" 
                    : "glass text-white hover:border-cyan-500/30"
                )}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-widest mb-2">{plan.name}</h3>
                  <p className={cn("text-sm", plan.highlight ? "text-zinc-900" : "text-zinc-500")}>{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">R$ {plan.price}</span>
                  <span className={cn("text-sm font-bold", plan.highlight ? "text-zinc-900" : "text-zinc-500")}>/mês</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle size={18} className={plan.highlight ? "text-zinc-950" : "text-cyan-500"} /> {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/admin/login" 
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-center transition-all",
                    plan.highlight 
                      ? "bg-zinc-950 text-white hover:bg-zinc-900" 
                      : "bg-white text-zinc-950 hover:bg-cyan-400"
                  )}
                >
                  ASSINAR AGORA
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="glass p-12 md:p-24 rounded-[4rem] space-y-10 relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent -z-10" />
            
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight">
              PRONTO PARA <br />
              <span className="text-gradient">DECOLAR?</span>
            </h2>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
              Junte-se a milhares de empreendedores que já transformaram seus negócios com a SuperLojas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/admin/login" 
                className="w-full sm:w-auto bg-white text-zinc-950 px-12 py-6 rounded-2xl font-black text-xl hover:bg-cyan-400 transition-all shadow-2xl"
              >
                CRIAR MINHA LOJA AGORA
              </Link>
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              Teste grátis por 7 dias • Sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-100">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-zinc-950">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                SUPER<span className="text-cyan-500">LOJAS</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              A plataforma de e-commerce mais completa do mercado brasileiro. 
              Tecnologia, design e conversão em um só lugar.
            </p>
          </div>

          {[
            { title: "Produto", links: ["Recursos", "Planos", "Mobile App", "Afiliados"] },
            { title: "Suporte", links: ["Central de Ajuda", "API Docs", "Status", "Contato"] },
            { title: "Legal", links: ["Privacidade", "Termos de Uso", "Cookies", "LGPD"] }
          ].map((col, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
              © 2024 SUPERLOJAS. TODOS OS DIREITOS RESERVADOS.
            </p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Desenvolvido por <a href="https://site.to-ligado.com" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">To-Ligado.com</a>
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-600 hover:text-white transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-zinc-600 hover:text-white transition-colors"><Smartphone size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
