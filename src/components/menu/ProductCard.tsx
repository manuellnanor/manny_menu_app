"use client";

import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { formatMoney } from "@/lib/format";

export function ProductCard({
  product,
  currency
}: {
  product: Product;
  currency: string;
}) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="aspect-[4/3] bg-zinc-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>

        {product.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-semibold">
            {formatMoney(product.price, currency)}
          </p>

          <button
            type="button"
            onClick={() => addItem(product)}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
