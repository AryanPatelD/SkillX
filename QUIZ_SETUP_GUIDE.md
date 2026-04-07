# Quiz System - Quick Setup Guide

## Prerequisites
- Backend server running on port 5000
- Frontend running on port 5173
- Database (PostgreSQL) connected

## Step-by-Step Setup

### 1. Database Migration

Run the migration to create quiz tables:

```bash
cd backend
node run-quiz-migration.js
```

**Expected Output:**
```
🔄 Running quiz migration...

✅ Quiz migration completed successfully!
```

### 2. Start Backend Server

```bash
cd backend
npm start
```

The server will:
- ✅ Connect to database
- ✅ Sync models
- ✅ Run quiz migration (if not already done)
- ✅ Seed quiz data (30 questions across 3 categories)

**Expected Output:**
```
Server is running on port 5000
Database connected!
Database synced!
✅ Quiz data seeded successfully!
✅ Cleanup job started...
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## Testing the Quiz System

### Test Case 1: Quiz Access (User with 0 Credits)

**Setup:**
1. Create a new user account
2. Use the credit reduction feature to bring credits to 0
   - Alternative: Manually update database:
   ```sql
   UPDATE "Users" SET credits = 0 WHERE email = 'test@example.com';
   ```

**Steps:**
1. Login with user account
2. Look at sidebar - credits button should be **RED**
3. Label should show: "0 Credits - Quiz Available"
4. Click on credits button

**Expected Result:**
- QuizModal opens
- Shows eligibility message with "Start Quiz" button
- Modal displays all 3 categories

✅ **PASS** - Modal opened successfully

---

### Test Case 2: Category Selection & Quiz Start

**Steps:**
1. From Category Selection screen
2. Click on any category (e.g., "C++")
3. Wait for quiz to load

**Expected Result:**
- Questions load successfully
- See progress indicator: "Question 1 of 10"
- All 4 options display as radio buttons
- All questions have text and options

✅ **PASS** - Quiz loaded with 10 questions

---

### Test Case 3: Answer Selection & Validation

**Steps:**
1. Select an answer for Question 1
2. Verify visual feedback (radio button filled)
3. Select different answer - old one deselects
4. Try to submit before answering all questions

**Expected Result:**
- Radio buttons respond correctly
- Visual feedback shows selected option
- Submit button is disabled (grayed out) until all answered
- Error message: "Please answer all 10 questions"

✅ **PASS** - Answer selection and validation working

---

### Test Case 4: Passing Quiz (≥60%)

**Steps:**
1. Answer questions to get at least 6/10 correct (60%)
2. Submit quiz
3. Check results page

**Expected Result:**
- Results show: "🎉 Congratulations!"
- Score displays: "X/10 (Y%)"
- Credits earned: "+10 Credits"
- Button to close modal
- Sidebar updates to show new credits

✅ **PASS** - Quiz passed, credits awarded

---

### Test Case 5: Failing Quiz (<60%)

**Steps:**
1. Answer questions to get less than 6/10 correct (40-50%)
2. Submit quiz
3. Check results page

**Expected Result:**
- Results show: "❌ Try Again Later"
- Score displays: "X/10 (Y%)"
- Shows next attempt date (7 days from now)
- "You need 60% to pass. Try again in 7 days!"

✅ **PASS** - Quiz failed, 7-day cooldown triggered

---

### Test Case 6: Cooldown Period

**Steps:**
1. Close quiz modal from failed attempt
2. Click credits button again within 7 days

**Expected Result:**
- Shows cooldown message
- Displays exact date/time when retake is allowed
- "You can retake the quiz on: [Date & Time]"
- Cannot proceed to quiz

✅ **PASS** - Cooldown enforcement working

---

### Test Case 7: Quiz Data Persistence

**Steps:**
1. Submit a quiz
2. Check database to verify attempt was recorded

**SQL Query:**
```sql
SELECT * FROM "QuizAttempts" 
ORDER BY attempted_at DESC LIMIT 1;
```

**Expected Result:**
- Quiz attempt record exists with:
  - Correct user ID
  - Correct category ID
  - Correct score
  - Correct percentage
  - Correct pass/fail status
  - Cooldown timestamp (if failed)

✅ **PASS** - Data persisted correctly

---

### Test Case 8: User with Existing Credits

**Steps:**
1. Create user with credits > 0
2. Click credits button

**Expected Result:**
- QuizModal shows: "You have X credits"
- Message: "You only need to take the quiz when credits reach 0"
- No category selection
- Clean close option

✅ **PASS** - Non-eligible users handled correctly

---

## Database Verification

### Check Quiz Data Seeding

```sql
-- Check categories
SELECT * FROM "QuizCategories";

