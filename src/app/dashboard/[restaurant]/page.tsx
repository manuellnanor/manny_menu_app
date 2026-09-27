import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/dashboard/MenuManager";
import type { Category, Product, Restaurant } from "@/types";

export default async function DashboardPage({ params }: { params: Promise<{ restaurant: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { restaurant: slug } = await params;
  const { data: restaurant, error } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
  if (error || !restaurant) notFound();
  const { data: membership } = await supabase.from("restaurant_users").select("id").eq("restaurant_id", restaurant.id).eq("user_id", user.id).single();
  if (!membership) notFound();
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
    supabase.from("products").select("*").eq("restaurant_id", restaurant.id).order("created_at")
  ]);
  if (categories.error || products.error) throw new Error("Unable to load your menu. Please try again.");
  return <MenuManager restaurant={restaurant as Restaurant} initialCategories={categories.data as Category[]} initialProducts={products.data as Product[]} />;
}
