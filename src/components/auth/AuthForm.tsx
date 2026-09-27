"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage({ initialSigningIn = false }: { initialSigningIn?: boolean }) {
  const [step, setStep] = useState<"account" | "restaurant">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantSlug, setRestaurantSlug] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [signingIn, setSigningIn] = useState(initialSigningIn);

  async function continueWithAccount(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from("restaurant_users")
      .select("restaurants(slug)").eq("user_id", userId).limit(1);
    if (error) throw new Error("Signed in, but your menus could not be loaded. Check that the Supabase database schema has been installed.");
    const restaurant = data?.[0]?.restaurants;
    const menu = Array.isArray(restaurant) ? restaurant[0] : restaurant;
    if (menu?.slug) {
      window.location.assign(`/dashboard/${encodeURIComponent(menu.slug)}`);
      return;
    }
    setStep("restaurant");
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("authError")) {
      setMessage("The confirmation link could not be verified. If your email is already confirmed, sign in below; otherwise request a new signup email.");
      return;
    }
    async function restoreSession() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await continueWithAccount(user.id);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to restore your session.");
      }
    }
    void restoreSession();
  }, []);

  async function createAccount() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const credentials = { email: email.trim(), password };
      const { data, error } = signingIn
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      if (!data.session) {
        setMessage("Check your email and confirm your account, then return here and sign in to continue.");
        setSigningIn(true);
        return;
      }
      await continueWithAccount(data.session.user.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function createRestaurant() {
    setLoading(true);
    setMessage("");
    try {
    const response = await fetch("/api/restaurants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: restaurantName,
        slug: restaurantSlug,
        whatsappNumber
      })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error ?? "Unable to create restaurant");
    }

    const result = await response.json();
    window.location.href = `/dashboard/${encodeURIComponent(result.restaurant.slug)}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
          Restaurant onboarding
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          {step === "account"
            ? signingIn ? "Sign in to continue" : "Create your account"
            : "Create your restaurant"}
        </h1>
        {message && <p role="status" className="mt-4 rounded-xl border border-zinc-700 p-4 text-sm">{message}</p>}

        {step === "account" ? (
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void createAccount(); }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              aria-label="Email"
              autoComplete="email"
              required
              placeholder="Email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              aria-label="Password"
              autoComplete={signingIn ? "current-password" : "new-password"}
              minLength={signingIn ? 1 : 6}
              required
              placeholder="Password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-40"
            >
              {loading ? "Please wait..." : signingIn ? "Sign in" : "Sign up"}
            </button>
            <button type="button" disabled={loading} onClick={() => { setSigningIn(!signingIn); setMessage(""); }} className="text-sm text-zinc-300 underline">
              {signingIn ? "Create a new account" : "Already have an account? Sign in"}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void createRestaurant(); }}>
            <input
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Restaurant name"
              aria-label="Restaurant name"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <input
              value={restaurantSlug}
              onChange={(e) =>
                setRestaurantSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                )
              }
              placeholder="restaurant-slug"
              aria-label="Menu URL name"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="WhatsApp number, e.g. 23324..."
              aria-label="WhatsApp number"
              type="tel"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !restaurantName ||
                !restaurantSlug ||
                !whatsappNumber
              }
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-40"
            >
              {loading ? "Creating..." : "Create restaurant"}
            </button>
          </form>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-zinc-300 underline">Back to home</Link>
      </div>
    </main>
  );
}
