# Weak Topics Card Feature Implementation Plan

## Current Issues
1. Weak Topics tab showing generic "Spaced Repetition Queue" instead of actual weak topics
2. No visual cards displaying weak topics with stats
3. No direct "Practice Now" functionality for individual weak topics
4. User cannot quickly practice a specific weak topic

## Requirements

### 1. Weak Topics Display
- **Show individual weak topic cards** (one card per weak section)
- Each card should display:
  - Section name
  - Accuracy percentage (color-coded)
  - Total attempts count
  - Correct attempts count
  - Weakness level badge (Critical/Moderate)
  - Last practiced date
  - Visual progress indicator

### 2. Practice Now Button
- Each weak topic card has a "Practice Now" button
- Clicking opens QuickQuizSheet with:
  - Pre-selected section (locked/disabled - user cannot change)
  - Default question count (10)
  - Default difficulty (mixed)
  - User can only adjust question count
  - Immediate start (no scheduling option for this flow)

### 3. Visual Design
- Card-based layout (similar to revision history)
- Color-coded by performance:
  - Red/Critical: < 40% accuracy
  - Orange/Moderate: 40-59% accuracy
- Stats displayed with icons:
  - Target icon for accuracy
  - Clipboard icon for total attempts
  - Check icon for correct attempts
  - Calendar icon for last practiced

### 4. Empty State
- Show when no weak topics (user is doing well!)
- Encouraging message
- Suggestion to take more tests

## Technical Implementation

### Backend Changes
**File:** `src/app/dashboard/practice/page.tsx`

Current weak topics query needs enhancement:
```typescript
// Current: Only fetches basic data
const userWeakTopics = await db
  .select({
    id: weakTopics.id,
    topicId: weakTopics.sectionId,
    // ...
  })
  .from(weakTopics)

// Needed: Join with sections table to get section names
const userWeakTopics = await db
  .select({
    id: weakTopics.id,
    sectionId: weakTopics.sectionId,
    sectionName: sections.name,
    accuracyPercentage: weakTopics.accuracyPercentage,
    weaknessLevel: weakTopics.weaknessLevel,
    totalAttempts: weakTopics.totalAttempts,
    correctAttempts: weakTopics.correctAttempts,
    lastPracticedAt: weakTopics.lastPracticedAt,
  })
  .from(weakTopics)
  .innerJoin(sections, eq(weakTopics.sectionId, sections.id))
  .where(eq(weakTopics.userId, user.id))
  .orderBy(weakTopics.accuracyPercentage) // Worst first
  .limit(10);
```

### Frontend Changes

#### 1. Create WeakTopicsSection Component
**File:** `src/components/practice/weak-topics-section.tsx`

Replace existing component with new implementation:

**Props:**
```typescript
interface WeakTopicItem {
  id: string;
  sectionId: string;
  sectionName: string;
  accuracyPercentage: number;
  weaknessLevel: 'critical' | 'moderate';
  totalAttempts: number;
  correctAttempts: number;
  lastPracticedAt: Date | null;
}

interface WeakTopicsSectionProps {
  weakTopics: WeakTopicItem[];
  userId: string;
}
```

**Component Structure:**
```
WeakTopicsSection
├── Header (icon + title + count)
├── Empty State (if weakTopics.length === 0)
└── Grid of Cards (if weakTopics.length > 0)
    └── WeakTopicCard (for each topic)
        ├── Section Name + Badge
        ├── Accuracy Circle/Progress
        ├── Stats Grid (attempts, correct, last practiced)
        └── Practice Now Button
```

#### 2. Modify QuickQuizSheet Component
**File:** `src/components/practice/quick-quiz-sheet.tsx`

Add new prop for pre-selected sections:
```typescript
interface QuickQuizSheetProps {
  userId: string;
  defaultTab?: 'immediate' | 'schedule';
  triggerButton?: React.ReactNode;
  preSelectedSections?: string[]; // NEW
  lockSelection?: boolean; // NEW - disable section/topic selection
}
```

When `preSelectedSections` and `lockSelection` are provided:
- Hide mode toggle (section/topic)
- Hide multi-select dropdown
- Display locked section name(s) with lock icon
- Show only question count selector
- Hide schedule tab (only "Start Now")
- Auto-submit on "Start Quiz"

#### 3. Update PracticeTabs Component
**File:** `src/components/practice/practice-tabs.tsx`

Pass weak topics to WeakTopicsSection:
```typescript
<TabsContent value="weak-topics">
  <WeakTopicsSection 
    weakTopics={weakTopics}
    userId={userId}
  />
</TabsContent>
```

### UI Components Needed

