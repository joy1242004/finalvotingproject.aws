# Debug Email Alerts - Test Guide

Since you're getting password recovery emails (Supabase built-in), but NOT login alerts (custom function), the issue is:

**The `send-login-alert` function either:**
1. Doesn't exist on your Supabase project yet, OR
2. Exists but has an error

---

## 🔧 Quick Debug - Test in Browser Console

### Step 1: Open DevTools
- Press **F12** or right-click → **Inspect**
- Go to **Console** tab

### Step 2: Run Test Command
Paste this in the console:
```javascript
testFunctions.testLoginAlert()
```

### Step 3: Check Output

**Success Output**:
```
Function response: {data: {...}}
Success! Response data: {id: "...", from: "...", to: [...]}
```

**Error Output - Function Not Found**:
```
Error 404: Request failed with status code 404
Function call failed: functions/send-login-alert not found
```
→ **Solution**: Deploy the function (see DEPLOY_VIA_WEB_UI.md)

**Error Output - Missing Secret**:
```
Function call failed: RESEND_API_KEY is undefined
Error in send-login-alert function: RESEND_API_KEY is not set
```
→ **Solution**: Add RESEND_API_KEY secret (see DEPLOY_VIA_WEB_UI.md)

**Error Output - Invalid API Key**:
```
Function response: {
  warning: "Email not sent - Resend domain not verified",
  details: {status: 400, message: "Invalid API key"}
}
```
→ **Solution**: Verify API key is correct in `.env` file and secret

**Error Output - Other**:
```
Function call failed: [error details]
```
→ Write down the exact error and see solutions below

---

## 📋 Detailed Solution by Error

### 1. Function Not Found (404)

**Cause**: Function not deployed

**Fix**:
1. Go to: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui/functions
2. Deploy `send-login-alert` function (copy from `supabase/functions/send-login-alert/index.ts`)
3. Deploy `send-vote-confirmation` function (copy from `supabase/functions/send-vote-confirmation/index.ts`)
4. Test again in console

---

### 2. RESEND_API_KEY Not Set

**Cause**: Secret not added to Supabase

**Fix**:
1. Go to: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui/functions
2. Scroll to **Secrets** section
3. Click **New secret**
4. Add: `RESEND_API_KEY` = `re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u`
5. Test again

---

### 3. Invalid API Key

**Cause**: API key is wrong or Resend domain not verified

**Check**:
1. Your `.env` file has: `RESEND_API_KEY="re_FKr3LpNV_DUPdyRq7dGSfEuGEra6kT28u"`
2. That same key is in Supabase secrets
3. Go to https://resend.com → Check if domain is verified

**Fix**:
- If using `onboarding@resend.dev` (test domain): Create account at https://resend.com with your email to receive test emails
- If using custom domain: Verify domain in Resend dashboard

---

## ✅ Complete Check List

- [ ] Test function in browser console: `testFunctions.testLoginAlert()`
- [ ] If 404 error: Deploy functions to Supabase
- [ ] If secret error: Add RESEND_API_KEY secret to Supabase
- [ ] If invalid key: Verify key in both `.env` and Supabase secrets match
- [ ] If still errors: Check Supabase function logs (dashboard → functions → click function → Logs)
- [ ] Test login: Log out, log back in, check email
- [ ] Test vote: Cast a vote, check email

---

## 🔍 View Function Logs

If test returns an error:

1. Go to: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui/functions
2. Click on `send-login-alert`
3. Click **Logs** tab
4. You'll see exact error from last function execution
5. This tells you exactly what's wrong

---

## 📧 Email Not Arriving?

Even if function test says "success":

**Check 1: Spam/Junk folder**
- Resend test emails might be flagged

**Check 2: Email address registered**
- Go to https://resend.com
- Make sure your email is in "Verified Recipients" list
- Add it if not there

**Check 3: Domain issue**
- Resend free tier only allows `onboarding@resend.dev` domain
- For production: Register your own domain

**Check 4: Rate limiting**
- If testing too many times: Resend might rate limit
- Wait 5 minutes and try again

---

## Quick Links

- **Your Project**: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui
- **Edge Functions**: https://supabase.com/dashboard/projects/cxijxxqqellvxqdtpgui/functions
- **Resend Dashboard**: https://resend.com
- **Supabase Docs**: https://supabase.com/docs/guides/functions

---

## Next Steps

1. Open browser console (F12)
2. Run: `testFunctions.testLoginAlert()`
3. Post the output here
4. Follow the solution for the specific error you get
