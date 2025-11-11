# Question Verification Workflow - Admin UI Guide

## Overview

The Question Verification system ensures only quality-checked questions appear in tests. Here's how admins review and approve questions.

---

## 📍 Access Point

**Navigation:** Admin Panel → **Question Review**

The sidebar shows "Question Review" menu item that takes you to `/admin/questions/pending`

---

## 🎯 Question Review Page Features

### 1. **Tab-Based Filtering**

Four tabs to organize questions by status:

- **Pending** - New questions awaiting review (default view)
- **Approved** - Questions verified and ready for tests
- **Rejected** - Questions that didn't pass review
- **All** - Complete list of all questions

### 2. **Question Card Layout**

Each question card displays:

```
┌─────────────────────────────────────────────────────────────┐
│ ☑️  Question Text                             [Pending Badge]│
│     "In which of the following years was..."  [Medium Badge] │
│                                               [By: Admin]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Answer Options (2x2 Grid):                                  │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ 1. 1837          │  │ 2. 1829 ✓        │                 │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ 3. 1858          │  │ 4. 1818          │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
│  📘 Explanation:                                             │
│  "The Bengal Sati Regulation was enacted in 1829..."         │
│                                                               │
│  [✓ Approve]  [✗ Reject]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- ✅ **Green border** around correct answer option
- 🟢 **Check icon** next to correct option
- 🎨 **Color-coded difficulty badges:**
  - 🟢 Easy (Green)
  - 🟡 Medium (Yellow)
  - 🔴 Hard (Red)

### 3. **Single Question Actions**

For **Pending Questions**:
- **✓ Approve Button** - Mark as approved (green button)
- **✗ Reject Button** - Mark as rejected (red button)

For **Rejected Questions**:
- **Re-approve Button** - Give it another chance

For **Approved Questions**:
- No action buttons (already verified)

### 4. **Bulk Operations**

**Select Multiple Questions:**
1. Check boxes next to pending questions
2. A blue banner appears showing selection count
3. Click **"Bulk Approve"** to approve all selected

```
┌─────────────────────────────────────────────────────────────┐
│ ☑️ All  3 question(s) selected     [Bulk Approve Button]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Verification Workflow

### Step-by-Step Process:

```
1. Questions Created
   ↓
   CSV Import or Manual Entry
   ↓
   Status: PENDING ⏳
   ↓
2. Admin Reviews (Question Review Page)
   ↓
   Checks: Text, Options, Correct Answer, Explanation
   ↓
3. Admin Decision
   ├─→ APPROVE ✅
   │   • status = 'approved'
   │   • is_verified = true
   │   • verified_by = admin ID
   │   • verified_at = timestamp
   │   • Available in Test Builder
   │
   └─→ REJECT ❌
       • status = 'rejected'
       • is_verified = false
       • NOT available in Test Builder
       • Can be re-approved later
```

---

## 🎯 What Admin Checks:

1. **Question Text** - Clear, unambiguous, grammatically correct
2. **Answer Options** - All 4 options present and distinct
3. **Correct Answer** - Properly marked (green highlight)
4. **Explanation** - Helpful, accurate explanation provided
5. **Categorization** - Correct section/topic/difficulty
6. **No Duplicates** - Not a repeat question

---

## 🚫 Test Builder Protection

**Critical Rule:** Only **approved AND verified** questions appear in the Test Builder!

- Admins creating tests can ONLY select from approved questions
- This ensures all test content is quality-controlled
- Prevents accidentally publishing low-quality questions

---

## 💡 Usage Tips

### For Efficient Review:

1. **Use Tabs** - Focus on "Pending" tab for daily reviews
2. **Bulk Approve** - Select multiple good questions at once
3. **Quick Scan** - Green border shows correct answer at a glance
4. **Re-check Rejected** - Periodically review rejected questions

### Example Daily Workflow:

```
Morning:
→ Open "Pending" tab
→ Review new questions from CSV imports
→ Bulk approve good quality ones
→ Individually reject poor quality ones

Afternoon:
→ Check "Rejected" tab
→ Re-approve any that were fixed
→ Check "Approved" count for test creation
```

---

## 📊 Status Indicators

| Badge Color | Status    | Meaning                          |
|-------------|-----------|----------------------------------|
| 🟡 Yellow   | Pending   | Awaiting admin review            |
| 🟢 Green    | Approved  | Verified, ready for tests        |
| 🔴 Red      | Rejected  | Failed review, needs improvement |

---

## 🔔 Next Steps After Approval

Once questions are approved:

1. ✅ Questions become available in **Test Builder**
2. 📝 Admins can add them to tests
3. 👥 Students can answer them in tests
4. 📊 Results get tracked and analyzed

---

## 🛡️ Database Changes

Behind the scenes, when admin approves:

```sql
UPDATE questions 
SET 
  status = 'approved',
  is_verified = true,
  verified_by = '<admin-user-id>',
  verified_at = NOW(),
  updated_at = NOW()
WHERE id = '<question-id>';
```

---

## 🎨 UI Screenshots Reference

Your current Questions page (with Edit dialog) remains for editing existing questions.

The new **Question Review** page is specifically designed for the approval workflow with:
- Better visual layout for quick scanning
- Bulk operations support
- Clear approve/reject actions
- Status-based organization

Both pages serve different purposes:
- **Questions** page = CRUD operations (Create, Read, Update, Delete)
- **Question Review** page = Verification workflow (Approve/Reject)

---

## ✨ Summary

**As an Admin, to verify questions:**

1. Click **"Question Review"** in sidebar
2. See all pending questions
3. Review each question (text, options, answer, explanation)
4. Click **"Approve"** ✅ or **"Reject"** ❌
5. Use **Bulk Approve** for multiple good questions
6. Approved questions → Available in Test Builder
7. Rejected questions → Hidden from Test Builder
