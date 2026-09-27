"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [step, setStep] = useState<"account" | "restaurant">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantSlug, setRestaurantSlug] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function createAccount() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const credentials = { email: email.trim(), password };
      const { data, error } = signingIn
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);
      if (error) throw error;
      if (!data.session) {
        setMessage("Check your email and confirm your account, then return here and sign in to continue.");
        setSigningIn(true);
        return;
      }
      setStep("restaurant");
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
    window.location.href = `/${result.restaurant.slug}`;
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
          <div className="mt-8 space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <button
              type="button"
              onClick={createAccount}
              disabled={loading || !email || password.length < 6}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-40"
            >
              {loading ? "Please wait..." : signingIn ? "Sign in" : "Continue"}
            </button>
            <button type="button" disabled={loading} onClick={() => { setSigningIn(!signingIn); setMessage(""); }} className="text-sm text-zinc-300 underline">
              {signingIn ? "Create a new account" : "Already have an account? Sign in"}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <input
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Restaurant name"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="WhatsApp number, e.g. 23324..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />

            <button
              type="button"
              onClick={createRestaurant}
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
          </div>
        )}
      </div>
    </main>
  );
}
