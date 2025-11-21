import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { GenerateQuizForm } from '@/components/practice/generate-quiz-form';

export default async function GeneratePracticePage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice/generate');
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Generate Practice Quiz</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Create a custom practice session tailored to your learning needs
        </p>
      </div>

      {/* Generate Form */}
      <div className="max-w-2xl">
        <GenerateQuizForm userId={user.id} />
      </div>
    </div>
  );
}
