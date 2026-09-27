import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/signup", url.origin));
    } catch {
      // Return to a usable sign-in form if configuration or verification fails.
    }
  }
  return NextResponse.redirect(new URL("/login?authError=confirmation", url.origin));
}
