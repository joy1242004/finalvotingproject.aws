# Manual Email Alerts Setup (Recommended)

## Quick Overview
Your email alert functions are ready to deploy. You need to:
1. Set an environment variable in Supabase
2. Deploy two Edge Functions to your Supabase project

---

## STEP 1: Set Environment Variables in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **cxijxxqqellvxqdtpgui**
3. Click **Settings** (bottom left sidebar)
4. Go to **Edge Functions** tab
5. Click **New secret** under "Secrets"
6. Add this secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u`
7. Click **Create secret**

---

## STEP 2: Deploy Email Functions

You can deploy using one of these methods:

### Method A: Using Supabase Web Dashboard (Easiest)

1. In Supabase Dashboard, go to **Edge Functions**
2. Click **Create a new function**
3. Name it: `send-login-alert`
4. Copy the entire code from `supabase/functions/send-login-alert/index.ts`
5. Paste it into the editor
6. Click **Deploy**
7. Repeat for `send-vote-confirmation`

### Method B: Using Supabase CLI (If you have access token)

Create a `.env.local` file with your Supabase access token:
```
SUPABASE_ACCESS_TOKEN=your_access_token
```

Then run:
```bash
npx supabase functions deploy send-login-alert --project-id cxijxxqqellvxqdtpgui
npx supabase functions deploy send-vote-confirmation --project-id cxijxxqqellvxqdtpgui
```

### Method C: Using GitHub (If connected)

If you have GitHub Actions connected to Supabase:
1. Push your changes to GitHub
2. Supabase will auto-deploy the functions

---

## Code to Deploy

### Function 1: send-login-alert
**Location**: `supabase/functions/send-login-alert/index.ts`

This function sends an email when someone logs in to their account.

### Function 2: send-vote-confirmation  
**Location**: `supabase/functions/send-vote-confirmation/index.ts`

This function sends an email when someone casts a vote.

---

## Verification

After deployment, test it:
1. Go to your app at `http://localhost:8081`
2. Log in with your test account
3. You should receive a login alert email
4. Cast a vote
5. You should receive a vote confirmation email

If emails don't arrive:
- Check your spam/junk folder
- Make sure the email address is registered with Resend (it's using onboarding@resend.dev domain)
- Check Supabase Edge Functions logs for errors

---

## Important Notes

- **Email Domain**: Currently using `onboarding@resend.dev` (free Resend domain)
- For production, you should:
  1. Verify your own domain in Resend
  2. Update `RESEND_FROM_EMAIL` in `.env`
  3. Update the `from` field in both functions to use your domain

---

## Getting Help

If you need your Supabase Access Token:
1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Create new token**
3. Name it (e.g., "CLI Deployment")
4. Copy the token and use it above

For more info: https://supabase.com/docs/guides/functions/deploy
