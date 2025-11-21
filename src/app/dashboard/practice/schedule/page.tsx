import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { SchedulePracticeForm } from '@/components/practice/schedule-practice-form';

export default async function SchedulePracticePage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice/schedule');
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Schedule Practice</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Plan your future study sessions with spaced repetition
        </p>
      </div>

      {/* Schedule Form */}
      <div className="max-w-2xl">
        <SchedulePracticeForm userId={user.id} />
      </div>
    </div>
  );
}
