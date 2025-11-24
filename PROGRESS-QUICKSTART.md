# Progress Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration (2 min)

```bash
# Connect to your database
psql -d your_database

# Run the migration file
\i migrations/progress_features.sql

# Verify tables created
\dt user_goals
\dt achievements
\dt user_achievements
\dt user_exams
```

**Expected Output:**
- 4 new tables created
- Indexes created
- 15 achievements seeded

### Step 2: Verify Installation (1 min)

```bash
# Check achievements are seeded
psql -d your_database -c "SELECT COUNT(*) FROM achievements;"
```

**Expected Result:** `15`

If count is 0, run:
```bash
node scripts/seed-achievements.js
```

### Step 3: Start Development Server (1 min)

```bash
npm run dev
```

### Step 4: Test the Feature (1 min)

1. Open browser: `http://localhost:3000`
2. Login to your account
3. Navigate to: `/dashboard/progress`
4. You should see:
   - Exam Readiness Card (may show 0% if no tests)
   - Study Streak (may show 0 days if no activity)
   - Goals Dashboard
   - Achievements Grid
   - Section Coverage
   - Improvement Metrics

### Step 5: Test with Sample Data (Optional)

Complete a test to see data populate:

1. Go to `/dashboard/tests`
2. Start a practice test
3. Answer questions
4. Submit test
5. Return to `/dashboard/progress`
6. Data should now display!

---

## 📱 Quick Feature Overview

### What Users See

**Exam Readiness**
- Overall readiness percentage (0-100%)
- Status: Ready / Almost Ready / Getting There / Keep Practicing
- Section-wise breakdown
- Days until exam (if set)

**Study Streak**
- Current consecutive days
- Longest streak record
- 30-day calendar visualization
- Next milestone indicator

**Goals**
- Today's goals with progress
- Weekly goal summary
- Real-time progress tracking

**Achievements**
- Unlocked badges (with emoji)
- In-progress achievements
- Progress bars for locked achievements

**Section Coverage**
- Status per section (Mastered/Proficient/Developing/Needs Work/Not Attempted)
- Accuracy and questions attempted
- Overall coverage percentage

**Improvement Metrics**
- Month-over-month comparison
- Most improved sections
- Consistency score

---

## 🔧 Common Tasks

### Add a Custom Achievement

```typescript
// In database
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points)
VALUES ('My Achievement', 'Description', '🎉', 'milestone', 'tests_count', 25, 30);
```

### Create a Goal for User

```bash
# POST to API
curl -X POST http://localhost:3000/api/progress/goals \
  -H "Content-Type: application/json" \
  -d '{
    "goalType": "daily",
    "goalCategory": "questions",
    "targetValue": 20,
    "periodStart": "2024-11-22",
    "periodEnd": "2024-11-22"
  }'
```

### Check User Achievements

```bash
# GET from API
curl http://localhost:3000/api/progress/achievements
```

### Manually Trigger Achievement Check

```bash
# POST to check endpoint
curl -X POST http://localhost:3000/api/progress/achievements/check
```

---

## 🎯 What to Test

### Smoke Tests (5 min)
- [ ] Page loads without errors
- [ ] All cards render
- [ ] Navigation works
- [ ] API endpoints respond
- [ ] No console errors

### Functional Tests (10 min)
- [ ] Complete a test → streak updates
- [ ] Accuracy reflects in readiness
- [ ] Section coverage updates
- [ ] Achievements unlock automatically
- [ ] Goals can be created
- [ ] Calendar shows activity

### Edge Cases (5 min)
- [ ] New user (no data)
- [ ] User with 1 test
- [ ] User with 100+ tests
- [ ] Midnight streak rollover
- [ ] All sections mastered

---

## 🐛 Troubleshooting

### Page Shows "No Data"
**Solution:** Complete at least one test

### Achievements Not Showing
**Solution:** 
```bash
node scripts/seed-achievements.js
```

### Streak Not Updating
**Solution:** Check `user_test_attempts.submitted_at` has valid timestamps

### API Returns 401
**Solution:** Ensure user is logged in, check authentication

### Database Error
**Solution:** Verify migration ran successfully:
```bash
psql -d your_database -c "\d user_goals"
```

---

## 📊 Expected Behavior

### For New Users
- Readiness: 0% or "Keep Practicing"
- Streak: 0 days
- Goals: Empty (prompt to create)
- Achievements: 0 unlocked, all showing progress
- Sections: All "Not Attempted"

### After 1 Test
- Readiness: 20-40% (depending on score)
- Streak: 1 day
- Achievement: "First Steps" unlocked
- Sections: Some show "Needs Work" or "Developing"

### After 10 Tests
- Readiness: 40-60%
- Streak: Varies (1-10 days)
- Achievements: 2-3 unlocked
- Sections: Mix of statuses
- Achievement: "Getting Started" unlocked

### After 100 Tests
- Readiness: 70-90%
- Streak: Could be 100+ days
- Achievements: 5-10 unlocked
- Sections: Most "Proficient" or "Mastered"
- Achievement: "Century Club" unlocked

---

## 🎓 Next Steps

1. **Customize Achievements**: Add more achievements relevant to your exam
2. **Set Goals**: Help users set realistic daily/weekly goals
3. **Track Exam Dates**: Add exam dates via user_exams table
4. **Monitor Usage**: Track which features users engage with most
5. **Optimize**: Cache calculations if needed for scale

---

## 📚 Resources

- **Full Documentation**: `docs/core/progress/PROGRESS-IMPLEMENTATION.md`
- **Requirements**: `docs/core/progress/progress-requirements.md`
- **Deployment Checklist**: `PROGRESS-DEPLOYMENT-CHECKLIST.md`
- **Summary**: `PROGRESS-FEATURE-SUMMARY.md`

---

## ✅ Success Checklist

After following this guide, you should have:
- ✅ Database tables created
- ✅ Achievements seeded
- ✅ Page accessible at `/dashboard/progress`
- ✅ API endpoints responding
- ✅ No console errors
- ✅ Data displays after completing tests

**Estimated Total Time**: 5-10 minutes

---

**Need Help?** Check the troubleshooting section or review the full implementation guide.

**Ready to Deploy?** See `PROGRESS-DEPLOYMENT-CHECKLIST.md`
