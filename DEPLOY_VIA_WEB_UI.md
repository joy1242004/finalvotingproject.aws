# Deploy Email Functions - Step-by-Step Web UI Guide

Since the CLI has permission limitations, use the web dashboard (easiest method).

---

## 🔍 Step 1: Check Current Status

Your Supabase project: **cxijxxqqellvxqdtpgui**

1. Go to: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui/functions
2. Look at the "Edge Functions" page
3. Check if `send-login-alert` and `send-vote-confirmation` already exist

---

## ✅ Step 2A: If Functions Don't Exist - Create Them

### Create send-login-alert function:

1. Click **Create a new function** button
2. Choose **Create with Typescript** (or JavaScript)
3. Enter function name: `send-login-alert`
4. Click **Create function**
5. Delete the template code
6. Copy ALL code from: `supabase/functions/send-login-alert/index.ts`
7. Paste into the editor
8. Click **Deploy**

### Create send-vote-confirmation function:

1. Click **Create a new function** button
2. Enter function name: `send-vote-confirmation`
3. Click **Create function**
4. Delete the template code
5. Copy ALL code from: `supabase/functions/send-vote-confirmation/index.ts`
6. Paste into the editor
7. Click **Deploy**

---

## 🔐 Step 2B: Add the API Key Secret

**IMPORTANT: Do this before testing!**

1. On the Edge Functions page, scroll down to **Secrets** section
2. Click **New secret**
3. Enter:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u`
4. Click **Create secret**

---

## 🧪 Step 3: Test

Once deployed:

1. Go to your app: http://localhost:8081
2. Log out (if logged in)
3. Log back in with your test account
4. **You should receive a login alert email within 10 seconds**
5. Check spam/junk folder if not in inbox

If you cast a vote and get a vote confirmation email = all working! ✅

---

## ❌ If Still No Login Alert Email

Check these in order:

### 1. Verify functions are deployed
- Go to Edge Functions dashboard
- You should see both functions with a green checkmark/status
- If red/error, click on each to see the error

### 2. Check that secret is set
- Scroll to Secrets section
- `RESEND_API_KEY` should be listed

### 3. Check browser console for errors
- Open DevTools (F12)
- Go to Console tab
- Log in again
- Look for any error messages
- You should see something like: "Login alert email sent" or "Login alert email failed"

### 4. Check Edge Function logs
- Click on `send-login-alert` function
- Click **Logs** tab
- You'll see exactly what error is happening

### 5. Test with curl command
If you want to manually test the function:

```bash
curl -X POST \
  https://cxijxxqqellvxqdtpgui.supabase.co/functions/v1/send-login-alert \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youremail@example.com",
    "userName": "Test User",
    "loginTime": "2026-01-08T12:00:00Z",
    "userAgent": "Mozilla/5.0"
  }'
```

Replace `YOUR_ANON_KEY` with value from `.env` file: `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 📝 Important Notes

**Emails from `onboarding@resend.dev`**:
- Free tier - limited to test emails
- Only verified email addresses can receive
- Make sure you're testing with an email verified in Resend

**Production Setup**:
- Create a real domain in Resend
- Update `RESEND_FROM_EMAIL` in `.env`
- Update `from` field in both function files
- Redeploy functions

---

## Quick Reference: Where Code Is

- **Login Alert**: `supabase/functions/send-login-alert/index.ts` (152 lines)
- **Vote Confirmation**: `supabase/functions/send-vote-confirmation/index.ts` (163 lines)

Both are complete and tested - just copy/paste into Supabase dashboard!

---

## Need More Help?

If stuck on web UI deployment, see the code sections below for what you should paste.

### Complete send-login-alert function (COPY THIS)
- File: `supabase/functions/send-login-alert/index.ts`
- 152 lines of ready-to-deploy code

### Complete send-vote-confirmation function (COPY THIS)
- File: `supabase/functions/send-vote-confirmation/index.ts`
- 163 lines of ready-to-deploy code

No modifications needed - just paste into Supabase editor!