-- Check questions by difficulty
SELECT difficulty_level, COUNT(*) FROM "QuizQuestions" 
GROUP BY difficulty_level;

-- Check total questions per category
SELECT qc.name, COUNT(qq.id) as question_count
FROM "QuizQuestions" qq
JOIN "QuizCategories" qc ON qq."categoryId" = qc.id
GROUP BY qc.name;
```

**Expected Result:**
```
Categories:
- C++
- Mathematics
- General Knowledge

Difficulty Distribution:
- Easy: 15 (5 per category)
- Medium: 12 (4 per category)
- Hard: 3 (1 per category)

Questions per Category: 10 each (30 total)
```

---

## Troubleshooting

### Issue: Quiz categories not loading
**Solution:**
```bash
# Re-run seeding
cd backend && node seed-quiz.js

# Or restart server
npm start
```

### Issue: Quiz modal won't open
**Solution:**
- Verify user has 0 credits
- Check browser console for errors
- Verify backend is running on port 5000

### Issue: Answers not submitting
**Solution:**
- Ensure all 10 questions are answered
- Check network tab in developer tools
- Verify authentication token is valid

### Issue: Credits not updating after passing
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Logout and login again
- Check browser localStorage

### Issue: Cooldown not enforcing
**Solution:**
```sql
-- Check user cooldown status
SELECT email, credits, quiz_cooldown_until FROM "Users";

-- Clear cooldown if needed (for testing)
UPDATE "Users" SET quiz_cooldown_until = NULL 
WHERE email = 'test@example.com';
```

---

## Performance Metrics

### Expected Response Times
- Get categories: < 100ms
- Get questions: < 200ms
- Submit quiz: < 300ms
- Update credits: < 100ms

### Database Indexes
Automatically created:
- `idx_quizquestions_category`
- `idx_quizquestions_difficulty`
- `idx_quizattempts_user`
- `idx_quizattempts_category`

---

## API Testing with cURL

### Get Categories
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/quiz/categories
```

### Get Quiz Status
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/quiz/status
```

### Get Questions
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/quiz/[CATEGORY_ID]/questions
```

### Submit Quiz
```bash
curl -X POST \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "[CATEGORY_ID]",
    "answers": [
      {"questionId": "[Q_ID_1]", "answer": "A"},
      {"questionId": "[Q_ID_2]", "answer": "B"}
    ]
  }' \
  http://localhost:5000/api/quiz/submit
```

---

## Demo Test Credentials

If you want to test with the same user:

```sql
-- Create test user
INSERT INTO "Users" (id, email, roll_no, password_hash, full_name, credits)
VALUES (
  gen_random_uuid(),
  'quiz.test@example.com',
  'CS001',
  '$2a$10$...',  -- bcrypt hash of 'password123'
  'Quiz Tester',
  0
);
```

Then login with: `quiz.test@example.com` / `password123`

---

## Next Steps

After successful setup:

1. ✅ Complete all test cases
2. ✅ Verify database records
3. ✅ Test across different browsers
4. ✅ Test on mobile devices
5. ✅ Monitor performance
6. ✅ Gather user feedback
7. ✅ Consider future enhancements from QUIZ_IMPLEMENTATION.md
