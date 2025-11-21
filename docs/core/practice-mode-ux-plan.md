# Practice Mode UX Plan

## Overview
Design a clear, intuitive practice system that separates immediate practice from scheduled study sessions, leveraging AI-powered weak topic analysis and spaced repetition.

## User Journey Scenarios

### Scenario A: "I want to practice right now"
**User Intent**: Immediate practice session
**Entry Points**: 
- Weak Topics tab → "Revise Now" button
- Weak Topics tab → "Generate Custom Quiz" button
- Main navigation → "Quick Practice"

### Scenario B: "I want to plan my study schedule"
**User Intent**: Schedule future practice sessions
**Entry Points**: 
- Scheduled tab → "Schedule Practice" button
- Weak Topics → "Schedule for Later" option
- Calendar integration

### Scenario C: "I need to review completed sessions"
**User Intent**: Track progress and review past attempts
**Entry Points**: 
- History tab → View past sessions
- Individual session → "Review Answers"

---

## Tab Structure & Information Architecture

### 🧠 **Weak Topics Tab** (Primary Learning Hub)
**Purpose**: AI-identified areas needing improvement

#### Layout:
```
┌─────────────────────────────────────────┐
│  🧠 Focus on Weak Topics               │
│  AI-identified areas for improvement    │
├─────────────────────────────────────────┤
│  📊 Mathematics        🔴 CRITICAL     │
│      9/30 correct • 30% • Due today    │
│      [Revise Now] [Schedule Review]    │
├─────────────────────────────────────────┤
│  📊 Reasoning          🟠 MODERATE     │
│      15/30 correct • 50% • Due in 3d   │
│      [Revise Now] [Schedule Review]    │
├─────────────────────────────────────────┤
│  Empty State (No weak topics):         │
│  🎯 "Great! No weak areas identified"  │
│      [Take Mock Test] [Practice All]   │
└─────────────────────────────────────────┘
```

#### Actions:
- **"Revise Now"**: Immediate 10-question focused practice
- **"Schedule Review"**: Plan future review session
- **"Generate Custom Quiz"**: Create custom immediate practice
- **"Practice All Topics"**: Comprehensive practice session

### ⏰ **Scheduled Tab** (Spaced Repetition Queue)
**Purpose**: Planned practice sessions and spaced repetition

#### Layout:
```
┌─────────────────────────────────────────┐
│  ⏰ Scheduled Practice Sessions         │
│  Your spaced repetition schedule        │
├─────────────────────────────────────────┤
│  📅 Tomorrow 9:00 AM    🟠 OVERDUE     │
│      Mathematics • 15 questions        │
│      [Start Now]                       │
├─────────────────────────────────────────┤
│  📅 Friday 2:00 PM                     │
│      Reasoning, GK • 20 questions      │
│      [Begin] [Reschedule]              │
├─────────────────────────────────────────┤
│  Empty State:                          │
│  📅 "No scheduled sessions"            │
│      [Schedule Practice] [Auto-Schedule]│
└─────────────────────────────────────────┘
```

#### Actions:
- **"Start Now"**: Begin overdue session immediately
- **"Begin"**: Start scheduled session
- **"Reschedule"**: Change date/time
- **"Schedule Practice"**: Create new scheduled session
- **"Auto-Schedule"**: AI creates optimal schedule based on weak topics

### 📚 **History Tab** (Progress Tracking)
**Purpose**: Review past performance and track improvement

#### Layout:
```
┌─────────────────────────────────────────┐
│  📚 Practice History                    │
│  Track your progress over time          │
├─────────────────────────────────────────┤
│  📊 Performance Overview                │
│      This Week: 85% avg • 12 sessions  │
│      [View Analytics]                   │
├─────────────────────────────────────────┤
│  📝 Recent Sessions                     │
│  ┌─────────────────────────────────────┐ │
│  │ Nov 21 • Mathematics Practice       │ │
│  │ 8/10 correct (80%) • 12 min        │ │
│  │ [Review Answers] [Retry Similar]    │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ Nov 20 • Mixed Topics Quiz          │ │
│  │ 15/20 correct (75%) • 18 min       │ │
│  │ [Review Answers] [Practice Mistakes]│ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Detailed UX Flows

### Flow 1: Immediate Practice ("I want to practice now")

#### Entry Point A: Quick Weak Topic Review
```
Weak Topics Tab → Click "Revise Now" on Mathematics
                ↓
Auto-Generated 10-Question Session
                ↓
Practice Session (Focused on Mathematics)
                ↓
Results & Analysis → Update Weak Topic Status
```

#### Entry Point B: Custom Immediate Practice
```
Weak Topics Tab → Click "Generate Custom Quiz"
                ↓
Quick Configuration Modal:
┌─────────────────────────────────────────┐
│  🎯 Generate Practice Quiz              │
├─────────────────────────────────────────┤
│  📚 Topics: [x] Math [ ] Reasoning      │
│               [ ] GK   [ ] English      │
│                                         │
│  📊 Difficulty: ○ Easy ● Mixed ○ Hard  │
│                                         │
│  🔢 Questions: ○ 10 ● 20 ○ 30          │
│                                         │
│  [Cancel]              [Start Practice] │
└─────────────────────────────────────────┘
                ↓
