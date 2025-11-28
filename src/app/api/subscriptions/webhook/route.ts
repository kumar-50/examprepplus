import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/subscriptions/webhook
 * Handle Razorpay webhook events
 * 
 * Note: This is optional during development if you can't use webhooks with localhost.
 * The payment flow will still work via direct API verification in /api/subscriptions/verify
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Skip webhook verification if webhook secret is not configured (development mode)
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not configured. Webhooks disabled.');
      return NextResponse.json({
        success: true,
        message: 'Webhook received but verification skipped (no secret configured)',
      });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('📨 Razorpay webhook event:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;

      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Webhook event handlers
async function handlePaymentCaptured(payment: any) {
  console.log('✅ Payment captured:', payment.id);
  
  // Update subscription status if needed
  try {
    const result = await db
      .update(subscriptions)
      .set({
        paymentStatus: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.razorpayPaymentId, payment.id))
      .returning();

    if (result.length > 0) {
      console.log('✅ Subscription updated for payment:', payment.id);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('❌ Payment failed:', payment.id);
  
  // Update subscription status
  try {
    await db
      .update(subscriptions)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.razorpayPaymentId, payment.id));

    // TODO: Send email notification to user about payment failure
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleOrderPaid(order: any) {
  console.log('✅ Order paid:', order.id);
  // Order is paid, payment.captured event will follow
}

async function handleSubscriptionCharged(subscription: any) {
  console.log('✅ Subscription charged:', subscription.id);
  // Handle recurring subscription charge
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('⚠️ Subscription cancelled:', subscription.id);
  
  // Update subscription status
  try {
    await db
      .update(subscriptions)
      .set({
        paymentStatus: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.razorpayOrderId, subscription.id));

    // TODO: Send email notification about cancellation
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCompleted(subscription: any) {
  console.log('✅ Subscription completed:', subscription.id);
  // Subscription period completed
}
