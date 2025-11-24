# Test Mode - Quick Start Guide

## What We Built

A complete **Test Mode** feature (formerly Mock Test) for ExamPrepPlus with:

### ✅ Test Library (`/dashboard/tests`)
- **Advanced Search**: Full-text search across test titles and descriptions
- **Smart Filters**: Filter by type, difficulty, duration with active filter badges
- **Dual View Modes**: Grid view with cards and compact list view
- **Rich Test Cards**: Banner images, ratings, attempt counts, and quick actions
- **User-Friendly UI**: Clear CTAs, responsive design, empty states

### ✅ Test Detail Page
- **Comprehensive Overview**: Full test information before starting
- **Attempt History**: View all past attempts with scores and breakdowns
- **Sticky Sidebar**: Easy access to "Start Test" button
- **Rating Display**: Star ratings and social proof
- **Tabbed Interface**: Organized content with attempt history and reviews

### ✅ Test Attempt Engine
- **Fullscreen Mode**: Enforced fullscreen with exit prevention
- **Live Timer**: Countdown with color-coded warnings and auto-submit
- **Auto-Save System**: Debounced answer saving (2-second delay)
- **Question Palette**: Visual grid showing question status (Desktop)
- **Mark for Review**: Flag questions for later review
- **Section Navigation**: Support for multi-section tests
- **Keyboard Shortcuts**: Navigate and answer with keyboard (1-4, arrows, M, C)
- **Language Toggle**: English/Hindi support (when available)
- **Mobile Responsive**: Optimized interface for all devices

### ✅ Results & Review
- **Instant Score Display**: Large, clear score with percentage
- **Detailed Breakdown**: Correct, incorrect, and unanswered counts
- **Quick Actions**: Retake test, view details, browse more tests
- **Performance Tracking**: All attempts saved with complete history

### ✅ Database Schema
- `tests`: Test configurations (title, duration, marks, type)
- `test_questions`: Junction table linking tests to questions with order
- `user_test_attempts`: Tracks each test session with scores
- `user_answers`: Individual question responses with time tracking

### ✅ Server Actions
- `getTests()`: Fetch all published tests with user attempt counts
- `getTestById()`: Get full test details
- `getTestQuestions()`: Load all questions for a test
- `createTestAttempt()`: Start new test attempt
- `saveAnswer()`: Auto-save individual answers
- `submitAttempt()`: Calculate scores and finalize submission

## Design Highlights

