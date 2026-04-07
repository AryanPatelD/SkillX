-- Migration: Add video provider field to MeetingSessions
-- Purpose: Support multiple video providers (Jitsi, Daily.co, etc.)
-- Date: April 1, 2026

-- Add video_provider column to MeetingSessions
ALTER TABLE "MeetingSessions" 
ADD COLUMN "video_provider" VARCHAR(50) DEFAULT 'daily' CHECK ("video_provider" IN ('jitsi', 'daily', 'whereby'));

-- Add provider_room_id for Daily.co or other providers
ALTER TABLE "MeetingSessions"
ADD COLUMN "provider_room_id" VARCHAR(255) UNIQUE;

-- Create index for provider lookups
CREATE INDEX idx_meeting_sessions_video_provider ON "MeetingSessions"("video_provider");
CREATE INDEX idx_meeting_sessions_provider_room_id ON "MeetingSessions"("provider_room_id");

-- Update existing sessions to use 'jitsi' as provider
UPDATE "MeetingSessions" SET "video_provider" = 'jitsi' WHERE "video_provider" IS NULL;

-- Add comment
COMMENT ON COLUMN "MeetingSessions"."video_provider" IS 'Video conferencing provider: daily (Daily.co), jitsi (Jitsi Meet), whereby (Whereby)';
COMMENT ON COLUMN "MeetingSessions"."provider_room_id" IS 'Provider-specific room ID or identifier';
