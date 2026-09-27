"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product, Restaurant } from "@/types";
import { formatMoney } from "@/lib/format";

const input = "mt-2 block w-full min-w-0 rounded-xl border border-zinc-300 bg-white px-4 py-3";
const button = "rounded-xl bg-[#bb4824] px-5 py-3 font-medium text-white hover:bg-[#a13c1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50";
const empty = { name: "", description: "", price: "", category_id: "", is_available: true };
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function MenuManager({ restaurant, initialCategories, initialProducts }: { restaurant: Restaurant; initialCategories: Category[]; initialProducts: Product[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [logo, setLogo] = useState(restaurant.logo_url);
  const [category, setCategory] = useState("");
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save changes. Please try again."); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    if (!extensions[file.type]) throw new Error("Choose a JPG, PNG or WebP image.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
    const client = createClient();
    const path = `${restaurant.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const { error } = await client.storage.from("restaurant-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    return { path, url: client.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl };
  }

  function reset() { setDraft(empty); setEditing(null); setPhoto(null); setFormKey(key => key + 1); }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const price = Number(draft.price);
      if (!draft.name.trim() || !draft.category_id || !Number.isFinite(price) || price < 0) throw new Error("Add a name, category and valid price.");
      const client = createClient();
      const image = photo ? await upload(photo) : null;
      const values = { ...draft, name: draft.name.trim(), price, restaurant_id: restaurant.id, slug: editing?.slug || `${slugify(draft.name) || "item"}-${crypto.randomUUID().slice(0, 8)}`, image_url: image?.url || editing?.image_url || null };
      const query = editing ? client.from("products").update(values).eq("id", editing.id).eq("restaurant_id", restaurant.id) : client.from("products").insert(values);
      const { data, error } = await query.select("*").single();
      if (error) {
        if (image) await client.storage.from("restaurant-media").remove([image.path]);
        throw new Error(error.message);
      }
      setProducts(list => editing ? list.map(item => item.id === editing.id ? data as Product : item) : [...list, data as Product]);
      reset(); setMessage("Menu item saved. Your public menu is updated.");
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-10 text-[#242522] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0"><p className="text-sm text-[#bb4824]">Restaurant dashboard</p><h1 className="mt-2 break-words text-3xl font-semibold">{restaurant.name}</h1></div>
          <div className="flex flex-wrap gap-3"><Link href={`/${restaurant.slug}`} className="rounded-xl bg-black px-5 py-3 font-medium text-white">View menu</Link><button disabled={busy} className="rounded-xl border border-zinc-300 px-5 py-3" onClick={() => void run(async () => { const { error } = await createClient().auth.signOut(); if (error) throw error; window.location.assign("/login"); })}>Sign out</button></div>
        </header>
        {message && <p role="status" className="mb-6 break-words rounded-xl border border-zinc-300 bg-white p-4">{message}</p>}
        <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-8 disabled:opacity-70 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Restaurant logo</h2>
              {logo && <img src={logo} alt={`${restaurant.name} logo`} className="mt-4 h-24 w-24 rounded-xl object-contain" />}
              <label className="mt-4 block text-sm">Upload logo
                <input aria-label="Upload logo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full min-w-0 text-sm" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void run(async () => {
                  const image = await upload(file); const client = createClient();
                  const { error } = await client.from("restaurants").update({ logo_url: image.url }).eq("id", restaurant.id).select("id").single();
                  if (error) { await client.storage.from("restaurant-media").remove([image.path]); throw new Error(error.message); }
                  setLogo(image.url); setMessage("Restaurant logo updated.");
                }); }} />
              </label>
              <p className="mt-2 text-xs text-zinc-500">JPG, PNG or WebP. Maximum 5 MB.</p>
            </section>
            <form className="rounded-2xl border border-zinc-200 bg-white p-5" onSubmit={event => { event.preventDefault(); void run(async () => {
              const name = category.trim(); if (!name) throw new Error("Enter a category name.");
              const { data, error } = await createClient().from("categories").insert({ restaurant_id: restaurant.id, name, slug: `${slugify(name) || "category"}-${crypto.randomUUID().slice(0, 8)}`, sort_order: categories.length, is_active: true }).select("*").single();
              if (error) throw new Error(error.message); setCategories(list => [...list, data as Category]); setCategory(""); setDraft(value => ({ ...value, category_id: data.id })); setMessage("Category added.");
            }); }}>
              <h2 className="text-xl font-semibold">Menu categories</h2>
              <p className="mt-2 text-sm text-zinc-500">Create sections such as Meals, Drinks or Desserts.</p>
              <label className="mt-4 block text-sm">Category name<input className={input} value={category} onChange={event => setCategory(event.target.value)} required maxLength={100} /></label>
              <button className={`${button} mt-4`}>Add category</button>
              <ul className="mt-4 flex flex-wrap gap-2">{categories.map(item => <li key={item.id} className="max-w-full break-words rounded-lg bg-zinc-100 px-3 py-2 text-sm">{item.name}</li>)}</ul>
            </form>
            <form key={formKey} onSubmit={saveProduct} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold">{editing ? "Edit menu item" : "Add food or drink"}</h2>
              <label className="mt-4 block text-sm">Item name<input required maxLength={150} className={input} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="mt-4 block text-sm">Description<textarea rows={3} maxLength={1000} className={input} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
              <label className="mt-4 block text-sm">Price ({restaurant.currency})<input type="number" required min="0" max="9999999999.99" step="0.01" className={input} value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} /></label>
              <label className="mt-4 block text-sm">Category<select required className={input} value={draft.category_id} onChange={event => setDraft({ ...draft, category_id: event.target.value })}><option value="">Choose a category</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
              {!categories.length && <p className="mt-2 text-sm text-zinc-500">Add a category above before saving your first item.</p>}
              {editing?.image_url && !photo && <img src={editing.image_url} alt={editing.name} className="mt-4 h-24 w-32 rounded-xl object-cover" />}
              <label className="mt-4 block text-sm">Food or drink photo<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full min-w-0 text-sm" onChange={event => setPhoto(event.target.files?.[0] || null)} /></label>
              <p className="mt-2 text-xs text-zinc-500">JPG, PNG or WebP. Maximum 5 MB. Leave blank to keep the current photo.</p>
              <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_available} onChange={event => setDraft({ ...draft, is_available: event.target.checked })} />Available on the public menu</label>
              <div className="mt-5 flex flex-wrap gap-3"><button className={button} disabled={busy || !categories.length}>{busy ? "Saving…" : "Save item"}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-zinc-300 px-5 py-3">Cancel edit</button>}</div>
            </form>
          </div>
          <section className="min-w-0"><h2 className="mb-5 text-2xl font-semibold">Your menu ({products.length})</h2>
            {!products.length && <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">Your menu is ready for its first dish. Add a category, then a food or drink with its price and photo.</p>}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{products.map(product => <article key={product.id} className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-zinc-100 text-sm text-zinc-500">No photo yet</div>}
              <div className="p-4"><h3 className="break-words font-semibold">{product.name}</h3><p className="mt-1 text-sm text-zinc-500">{categories.find(item => item.id === product.category_id)?.name}</p><p className="mt-2">{formatMoney(product.price, restaurant.currency)}</p><p className="mt-2 text-sm text-zinc-500">{product.is_available ? "Available" : "Hidden from menu"}</p>
              <button className="mt-4 rounded-xl border border-zinc-300 px-4 py-2 font-medium" onClick={() => { setEditing(product); setPhoto(null); setFormKey(key => key + 1); setDraft({ name: product.name, description: product.description || "", price: String(product.price), category_id: product.category_id || "", is_available: product.is_available }); setMessage(`Editing ${product.name}. Update the form and save your changes.`); }} type="button">Edit {product.name}</button></div>
            </article>)}</div>
          </section>
        </fieldset>
      </div>
    </main>
  );
}

