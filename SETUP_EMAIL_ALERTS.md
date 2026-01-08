# Email Alerts Setup Guide

## Problem
Email alerts for login and vote confirmation are not being sent because:
1. Supabase Edge Functions are not deployed to your Supabase project
2. The RESEND_API_KEY environment variable is not set in Supabase

## Solution

### Step 1: Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
- This will prompt you to create an access token at https://supabase.com/dashboard/account/tokens
- Create a new token and paste it when prompted

### Step 3: Set Up Secrets in Supabase
Navigate to your [Supabase Dashboard](https://supabase.com/dashboard) and:

1. Go to your project (cxijxxqqellvxqdtpgui)
2. Click on **Settings** → **Edge Functions** (in the left sidebar)
3. Under **Secrets**, add the following:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u` (from your .env file)

### Step 4: Deploy Edge Functions
From your project root directory, run:

```bash
supabase functions deploy send-login-alert
supabase functions deploy send-vote-confirmation
```

### Step 5: Verify Deployment
Check your Supabase Dashboard:
- Go to **Edge Functions** in the left sidebar
- You should see both functions listed with a green status

## Troubleshooting

### Functions don't appear after deployment
- Ensure you're logged in: `supabase login`
- Check the function names match exactly: `send-login-alert` and `send-vote-confirmation`
- Review the terminal output for error messages

### Emails still not sending
- Verify RESEND_API_KEY is correctly set in Supabase Secrets
- Check the email address in your RESEND_FROM_EMAIL setting (currently: onboarding@resend.dev)
- Note: If using a free Resend tier, only registered email addresses can receive emails
- Check Supabase Function logs for errors

### To view function logs
```bash
supabase functions get send-login-alert --logs
supabase functions get send-vote-confirmation --logs
```

## Testing
After deployment:
1. Log in to the application - you should receive a login alert email
2. Cast a vote - you should receive a vote confirmation email

If emails still don't arrive, check:
- Your SPAM/JUNK folder
- The email address you're using is in your Resend allowed list
- Function logs for error messages
