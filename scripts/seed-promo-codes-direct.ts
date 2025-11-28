/**
 * Direct database seed script for promo codes
 * Run with: npx tsx scripts/seed-promo-codes-direct.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔌 Connecting to database...');

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function seedPromoCodes() {
  console.log('🌱 Seeding promo codes...\n');

  try {
    // First, get the yearly plan ID
    const plans = await client`
      SELECT id, name, duration_days, price 
      FROM subscription_plans 
      WHERE duration_days = 365 AND is_active = true
      LIMIT 1
    `;

    let yearlyPlanId: string | null = null;
    const yearlyPlan = plans[0];
    
    if (yearlyPlan) {
      yearlyPlanId = yearlyPlan.id;
      console.log(`✓ Found Yearly plan: ${yearlyPlan.name} (ID: ${yearlyPlanId})`);
    } else {
      console.log('⚠️ No yearly plan found - EARLYBIRD50 will apply to all plans');
    }

    // Delete existing promo codes with same codes (if any)
    await client`DELETE FROM promo_codes WHERE code = 'EARLYBIRD50'`;
    await client`DELETE FROM promo_codes WHERE code = 'EARLYADOPT25'`;
    console.log('✓ Cleared existing promo codes (if any)\n');

    // Insert EARLYBIRD50
    const earlybird = await client`
      INSERT INTO promo_codes (
        code, 
        name, 
        description, 
        discount_type, 
        discount_value, 
        applicable_plan_id, 
        max_uses, 
        current_uses, 
        max_uses_per_user, 
        is_active
      ) VALUES (
        'EARLYBIRD50',
        'Early Bird Special',
        '🔥 50% OFF for first 50 users! Limited time offer.',
        'percentage',
        50,
        ${yearlyPlanId},
        50,
        0,
        1,
        true
      ) RETURNING id, code, name, discount_value
    `;
    
    const earlybirdCode = earlybird[0];
    if (earlybirdCode) {
      console.log(`✅ Created: ${earlybirdCode.code}`);
      console.log(`   Name: ${earlybirdCode.name}`);
      console.log(`   Discount: ${earlybirdCode.discount_value}% OFF`);
    }
    console.log(`   Applicable: ${yearlyPlanId ? 'Yearly plan only' : 'All plans'}`);
    console.log(`   Max uses: 50\n`);

    // Insert EARLYADOPT25 (for all plans)
    const earlyadopt = await client`
      INSERT INTO promo_codes (
        code, 
        name, 
        description, 
        discount_type, 
        discount_value, 
        applicable_plan_id, 
        max_uses, 
        current_uses, 
        max_uses_per_user, 
        is_active
      ) VALUES (
        'EARLYADOPT25',
        'Early Adopter Discount',
        '💰 25% OFF for next 100 users! Be an early adopter.',
        'percentage',
        25,
        NULL,
        100,
        0,
        1,
        true
      ) RETURNING id, code, name, discount_value
    `;
    
    const earlyadoptCode = earlyadopt[0];
    if (earlyadoptCode) {
      console.log(`✅ Created: ${earlyadoptCode.code}`);
      console.log(`   Name: ${earlyadoptCode.name}`);
      console.log(`   Discount: ${earlyadoptCode.discount_value}% OFF`);
    }
    console.log(`   Applicable: All plans`);
    console.log(`   Max uses: 100\n`);

    // Verify
    const allCodes = await client`
      SELECT code, name, discount_value, max_uses, current_uses, is_active 
      FROM promo_codes 
      ORDER BY created_at DESC
    `;
    
    console.log('📋 All Promo Codes in Database:');
    console.log('─'.repeat(60));
    allCodes.forEach((code: any) => {
      const status = code.is_active ? '✓ Active' : '✗ Inactive';
      console.log(`  ${code.code}: ${code.discount_value}% OFF | Uses: ${code.current_uses}/${code.max_uses || '∞'} | ${status}`);
    });
    console.log('─'.repeat(60));

    console.log('\n✨ Promo codes seeded successfully!');
    console.log('\n📝 Users can now use these codes at checkout:');
    console.log('   • EARLYBIRD50 - 50% off (Yearly plan)');
    console.log('   • EARLYADOPT25 - 25% off (Any plan)');

  } catch (error) {
    console.error('❌ Error seeding promo codes:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedPromoCodes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
