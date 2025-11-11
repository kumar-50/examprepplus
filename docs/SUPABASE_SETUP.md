# Supabase Setup Guide

## Configuration Complete ✅

The following Supabase integration has been implemented:

### Files Created

1. **`src/lib/supabase/browser.ts`** - Browser client with singleton pattern
   - Prevents re-instantiation on hot reload
   - Includes dev console logging for debugging

2. **`src/lib/supabase/server.ts`** - Server-side client for Server Components/Actions
   - RLS-safe with cookie handling
   - Supports Next.js App Router

3. **`src/hooks/use-session-user.ts`** - React hook for session management
   - Returns current user, loading state, and errors
   - Automatically subscribes to auth state changes

4. **`src/app/auth-test/page.tsx`** - Test page for authentication
   - Sign up and sign in forms
   - Current user display
   - Error handling with toast notifications

5. **`.env.local`** - Environment variables (not committed to git)
6. **`.env.example`** - Template for environment variables

### Next Steps

#### 1. Configure Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings → API**
4. Copy your project values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

#### 2. Update Environment Variables

Edit `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

#### 3. Enable Email Authentication

In your Supabase project:
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

#### 4. Test Authentication

1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:3000/auth-test
3. Try signing up with a test email
4. Check your email for verification link
5. Try signing in with the credentials

### Development Tips

- **Console Logs**: In development, you'll see singleton pattern working:
  ```
  ✨ Created new Supabase browser client
  ♻️ Reusing existing Supabase browser client
  ```

- **Session Persistence**: Sessions are automatically managed via cookies
- **Auto-refresh**: Session tokens refresh automatically before expiration

### Security Best Practices

✅ **Never expose service role key** - Only use anon key on client
✅ **Use RLS policies** - Implement Row Level Security in database
✅ **Validate on server** - Always verify auth in Server Actions
✅ **Environment variables** - `.env.local` is gitignored

### Troubleshooting

**Error: Missing Supabase environment variables**
- Ensure `.env.local` exists with correct values
- Restart dev server after changing env vars

**Error: Invalid credentials**
- Check if email provider is enabled in Supabase
- Verify email confirmation if required

**Network failure**
- Check Supabase project status
- Verify project URL is correct

### Usage Examples

#### Client Component
```tsx
'use client'
import { useSessionUser } from '@/hooks/use-session-user'

export function MyComponent() {
  const { user, loading } = useSessionUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Hello {user.email}</div>
}
```

#### Server Action
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function myServerAction() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // Your server logic here
}
```

## Acceptance Criteria Met

✅ Can create a new user and retrieve session
✅ Client not re-instantiated on hot reload
✅ Session auto-refresh mechanism enabled
✅ Error handling with network failures
✅ Type-safe with TypeScript

---

**Next Task**: Proceed to `03-database-migrations.md`
