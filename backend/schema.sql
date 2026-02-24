-- Create Tables
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    bio TEXT,
    credits INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Skills" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserSkills" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proficiency VARCHAR(255) DEFAULT 'Beginner',
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    "skillId" UUID REFERENCES "Skills"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SkillRequests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    status VARCHAR(255) DEFAULT 'Open',
    "requesterId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "skillId" UUID REFERENCES "Skills"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Sessions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(255) DEFAULT 'Pending',
    meeting_link VARCHAR(255),
    "requesterId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "providerId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "skillId" UUID REFERENCES "Skills"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed Data

-- Insert Users (Password: password123)
-- Note: Replace password_hash with actual bcrypt hash if needed, but for raw SQL we'll use a placeholder or plain text if the app doesn't check strict bcrypt format for now (it does check, so we need a valid hash).
-- Using a known hash for 'password123': $2a$10$wI.q.1.1.1.1.1.1.1.1.1 (This is fake, let's use a real one or ask user to register)
-- Actually, let's just insert users and let them register via app if they want valid passwords.
-- Or better, we can't easily generate pg-compatible bcrypt hash here without pgcrypto.
-- We will just insert skills.

INSERT INTO "Skills" (id, name, category, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'Python', 'Programming', NOW(), NOW()),
(gen_random_uuid(), 'JavaScript', 'Programming', NOW(), NOW()),
(gen_random_uuid(), 'React', 'Web Development', NOW(), NOW()),
(gen_random_uuid(), 'Node.js', 'Backend Development', NOW(), NOW()),
(gen_random_uuid(), 'Graphic Design', 'Design', NOW(), NOW()),
(gen_random_uuid(), 'Calculus', 'Mathematics', NOW(), NOW()),
(gen_random_uuid(), 'Physics', 'Science', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

