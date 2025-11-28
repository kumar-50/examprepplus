# Subscription System - Setup & Deployment Guide

## 🎉 Phase 1 Complete!

All Phase 1 features for the subscription system have been successfully implemented. This guide will help you set up and deploy the system.

---

## ✅ What's Been Built

### **1. Database & Seeding**
- ✅ Subscription plans schema (already exists)
- ✅ Seed script for 5 pricing plans
- ✅ Script: `npm run seed:plans`

### **2. API Routes (7 new endpoints)**
- ✅ `GET /api/subscriptions/plans` - Fetch all plans
- ✅ `POST /api/subscriptions/create-order` - Create Razorpay order
- ✅ `POST /api/subscriptions/verify` - Verify payment & activate
- ✅ `GET /api/subscriptions/status` - Get user subscription
- ✅ `GET /api/subscriptions/usage` - Get usage limits
- ✅ `GET /api/tests/check-access` - Check test access

### **3. Frontend Components**
- ✅ Pricing page (`/pricing`)
- ✅ Pricing cards with features
- ✅ Subscription modal with Razorpay checkout
- ✅ Upgrade banner (shows on dashboard)
- ✅ Subscription status widget (shows on dashboard)

### **4. Utilities & Helpers**
- ✅ Razorpay integration functions
- ✅ Subscription utilities (check status, usage limits)
- ✅ Access control helpers

---

## 🚀 Setup Instructions

### **Step 1: Install Dependencies**

No new dependencies needed! Razorpay checkout is loaded via CDN.

### **Step 2: Configure Environment Variables**

Add these to your `.env.local` file:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# App URL (for payment callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to get Razorpay keys:**
1. Go to https://dashboard.razorpay.com/
2. Sign up / Log in
3. Navigate to Settings → API Keys
4. Generate Test Keys (for development)
5. Copy Key ID and Key Secret

### **Step 3: Seed Subscription Plans**

Run the seed script to populate the database with your pricing plans:

```bash
npm run seed:plans
```

This will create:
- Monthly Pass (₹99)
- Half-Yearly Pass (₹499)
- Yearly Pass (₹799)
- Early Bird Special (₹399) - Limited offer
- Early Adopter (₹599) - Limited offer

### **Step 4: Test the System**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the pricing page:**
   ```
   http://localhost:3000/pricing
   ```

3. **Test payment flow:**
   - Click "Get Started" on any plan
   - Modal will open with Razorpay checkout
   - Use Razorpay test cards for testing

**Razorpay Test Cards:**
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

### **Step 5: Verify Access Control**

1. Create a free user account
2. Go to `/dashboard/tests`
3. Try to take more than 5 tests
4. You should see an upgrade prompt

---

## 📊 Pricing Plans Summary

| Plan | Price | Duration | Discount | Effective Monthly |
|------|-------|----------|----------|-------------------|
| **Monthly** | ₹99 | 30 days | - | ₹99 |
| **Half-Yearly** | ₹499 | 180 days | 16% | ₹83 |
| **Yearly** | ₹799 | 365 days | 33% | ₹67 |
| **Early Bird** 🔥 | ₹399 | 365 days | 50% | ₹33 |
| **Early Adopter** 💰 | ₹599 | 365 days | 25% | ₹50 |

---

## 🔐 Access Control Implementation

### **Free Tier Limits:**
- ✅ 5 full mock tests (lifetime)
- ✅ 50 practice questions per day
- ✅ 7 days of analytics history
- ✅ Basic features

### **Premium (Paid) Tier:**
- ✅ Unlimited everything
- ✅ Advanced analytics
- ✅ Weekly live tests
- ✅ Priority support

### **How It Works:**
1. User attempts to start a test
2. System checks `/api/tests/check-access`
3. If free limit reached → Show upgrade prompt
4. If premium → Allow access

---

## 🎨 UI Components Added

### **1. Pricing Page (`/pricing`)**
- Public page with all pricing plans
- Early bird & regular pricing sections
- Value propositions
- Free tier information

### **2. Subscription Modal**
- Opens when user clicks "Get Started"
- Shows plan summary
- Razorpay checkout integration
- Payment verification

### **3. Upgrade Banner**
- Shows on dashboard for free users
- Displays remaining usage (tests/questions)
- "View Plans" CTA button
- Dismissible

### **4. Subscription Status Widget**
- Shows current plan (Free/Premium)
- Days remaining
- Expiry warning (if < 7 days)
- Renew/Upgrade button

---

## 🧪 Testing Checklist

- [ ] Visit `/pricing` page
- [ ] Click "Get Started" on any plan
- [ ] Modal opens with Razorpay checkout
- [ ] Complete test payment
- [ ] Redirected to dashboard with success message
- [ ] Subscription status shows on dashboard
- [ ] Upgrade banner disappears for paid users
- [ ] Create free account
- [ ] Take 5 tests
- [ ] 6th test shows upgrade prompt
- [ ] Answer 50 practice questions
- [ ] 51st question shows limit message

---

## 🔧 Production Deployment

### **Before Going Live:**

1. **Switch to Live Razorpay Keys:**
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   ```

2. **Set Production URL:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Configure Razorpay Webhook:**
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://your-domain.com/api/subscriptions/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy webhook secret to `.env`

4. **Test with Real Cards:**
   - Use small amounts first (₹1-10)
   - Verify payment flow
   - Check database updates

5. **Monitor Payments:**
   - Razorpay dashboard for transactions
   - Your admin panel for subscriptions
   - Email notifications (if set up)

---

## 📈 Next Steps (Phase 2)

### **Immediate Enhancements:**
1. Email notifications (payment success/failure)
2. Admin subscription management dashboard
3. Referral system
4. Usage analytics

### **Future Features:**
1. Subscription cancellation
2. Plan upgrades/downgrades
3. Proration for plan changes
4. Auto-renewal management
5. Invoice generation

---

## 🐛 Troubleshooting

### **Issue: Razorpay checkout not opening**
**Solution:** Check browser console for errors. Ensure Razorpay script is loaded.

### **Issue: Payment succeeds but subscription not activated**
**Solution:** Check API logs. Verify signature validation is working.

### **Issue: Free tier limits not enforcing**
**Solution:** Check `hasReachedMockTestLimit()` function. Verify user ID is correct.

### **Issue: Pricing page not showing plans**
**Solution:** Ensure seed script ran successfully. Check `/api/subscriptions/plans` response.

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check API route logs
3. Verify environment variables
4. Test with Razorpay test mode first

---

## ✨ Success! Phase 1 Complete

Your subscription system is now ready for testing. Follow the setup instructions above to get started!

**Quick Start:**
```bash
# 1. Add Razorpay keys to .env.local
# 2. Seed subscription plans
npm run seed:plans

# 3. Start dev server
npm run dev

# 4. Visit http://localhost:3000/pricing
```

🎉 **Congratulations! You can now start monetizing your platform!** 🎉
