-- Migration: Make Roll_NO Mandatory, Remove Username Requirement
-- Description: Updates Users table to make roll_no mandatory and username optional
-- Date: 2024

-- Step 1: Make username nullable
ALTER TABLE "Users" ALTER COLUMN username DROP NOT NULL;

-- Step 2: Make roll_no NOT NULL (it already has UNIQUE constraint)
ALTER TABLE "Users" ALTER COLUMN roll_no SET NOT NULL;

-- Step 3: Drop unique constraint on username if it exists
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_username_key";
