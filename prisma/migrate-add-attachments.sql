-- Migration: Add attachments column to CompanyPolicy table
-- Date: 2024
-- Description: Adds attachments JSONB field to store file and image attachments for company policies
-- This migration is idempotent and safe to run multiple times

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'CompanyPolicy' 
    AND column_name = 'attachments'
  ) THEN
    ALTER TABLE "CompanyPolicy" 
    ADD COLUMN attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'Added attachments column to CompanyPolicy table';
  ELSE
    RAISE NOTICE 'attachments column already exists in CompanyPolicy table';
  END IF;
END $$;
