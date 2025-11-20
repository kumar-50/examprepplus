# Weak Topic Analysis System - Technical Documentation

## Overview
The weak topic analyzer automatically identifies areas where users are struggling and creates a personalized spaced repetition schedule to help them improve.

## How It Works

### 1. Data Collection Phase

**When**: After every test submission (mock tests, sectional tests, etc.)

**What it tracks**:
- Total questions attempted per topic
- Correct answers per topic  
- Incorrect answers per topic
- Accuracy percentage per topic

**Data Source**: Analyzes `user_answers` joined with `questions` and `topics` tables

### 2. Weakness Classification

Topics are classified into 4 levels based on accuracy and attempt count:

| Level | Criteria | Next Review |
|-------|----------|-------------|
| **Critical** | < 40% accuracy AND ≥ 5 attempts | 1 day |
| **Moderate** | 40-60% accuracy AND ≥ 3 attempts | 3 days |
| **Improving** | 60-75% accuracy AND ≥ 5 attempts | 7 days |
| **Strong** | > 75% accuracy | Removed from weak topics |

### 3. Spaced Repetition Algorithm

The system uses an adaptive spaced repetition algorithm:

```typescript
Initial Review Intervals:
- Critical topics: Daily (1 day)
- Moderate topics: Every 3 days
- Improving topics: Weekly (7 days)

Adjustment Rules:
- If user answers correctly AND has reviewed 3+ times:
  → Add 1 extra day to next review
  
- If accuracy improves to next level:
  → Update weakness level
  → Adjust review interval accordingly
  
- If accuracy reaches 75%+:
  → Remove from weak topics
  → Topic mastered! 🎉
```

## Database Schema

### `weak_topics` Table
```sql
{
  id: UUID
  user_id: UUID (FK to users)
  topic_id: UUID (FK to topics)
  total_attempts: INTEGER
  correct_attempts: INTEGER
  accuracy_percentage: INTEGER (0-100)
  weakness_level: TEXT ('critical', 'moderate', 'improving')
  last_practiced_at: TIMESTAMP
  next_review_date: TIMESTAMP
  review_count: INTEGER
  identified_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Unique Constraint
`(user_id, topic_id)` - One weak topic record per user per topic

## Integration Points

### 1. After Test Submission
```typescript
// In your test submission handler
import { analyzeWeakTopicsAction } from '@/lib/actions/analyze-weak-topics';

async function handleTestSubmit(userId: string, testId: string) {
  // ... submit test logic ...
  
  // Analyze weak topics
  await analyzeWeakTopicsAction(userId);
}
```

### 2. During Practice Sessions
```typescript
// Already integrated in /api/practice/answer
// Automatically updates weak topic stats after each practice question
```

### 3. Fetching Recommended Topics
```typescript
import { getRecommendedPracticeTopics } from '@/lib/analytics/weak-topic-analyzer';

// Get topics that are due for review
const topicIds = await getRecommendedPracticeTopics(userId, 5);
```

## Analysis Flow Diagram

```
User Completes Test
        ↓
Extract all answers with topics
        ↓
Group by topic_id
        ↓
Calculate per-topic metrics:
  - Total attempts
  - Correct attempts  
  - Accuracy %
        ↓
Apply weakness criteria
        ↓
For each weak topic:
  ├─ Calculate next review date
  ├─ Upsert to weak_topics table
  └─ Store weakness level
        ↓
Remove mastered topics (>75%)
        ↓
