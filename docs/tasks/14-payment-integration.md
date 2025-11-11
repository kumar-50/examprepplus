# 14 Payment Integration (Razorpay)

## Objective

Enable purchasing a subscription plan using Razorpay sandbox flow.

## Steps

1. Plan listing from `subscription_plans` table.
2. Create order API route (amount, currency, receipt, coupon discount applied prior if any).
3. Razorpay checkout modal integration in client.
4. Verify route to confirm signature → update subscription record.
5. Post-purchase toast + UI refresh.

## Acceptance Criteria

- Successful payment updates user subscription_status.
- Invalid signature does not grant access.

## Best Practices

- Keep secret key server-side only.
- Graceful handling of aborted checkout (no stale pending state).
