export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  active: boolean;
}

export interface Settings {
  store_name: string;
  store_description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  layout_type: 'modern' | 'minimal' | 'electronics' | 'fashion' | 'brutalist';
  whatsapp_number: string;
  evolution_api_url?: string;
  evolution_api_key?: string;
  evolution_instance?: string;
  mercadopago_public_key?: string;
  mercadopago_access_token?: string;
  melhorenvio_token?: string;
  melhorenvio_sandbox: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  pix_key?: string;
  affiliate_system_enabled: number;
  default_commission_percent: number;
  loyalty_system_enabled: number;
  points_per_real: number;
  points_value_per_point: number;
  low_stock_threshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  whatsapp: string;
  email?: string;
  address_zip: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_whatsapp: string;
  total_amount: number;
  shipping_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'pix' | 'mercadopago';
  payment_id?: string;
  shipping_method?: string;
  tracking_code?: string;
  items_json: string;
  created_at: string;
}
