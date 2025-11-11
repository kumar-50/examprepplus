# 15 Coupon Validation

## Objective

Apply discount codes with validation (active, not expired, usage limit).

## Steps

1. Coupon input component in pricing/checkout.
2. API validation call returns adjusted amount + status.
3. Show discount line item; lock coupon on order creation.
4. On successful payment increment usage counter.

## Acceptance Criteria

- Invalid coupon shows clear error; amount unchanged.
- Valid coupon reduces order amount accordingly.

## Best Practices

- Prevent re-use by same user if policy requires (configurable flag).
