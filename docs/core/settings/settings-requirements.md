# Settings - Requirements & Specifications

## Overview
Settings page provides user profile management and subscription control. Kept intentionally simple with focus on essential user account operations.

**Route:** `/dashboard/settings`

---

## ⚠️ CURRENT STATUS: NOT IMPLEMENTED

Settings page needs to be built from scratch.

---

## 🎯 PURPOSE & USER INTENT

**User Question:** "How do I update my profile? How do I manage my subscription?"

**Goals:**
- Update personal information
- Change email/password
- Manage subscription plan
- Cancel or upgrade subscription
- View billing history
- Delete account (optional)

**Key Principle:** Keep it simple - only essential settings, no bloat.

---

## 📊 REQUIRED FEATURES

### 1. Profile Settings
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- **Profile Picture/Avatar**
  - Upload image or use initials
  - Remove/change avatar
  
- **Personal Information**
  - Full Name
  - Email (read-only, or require verification to change)
  - Phone Number (optional)
  
- **Exam Details**
  - Target Exam (RRB NTPC, etc.)
  - Exam Date (for countdown)
  - Exam Center (optional)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Profile Settings                           │
├─────────────────────────────────────────────┤
│  ┌────┐                                     │
│  │ M  │  [Upload Photo] [Remove]            │
│  └────┘                                     │
│                                             │
│  Full Name                                  │
│  [Muthu Kumar                            ]  │
│                                             │
│  Email                                      │
│  [muthu08812@gmail.com                  ]  │
│  🔒 Verified                               │
│                                             │
│  Phone (Optional)                           │
│  [                                       ]  │
│                                             │
│  Target Exam                                │
│  [RRB NTPC 2026                        ▼]  │
│                                             │
│  Exam Date                                  │
│  [2026-01-08                            ]  │
│                                             │
│  [Save Changes]                             │
└─────────────────────────────────────────────┘
```

**Database Fields:**
```sql
-- users table (Supabase Auth + metadata)
user_metadata: {
  name: string
  avatar_url: string
  phone: string
  target_exam: string
  exam_date: date
  exam_center: string
}
```

---

### 2. Account Security
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- **Change Password**
  - Current password
  - New password
  - Confirm password
  
- **Email Verification Status**
  - Show if verified
  - Resend verification email

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Security                                   │
├─────────────────────────────────────────────┤
│  Email Verification                         │
│  ✅ Your email is verified                 │
│                                             │
│  Password                                   │
│  Last changed: Nov 10, 2025                │
│  [Change Password]                          │
│                                             │
│  ┌─── Change Password Modal ─────────────┐ │
│  │ Current Password                       │ │
│  │ [●●●●●●●●                           ]  │ │
│  │                                        │ │
│  │ New Password                           │ │
│  │ [●●●●●●●●                           ]  │ │
│  │                                        │ │
│  │ Confirm New Password                   │ │
│  │ [●●●●●●●●                           ]  │ │
│  │                                        │ │
│  │ [Cancel]  [Update Password]            │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

### 3. Subscription Management
**Priority:** HIGH ⭐⭐⭐

**What to Show:**

**A. Current Plan Display**
- Plan name (Free/Premium/Pro)
- Price
- Billing cycle (Monthly/Yearly)
- Features included
- Next billing date
- Status (Active/Cancelled/Expired)

**B. Plan Actions**
- Upgrade plan (if on Free)
- Change billing cycle (Monthly ↔ Yearly)
- Cancel subscription
- Reactivate subscription (if cancelled)

**C. Billing History**
- Last 10 invoices
- Invoice number, date, amount, status
- Download invoice PDF

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Subscription                               │
├─────────────────────────────────────────────┤
│  Current Plan: Free                         │
│  ┌─────────────────────────────────────┐   │
│  │  Free Plan                          │   │
│  │  • 5 tests per day                  │   │
│  │  • Basic analytics                  │   │
│  │  • Community support                │   │
│  │                                      │   │
│  │  [Upgrade to Premium]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Available Plans:                           │
│  ┌─────────────┬─────────────────────────┐ │
│  │ Premium     │ ₹499/month              │ │
│  │             │ • Unlimited tests        │ │
│  │             │ • Advanced analytics     │ │
│  │             │ • Priority support       │ │
│  │             │ [Select Plan]            │ │
│  ├─────────────┼─────────────────────────┤ │
│  │ Premium     │ ₹4,999/year (save 17%)  │ │
│  │ (Yearly)    │ Same features as above   │ │
│  │             │ [Select Plan]            │ │
│  └─────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────┤
│  Billing History                            │
│  • INV-001 | Nov 1, 2025 | ₹499 | Paid    │
│  • INV-002 | Oct 1, 2025 | ₹499 | Paid    │
│  [View All]                                 │
└─────────────────────────────────────────────┘
```

