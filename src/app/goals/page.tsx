import { redirect } from 'next/navigation';

/**
 * Goals page - redirects to progress page
 */
export default function GoalsPage() {
  redirect('/dashboard/progress');
}