#### WeakTopicCard Component
```typescript
interface WeakTopicCardProps {
  topic: WeakTopicItem;
  userId: string;
}
```

**Visual Elements:**
- Card with hover effect
- Color-coded left border (red/orange)
- Badge showing weakness level
- Circular progress indicator for accuracy
- Icon-based stats
- Prominent "Practice Now" button
- Last practiced as "time ago" format

**Layout:**
```
┌─────────────────────────────────────┐
│ 🔴 General Awareness      [Critical]│
│                                     │
│     ⭕ 35%                          │
│    Accuracy                         │
│                                     │
│  📊 12 attempts  ✓ 4 correct       │
│  📅 Last: 2 days ago               │
│                                     │
│  [       Practice Now       ]       │
└─────────────────────────────────────┘
```

### Integration Flow

1. **User visits Weak Topics tab**
   - Backend fetches weak topics with section names
   - WeakTopicsSection renders cards
   
2. **User clicks "Practice Now" on a card**
   - Opens QuickQuizSheet
   - Section pre-selected and locked
   - Only question count adjustable
   - "Start Quiz" button active
   
3. **User adjusts question count (optional)**
   - Validates against available questions
   
4. **User clicks "Start Quiz"**
   - Calls `/api/practice/generate` with locked section
   - Redirects to quiz session
   
5. **After quiz completion**
   - Weak topic stats automatically updated
   - User returns to dashboard
   - Fresh data shows updated stats

### Styling Considerations

**Color Scheme:**
- Critical (< 40%): 
  - Border: red-500
  - Background: red-500/5
  - Badge: destructive variant
  
- Moderate (40-59%):
  - Border: orange-500
  - Background: orange-500/5
  - Badge: warning variant

**Responsive Design:**
- Mobile: 1 card per row (full width)
- Tablet: 2 cards per row
- Desktop: 3 cards per row
- Use CSS Grid with auto-fill

### Error Handling

1. **No questions available in weak section**
   - Disable "Practice Now" button
   - Show tooltip: "Not enough questions available"
   
2. **Quiz generation fails**
   - Show error toast
   - Keep QuickQuizSheet open
   - Allow user to retry
   
3. **Empty weak topics**
   - Show congratulatory empty state
   - Suggest taking more tests to identify areas

### Data Flow Summary

```
Practice Page Load
    ↓
Fetch weak_topics + JOIN sections
    ↓
Pass to PracticeTabs
    ↓
Render WeakTopicsSection
    ↓
Display WeakTopicCard(s)
    ↓
User clicks "Practice Now"
    ↓
Open QuickQuizSheet (locked mode)
    ↓
Generate quiz with locked section
    ↓
Take quiz → Submit
    ↓
weak_topics updated automatically
    ↓
Return to dashboard (fresh data)
```

## Implementation Steps

### Phase 1: Backend Enhancement
1. Update practice page query to JOIN with sections
2. Add section name to weak topics data
3. Sort by accuracy (worst first)

### Phase 2: Create WeakTopicCard Component
1. Design card layout with Shadcn components
2. Implement color coding based on weakness level
3. Add stats display with icons
4. Create "Practice Now" button with state management

### Phase 3: Update WeakTopicsSection
1. Replace existing placeholder with card grid
2. Add empty state component
3. Implement responsive layout
4. Add loading states

### Phase 4: Enhance QuickQuizSheet
1. Add preSelectedSections prop
2. Add lockSelection prop
3. Implement locked UI state
4. Hide unnecessary controls
5. Pre-fill section selection

### Phase 5: Integration
1. Connect WeakTopicCard to QuickQuizSheet
2. Test data flow
3. Verify quiz generation works
4. Ensure stats update after quiz

### Phase 6: Polish
1. Add animations and transitions
2. Implement micro-interactions
3. Add tooltips for guidance
4. Test responsive design
5. Add loading skeletons

## Success Criteria

- ✅ Weak topics displayed as individual cards with stats
- ✅ Each card shows section name, accuracy, attempts, weakness level
- ✅ "Practice Now" button opens QuickQuizSheet with locked section
- ✅ User cannot change section selection in locked mode
- ✅ Quiz generates and runs successfully
- ✅ After completion, stats update and show on return
- ✅ Empty state displays when no weak topics
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Color coding clearly indicates severity

## Future Enhancements

1. **Trend indicators**: Show if accuracy is improving/declining
2. **Streak tracking**: Days practiced consecutively
3. **Quick stats comparison**: Compare with average user performance
4. **Smart recommendations**: Suggest best time to practice based on patterns
5. **Bulk practice**: Select multiple weak topics for combined practice
6. **Topic breakdown**: Show weak topics within weak sections
