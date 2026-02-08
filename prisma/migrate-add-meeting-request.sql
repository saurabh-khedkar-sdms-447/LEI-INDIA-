-- Migration: Add meetingRequest column to Inquiry table
-- Date: 2024
-- Description: Adds meetingRequest boolean field to track online meeting requests from contact form

-- Add meetingRequest column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Inquiry' 
    AND column_name = 'meetingRequest'
  ) THEN
    ALTER TABLE "Inquiry" 
    ADD COLUMN "meetingRequest" BOOLEAN NOT NULL DEFAULT FALSE;
    
    RAISE NOTICE 'Added meetingRequest column to Inquiry table';
  ELSE
    RAISE NOTICE 'meetingRequest column already exists in Inquiry table';
  END IF;
END $$;
