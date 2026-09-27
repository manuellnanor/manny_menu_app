import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const whatsappNumber = String(body.whatsappNumber ?? "").trim();

  if (!name || !slug || !whatsappNumber) {
    return NextResponse.json(
      { error: "Name, slug and WhatsApp number are required." },
      { status: 400 }
    );
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      name,
      slug,
      whatsapp_number: whatsappNumber,
      currency: "GHS",
      primary_color: "#18181b",
      secondary_color: "#ffffff",
      is_active: true
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: membershipError } = await supabase
    .from("restaurant_users")
    .insert({
      restaurant_id: restaurant.id,
      user_id: user.id,
      role: "owner"
    });

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ restaurant });
}
