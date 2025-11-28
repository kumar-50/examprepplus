# Promo Codes - Quick Test Checklist

## ⚡ Quick Start

### 1. Run Seed Scripts
```bash
npx tsx scripts/seed-promo-codes.ts
npx tsx scripts/update-plans.ts
```

## ✅ Test Checklist

### Basic Functionality
- [ ] Subscription modal shows only 3 plans (not 5)
- [ ] Promo code input field is visible
- [ ] Can type promo code (auto-uppercase)
- [ ] Apply button is clickable

### EARLYBIRD50 (50% OFF Yearly)
- [ ] Enter "EARLYBIRD50" on Yearly plan
- [ ] Click Apply
- [ ] Sees: Original ₹799, Discount -₹399.50, Final ₹399.50
- [ ] Pay button shows "Pay ₹399.50"
- [ ] Green badge shows "Early Bird Special"
- [ ] Can remove promo code with X button

### EARLYADOPT25 (25% OFF Any Plan)
- [ ] Enter "EARLYADOPT25" on Monthly plan
- [ ] Click Apply
- [ ] Sees: Original ₹99, Discount -₹24.75, Final ₹74.25
- [ ] Try on Half-yearly plan (should work)
- [ ] Try on Yearly plan (should work)

### Error Cases
- [ ] Enter invalid code → Shows error message
- [ ] Enter EARLYBIRD50 on Monthly plan → Shows "not applicable" error
- [ ] Empty input → Apply button disabled
- [ ] No plan selected → Shows "select plan first" error

### Payment Flow
- [ ] Complete payment with promo code
- [ ] Verify Razorpay charges discounted amount
- [ ] Check database: promo_code_usages has new row
- [ ] Check database: current_uses incremented

### UI/UX
- [ ] Promo section looks good in light mode
- [ ] Promo section looks good in dark mode
- [ ] Loading state shows while validating
- [ ] Discount amount updates when switching plans
- [ ] Removed promo can be re-applied

## 🐛 Common Issues

**"Database connection failed"**
- Check `.env.local` has `DATABASE_URL`
- Ensure dev server is running: `npm run dev`

**"Plan not found"**
- Run seed scripts first
- Check plans exist: `npx tsx scripts/check-plan-names.ts`

**"Promo code not found"**
- Run `npx tsx scripts/seed-promo-codes.ts`
- Check in Drizzle Studio: `npx drizzle-kit studio`

**Apply button doesn't work**
- Check browser console for errors
- Verify `/api/promo/validate` endpoint exists
- Check network tab for API response

## 📊 Verify in Database

```sql
-- Check promo codes exist
SELECT * FROM promo_codes;

-- Check usage after payment
SELECT * FROM promo_code_usages;

-- Check subscription plans
SELECT name, price, is_active FROM subscription_plans;
```

## ✨ Success Criteria

✅ Only 3 plans visible in modal
✅ Promo codes work as expected
✅ Discounts calculate correctly
✅ Payment flows successfully
✅ Usage tracked in database
✅ UI looks clean and professional

---

**All tests passing? Feature is ready! 🎉**