### Color System
- **Orange (#fca311)**: Primary actions, active states, CTAs
- **Prussian Blue (#14213d)**: Secondary elements, headers
- **Green**: Correct answers, answered questions, success states
- **Red**: Incorrect answers, timer warnings, errors
- **Orange**: Marked for review, moderate urgency
- **Gray**: Unanswered, not visited, disabled states

### Key Features
- **Fullscreen Enforcement**: Immersive, distraction-free test environment
- **Smart Auto-Save**: Never lose progress with automatic answer saving
- **Visual Feedback**: Color-coded question palette and clear indicators
- **Responsive Timer**: Dynamic color changes based on time remaining
- **Mobile-First**: Optimized for all screen sizes and touch devices
- **Accessible**: Keyboard navigation, screen reader support, high contrast

## Quick Start

### 1. Access Test Library
```
Navigate to: /dashboard/tests
```
- Browse available tests
- Use filters to find specific tests
- View test cards with all details

### 2. Start a Test
1. Click on any test card
2. Review test details and past attempts
3. Click "Start Test" button
4. Read instructions on pre-test screen
5. Select language preference (if applicable)
6. Click "Start Test" to begin
7. Browser enters fullscreen automatically

### 3. Take the Test
1. Read question carefully
2. Select answer option (1-4 keys or click)
3. Answer auto-saves after 2 seconds
4. Click "Next" to move forward
5. Use question palette to jump to any question
6. Mark questions for review if needed
7. Monitor timer throughout test
8. Click "Submit Test" when ready
9. Confirm submission in dialog

### 4. View Results
1. See score immediately after submission
2. Review breakdown of correct/incorrect/unanswered
3. Check accuracy percentage
4. Navigate to browse more tests or retake

## File Structure
```
src/
├── app/
│   ├── dashboard/
│   │   └── tests/
│   │       ├── page.tsx
│   │       └── [testId]/
│   │           ├── page.tsx
│   │           └── attempt/
│   │               ├── page.tsx
│   │               ├── layout.tsx
│   │               └── [attemptId]/review/page.tsx
│   └── admin/
│       └── tests/
│           ├── page.tsx
│           └── builder/page.tsx
├── components/
│   └── tests/
│       ├── test-library.tsx
│       ├── test-library-client.tsx
│       ├── test-detail-view.tsx
│       ├── test-instructions.tsx
│       ├── test-attempt-engine.tsx
│       ├── test-attempt-wrapper.tsx
│       ├── test-review-view.tsx
│       └── submit-confirm-dialog.tsx
├── lib/
│   └── actions/
│       └── tests.ts (all server actions)
└── db/
    └── schema/
        ├── tests.ts
        ├── test-questions.ts
        ├── user-test-attempts.ts
        └── user-answers.ts
```

## Key Differences: Test Mode vs Practice Mode

| Feature | Test Mode | Practice Mode |
|---------|-----------|---------------|
| **Purpose** | Exam simulation | Skill building |
| **Feedback** | After submission | Immediate per question |
| **Fullscreen** | Enforced | Optional |
| **Timer** | Strict countdown | Flexible |
| **Question Order** | Fixed | Can jump freely |
| **Explanations** | After test only | After each question |
| **Scoring** | Full test score | Per question feedback |
| **Review Flag** | Yes | No (not needed) |
| **Best For** | Final preparation | Learning & practice |

## Keyboard Shortcuts

During a test:
- **1, 2, 3, 4**: Select option A, B, C, or D
- **→** (Right Arrow): Next question
- **←** (Left Arrow): Previous question
- **M**: Mark for review
- **C**: Clear response
- **Enter**: Confirm selection (when on button)

## Testing Checklist

### User Flow Tests
- [ ] Browse test library with filters
- [ ] View test details and attempt history
- [ ] Start test and enter fullscreen
- [ ] Answer questions and see auto-save
- [ ] Navigate using question palette
- [ ] Mark questions for review
- [ ] Submit test with confirmation
- [ ] View results page with score
- [ ] Retake test (new attempt)

### Edge Cases
- [ ] Timer reaches zero (auto-submit)
- [ ] User tries to exit fullscreen (prevented)
- [ ] Network failure during auto-save (retry)
- [ ] Submit with unanswered questions (warning)
- [ ] Refresh during test (state preserved)
- [ ] Mobile device test-taking experience
- [ ] Browser without fullscreen support

### Admin Tests
- [ ] Create new test with questions
- [ ] Publish/unpublish test
- [ ] View test analytics
- [ ] Edit existing test
- [ ] Delete test (cascade to attempts)

## Common Issues & Solutions

### Issue: Fullscreen Not Working
**Cause**: Browser doesn't support fullscreen API (e.g., iOS Safari)
**Solution**: 
- Display warning message
- Allow test to continue without fullscreen
- Recommend desktop browser for better experience

### Issue: Answers Not Saving
**Cause**: Network latency or connection issue
**Solution**:
- System retries failed saves automatically
- Check network connection
- Wait for 2-second debounce period
- Last saved state indicated (if implemented)

### Issue: Timer Shows Wrong Time
**Cause**: Device time changed or page refresh
**Solution**:
- Timer syncs with server time on page load
- Refresh page to resync
- Server-side validation prevents cheating

### Issue: Can't See Question Palette
**Cause**: Mobile device or small screen
**Solution**:
- Question palette hidden on mobile (by design)
- Use question counter and navigation buttons instead
- Access via drawer/modal on mobile (if implemented)

## Performance Tips

### For Admins
1. **Optimize Test Size**: Keep tests under 100 questions for best performance
2. **Use Sections**: Organize large tests into sections for better navigation
3. **Image Optimization**: Compress question images before upload
4. **Question Reuse**: Leverage question bank instead of duplicating

### For Users
1. **Use Desktop**: Best experience on desktop/laptop with fullscreen
2. **Stable Connection**: Ensure stable internet for auto-save
3. **Close Other Apps**: Minimize distractions during test
4. **Practice First**: Try practice mode before taking full tests

## Monitoring & Analytics

### Key Metrics to Track
- **Test Completion Rate**: % of started tests that are submitted
- **Average Score**: Mean score across all attempts
- **Time Per Question**: Average time spent per question
- **Popular Tests**: Most attempted tests
- **Drop-off Points**: Questions where users quit

### Database Queries
```sql
-- Test completion rate
SELECT 
  COUNT(CASE WHEN status = 'submitted' THEN 1 END)::float / COUNT(*) as completion_rate
FROM user_test_attempts
WHERE started_at > NOW() - INTERVAL '30 days';

-- Average score by test
SELECT 
  t.title,
  AVG(uta.score) as avg_score,
  COUNT(*) as attempt_count
FROM user_test_attempts uta
JOIN tests t ON uta.test_id = t.id
WHERE uta.status = 'submitted'
GROUP BY t.id, t.title
ORDER BY attempt_count DESC;

-- User performance over time
SELECT 
  DATE(submitted_at) as date,
  AVG(score) as avg_score,
  COUNT(*) as attempts
FROM user_test_attempts
WHERE user_id = $1 AND status = 'submitted'
GROUP BY DATE(submitted_at)
ORDER BY date DESC;
```

## Next Steps

### Immediate (Current Sprint)
- ✅ Test library with advanced filters
- ✅ Full test attempt engine with fullscreen
- ✅ Auto-save and timer functionality
- ✅ Results page with score summary

### Short-term (Next Sprint)
- [ ] Question-by-question review with explanations
- [ ] Detailed analytics and performance graphs
- [ ] Percentile calculation for tests
- [ ] Export results as PDF
- [ ] Test recommendations based on weak areas

### Medium-term (Next Quarter)
- [ ] Live tests with real-time leaderboards
- [ ] Video explanations for questions
- [ ] Discussion forum per question
- [ ] Test series and structured preparation paths
- [ ] Social sharing of results

### Long-term (Roadmap)
- [ ] AI-based proctoring for cheating detection
- [ ] Adaptive tests (difficulty adjusts dynamically)
- [ ] Peer comparison and competitive features
- [ ] Gamification (badges, achievements, leaderboards)
- [ ] Mobile app with offline test-taking

## Resources

### Documentation
- [Complete Implementation Guide](./TEST-MODE-IMPLEMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Dashboard Features Guide](./DASHBOARD-FEATURES-GUIDE.md)
- [Practice Mode Guide](./PRACTICE-MODE-QUICKSTART.md)

### Code References
- Server Actions: `src/lib/actions/tests.ts`
- Main Engine: `src/components/tests/test-attempt-engine.tsx`
- Schema: `src/db/schema/tests.ts`

### External Resources
- [Fullscreen API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Test Mode is fully functional and ready for users!** 🎉

**Quick Summary**: Users can now browse tests, take full-length exams in fullscreen mode with live timer, automatic answer saving, and instant results with detailed breakdowns.
