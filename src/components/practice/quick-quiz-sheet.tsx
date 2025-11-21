'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Brain, Plus, AlertCircle, ChevronDown, Calendar, Clock, Check, ChevronsUpDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Section {
  id: string;
  name: string;
  questionCount: number;
}

interface Topic {
  id: string;
  name: string;
  sectionId: string;
  questionCount: number;
}

interface QuickQuizSheetProps {
  userId: string;
  defaultTab?: 'immediate' | 'schedule';
  triggerButton?: React.ReactNode;
}

export function QuickQuizSheet({ userId, defaultTab = 'immediate', triggerButton }: QuickQuizSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const [practiceType, setPracticeType] = useState<'immediate' | 'schedule'>(defaultTab);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState('');
  const [quizName, setQuizName] = useState('');
  
  const [mode, setMode] = useState<'section' | 'topic'>('section');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30>(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Fetch sections and topics with question counts
  useEffect(() => {
    if (open) {
      fetchAvailableOptions();
    }
  }, [open]);

  const fetchAvailableOptions = async () => {
    setFetchingData(true);
    try {
      const response = await fetch('/api/practice/available-questions');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      toast.error('Failed to load quiz options');
    } finally {
      setFetchingData(false);
    }
  };

  const getAvailableItems = () => {
    const items = mode === 'section' ? sections : topics;
    return items.filter(item => item.questionCount >= questionCount);
  };

  const isItemDisabled = (item: Section | Topic) => {
    return item.questionCount < questionCount;
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error(`Please select at least one ${mode}`);
      return;
    }

    // Validate schedule fields if scheduling
    if (practiceType === 'schedule') {
      if (!scheduleDate || !scheduleTime) {
        toast.error('Please select both date and time for scheduling');
        return;
      }

      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduleDate);
      scheduledDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
      
      if (scheduledDateTime < new Date()) {
        toast.error('Cannot schedule practice in the past');
        return;
      }
    }

    setLoading(true);
    
    try {
      if (practiceType === 'immediate') {
        // Generate and start practice immediately
        const response = await fetch('/api/practice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            sectionIds: mode === 'section' ? selectedItems : topics.filter(t => selectedItems.includes(t.id)).map(t => t.sectionId),
            topicIds: mode === 'topic' ? selectedItems : undefined,
            questionCount,
            difficulty: 'mixed',
            customTitle: quizName.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate quiz');
        }

        toast.success('Quiz generated successfully!');
        setOpen(false);
        router.push(`/dashboard/practice/session/${data.sessionId}`);
      } else {
        // Schedule practice for later
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        const scheduledDateTime = new Date(scheduleDate!);
        scheduledDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        
        const response = await fetch('/api/practice/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledDate: scheduledDateTime.toISOString(),
            sectionIds: mode === 'section' ? selectedItems : topics.filter(t => selectedItems.includes(t.id)).map(t => t.sectionId),
            topicIds: mode === 'topic' ? selectedItems : undefined,
            questionCount,
            difficulty: 'mixed',
            customTitle: quizName.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to schedule practice');
        }

        toast.success('Practice session scheduled successfully!');
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const availableItems = getAvailableItems();
  const hasNoQuestions = (mode === 'section' ? sections : topics).every(item => item.questionCount === 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 sm:h-auto sm:w-auto sm:rounded-lg sm:px-6"
          title="Generate Quick Quiz"
        >
          <Plus className="h-6 w-6 sm:mr-2" />
          <span className="hidden sm:inline">Quick Quiz</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            Generate Quick Quiz
          </SheetTitle>
          <SheetDescription>
            Create a custom practice quiz based on sections or topics
          </SheetDescription>
        </SheetHeader>

        {fetchingData ? (
          <div className="px-6 flex-1 overflow-y-auto space-y-6">
            {/* Mode Selection Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Question Count Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>

            {/* Selection Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : hasNoQuestions ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
            <p className="text-sm text-muted-foreground">
              There are no verified questions available for practice at the moment.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {/* Practice Type - Immediate or Schedule */}
            <div className="space-y-3">
              <Label>Practice Type</Label>
              <Tabs value={practiceType} onValueChange={(value) => {
                setPracticeType(value as 'immediate' | 'schedule');
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="immediate">Start Now</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quiz Name */}
            <div className="space-y-3">
              <Label htmlFor="quiz-name">Quiz Name (Optional)</Label>
              <Input
                id="quiz-name"
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="e.g., Morning Practice, Weak Topics Review"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate based on difficulty
              </p>
            </div>

            {/* Schedule Date/Time - Only shown when scheduling */}
            {practiceType === 'schedule' && (
              <div className="space-y-3">
                <Label>Schedule Date & Time</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduleDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={scheduleTime} onValueChange={setScheduleTime}>
                    <SelectTrigger className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return ['00', '30'].map(minute => {
                            const time = `${hour}:${minute}`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          });
                        })}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Mode Selection - Tabs */}
            <div className="space-y-3">
              <Label>Select Mode</Label>
              <Tabs value={mode} onValueChange={(value) => {
                setMode(value as 'section' | 'topic');
                setSelectedItems([]);
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="section">Section-based</TabsTrigger>
                  <TabsTrigger value="topic">Topic-based</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <Label>Number of Questions</Label>
              <Tabs value={questionCount.toString()} onValueChange={(value) => {
                setQuestionCount(parseInt(value) as 10 | 20 | 30);
                setSelectedItems([]);
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="10">10</TabsTrigger>
                  <TabsTrigger value="20">20</TabsTrigger>
                  <TabsTrigger value="30">30</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Selection - Multi-select with search */}
            <div className="space-y-3">
              <Label>Select {mode === 'section' ? 'Sections' : 'Topics'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      selectedItems.length === 0 && "text-muted-foreground"
                    )}
                  >
                    {selectedItems.length > 0
                      ? `${selectedItems.length} selected`
                      : `Select ${mode === 'section' ? 'sections' : 'topics'}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={`Search ${mode === 'section' ? 'sections' : 'topics'}...`} />
                    <CommandList>
                      <CommandEmpty>No {mode === 'section' ? 'section' : 'topic'} found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[300px]">
                          {availableItems.map((item) => {
                            const isSelected = selectedItems.includes(item.id);
                            const disabled = isItemDisabled(item);
                            return (
                              <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={() => {
                                  if (!disabled) {
                                    handleItemToggle(item.id);
                                  }
                                }}
                                disabled={disabled}
                                className={cn(
                                  "flex items-center gap-2",
                                  disabled && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}>
                                  <Check className="h-4 w-4" />
                                </div>
                                <span className="flex-1">{item.name}</span>
                                <Badge variant={disabled ? "secondary" : "default"}>
                                  {item.questionCount} Q
                                </Badge>
                              </CommandItem>
                            );
                          })}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Items Display */}
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((itemId) => {
                    const item = availableItems.find((i) => i.id === itemId);
                    if (!item) return null;
                    return (
                      <Badge key={itemId} variant="secondary" className="pl-2 pr-1">
                        {item.name}
                        <button
                          type="button"
                          onClick={() => handleItemToggle(itemId)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fixed Footer */}
        <div className="border-t bg-background p-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || selectedItems.length === 0 || availableItems.length === 0}
          >
            {loading ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                {practiceType === 'immediate' ? 'Generating Quiz...' : 'Scheduling...'}
              </>
            ) : practiceType === 'immediate' ? (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Start Quiz {selectedItems.length > 0 && `(${selectedItems.length})`}
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Quiz {selectedItems.length > 0 && `(${selectedItems.length})`}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
