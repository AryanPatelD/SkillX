-- Migration: Add Roll_NO to Users table
-- Description: Adds roll_no column to the Users table for student identification
-- Date: 2024

-- Add roll_no column to Users table if it doesn't exist
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS roll_no VARCHAR(50) UNIQUE;
