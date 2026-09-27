import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/menu/ProductCard";
import { CartBar } from "@/components/cart/CartBar";
import type { Category, Product, Restaurant } from "@/types";

const demoRestaurant: Restaurant = {
  id: "demo-restaurant-id",
  name: "Demo Restaurant",
  slug: "demo-restaurant",
  description: "Fresh meals, drinks and snacks.",
  logo_url: null,
  cover_url: null,
  whatsapp_number: "233574506931",
  currency: "GHS",
  primary_color: "#18181b",
  secondary_color: "#ffffff",
  is_active: true
};

const demoCategories: Category[] = [
  {
    id: "cat-1",
    restaurant_id: demoRestaurant.id,
    name: "Meals",
    slug: "meals",
    sort_order: 1,
    is_active: true
  },
  {
    id: "cat-2",
    restaurant_id: demoRestaurant.id,
    name: "Drinks",
    slug: "drinks",
    sort_order: 2,
    is_active: true
  }
];

const demoProducts: Product[] = [
  {
    id: "prod-1",
    restaurant_id: demoRestaurant.id,
    category_id: "cat-1",
    name: "Jollof Rice",
    slug: "jollof-rice",
    description: "Jollof rice served with grilled chicken.",
    price: 65,
    image_url: null,
    is_available: true
  },
  {
    id: "prod-2",
    restaurant_id: demoRestaurant.id,
    category_id: "cat-2",
    name: "Fresh Pineapple Juice",
    slug: "pineapple-juice",
    description: "Chilled fresh pineapple juice.",
    price: 20,
    image_url: null,
    is_available: true
  }
];

export default async function RestaurantPage({
  params
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const { restaurant: slug } = await params;

  let restaurant: Restaurant | null = null;
  let categories: Category[] = [];
  let products: Product[] = [];

  if (slug === "demo-restaurant") {
    restaurant = demoRestaurant;
    categories = demoCategories;
    products = demoProducts;
  } else {
    const supabase = await createClient();

    const { data: restaurantData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!restaurantData) {
      notFound();
    }

    restaurant = restaurantData as Restaurant;

    const [{ data: categoryData }, { data: productData }] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("is_available", true)
        .order("name")
    ]);

    categories = (categoryData ?? []) as Category[];
    products = (productData ?? []) as Product[];
  }

  if (!restaurant) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 pb-28">
      <section
        className="px-5 py-12 text-white"
        style={{ backgroundColor: restaurant.primary_color }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">
            Digital Menu
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{restaurant.name}</h1>
          {restaurant.description ? (
            <p className="mt-3 max-w-2xl text-white/75">
              {restaurant.description}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="whitespace-nowrap rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm"
            >
              {category.name}
            </a>
          ))}
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id
            );

            if (!categoryProducts.length) return null;

            return (
              <section key={category.id} id={category.slug}>
                <h2 className="mb-5 text-2xl font-semibold">{category.name}</h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={restaurant.currency}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <CartBar
        restaurantSlug={restaurant.slug}
        currency={restaurant.currency}
      />
    </main>
  );
}
