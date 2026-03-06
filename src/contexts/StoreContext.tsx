import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Settings, Category, Product, CartItem, Customer } from "../types";

interface StoreContextType {
  settings: Settings | null;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing cart from localStorage:", e);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      // Get tenant ID from URL or localStorage
      const params = new URLSearchParams(window.location.search);
      const tenantId = params.get("tenant") || localStorage.getItem("current_tenant_id");
      
      if (!tenantId) {
        setSettings(null);
        setLoading(false);
        return;
      }

      const headers = { "x-tenant-id": tenantId };
      
      const [settingsRes, categoriesRes, productsRes] = await Promise.all([
        fetch("/api/settings", { headers }),
        fetch("/api/categories", { headers }),
        fetch("/api/products", { headers })
      ]);
      
      if (!settingsRes.ok) {
        setSettings(null);
        setLoading(false);
        return;
      }

      const settingsData = await settingsRes.json();
      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();
      
      setSettings(settingsData);
      setCategories(categoriesData);
      setProducts(productsData);
      
      localStorage.setItem("current_tenant_id", tenantId);
    } catch (error) {
      console.error("Error fetching store data:", error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      settings, categories, products, cart, 
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartTotal, cartCount, loading, refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
