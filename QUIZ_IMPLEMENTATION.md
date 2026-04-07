# Credits Quiz System Implementation

## Overview
A complete credit recovery quiz system has been implemented. When a user's credits reach 0, they can take a quiz to earn 10 credits back. The quiz consists of 10 MCQs with 3 difficulty levels (5 easy, 4 medium, 1 hard) across 3 categories.

## Features

### 1. **Quiz Access Control**
- ✅ Users with 0 credits can access the quiz
- ✅ Users with credits > 0 cannot take the quiz
- ✅ Failed attempts trigger a 7-day cooldown
- ✅ Users cannot retake quiz during cooldown

### 2. **Quiz Categories**
Three categories available:
- **C++** - Programming fundamentals and advanced concepts
- **Mathematics** - Algebra, calculus, and basic math
- **General Knowledge** - Diverse knowledge across topics

### 3. **Quiz Structure**
Each quiz contains exactly 10 MCQs:
- **5 Easy Questions** (basic concepts, recall)
- **4 Medium Questions** (application, intermediate understanding)
- **1 Hard Question** (analysis, advanced concepts)

### 4. **Scoring & Credits**
- **Passing Score:** 60% (6 out of 10 questions correct)
- **Credits Awarded:** 10 credits for passing
- **Failed Attempt:** Triggered 7-day cooldown for retake
- **Score Calculation:** Real-time verification against database

### 5. **User Experience**
- ✅ Interactive quiz interface with radio button selection
- ✅ Visual feedback for selected answers
- ✅ Progress indicator (Question X of 10)
- ✅ Results display with score, percentage, and status
- ✅ Cooldown timer display for failed attempts

---

## Backend Implementation

### Database Schema

#### Tables Created:

1. **QuizCategories**
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR, Unique)
   - `description` (TEXT)

2. **QuizQuestions**
   - `id` (UUID, Primary Key)
   - `categoryId` (UUID, Foreign Key)
   - `question` (TEXT)
   - `option_a`, `option_b`, `option_c`, `option_d` (TEXT)
   - `correct_answer` (ENUM: A, B, C, D)
   - `difficulty_level` (ENUM: Easy, Medium, Hard)

3. **QuizAttempts**
   - `id` (UUID, Primary Key)
   - `userId` (UUID, Foreign Key)
   - `categoryId` (UUID, Foreign Key)
   - `score` (INTEGER)
   - `total_questions` (INTEGER)
   - `percentage` (DECIMAL)
   - `passed` (BOOLEAN)
   - `attempted_at` (TIMESTAMP)
   - `next_attempt_allowed_at` (TIMESTAMP, nullable)

4. **Users (Updated)**
   - `last_quiz_attempt_at` (TIMESTAMP, nullable)
   - `quiz_cooldown_until` (TIMESTAMP, nullable)

### API Endpoints

All endpoints require authentication (`authMiddleware`)

#### 1. Get Quiz Categories
```
GET /api/quiz/categories
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "C++",
    "description": "Test your C++ programming knowledge"
  }
]
```

#### 2. Get Quiz Status
```
GET /api/quiz/status
```
**Response:**
```json
{
  "credits": 0,
  "isEligible": true,
  "isCooldownActive": false,
  "cooldownUntil": null
}
```

#### 3. Get Quiz Questions
```
GET /api/quiz/:categoryId/questions
```
**Requirements:**
- User must have 0 credits
- User must not be in cooldown

**Response:**
```json
{
  "categoryId": "uuid",
  "totalQuestions": 10,
  "questions": [
    {
      "id": "uuid",
      "question": "What is...?",
      "option_a": "Answer A",
      "option_b": "Answer B",
      "option_c": "Answer C",
      "option_d": "Answer D",
      "difficulty_level": "Easy"
    }
  ]
}
```

#### 4. Submit Quiz
```
POST /api/quiz/submit
```
**Request Body:**
```json
{
  "categoryId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "answer": "A"
    }
  ]
}
```

**Response (Passed - 60%+):**
```json
{
  "passed": true,
  "score": 8,
  "totalQuestions": 10,
  "percentage": 80.00,
  "creditsEarned": 10,
  "message": "🎉 Congratulations! You passed the quiz and earned 10 credits!",
  "nextAttemptAllowedAt": null
}
```

**Response (Failed - <60%):**
```json
{
  "passed": false,
  "score": 4,
  "totalQuestions": 10,
  "percentage": 40.00,
  "creditsEarned": 0,
  "message": "❌ You need 60% to pass. Try again in 7 days!",
  "nextAttemptAllowedAt": "2026-04-08T10:30:00Z"
}
```

