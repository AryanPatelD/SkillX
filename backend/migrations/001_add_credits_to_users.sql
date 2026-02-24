-- Migration: Add credits system to Users table
-- Description: Adds a credits column to the Users table to implement the credit system
-- Date: 2024

-- Add credits column to Users table if it doesn't exist
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Update existing users to have 10 credits as initial value
UPDATE "Users" SET credits = 10 WHERE credits = 0;
