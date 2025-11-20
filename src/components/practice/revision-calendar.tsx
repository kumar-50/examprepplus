'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GenerateQuizForm } from '@/components/practice/generate-quiz-form';
import { isSameDay } from 'date-fns';

interface ScheduledDate {
  id: string;
  scheduledDate: Date;
  attemptId: string | null;
}

interface RevisionCalendarProps {
  userId: string;
  scheduledDates: ScheduledDate[];
}

export function RevisionCalendar({ userId, scheduledDates }: RevisionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Create a set of dates that have scheduled sessions
  const datesWithSessions = scheduledDates.map(item => new Date(item.scheduledDate));
  
  // Check if a date has a session
  const hasSession = (date: Date) => {
    return datesWithSessions.some(sessionDate => 
      isSameDay(new Date(sessionDate), date)
    );
  };

  // Check if a session is completed
  const isSessionCompleted = (date: Date) => {
    const session = scheduledDates.find(item => 
      isSameDay(new Date(item.scheduledDate), date)
    );
    return session?.attemptId !== null;
  };

  const handleQuizGenerated = () => {
    setIsSheetOpen(false);
    // Navigation is handled in the form component
  };

  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-secondary/10">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Revision Calendar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Plan your practice sessions
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-4">
          {/* Calendar */}
          <div className="w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-prussian-blue-500/20 w-full"
              modifiers={{
                scheduled: datesWithSessions,
              }}
              modifiersStyles={{
                scheduled: {
                  position: 'relative',
                },
              }}
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const isScheduled = hasSession(day.date);
                  const isCompleted = isSessionCompleted(day.date);
                  
                  return (
                    <button {...props} className="relative">
                      {props.children}
                      {isScheduled && (
                        <span 
                          className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                            isCompleted ? 'bg-green-500' : 'bg-secondary'
                          }`}
                        />
                      )}
                    </button>
                  );
                },
              }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
          </div>

          {/* Generate Quiz Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="w-full text-xs sm:text-sm">
                <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Generate Quiz
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl sm:text-2xl">Generate Your Revision Quiz</SheetTitle>
                <SheetDescription className="text-sm">
                  Create a custom quiz to focus on your study needs.
                </SheetDescription>
              </SheetHeader>
              <GenerateQuizForm 
                userId={userId} 
                onSuccess={handleQuizGenerated}
              />
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}
