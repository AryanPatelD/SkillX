-- Migration: Create Meeting Session Tables
-- Description: Creates MeetingSessions table for the Meeting Link feature
-- Date: 2026

-- Create MeetingSessions table
CREATE TABLE IF NOT EXISTS "MeetingSessions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_name VARCHAR(255) NOT NULL,
    tutor_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    learner_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    confirmed_slot JSONB,
    proposed_slots JSONB,
    meeting_link VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_sessions_status ON "MeetingSessions"(status);
CREATE INDEX IF NOT EXISTS idx_meeting_sessions_tutor_id ON "MeetingSessions"(tutor_id);
CREATE INDEX IF NOT EXISTS idx_meeting_sessions_learner_id ON "MeetingSessions"(learner_id);
CREATE INDEX IF NOT EXISTS idx_meeting_sessions_created_at ON "MeetingSessions"("createdAt");
