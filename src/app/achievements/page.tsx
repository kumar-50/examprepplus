import { redirect } from 'next/navigation';

/**
 * Achievements page - redirects to progress page
 */
export default function AchievementsPage() {
  redirect('/dashboard/progress');
}
