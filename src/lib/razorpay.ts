import crypto from 'crypto';

/**
 * Razorpay utility functions for payment processing
 */

export interface RazorpayOrderOptions {
  amount: number; // Amount in paise (e.g., 9900 for ₹99)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(options: RazorpayOrderOptions) {
  const { amount, currency = 'INR', receipt, notes } = options;

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes: notes || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to create Razorpay order');
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 * This ensures the payment data hasn't been tampered with
 */
export function verifyRazorpaySignature(data: RazorpayVerificationData): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      throw new Error('RAZORPAY_KEY_SECRET is not configured');
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures securely
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Format amount to Razorpay format (paise)
 */
export function toRazorpayAmount(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format amount from Razorpay format (paise) to rupees
 */
export function fromRazorpayAmount(paise: number): number {
  return paise / 100;
}

/**
 * Get Razorpay checkout options
 */
export function getRazorpayCheckoutOptions(
  orderId: string,
  amount: number,
  userEmail: string,
  userName?: string
) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'ExamPrepPlus',
    description: 'Railways Exam Preparation Subscription',
    order_id: orderId,
    prefill: {
      name: userName || '',
      email: userEmail,
    },
    theme: {
      color: '#fca311', // Your brand color (orange)
    },
  };
}
