import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

async function checkPlanNames() {
  try {
    const plans = await db.select().from(subscriptionPlans);
    
    console.log('📋 Available subscription plans:');
    plans.forEach((plan) => {
      console.log(`  • ${plan.name} (ID: ${plan.id}) - ₹${plan.price / 100} - ${plan.durationDays} days - Active: ${plan.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPlanNames();