#### 5. Get Last Attempt
```
GET /api/quiz/attempt/last
```
**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "categoryId": "uuid",
  "score": 7,
  "total_questions": 10,
  "percentage": 70.00,
  "passed": true,
  "attempted_at": "2026-04-01T10:30:00Z",
  "category": {
    "id": "uuid",
    "name": "C++"
  }
}
```

---

## Frontend Implementation

### Components

#### 1. **QuizModal.jsx** (`src/components/QuizModal.jsx`)
Main quiz component with 4 steps:
- **Eligibility Check** - Verifies user credits and cooldown status
- **Category Selection** - User selects which category to take
- **Quiz Display** - Interactive quiz with radio buttons
- **Results Display** - Shows score, percentage, and credits earned

**Features:**
- Real-time answer tracking
- Progress indicator
- Answer validation before submission
- Mobile responsive design

#### 2. **Navbar Integration** (`src/components/Navbar.jsx`)
- Credits button updated to open QuizModal when clicked
- Visual indicator when user has 0 credits (red color + "Quiz Available")
- Button changes color based on credit status

### User Flow

1. **User sees 0 Credits**
   - Credits button turns red
   - Shows "0 Credits - Quiz Available"

2. **User clicks Credits Button**
   - QuizModal opens
   - Eligibility check performed
   - If eligible → Category selection screen
   - If in cooldown → Shows cooldown timer

3. **User Selects Category**
   - 10 questions loaded (5 easy, 4 medium, 1 hard)
   - Questions displayed one per view with 4 options each

4. **User Answers Questions**
   - Radio buttons for selection
   - Visual feedback for selected answers
   - Progress indicator updates

5. **User Submits Quiz**
   - Validation: All 10 questions must be answered
   - Server verifies answers against database
   - Score calculated as percentage

6. **Results Displayed**
   - **If Passed (≥60%):** Shows congratulations, credits earned (+10), refresh user data
   - **If Failed (<60%):** Shows message, next attempt date (7 days later)

---

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
node run-quiz-migration.js
```

This creates the required tables:
- QuizCategories
- QuizQuestions
- QuizAttempts
- Updates Users table

### 2. Seed Quiz Data
Quiz data is automatically seeded when the server starts (`seed-quiz.js` called in `app.js`).

Includes:
- 3 categories: C++, Mathematics, General Knowledge
- 30 total questions (10 per category with correct difficulty mix)

### 3. Frontend Setup
No additional setup needed. The `QuizModal` component is integrated into the Navbar.

---

## Testing Checklist

- [ ] User with 0 credits can see "Quiz Available" on credits button
- [ ] Clicking credits button opens QuizModal
- [ ] Category selection appears for eligible users
- [ ] Selecting category loads 10 questions with correct difficulty
- [ ] All answers can be selected and changed
- [ ] Cannot submit without answering all questions
- [ ] Passing quiz (≥60%) adds 10 credits to user
- [ ] Failed quiz shows 7-day cooldown message
- [ ] Cooldown prevents retake within 7 days
- [ ] Quiz results persist in database
- [ ] Credits update in real-time in sidebar

---

## Database Queries (for debugging)

### View all quiz attempts by user
```sql
SELECT qa.*, qc.name, u.full_name 
FROM "QuizAttempts" qa
JOIN "QuizCategories" qc ON qa."categoryId" = qc.id
JOIN "Users" u ON qa."userId" = u.id
ORDER BY qa.attempted_at DESC;
```

### View user cooldown status
```sql
SELECT id, email, credits, quiz_cooldown_until, last_quiz_attempt_at
FROM "Users"
WHERE quiz_cooldown_until IS NOT NULL;
```

### View questions by category and difficulty
```sql
SELECT qc.name, qq.difficulty_level, COUNT(*) as count
FROM "QuizQuestions" qq
JOIN "QuizCategories" qc ON qq."categoryId" = qc.id
GROUP BY qc.name, qq.difficulty_level
ORDER BY qc.name, qq.difficulty_level;
```

---

## Files Modified/Created

### Backend
- ✅ `migrations/005_create_quiz_tables.sql` - Database schema
- ✅ `src/models/quizCategory.model.js` - Category model
- ✅ `src/models/quizQuestion.model.js` - Question model
- ✅ `src/models/quizAttempt.model.js` - Attempt model
- ✅ `src/models/index.js` - Updated with quiz models
- ✅ `src/controllers/quiz.controller.js` - Quiz logic
- ✅ `src/routes/quiz.routes.js` - Quiz endpoints
- ✅ `src/app.js` - Integrated quiz routes
- ✅ `seed-quiz.js` - Quiz data seeding
- ✅ `run-quiz-migration.js` - Migration runner

### Frontend
- ✅ `src/components/QuizModal.jsx` - Quiz UI component
- ✅ `src/components/Navbar.jsx` - Updated with quiz button
- ✅ `src/context/AuthContext.jsx` - Uses updateUser for credits

---

## Error Handling

| Error | Status | Message | Solution |
|-------|--------|---------|----------|
| User has credits > 0 | 403 | "You must have 0 credits to take the quiz" | Wait until credits reach 0 |
| In cooldown period | 403 | "You must wait before retaking the quiz" | Check cooldownUntil date |
| Not all questions answered | 400 | "Please answer all 10 questions" | Answer remaining questions |
| Invalid category ID | 404 | Category not found | Select valid category |
| Server error | 500 | "Error submitting quiz" | Contact support |

---

## Future Enhancements

Potential improvements:
- [ ] Add timer for quiz (e.g., 30 minutes limit)
- [ ] Shuffle question options each time
- [ ] Add explanation for correct answers
- [ ] Create quiz history/analytics page
- [ ] Add more quiz categories
- [ ] Implement weighted scoring (harder questions worth more)
- [ ] Add quiz difficulty levels (basic, intermediate, advanced)
- [ ] Integrate with skill verification system
