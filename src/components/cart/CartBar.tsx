"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatMoney } from "@/lib/format";

export function CartBar({
  restaurantSlug,
  currency
}: {
  restaurantSlug: string;
  currency: string;
}) {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const count = items.reduce((total, item) => total + item.quantity, 0);

  if (!count) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-2xl">
        <div>
          <p className="text-sm text-zinc-400">
            {count} item{count === 1 ? "" : "s"}
          </p>
          <p className="font-semibold">{formatMoney(subtotal, currency)}</p>
        </div>

        <Link
          href={`/${restaurantSlug}/checkout`}
          className="rounded-xl bg-white px-4 py-2 font-medium text-black"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
