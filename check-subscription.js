import { db } from './src/db/index.ts';
import { subscriptions } from './src/db/schema/index.ts';
import { eq } from 'drizzle-orm';

(async () => {
  const userId = 'c4d582dc-42ea-48ba-a76a-f3faefa72e31';

  const subs = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));

  console.log('📊 Subscriptions for user:', userId);
  console.log(JSON.stringify(subs, null, 2));

  if (subs.length === 0) {
    console.log('❌ No subscriptions found!');
  } else {
    console.log('✅ Found', subs.length, 'subscription(s)');
  }
  
  process.exit(0);
})();
