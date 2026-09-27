# Connect authentication

1. In Supabase project `beftfzydhwewzuvpotsv`, copy the **publishable** key from Settings → API Keys (the legacy anon key also works).
2. Set these values in `.env.local` and in your hosting project's environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://beftfzydhwewzuvpotsv.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
   ```

   Alternatively use `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put a secret or service-role key in a `NEXT_PUBLIC_` variable. Restart the local server or rebuild/redeploy after changing these values.

3. Enable the Email provider under Authentication. Keep email confirmation enabled if you want users to verify their address.
4. Under Authentication → URL Configuration, set Site URL to your deployed website origin. Allow these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-DEPLOYED-DOMAIN/auth/callback`
5. For a new database, run `schema.sql` once in the SQL Editor. Existing databases should use migrations; the policy statements in that file are not rerunnable.
6. Visit `/signup`, create an account, and open the confirmation email in the same browser that started signup. The PKCE callback exchanges the code for a cookie session. If you confirm in another browser, return to `/login` and sign in with your confirmed email and password.
7. Sign-in returns existing members to their first menu. Accounts without a menu continue to restaurant creation.

No service-role key is needed for signup or login. The starter database membership policies should be hardened before using this as a production multi-tenant management platform.

Reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client