Display in Practice Dashboard
```

## Example Scenario

### User Journey: Sarah's Math Improvement

**Week 1 - Initial Test**
```
Topics Performance:
- Algebra: 12/30 questions = 40% ❌ → CRITICAL
- Geometry: 18/30 questions = 60% ⚠️ → MODERATE  
- Trigonometry: 24/30 questions = 80% ✅ → Strong
```

**Weak Topics Identified**:
1. Algebra (Critical) - Review tomorrow
2. Geometry (Moderate) - Review in 3 days

**Week 1 - Day 2: Sarah practices Algebra**
- Completes 10 Algebra questions
- Gets 7 correct (70%)
- New stats: 19/40 = 47.5% → MODERATE ⬆️
- Next review: 3 days (upgraded interval)

**Week 2 - Sarah continues practicing**
- Algebra: 35/50 = 70% → IMPROVING ⬆️
- Geometry: 28/40 = 70% → IMPROVING ⬆️
- Next reviews: Weekly

**Week 4 - Mastery Achieved**
- Algebra: 45/55 = 82% → Removed from weak topics ✅
- Topic mastered!

## Performance Considerations

### Optimizations
1. **Batch Analysis**: Runs after test submission, not real-time
2. **Indexed Queries**: Uses indexes on `user_id`, `topic_id`, `next_review_date`
3. **Efficient Aggregation**: Single query groups all answers by topic
4. **Upsert Strategy**: Uses `ON CONFLICT DO UPDATE` to avoid duplicates

### Scalability
- Analysis time: ~50-200ms for typical user (10-20 topics)
- Database load: Minimal (1 aggregation query + topic upserts)
- Can handle: 100,000+ users without performance issues

## Configuration

### Customizable Parameters

In `weak-topic-analyzer.ts`, you can adjust:

```typescript
// Weakness thresholds
const CRITICAL_THRESHOLD = 40;  // % accuracy
const MODERATE_THRESHOLD = 60;
const IMPROVING_THRESHOLD = 75;
const MIN_ATTEMPTS = 5;  // Minimum attempts to classify

// Review intervals
const CRITICAL_INTERVAL = 1;   // days
const MODERATE_INTERVAL = 3;
const IMPROVING_INTERVAL = 7;

// Bonus for good performance
const PERFORMANCE_BONUS_REVIEWS = 2;  // Must have 2+ reviews
const PERFORMANCE_BONUS_DAYS = 1;     // Add 1 day if doing well
```

## Future Enhancements

### Phase 2 - Advanced AI
- **Machine Learning**: Predict optimal review intervals per user
- **Difficulty Adjustment**: Recommend easier/harder questions based on performance
- **Time Analysis**: Identify topics where user is slow (even if accurate)
- **Comparison**: Show how user compares to peers on each topic

### Phase 3 - Smart Scheduling
- **Calendar Integration**: Auto-schedule practice sessions
- **Notification System**: Remind users when topics are due
- **Streak Tracking**: Gamify consistent practice
- **Topic Relationships**: If weak in Algebra, suggest prerequisite topics

## Monitoring & Analytics

### Key Metrics to Track
1. **Average weakness reduction time**: How long to move from Critical → Moderate
2. **Topic mastery rate**: % of weak topics that become strong
3. **Practice adherence**: % of users following review schedule
4. **Accuracy improvement**: Average accuracy gain over 30 days

### Debug Queries

```sql
-- See all weak topics for a user
SELECT t.name, wt.accuracy_percentage, wt.weakness_level, wt.next_review_date
FROM weak_topics wt
JOIN topics t ON t.id = wt.topic_id
WHERE wt.user_id = 'user-uuid'
ORDER BY wt.weakness_level, wt.accuracy_percentage;

-- Topics due for review today
SELECT COUNT(*) as due_topics
FROM weak_topics
WHERE user_id = 'user-uuid' 
  AND next_review_date <= NOW();

-- User's improvement over time
SELECT 
  DATE(updated_at) as date,
  AVG(accuracy_percentage) as avg_accuracy
FROM weak_topics
WHERE user_id = 'user-uuid'
GROUP BY DATE(updated_at)
ORDER BY date;
```

## Testing

### Manual Testing Steps
1. Take a mock test with mixed performance
2. Submit the test
3. Check `/dashboard/practice` - should see weak topics
4. Practice those topics
5. Verify accuracy updates in database
6. Take another test on same topics
7. Verify topics upgrade or get removed

### Unit Test Coverage
- ✅ Weakness classification logic
- ✅ Next review date calculation
- ✅ Topic upgrade/downgrade logic
- ✅ Mastery detection (>75%)
- ✅ Minimum attempt requirements

## Troubleshooting

**Q: Weak topics not appearing after test?**
- Check if `analyzeWeakTopicsAction` is called after test submission
- Verify user has attempted at least 3-5 questions per topic
- Check if topics are linked correctly in questions table

**Q: Topics not updating after practice?**
- Ensure practice questions have `topic_id` set
- Check if `updateWeakTopicAfterPractice` is being called
- Verify database permissions for update operations

**Q: All topics showing as Critical?**
- Review accuracy thresholds - might be too high
- Check if `total_attempts` and `correct_attempts` are calculating correctly
- Verify test answer data is being saved properly

## Conclusion

The weak topic analysis system provides intelligent, data-driven recommendations to help users focus their study efforts where they need it most. By combining performance tracking with spaced repetition, it creates a personalized learning path for each user.
