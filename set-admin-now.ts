import { db } from './src/db';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function setAdmin() {
  const email = 'muthu09612@gmail.com';
  
  console.log(`Setting ${email} as admin...`);
  
  // Update the user role to admin
  await db.update(users)
    .set({ role: 'admin' })
    .where(eq(users.email, email));
  
  // Verify
  const result = await db.select({ email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, email));
  
  console.log('Updated user:', result);
  process.exit(0);
}

setAdmin().catch(console.error);
