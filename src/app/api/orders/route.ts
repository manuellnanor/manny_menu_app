import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types";

function makeOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${date}-${suffix}`;
}

export async function POST(request: Request) {
  const body = await request.json();

  const restaurantSlug = String(body.restaurantSlug ?? "").trim();
  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const items: Pick<CartItem, "productId" | "quantity">[] = Array.isArray(body.items)
    ? body.items
    : [];

  if (!restaurantSlug || !customerName || !customerPhone || !items.length) {
    return NextResponse.json(
      { error: "Missing order information." },
      { status: 400 }
    );
  }

  if (restaurantSlug === "demo-restaurant") {
    return NextResponse.json({
      order_number: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      delivery_fee: 0,
      restaurant: {
        name: "Demo Restaurant",
        whatsapp_number: "233574506931",
        currency: "GHS"
      }
    });
  }

  const supabase = await createClient();

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id,name,whatsapp_number,currency")
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 }
    );
  }

  const productIds = items.map((item) => item.productId);

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,name,price,is_available")
    .eq("restaurant_id", restaurant.id)
    .in("id", productIds);

  if (productError || !products) {
    return NextResponse.json(
      { error: "Unable to verify products." },
      { status: 400 }
    );
  }

  const verifiedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    if (!product || !product.is_available) {
      throw new Error("One or more products are unavailable.");
    }

    const quantity = Math.max(1, Number(item.quantity ?? 1));

    return {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: Number(product.price),
      total: Number(product.price) * quantity
    };
  });

  const subtotal = verifiedItems.reduce(
    (total, item) => total + item.total,
    0
  );

  const orderNumber = makeOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurant.id,
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      subtotal,
      delivery_fee: 0,
      total: subtotal,
      payment_method: "whatsapp",
      payment_status: "unpaid",
      order_status: "pending",
      order_type: address ? "delivery" : "pickup",
      delivery_address: address || null,
      notes: notes || null
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Unable to create order." },
      { status: 400 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    verifiedItems.map((item) => ({
      order_id: order.id,
      ...item
    }))
  );

  if (itemsError) {
    return NextResponse.json(
      { error: itemsError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    order_number: order.order_number,
    delivery_fee: order.delivery_fee,
    restaurant
  });
}
