import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const whatsapp = String(body.whatsappNumber ?? "").replace(/[\s()-]/g, "");
  if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || ["dashboard", "login", "signup", "api", "auth", "demo-restaurant"].includes(slug) || !/^\+?[0-9]{7,15}$/.test(whatsapp)) {
    return NextResponse.json({ error: "Enter a name, a valid menu URL, and an international WhatsApp number." }, { status: 400 });
  }
  const { data: restaurant, error } = await supabase.rpc("create_restaurant", { p_name: name, p_slug: slug, p_whatsapp: whatsapp });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "That menu URL is already taken. Choose another." : error.code === "PGRST202" ? "Restaurant setup is not ready. The site administrator needs to install the dashboard database migration." : error.message }, { status: 400 });
  return NextResponse.json({ restaurant });
}
