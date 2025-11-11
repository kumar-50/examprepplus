'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  totalQuestions: number;
  answered: number;
  unanswered: number;
  markedForReview: number;
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  totalQuestions,
  answered,
  unanswered,
  markedForReview,
}: SubmitConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Test?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to submit your test? You cannot change your answers after submission.
            </p>
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-foreground">Test Summary:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="ml-2 font-medium text-foreground">{totalQuestions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="ml-2 font-medium text-green-600 dark:text-green-400">{answered}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unanswered:</span>
                  <span className="ml-2 font-medium text-red-600 dark:text-red-400">{unanswered}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Marked for Review:</span>
                  <span className="ml-2 font-medium text-purple-600 dark:text-purple-400">{markedForReview}</span>
                </div>
              </div>
            </div>

            {unanswered > 0 && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                ⚠️ You have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}!
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Yes, Submit Test
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
