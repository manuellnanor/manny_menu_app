import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("restaurant_users").select("restaurants(slug)").eq("user_id", user.id).limit(1);
  if (error) throw new Error("Unable to load your restaurant.");
  const joined = data?.[0]?.restaurants;
  const restaurant = Array.isArray(joined) ? joined[0] : joined;
  redirect(restaurant?.slug ? `/dashboard/${encodeURIComponent(restaurant.slug)}` : "/signup");
}
