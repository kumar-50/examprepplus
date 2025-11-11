# 16 Subscription Gating

## Objective

Restrict access to premium tests/features based on active subscription.

## Steps

1. Middleware/guard checking subscription_status before entering premium routes.
2. UI prompts upgrade with plan CTA when blocked.
3. Dashboard badges indicating locked tests.
4. Refresh subscription state post-payment.

## Acceptance Criteria

- Non-subscribed user cannot start premium test.
- Subscribed user gains access immediately after verify.

## Best Practices

- Cache subscription in client with short TTL; always allow manual refresh.
