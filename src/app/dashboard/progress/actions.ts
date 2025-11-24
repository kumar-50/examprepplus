'use server';

import { revalidatePath } from 'next/cache';

export async function refreshProgressPage() {
  revalidatePath('/dashboard/progress');
}
