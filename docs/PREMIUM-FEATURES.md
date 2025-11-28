# ExamPrepPlus Premium Features

This document outlines all features and their access levels for Free and Premium subscription tiers.

---

## 📊 Feature Comparison Table

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| **Mock Tests** | 3 per month | ✅ Unlimited |
| **Practice Quizzes** | 5 per day | ✅ Unlimited |
| **Scheduled Practice** | 3 per week | ✅ Unlimited |
| **Practice Questions** | 50 per day | ✅ Unlimited |
| **Topic Access** | 5 topics | ✅ All topics |
| **Analytics History** | 7 days | ✅ Full history |
| **Analytics Export** | ❌ Not available | ✅ PDF & CSV |
| **Time Analysis** | ❌ Not available | ✅ Full access |
| **Learning Insights** | 2 insights | ✅ All insights |
| **Activity Heatmap** | 30 days | ✅ Full year (365 days) |
| **Test History** | Last 5 tests | ✅ All history |
| **Answer Explanations** | 10 per day | ✅ Unlimited |
| **Weak Topics Analysis** | ❌ Not available | ✅ Full access |
| **Leaderboard** | Top 10 only | ✅ Full leaderboard |
| **Goals** | 1 active goal | ✅ Unlimited |
| **Section Coverage** | Top 3 sections | ✅ All sections |
| **Improvement Metrics** | ❌ Not available | ✅ Full access |
| **Exam Readiness** | Basic score only | ✅ Full breakdown |

---

## 🔐 Premium-Only Features

These features are completely disabled for free users:

1. **Analytics Export** - Export your analytics reports as PDF or CSV files
2. **Time Analysis** - Discover your peak performance times and optimal study schedule
3. **Weak Topics Analysis** - Identify and focus on your weakest areas
4. **Improvement Metrics** - Track month-over-month progress and improvements

---

## 📈 Feature Details by Category

### 🧪 Tests & Practice

| Feature | Free | Premium | Description |
|---------|------|---------|-------------|
| Mock Tests | 3/month | Unlimited | Full-length exam simulations |
| Practice Quizzes | 5/day | Unlimited | Quick topic-focused quizzes |
| Practice Questions | 50/day | Unlimited | Individual question practice |
| Scheduled Practice | 3/week | Unlimited | Schedule future practice sessions |
| Topic Access | 5 topics | All | Access to exam topics/sections |

### 📊 Analytics & Insights

| Feature | Free | Premium | Description |
|---------|------|---------|-------------|
| Analytics History | 7 days | All time | Date range for analytics data |
| Analytics Export | ❌ | ✅ | Export reports as PDF/CSV |
| Time Analysis | ❌ | ✅ | Performance by time of day/week |
| Learning Insights | 2 | Unlimited | AI-generated recommendations |
| Activity Heatmap | 30 days | 365 days | Activity calendar view |

### 📈 Progress Tracking

| Feature | Free | Premium | Description |
|---------|------|---------|-------------|
| Test History | 5 tests | All | Access to past test attempts |
| Goals | 1 active | Unlimited | Study goal tracking |
| Section Coverage | 3 sections | All | Coverage across exam sections |
| Improvement Metrics | ❌ | ✅ | Month-over-month comparisons |
| Exam Readiness | Basic | Full | Exam readiness score breakdown |

### 📚 Learning Support

| Feature | Free | Premium | Description |
|---------|------|---------|-------------|
| Answer Explanations | 10/day | Unlimited | Detailed answer explanations |
| Weak Topics | ❌ | ✅ | Identify weak areas to improve |
| Leaderboard | Top 10 | Full | Compare with other students |

---

## 💡 Upgrade Prompts

Free users will see upgrade prompts when they:

- Reach their monthly mock test limit (3 tests)
- Try to access premium-only features
- Hit daily limits on practice quizzes or explanations
- Attempt to export analytics data
- Try to create more than 1 active goal
- View limited section coverage or analytics history

---

## 🔧 Technical Implementation

Access control is implemented in:
- **Types**: `src/lib/access-control/types.ts`
- **Config**: `src/lib/access-control/config.ts`
- **Middleware**: `src/lib/access-control/middleware.ts`
- **Client Hook**: `src/hooks/use-access-control.ts`

### Feature Keys

```typescript
type FeatureKey = 
  | 'mock_tests'
  | 'practice_quizzes'
  | 'scheduled_practice'
  | 'practice_questions'
  | 'topic_access'
  | 'analytics_history'
  | 'analytics_export'
  | 'time_analysis'
  | 'learning_insights'
  | 'activity_heatmap'
  | 'test_history'
  | 'explanations'
  | 'weak_topics'
  | 'leaderboard'
  | 'goals'
  | 'section_coverage'
  | 'improvement_metrics'
  | 'exam_readiness';
```

### Limit Periods

- `daily` - Resets every day
- `weekly` - Resets every week
- `monthly` - Resets every month
- `total` - Does not reset (fixed limit)

---

## 📱 UI Components with Access Control

| Page | Component | Access Control |
|------|-----------|----------------|
| Tests | `test-library-client.tsx` | 3 tests for free, premium tests hidden |
| Tests | `test-detail-view.tsx` | Server-side check for premium tests |
| Analytics | `analytics-client.tsx` | Date range, export, time analysis limits |
| Analytics | `learning-insights.tsx` | Limited insights with upgrade prompt |
| Analytics | `activity-heatmap.tsx` | 30 days for free, upgrade prompt |
| Practice | `practice-tabs.tsx` | Quiz/schedule limits checked |
| Progress | `progress-page-client.tsx` | Section coverage, improvement metrics |
| Progress | `goals-dashboard.tsx` | 1 goal limit for free |
| Progress | `exam-readiness-card.tsx` | Basic score vs full breakdown |

---

*Last updated: November 28, 2025*
