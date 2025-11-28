import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

/**
 * Seed subscription plans with approved pricing:
 * - Monthly: ₹99
 * - Half-Yearly: ₹499 (Save 16%)
 * - Yearly: ₹799 (Save 33%)
 */
async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  try {
    // Delete existing plans to avoid duplicates
    await db.delete(subscriptionPlans);
    console.log('✓ Cleared existing plans');

    // Insert the 3 main plans
    const plans = await db
      .insert(subscriptionPlans)
      .values([
        {
          name: 'Monthly Pass',
          description: 'Access all Railway exam preparation content with monthly billing',
          price: 9900, // ₹99 in paise
          currency: 'INR',
          durationDays: 30,
          features: JSON.stringify([
            'Unlimited RRB NTPC mock tests',
            'Unlimited practice quizzes',
            'Advanced analytics dashboard',
            'Weak topic identification',
            'Weekly live tests with rankings',
            'Question bookmarking & notes',
            'PDF reports',
            'Priority support',
            'All future Railway exams included'
          ]),
          isActive: true,
          displayOrder: 1,
        },
        {
          name: 'Half-Yearly Pass',
          description: 'Save 16% with half-yearly billing. Best for consistent preparation.',
          price: 49900, // ₹499 in paise
          currency: 'INR',
          durationDays: 180,
          features: JSON.stringify([
            'Everything in Monthly Pass',
            'Save ₹95 (16% discount)',
            '₹83/month effective cost',
            'Unlimited RRB NTPC mock tests',
            'Unlimited practice quizzes',
            'Advanced analytics dashboard',
            'Weak topic identification',
            'Weekly live tests with rankings',
            'Question bookmarking & notes',
            'PDF reports',
            'Priority support',
            'All future Railway exams included'
          ]),
          isActive: true,
          displayOrder: 2,
        },
        {
          name: 'Yearly Pass',
          description: 'Save 33% with annual billing. Maximum value for serious aspirants.',
          price: 79900, // ₹799 in paise
          currency: 'INR',
          durationDays: 365,
          features: JSON.stringify([
            'Everything in Monthly Pass',
            'Save ₹389 (33% discount)',
            '₹67/month effective cost',
            'Best value for money',
            'Unlimited RRB NTPC mock tests',
            'Unlimited practice quizzes',
            'Advanced analytics dashboard',
            'Weak topic identification',
            'Weekly live tests with rankings',
            'Question bookmarking & notes',
            'PDF reports',
            'Priority support',
            'All future Railway exams included'
          ]),
          isActive: true,
          displayOrder: 3,
        },
        // Early Bird Special (Limited - First 50 users)
        {
          name: 'Early Bird Yearly',
          description: '🔥 Limited offer for first 50 users! 50% OFF + Lifetime price lock',
          price: 39900, // ₹399 in paise
          currency: 'INR',
          durationDays: 365,
          features: JSON.stringify([
            '🔥 50% OFF - Save ₹400',
            '🎁 Lifetime price lock (₹399 forever)',
            '👑 Founder member badge',
            '⭐ Priority feature requests',
            'Everything in Yearly Pass',
            'Unlimited RRB NTPC mock tests',
            'Unlimited practice quizzes',
            'Advanced analytics',
            'Weekly live tests',
            'All future Railway exams included'
          ]),
          isActive: true,
          displayOrder: -2,
        },
        // Early Adopter (Limited - Next 100 users)
        {
          name: 'Early Adopter Yearly',
          description: '💰 Special offer for next 100 users! 25% OFF',
          price: 59900, // ₹599 in paise
          currency: 'INR',
          durationDays: 365,
          features: JSON.stringify([
            '💰 25% OFF - Save ₹200',
            '🏅 Early adopter badge',
            'Everything in Yearly Pass',
            'Unlimited RRB NTPC mock tests',
            'Unlimited practice quizzes',
            'Advanced analytics',
            'Weekly live tests',
            'All future Railway exams included'
          ]),
          isActive: true,
          displayOrder: -1,
        },
      ])
      .returning();

    console.log(`✅ Successfully seeded ${plans.length} subscription plans`);
    
    plans.forEach((plan) => {
      console.log(`  • ${plan.name}: ₹${plan.price / 100} for ${plan.durationDays} days`);
    });

    return plans;
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    throw error;
  }
}

// Run the seed function
seedSubscriptionPlans()
  .then(() => {
    console.log('🎉 Subscription plans seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed subscription plans:', error);
    process.exit(1);
  });
