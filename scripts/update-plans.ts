import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';
import { like } from 'drizzle-orm';

/**
 * Update subscription plans:
 * - Keep only 3 main plans: Monthly, Half-Yearly, Yearly
 * - Deactivate Early Bird and Early Adopter plans (replaced by promo codes)
 */
async function updatePlans() {
  console.log('🔄 Updating subscription plans...');

  try {
    // Deactivate Early Bird plans
    const result = await db
      .update(subscriptionPlans)
      .set({ isActive: false })
      .where(like(subscriptionPlans.name, '%Early%'))
      .returning();

    console.log(`✅ Deactivated ${result.length} early bird/adopter plans`);
    
    result.forEach((plan) => {
      console.log(`  • ${plan.name} → isActive: false`);
    });

    // Verify active plans
    const activePlans = await db
      .select()
      .from(subscriptionPlans)
      .where(like(subscriptionPlans.isActive, true as any));

    console.log(`\n📊 Active plans remaining: ${activePlans.length}`);
    activePlans.forEach((plan) => {
      console.log(`  • ${plan.name}: ₹${plan.price / 100}`);
    });

  } catch (error) {
    console.error('❌ Error updating plans:', error);
    throw error;
  }
}

updatePlans()
  .then(() => {
    console.log('\n✨ Plans updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });
