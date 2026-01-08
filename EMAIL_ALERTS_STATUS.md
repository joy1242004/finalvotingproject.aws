# Email Alerts - Current Status & Quick Fix

## What's Happening
✅ **Frontend Code**: Your app is correctly set up to send email alerts  
❌ **Backend Functions**: Not deployed to Supabase yet  
❌ **Environment Variables**: Not configured in Supabase  

---

## Why You're Not Receiving Emails

Your app tries to call these Supabase Edge Functions:
- `send-login-alert` - Called when user logs in
- `send-vote-confirmation` - Called when user casts a vote

But these functions:
1. **Don't exist on Supabase cloud** - They're only in your local project
2. **Don't have the API key** - RESEND_API_KEY is only in your `.env` file

---

## Quick Fix (5 minutes)

### Step 1: Get Your Supabase Project ID
Your project ID: **cxijxxqqellvxqdtpgui**

### Step 2: Deploy via Dashboard
1. Go to: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui
2. Click **Edge Functions** (left sidebar)
3. Click **Create a new function**
4. Name: `send-login-alert`
5. Copy this file: `supabase/functions/send-login-alert/index.ts`
6. Paste into editor
7. Click **Deploy**
8. Repeat for `send-vote-confirmation`

### Step 3: Add Secret
1. In Edge Functions, click **New secret**
2. Name: `RESEND_API_KEY`
3. Value: `re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u`
4. Click **Create secret**

### Step 4: Test
- Log in to your app → Check email for login alert
- Cast a vote → Check email for confirmation

---

## Still Not Working?

**Check these:**
- Did you add the RESEND_API_KEY secret? (Most common issue)
- Is the function actually deployed? (Check green checkmark)
- Check your spam folder
- Use a real email address (not test@example.com)
- For free Resend tier: only registered emails can receive

**View Logs:**
- Go to Edge Functions → Click function → **Logs** tab
- This shows exactly what's failing

---

## Files You Need to Deploy

1. `supabase/functions/send-login-alert/index.ts` (152 lines)
2. `supabase/functions/send-vote-confirmation/index.ts` (163 lines)

Both are complete and ready - just copy/paste into Supabase dashboard.

---

## For Production

When you're ready to use real emails:
1. Register your domain in Resend (https://resend.com)
2. Get an API key for that domain
3. Update `.env`: `RESEND_FROM_EMAIL` and `RESEND_API_KEY`
4. Update both function files: change `from` field to your domain
5. Redeploy functions

**Current setup uses**: `onboarding@resend.dev` (Resend test domain)

---

See `DEPLOY_FUNCTIONS.md` for detailed CLI instructions if you prefer command line.
