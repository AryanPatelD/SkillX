-- Migration: Add deadline to SkillRequests and availability to Sessions

-- Add deadline column to SkillRequests table
ALTER TABLE "SkillRequests" 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP DEFAULT NULL;

-- Add availability columns to Sessions table
ALTER TABLE "Sessions"
ADD COLUMN IF NOT EXISTS provider_available_from TIMESTAMP DEFAULT NULL;

ALTER TABLE "Sessions"
ADD COLUMN IF NOT EXISTS provider_available_to TIMESTAMP DEFAULT NULL;

-- Add skillRequestId column to Sessions table
ALTER TABLE "Sessions"
ADD COLUMN IF NOT EXISTS "skillRequestId" UUID DEFAULT NULL;

-- Make scheduled_time nullable in Sessions (for "Offer to Help" flow without scheduled_time)
ALTER TABLE "Sessions"
ALTER COLUMN scheduled_time DROP NOT NULL;

-- Add foreign key constraint for skillRequestId
ALTER TABLE "Sessions"
ADD CONSTRAINT fk_sessions_skilrequest FOREIGN KEY ("skillRequestId") 
REFERENCES "SkillRequests"(id) ON DELETE SET NULL;

-- Add comments/indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skillrequests_deadline ON "SkillRequests"(deadline);
CREATE INDEX IF NOT EXISTS idx_sessions_availability ON "Sessions"(provider_available_from, provider_available_to);
CREATE INDEX IF NOT EXISTS idx_sessions_skillrequest ON "Sessions"("skillRequestId");
