# QuickMenu Starter

Starter project for a multi-restaurant digital menu platform.

Included:

- Restaurant signup
- Restaurant creation
- Multi-tenant public menus
- Categories
- Products
- Zustand cart
- Checkout
- Server-side order creation
- WhatsApp order handoff
- Supabase schema and starter RLS policies
- Demo restaurant route

## 1. Install

```bash
npm install
```

## 2. Create environment file

Copy:

```bash
cp .env.example .env.local
```

Fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Create database

Open Supabase SQL Editor and run:

```text
supabase/schema.sql
```

## 4. Important production change

The public `/api/orders` endpoint currently uses the normal server Supabase client.

Because the supplied RLS policies do not allow anonymous users to insert orders, use one of these production approaches:

1. Add a server-only Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`.
2. Create a security-definer Postgres function for checkout.

The admin client approach is the simplest first step.

Example file:

`src/lib/supabase/admin.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

Then use `supabaseAdmin` only in trusted server routes such as:

`src/app/api/orders/route.ts`

Never expose the service role key to a browser.

## 5. Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Demo menu:

```text
http://localhost:3000/demo-restaurant
```

Signup:

```text
http://localhost:3000/signup
```

## 6. Recommended next features

Build these next:

- Restaurant dashboard
- Product CRUD
- Category CRUD
- Product image upload
- Orders dashboard
- Customer records
- Inventory
- Paystack or Hubtel payment initialization
- Payment webhooks
- Restaurant QR-code generation
- Restaurant branding settings
- Subscription plans
- Platform admin
