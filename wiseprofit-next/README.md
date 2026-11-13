# WiseProfit Next

A separate Vite + React application in this repository. It does not replace or modify the legacy app in `wiseprofit/`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`).
3. Install and run:

```bash
npm install
npm run dev
```

## Supabase setup

Use the existing WiseProfit Supabase project only after confirming it is the intended project.

1. In Supabase SQL Editor, run `supabase/schema.sql` to ensure the base profile, inventory, withdrawal, RLS and profile-photo storage structures exist.
2. Run `supabase/migrations/202610290001_support_tickets.sql` to create support tickets and messages with row-level security.
3. In Authentication > Providers, enable Google if Google sign-in is required. Add the deployed Vercel URL and local URL to the Supabase Auth redirect allow list.
4. For developer inbox access, set the developer user's **app metadata** to `{"role":"support_admin"}`. Do not use user metadata; users can edit their own user metadata.

The support migration is separate from the base schema. Until it is applied, the support ticket UI will show a database setup error rather than silently pretending tickets work.

## Vercel deployment

Create a separate Vercel project for WiseProfit Next, or use a separate deployment configuration. Set:

- Root Directory: `wiseprofit-next`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Set the following environment variables in Vercel:

### Browser-safe variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)

### Server-only variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only; never prefix with `VITE_`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional; default is `openai/gpt-oss-20b`)
- `RESEND_API_KEY`
- `SUPPORT_ADMIN_EMAIL`
- `SUPPORT_EMAIL_FROM` (optional; use a sender/domain verified in Resend)

Never commit `.env`, `.env.local`, publishable/secret values, or service-role credentials. The `.env.example` file contains names and placeholders only.

## Implemented modules and current limits

- Dashboard, inventory, cashier, withdrawal and financial reports.
- Purchases page currently presents purchase entries represented by existing inventory rows. It is not yet a separate supplier invoice / multiple-batch ledger.
- Cashier currently increments cumulative units sold. It does not yet create per-sale receipts or transaction history.
- Notes are scoped by signed-in user in browser local storage; they are not yet synced across devices.
- JSON backup includes inventory, withdrawals, starting capital and local notes; import merges by ID and does not delete existing rows.
- Support chat uses a server-side Groq key; ticket notifications use server-side Resend credentials.
- Historical revenue charts remain disabled until actual dated sales transaction records exist. No sample revenue is fabricated.

## Checks

```bash
npm run build
npm test
```

The build type-checks frontend and serverless API source. Unit tests cover the core HPP, revenue, profit, stock, cash, equity and currency calculations.
