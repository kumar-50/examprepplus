'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateQuizFormProps {
  userId: string;
  onSuccess?: () => void;
}

interface Section {
  id: string;
  name: string;
}

export function GenerateQuizForm({ userId, onSuccess }: GenerateQuizFormProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [allSectionsSelected, setAllSectionsSelected] = useState(false);
  const [quizLength, setQuizLength] = useState<'10' | '20' | '30'>('20');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  // Fetch available sections
  useEffect(() => {
    async function fetchSections() {
      try {
        const response = await fetch('/api/sections');
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        toast.error('Failed to load sections');
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
    setAllSectionsSelected(false);
  };

  const handleAllSectionsToggle = (checked: boolean) => {
    setAllSectionsSelected(checked);
    if (checked) {
      setSelectedSections(sections.map(s => s.id));
    } else {
      setSelectedSections([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allSectionsSelected && selectedSections.length === 0) {
      toast.error('Please select at least one section');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sectionIds: allSectionsSelected ? sections.map(s => s.id) : selectedSections,
          questionCount: parseInt(quizLength),
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      console.log('✅ Quiz generated:', data);
      
      // Navigate to the practice session
      const sessionUrl = `/dashboard/practice/session/${data.sessionId}`;
      console.log('🔄 Redirecting to:', sessionUrl);
      
      toast.success('Quiz generated successfully!');
      router.push(sessionUrl);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Select Sections */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold mb-2">Select Your Topics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose one or more topics to focus on.
          </p>
        </div>

        {/* All Sections Checkbox */}
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-prussian-blue-500/20 bg-accent/30">
          <Checkbox
            id="all-sections"
            checked={allSectionsSelected}
            onCheckedChange={handleAllSectionsToggle}
          />
          <Label
            htmlFor="all-sections"
            className="text-sm font-medium cursor-pointer"
          >
            All Topics
          </Label>
        </div>

        {/* Sections List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {sections.map(section => (
            <div
              key={section.id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={section.id}
                checked={selectedSections.includes(section.id) || allSectionsSelected}
                onCheckedChange={() => handleSectionToggle(section.id)}
                disabled={allSectionsSelected}
              />
              <Label
                htmlFor={section.id}
                className="text-sm cursor-pointer flex-1"
              >
                {section.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Length */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold mb-1">Choose Quiz Length</h3>
          <p className="text-sm text-muted-foreground">
            Select the number of questions for your quiz.
          </p>
        </div>
        <RadioGroup value={quizLength} onValueChange={(value: any) => setQuizLength(value)}>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <RadioGroupItem value="10" id="length-10" className="peer sr-only" />
              <Label
                htmlFor="length-10"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-semibold">10 Questions</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="20" id="length-20" className="peer sr-only" />
              <Label
                htmlFor="length-20"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-semibold">20 Questions</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="30" id="length-30" className="peer sr-only" />
              <Label
                htmlFor="length-30"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-semibold">30 Questions</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold mb-1">Select Difficulty</h3>
          <p className="text-sm text-muted-foreground">
            Choose the difficulty level for the questions.
          </p>
        </div>
        <RadioGroup value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <RadioGroupItem value="easy" id="diff-easy" className="peer sr-only" />
              <Label
                htmlFor="diff-easy"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-medium">Easy</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="medium" id="diff-medium" className="peer sr-only" />
              <Label
                htmlFor="diff-medium"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-medium">Medium</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="hard" id="diff-hard" className="peer sr-only" />
              <Label
                htmlFor="diff-hard"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-medium">Hard</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="mixed" id="diff-mixed" className="peer sr-only" />
              <Label
                htmlFor="diff-mixed"
                className="flex items-center justify-center rounded-lg border-2 border-prussian-blue-500/20 bg-background p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-colors"
              >
                <span className="font-medium">Mixed</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-6 text-base font-semibold"
        disabled={submitting || (!allSectionsSelected && selectedSections.length === 0)}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            Generate Quiz
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
