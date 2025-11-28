import { db } from '@/db';
import { promoCodes, subscriptionPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed promo codes:
 * - EARLYBIRD50 - 50% OFF Yearly (First 50 users)
 * - EARLYADOPT25 - 25% OFF Yearly (Next 100 users)
 */
async function seedPromoCodes() {
  console.log('🌱 Seeding promo codes...');

  try {
    // Get yearly plan ID (try multiple variations)
    const yearlyPlans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.durationDays, 365));

    if (yearlyPlans.length === 0 || !yearlyPlans[0]) {
      console.error('❌ No yearly plan (365 days) found. Please seed subscription plans first.');
      process.exit(1);
    }

    const yearlyPlan = yearlyPlans[0]; // Get first active yearly plan
    console.log('✓ Found Yearly plan:', yearlyPlan.name, '(ID:', yearlyPlan.id, ')');

    // Delete existing promo codes with same codes
    await db.delete(promoCodes).where(eq(promoCodes.code, 'EARLYBIRD50'));
    await db.delete(promoCodes).where(eq(promoCodes.code, 'EARLYADOPT25'));
    console.log('✓ Cleared existing promo codes');

    // Insert promo codes
    const codes = await db
      .insert(promoCodes)
      .values([
        {
          code: 'EARLYBIRD50',
          name: 'Early Bird Special',
          description: '🔥 50% OFF for first 50 users! Limited time offer with lifetime price lock.',
          discountType: 'percentage',
          discountValue: 50, // 50% off
          applicablePlanId: yearlyPlan.id, // Only for Yearly plan
          maxUses: 50, // First 50 users only
          maxUsesPerUser: 1,
          isActive: true,
        },
        {
          code: 'EARLYADOPT25',
          name: 'Early Adopter Discount',
          description: '💰 25% OFF for next 100 users! Be an early adopter.',
          discountType: 'percentage',
          discountValue: 25, // 25% off
          applicablePlanId: null, // Apply to all plans
          maxUses: 100, // Next 100 users
          maxUsesPerUser: 1,
          isActive: true,
        },
      ])
      .returning();

    console.log(`✅ Successfully seeded ${codes.length} promo codes`);
    
    codes.forEach((code) => {
      console.log(`  • ${code.code}: ${code.discountValue}% OFF (Max ${code.maxUses} uses) - ${code.applicablePlanId ? 'Yearly only' : 'All plans'}`);
    });

    return codes;
  } catch (error) {
    console.error('❌ Error seeding promo codes:', error);
    throw error;
  }
}

seedPromoCodes()
  .then(() => {
    console.log('\n✨ Promo codes seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
