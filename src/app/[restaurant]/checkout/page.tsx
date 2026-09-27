"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { formatMoney } from "@/lib/format";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const params = useParams<{ restaurant: string }>();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  async function handleWhatsAppOrder() {
    if (!customerName || !customerPhone || !items.length) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug: params.restaurant,
          customerName,
          customerPhone,
          address,
          notes,
          items
        })
      });

      if (!response.ok) {
        throw new Error("Unable to create order");
      }

      const order = await response.json();

      const url = buildWhatsAppOrderUrl({
        restaurantName: order.restaurant.name,
        whatsappNumber: order.restaurant.whatsapp_number,
        customerName,
        customerPhone,
        orderNumber: order.order_number,
        items,
        subtotal,
        deliveryFee: order.delivery_fee ?? 0,
        address,
        notes,
        currency: order.restaurant.currency
      });

      clearCart();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      alert("The order could not be created. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <h1 className="text-3xl font-semibold">Checkout</h1>
          <p className="mt-2 text-zinc-500">
            Enter your details, then send the order to WhatsApp.
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            />

            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            />

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address"
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes"
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            />
          </div>
        </section>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Your order</h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-zinc-500">
                    {formatMoney(item.price, "GHS")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseItem(item.productId)}
                    className="h-8 w-8 rounded-lg border border-zinc-300"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        id: item.productId,
                        restaurant_id: "",
                        category_id: null,
                        name: item.name,
                        slug: "",
                        description: null,
                        price: item.price,
                        image_url: item.imageUrl ?? null,
                        is_available: true
                      })
                    }
                    className="h-8 w-8 rounded-lg border border-zinc-300"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal, "GHS")}</strong>
          </div>

          <button
            type="button"
            disabled={
              submitting || !items.length || !customerName || !customerPhone
            }
            onClick={handleWhatsAppOrder}
            className="mt-6 w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating order..." : "Order on WhatsApp"}
          </button>
        </aside>
      </div>
    </main>
  );
}
