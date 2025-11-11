# 📧 Supabase Email Confirmation Setup

## The Error You Saw

```
AuthApiError: Email not confirmed
```

This happens when Supabase requires email confirmation but the user hasn't clicked the confirmation link yet.

---

## 🔧 Quick Fix for Development

### Disable Email Confirmation

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Providers**
   - Click **Email** provider

3. **Disable Email Confirmation**
   - Scroll to **"Confirm email"** section
   - **Uncheck** "Enable email confirmations"
   - Click **Save**

4. **Confirm Existing Users** (if needed)
   
   Run in **SQL Editor**:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW(), 
       confirmed_at = NOW()
   WHERE email_confirmed_at IS NULL;
   ```

---

## ✅ For Production

### Keep Email Confirmation Enabled

For production, you **should** require email confirmation for security:

1. ✅ **Enable** "Confirm email" in Supabase
2. ✅ Configure email templates
3. ✅ Set up custom SMTP (optional, for better deliverability)
4. ✅ Add proper redirect URLs

### Code Already Handles It

I've updated your forms to:
- Show helpful message when email confirmation is required
- Handle "email not confirmed" errors gracefully
- Alert users to check their email after signup

---

## 🎨 Email Templates (Optional)

Customize the confirmation email in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Edit **"Confirm signup"** template
3. Customize subject and body
4. Use variables like `{{ .ConfirmationURL }}`

Example:
```html
<h2>Welcome to ExamPrepPlus!</h2>
<p>Click the link below to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

---

## 🔗 Redirect URLs

Add your app URLs to **allowed redirect URLs**:

1. **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/**
   https://your-domain.com/**
   ```

---

## 🧪 Testing

After disabling email confirmation:

```bash
# 1. Restart your dev server
npm run dev

# 2. Try signing up with a new email
# 3. Sign in immediately (no confirmation needed)
# 4. Should work! ✅
```

---

## 📋 Settings Comparison

| Setting | Development | Production |
|---------|-------------|------------|
| **Confirm email** | ❌ Disabled | ✅ Enabled |
| **Double confirm** | ❌ Disabled | ❌ Disabled |
| **Secure email change** | ❌ Disabled | ✅ Enabled |
| **Custom SMTP** | ❌ Not needed | ✅ Recommended |

---

## ⚠️ Important Notes

- **Development:** Disable confirmation for faster testing
- **Production:** Enable confirmation for security
- **Existing users:** Run SQL to confirm them manually
- **Code updated:** Now shows better error messages

---

## 🆘 Still Having Issues?

1. **Clear browser cookies/localStorage**
2. **Try incognito mode**
3. **Check Supabase logs** (Dashboard → Logs)
4. **Verify email settings saved** (reload Supabase dashboard)
5. **Wait 1-2 minutes** for settings to propagate

---

**You're all set!** Try signing in again after disabling email confirmation. 🚀
