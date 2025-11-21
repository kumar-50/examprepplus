'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SchedulePracticeFormProps {
  userId: string;
}

export function SchedulePracticeForm({ userId }: SchedulePracticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    questionCount: 15,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast.error('Please select both date and time');
      return;
    }

    setLoading(true);
    
    try {
      const scheduledDate = new Date(`${formData.date}T${formData.time}`);
      
      // Check if date is in the past
      if (scheduledDate < new Date()) {
        toast.error('Cannot schedule practice in the past');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/practice/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: scheduledDate.toISOString(),
          sectionIds: [], // All sections for now
          questionCount: formData.questionCount,
          difficulty: formData.difficulty,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Practice session scheduled successfully!');
        router.push('/dashboard/practice');
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error scheduling practice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule practice session');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0]; // Today

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>Schedule Practice Session</CardTitle>
            <CardDescription>
              Plan a future practice session for spaced repetition
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCount">Question Count</Label>
              <Input
                id="questionCount"
                type="number"
                min={5}
                max={50}
                value={formData.questionCount}
                onChange={(e) => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Schedule Practice Session
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
