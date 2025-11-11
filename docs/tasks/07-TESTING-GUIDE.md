# Authentication Setup & Testing Guide

## Initial Setup

### 1. Apply Database Triggers

Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of migrations/auth-triggers.sql
```

This will ensure that:
- New Supabase auth users automatically get a profile in `public.users`
- Last login timestamps are tracked
- User metadata is synced

### 2. Verify Environment Variables

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-database-connection-string
```

### 3. Start Development Server

```bash
npm run dev
```

## Testing the Authentication Flow

### Test 1: Sign Up Flow

1. Navigate to `http://localhost:3000`
2. Click "Sign Up" in the header
3. Fill in:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Sign Up"

**Expected Result:**
- User is created in Supabase Auth
- Profile automatically created in `public.users` table
- User is redirected to home page
- Header shows user avatar with initials "TU"

### Test 2: Sign In Flow

1. Sign out if currently signed in (click avatar → Sign out)
2. Click "Sign In" in header
3. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Sign In"

**Expected Result:**
- User is authenticated
- Redirected to home page
- Avatar appears in header

### Test 3: User Dropdown

1. While signed in, click on avatar in header
2. Verify dropdown shows:
   - User's full name
   - User's email
   - Profile link
   - Settings link
   - Sign out button

### Test 4: Sign Out

1. Click avatar → Sign out
2. Verify:
   - User is signed out
   - Redirected to home page
   - Header shows "Sign In" and "Sign Up" buttons

### Test 5: Admin Protection (Non-Admin)

1. Sign in as a regular user
2. Try to navigate to `http://localhost:3000/admin`

**Expected Result:**
- Redirected to `/login?redirect=/admin`
- Cannot access admin dashboard

### Test 6: Create Admin User

In Supabase SQL Editor, run:

```sql
-- Replace with your test user's email
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@example.com';
```

### Test 7: Admin Access (Admin User)

1. Sign in as the admin user
2. Navigate to `http://localhost:3000/admin`

**Expected Result:**
- Admin dashboard is displayed
- Shows welcome card with email and role
- Role shows as "admin"

### Test 8: Validation Testing

Try these scenarios:

**Invalid Email:**
- Email: "notanemail"
- Should show "Please enter a valid email address"

**Short Password:**
- Password: "12345"
- Should show "Password must be at least 6 characters"

**Password Mismatch:**
- Password: "password123"
- Confirm: "different123"
- Should show "Passwords don't match"

**Duplicate Email:**
- Try signing up with existing email
- Should show generic error message

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Verify variable names are exact (including `NEXT_PUBLIC_` prefix)
- Restart dev server after adding variables

### Issue: User not appearing in database
- Check that `auth-triggers.sql` was applied
- Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check Supabase logs for errors

### Issue: Admin route still accessible to non-admin
- Clear browser cookies and local storage
- Verify user role in database: `SELECT email, role FROM users;`
- Check server-side rendering is working (not using client-side only)

### Issue: Cannot sign in after sign up
- Check Supabase Auth settings
- Verify "Confirm email" is disabled (or check email for confirmation link)
- Check Supabase Auth logs for errors

### Issue: Avatar not showing
- Check Network tab for avatar URL loading
- Verify avatar is optional (initials should show as fallback)
- Check user metadata: `SELECT raw_user_meta_data FROM auth.users;`

## Next Steps After Testing

1. ✅ Verify all authentication flows work
2. ✅ Confirm admin protection is working
3. ✅ Test edge cases and error handling
4. 📋 Move to Task 08: Admin CRUD UI
5. 📋 Implement question management for admins
6. 📋 Build CSV import flow (Task 09)

## Important Notes

- **Email Confirmation:** By default, Supabase may require email confirmation. For development, you can disable this in Supabase Dashboard → Authentication → Settings → Enable email confirmations
- **Password Requirements:** Currently set to minimum 6 characters. Adjust in form schema if needed.
- **Generic Errors:** Error messages are intentionally generic for security. Check server logs for detailed errors.
- **Session Persistence:** Sessions persist in browser cookies. Clear cookies to test fresh authentication.

## Admin User Management

To manage admin users:

```sql
-- List all users and their roles
SELECT email, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;

-- Make user admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Remove admin role
UPDATE users SET role = 'user' WHERE email = 'admin@example.com';

-- Deactivate user
UPDATE users SET is_active = false WHERE email = 'user@example.com';
```