Practice Session Begins Immediately
```

### Flow 2: Scheduled Practice ("I want to plan ahead")

#### Entry Point: Schedule Future Session
```
Scheduled Tab → Click "Schedule Practice"
                ↓
Detailed Scheduling Form:
┌─────────────────────────────────────────┐
│  📅 Schedule Practice Session           │
├─────────────────────────────────────────┤
│  📅 Date: [Nov 25, 2025]               │
│  🕐 Time: [2:00 PM]                    │
│                                         │
│  📚 Focus Areas:                        │
│      [x] Weak Topics (Auto-selected)   │
│      [x] Mathematics  [ ] Reasoning     │
│      [ ] All Topics   [ ] Custom Mix   │
│                                         │
│  📊 Session Settings:                   │
│      Questions: ○ 10 ● 15 ○ 20         │
│      Difficulty: ● Adaptive ○ Mixed    │
│                                         │
│  🔔 Reminders:                         │
│      [x] 1 hour before                  │
│      [x] 15 minutes before              │
│                                         │
│  [Cancel]              [Schedule Now]   │
└─────────────────────────────────────────┘
                ↓
Added to Scheduled Tab with Countdown
                ↓
Notification Sent at Scheduled Time
                ↓
"Begin Session" → Practice Flow
```

### Flow 3: Starting Scheduled Session

#### When Time Arrives:
```
Scheduled Tab → Session shows "Ready" or "Overdue"
                ↓
Click "Start Now" or "Begin"
                ↓
Session Preparation Screen:
┌─────────────────────────────────────────┐
│  🎯 Ready to Begin Practice?            │
├─────────────────────────────────────────┤
│  📚 Focus: Mathematics (Weak Topic)     │
│  📊 15 questions • Mixed difficulty     │
│  ⏱️  Estimated time: 12-15 minutes      │
│                                         │
│  💡 Quick Tips:                         │
│  • Focus on accuracy over speed         │
│  • Review explanations after each Q     │
│                                         │
│  [Postpone]     [Modify]     [Begin]    │
└─────────────────────────────────────────┘
                ↓
Practice Session Starts
```

---

## Visual Design Principles

### Color System
- **🔴 Critical Weak Topics**: Red accents, urgent attention
- **🟠 Moderate Issues**: Orange, needs improvement  
- **🟢 Improving Areas**: Green, positive progress
- **🔵 Scheduled Sessions**: Blue, future planning
- **⚪ Completed**: Muted colors, accomplished

### Urgency Indicators
- **Pulsing Animation**: Overdue sessions
- **Badge Counters**: Number of weak topics, overdue sessions
- **Progress Bars**: Topic improvement over time
- **Color Intensity**: More urgent = more saturated colors

### Micro-Interactions
- **Hover States**: Preview session details
- **Loading States**: "Generating questions..." with progress
- **Success Animations**: Checkmarks for completed sessions
- **Smooth Transitions**: Between tabs, modal appearances

---

## Empty States & Onboarding

### New User (No Data Yet)
```
┌─────────────────────────────────────────┐
│  🎯 Welcome to Practice Mode            │
├─────────────────────────────────────────┤
│  Get started with AI-powered learning:  │
│                                         │
│  1. 📝 Take a diagnostic test           │
│     → Identify your weak areas          │
│                                         │
│  2. 🧠 AI analyzes your performance     │
│     → Creates personalized study plan   │
│                                         │
│  3. 📅 Schedule regular practice        │
│     → Spaced repetition for retention   │
│                                         │
│  [Take Diagnostic Test]                 │
│  [Browse All Topics]                    │
└─────────────────────────────────────────┘
```

### Strong Student (No Weak Topics)
```
┌─────────────────────────────────────────┐
│  🏆 Excellent Performance!              │
├─────────────────────────────────────────┤
│  No weak areas identified currently     │
│                                         │
│  Keep up the momentum:                  │
│  • Take challenging practice tests      │
│  • Review previous sessions             │
│  • Maintain regular study schedule      │
│                                         │
│  [Practice All Topics]                  │
│  [Schedule Maintenance Review]          │
└─────────────────────────────────────────┘
```

---

## Mobile Responsiveness

### Tab Navigation (Mobile)
```
┌─────────────────────────────────────────┐
│  [🧠] [⏰] [📚]                        │  
│   ^current                              │
├─────────────────────────────────────────┤
│  Swipe between tabs                     │
│  Simplified card layouts                │
│  Bottom action buttons                  │
└─────────────────────────────────────────┘
```

### Quick Actions (Mobile)
- **Floating Action Button**: Quick practice access
- **Swipe Gestures**: Mark sessions complete, reschedule
- **Bottom Sheet Modals**: Configuration forms
- **Push Notifications**: Scheduled session reminders

---

## Integration Points

### AI Integration
- **Smart Scheduling**: Auto-suggest optimal practice times
- **Adaptive Difficulty**: Adjust based on recent performance  
- **Topic Prioritization**: Focus order based on weakness level
- **Progress Prediction**: "Practice 3 more sessions to improve"

### Gamification Elements
- **Streak Tracking**: "5 days of consistent practice"
- **Achievement Badges**: "Weak Topic Warrior", "Scheduler Pro"
- **Progress Visualization**: Charts showing improvement curves
- **Social Features**: Share achievements (optional)

This UX plan creates a clear separation between immediate and scheduled practice while maintaining an intuitive user experience focused on learning effectiveness.