**If User Has Active Subscription:**
```
┌─────────────────────────────────────────────┐
│  Current Plan: Premium (Monthly)            │
│  ┌─────────────────────────────────────┐   │
│  │  ✅ Active                          │   │
│  │  ₹499/month                         │   │
│  │  Next billing: Dec 1, 2025          │   │
│  │                                      │   │
│  │  Features:                           │   │
│  │  ✅ Unlimited tests                 │   │
│  │  ✅ Advanced analytics              │   │
│  │  ✅ Priority support                │   │
│  │                                      │   │
│  │  [Switch to Yearly] [Cancel Plan]   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

### 4. Preferences (Optional - Phase 2)
**Priority:** LOW ⭐

**What to Show:**
- **Notifications**
  - Email notifications (goal reminders, achievements)
  - Push notifications (if web push enabled)
  
- **Display**
  - Theme: Light/Dark/Auto
  - Language: English (future: Hindi, etc.)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Preferences                                │
├─────────────────────────────────────────────┤
│  Notifications                              │
│  ☑ Email notifications                     │
│  ☑ Goal reminders                          │
│  ☑ Achievement unlocks                     │
│  ☐ Weekly progress reports                 │
│                                             │
│  Display                                    │
│  Theme: [Auto                           ▼] │
│  Language: [English                     ▼] │
│                                             │
│  [Save Preferences]                         │
└─────────────────────────────────────────────┘
```

---

### 5. Danger Zone (Optional)
**Priority:** LOW ⭐

**What to Show:**
- **Export Data**
  - Download all user data (GDPR compliance)
  - JSON format with all test history, answers, etc.

