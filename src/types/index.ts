export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  whatsapp_number: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
};

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};
