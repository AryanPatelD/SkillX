-- Migration: Create Quiz, Question, and QuizAttempt tables

-- Create Quiz Categories table
CREATE TABLE IF NOT EXISTS "QuizCategories" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Quiz Questions table
CREATE TABLE IF NOT EXISTS "QuizQuestions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "categoryId" UUID REFERENCES "QuizCategories"(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer VARCHAR(1) NOT NULL CHECK(correct_answer IN ('A', 'B', 'C', 'D')),
    difficulty_level VARCHAR(50) NOT NULL CHECK(difficulty_level IN ('Easy', 'Medium', 'Hard')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Quiz Attempts table to track user quiz attempts
CREATE TABLE IF NOT EXISTS "QuizAttempts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE NOT NULL,
    "categoryId" UUID REFERENCES "QuizCategories"(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 10,
    percentage DECIMAL(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    next_attempt_allowed_at TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add last_quiz_attempt column to Users if not exists
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS last_quiz_attempt_at TIMESTAMP;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS quiz_cooldown_until TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quizquestions_category ON "QuizQuestions"("categoryId");
CREATE INDEX IF NOT EXISTS idx_quizquestions_difficulty ON "QuizQuestions"(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quizattempts_user ON "QuizAttempts"("userId");
CREATE INDEX IF NOT EXISTS idx_quizattempts_category ON "QuizAttempts"("categoryId");
