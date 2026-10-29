# WiseProfit Support System — Setup

The support system uses Supabase for persistent tickets/replies, Vercel serverless functions for AI/email, and Resend for email. Provider secrets must never be exposed to browser code.

## Database
Run `supabase/migrations/202610290001_support_tickets.sql` in the Supabase SQL Editor. It creates ticket/message tables and RLS policies. Admin authorization relies on the trusted Supabase Auth `app_metadata.role = "support_admin"` claim, not user-editable metadata.

## Vercel server-only environment variables
Set these in Project Settings → Environment Variables (Production and Preview as appropriate):
- `SUPABASE_URL`: existing Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service role secret; server only, never prefix with VITE_
- `OPENAI_API_KEY`: optional until AI is enabled
- `SUPPORT_AI_MODEL`: optional, defaults to `gpt-4o-mini`
- `RESEND_API_KEY`: required for email notification
- `SUPPORT_ADMIN_EMAIL`: developer inbox
- `SUPPORT_EMAIL_FROM`: optional verified sender, e.g. `WiseProfit Support <support@your-domain>`

Redeploy after configuration. Verify the sender/domain in Resend. The onboarding sender is suitable only for limited testing.

## Admin access
Grant the trusted developer account an `app_metadata` claim of `{"role":"support_admin"}` using a trusted server/admin process. Never use user-editable `user_metadata` for authorization. Refresh the session after changing the claim.

## Operations
A ticket must remain saved if AI/email is unavailable. Email failure must not delete a ticket. Before production use, test owner-vs-other-user access, admin access, invalid tokens, missing keys, rate limiting, and notification failures. AI is informational and must not receive inventory/financial records unless the user explicitly submits them.