- **Delete Account**
  - Permanent account deletion
  - Requires password confirmation
  - Shows warning about data loss

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ⚠️ Danger Zone                            │
├─────────────────────────────────────────────┤
│  Export Your Data                           │
│  Download all your data in JSON format      │
│  [Export Data]                              │
│                                             │
│  Delete Account                             │
│  ⚠️ This action cannot be undone           │
│  [Delete Account]                           │
│                                             │
│  ┌─── Confirm Deletion ─────────────────┐  │
│  │ This will permanently delete:        │  │
│  │ • All your test attempts             │  │
│  │ • Progress and goals                 │  │
│  │ • Subscription (if any)              │  │
│  │                                       │  │
│  │ Type "DELETE" to confirm:            │  │
│  │ [                                  ]  │  │
│  │                                       │  │
│  │ Enter your password:                 │  │
│  │ [●●●●●●●●                          ]  │  │
│  │                                       │  │
│  │ [Cancel]  [Delete My Account]        │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 📱 RESPONSIVE LAYOUT

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────┐
│  Settings                                       │
├───────────────┬─────────────────────────────────┤
│ Navigation:   │  Content Area:                  │
│ • Profile     │  [Profile Form]                 │
│ • Security    │  • Avatar upload                │
│ • Subscription│  • Name, Email fields           │
│ • Preferences │  • Exam details                 │
│ • Danger Zone │  • Save button                  │
└───────────────┴─────────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────────┐
│  Settings         │
│  [Profile     ▼]  │
├───────────────────┤
│  [Profile Form]   │
│  Stacked          │
│  vertically       │
└───────────────────┘
```

---

## 🔄 DATA FLOW

### Profile Update Flow
```typescript
1. User changes name/email/phone
2. Click "Save Changes"
3. Validate inputs (client-side)
4. POST /api/settings/profile
5. Update Supabase user_metadata
6. Show success message
7. Refresh user data in layout
```

### Subscription Flow
```typescript
1. User clicks "Upgrade to Premium"
2. Open Stripe Checkout or Payment modal
3. User completes payment
4. Stripe webhook fires
5. Update subscription status in database
6. Redirect back to settings
7. Show success + updated plan
```

### Password Change Flow
```typescript
1. User enters current + new password
2. Click "Update Password"
3. Validate passwords
4. Call Supabase auth.updateUser()
5. Send password change confirmation email
6. Show success message
7. Log out user (optional)
```

---

## 🎨 UI COMPONENTS NEEDED

### New Components:
1. `<SettingsLayout />` - Sidebar navigation + content area
2. `<ProfileSettingsForm />` - Profile editing form
3. `<AvatarUpload />` - Image upload with preview
4. `<PasswordChangeModal />` - Password update dialog
5. `<SubscriptionCard />` - Current plan display
6. `<PlanSelector />` - Available plans grid
7. `<BillingHistory />` - Invoice list
8. `<DeleteAccountModal />` - Confirmation dialog

### Existing Components to Reuse:
- `<Card>`, `<CardHeader>`, `<CardContent>` - Layout
- `<Input>`, `<Label>` - Form fields
- `<Button>` - Actions
- `<Select>` - Dropdowns
- `<Switch>` - Toggle settings
- `<Badge>` - Status indicators
- `<Dialog>` - Modals

---

## 🔌 API ENDPOINTS NEEDED

### 1. GET `/api/settings/profile`
Get current user profile.

**Response:**
```typescript
{
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  phone: string;
  target_exam: string;
  exam_date: string;
  email_verified: boolean;
}
```

### 2. PUT `/api/settings/profile`
Update user profile.

**Request:**
```typescript
{
  name?: string;
  phone?: string;
  target_exam?: string;
  exam_date?: string;
  avatar_url?: string;
}
```

### 3. POST `/api/settings/avatar`
Upload profile picture.

**Request:** FormData with image file
**Response:** `{ avatar_url: string }`

### 4. POST `/api/settings/change-password`
Update password (via Supabase Auth).

**Request:**
```typescript
{
  current_password: string;
  new_password: string;
}
```

### 5. GET `/api/settings/subscription`
Get subscription details.

**Response:**
```typescript
{
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  price: number;
  next_billing_date: string;
  features: string[];
}
```

### 6. POST `/api/settings/subscription/checkout`
Create Stripe checkout session.

**Request:**
```typescript
{
  plan: 'premium' | 'pro';
  billing_cycle: 'monthly' | 'yearly';
}
```

**Response:**
```typescript
{
  checkout_url: string; // Redirect to Stripe
}
```

### 7. POST `/api/settings/subscription/cancel`
Cancel subscription.

### 8. POST `/api/settings/export-data`
Export user data (GDPR).

**Response:** JSON file download

### 9. DELETE `/api/settings/account`
Delete user account.

**Request:**
```typescript
{
  password: string;
  confirmation: string; // Must be "DELETE"
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (MVP) - Week 1
1. ✅ Profile Settings (name, email, phone, exam details)
2. ✅ Avatar upload
3. ✅ Current subscription display
4. ✅ Password change modal

### Phase 2 - Week 2
5. ✅ Upgrade to Premium flow
6. ✅ Billing history
7. ✅ Cancel subscription

### Phase 3 (Enhancement)
8. ✅ Preferences (notifications, theme)
9. ✅ Export data
10. ✅ Delete account

---

## 🧪 TESTING REQUIREMENTS

### Test Scenarios:
1. **Profile Update**
   - Update name → Should reflect everywhere
   - Upload avatar → Should show in header
   - Change exam date → Should update countdown

2. **Password Change**
   - Wrong current password → Show error
   - Weak new password → Show validation
   - Successful change → Send confirmation email

3. **Subscription**
   - Free user → Show upgrade options
   - Premium user → Show cancel option
   - Payment success → Update plan immediately
   - Payment failure → Show error, don't change plan

4. **Account Deletion**
   - Wrong password → Block deletion
   - Wrong confirmation text → Block deletion
   - Successful deletion → Delete all user data

---

## 📈 SUCCESS METRICS

- **Profile Updates:** % of users who update profile in first week
- **Avatar Uploads:** % of users with custom avatars
- **Subscription Conversions:** Free → Premium conversion rate
- **Cancellation Rate:** % of users who cancel within 30 days
- **Setting Changes:** Average settings updated per user

---

## 🚀 FUTURE ENHANCEMENTS

### Version 2.0:
- **Two-factor authentication (2FA)**
- **Session management** (view active devices, log out all)
- **Email preferences** (granular notification control)
- **API keys** (for developers)
- **Connected accounts** (Google, Facebook SSO)
- **Custom exam schedules**
- **Study reminders** (daily/weekly)
- **Progress reports** (auto-email weekly summary)

### Version 3.0:
- **Team/Family plans**
- **Referral system**
- **Gift subscriptions**
- **Multi-language support**
- **Accessibility settings** (font size, contrast)
- **Keyboard shortcuts customization**

---

## 🏗️ ARCHITECTURE DECISIONS

### Why Simple?
- Most users rarely change settings
- Focus on core features: profile + subscription
- Avoid overwhelming users with options
- Faster to implement and maintain

### Why Separate Subscription Page?
- Consider moving subscription to `/dashboard/subscription`
- Settings = Personal info + Security
- Subscription = Billing + Plans (more complex)
- Decision: Keep together for MVP, split later if needed

### Avatar Storage?
- Use Supabase Storage for avatars
- Create `avatars` bucket
- Public read, authenticated write
- Resize images on upload (max 500x500)

---

## 📚 RELATED DOCUMENTATION

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Stripe Checkout Integration](https://stripe.com/docs/checkout)
- [User Profile Management](../../lib/user-profile.ts)

---

## ✅ DEFINITION OF DONE

Feature is complete when:
- [ ] Profile settings form working
- [ ] Avatar upload functional
- [ ] Password change modal working
- [ ] Subscription status displayed
- [ ] Upgrade flow integrated (Stripe)
- [ ] Billing history shown
- [ ] Cancel subscription working
- [ ] All forms validated
- [ ] Error handling in place
- [ ] Responsive on mobile
- [ ] Success/error messages shown
- [ ] Email confirmations sent
- [ ] Tests passing
- [ ] Documentation updated

---

**Last Updated:** November 24, 2025
**Status:** Requirements Defined - Ready for Implementation
**Owner:** Development Team
**Stakeholders:** Product, Engineering
