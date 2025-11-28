/**
 * Debug script to check user subscription status
 * Run with: npx tsx scripts/check-user-subscription.ts <email>
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

const email = process.argv[2] || 'muthu08812@gmail.com';

console.log(`🔍 Checking subscription for: ${email}\n`);

const client = postgres(DATABASE_URL);

async function checkSubscription() {
  try {
    // Get user
    const users = await client`
      SELECT id, email, full_name 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0 || !users[0]) {
      console.log('❌ User not found');
      return;
    }

    const user = users[0];
    console.log(`👤 User: ${user.full_name || user.email} (ID: ${user.id})\n`);

    // Get all subscriptions for this user
    const subscriptions = await client`
      SELECT 
        s.id,
        s.payment_status,
        s.start_date,
        s.end_date,
        s.created_at,
        p.name as plan_name,
        p.price,
        p.duration_days
      FROM subscriptions s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ${user.id}
      ORDER BY s.created_at DESC
    `;

    if (subscriptions.length === 0) {
      console.log('📭 No subscriptions found for this user');
      return;
    }

    console.log(`📋 Found ${subscriptions.length} subscription(s):\n`);
    console.log('─'.repeat(80));

    const now = new Date();
    
    subscriptions.forEach((sub: any, i: number) => {
      const endDate = sub.end_date ? new Date(sub.end_date) : null;
      const isActive = endDate && endDate > now;
      const status = isActive ? '✅ ACTIVE' : '❌ EXPIRED/INACTIVE';
      
      console.log(`\n#${i + 1} ${sub.plan_name || 'Unknown Plan'}`);
      console.log(`   Status: ${status}`);
      console.log(`   Payment: ${sub.payment_status}`);
      console.log(`   Start: ${sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}`);
      console.log(`   End: ${endDate ? endDate.toLocaleDateString() : 'N/A'}`);
      console.log(`   Price: ₹${sub.price ? sub.price / 100 : 'N/A'}`);
      console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
      
      if (isActive && endDate) {
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   Days Remaining: ${daysLeft}`);
      }
    });

    console.log('\n' + '─'.repeat(80));
    
    // Check for active subscription
    const activeSubscription = subscriptions.find((sub: any) => {
      const endDate = sub.end_date ? new Date(sub.end_date) : null;
      return sub.payment_status === 'completed' && endDate && endDate > now;
    });

    if (activeSubscription) {
      console.log('\n✅ User HAS an active subscription');
    } else {
      console.log('\n⚠️ User does NOT have an active subscription');
      console.log('   Possible reasons:');
      console.log('   - payment_status is not "completed"');
      console.log('   - end_date has passed');
      console.log('   - No subscriptions exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSubscription();
