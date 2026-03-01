-- Migration: Ensure all enum types are properly defined
-- This migration ensures all custom enum types exist for the marketplace schema

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'RESELLER', 'DISTRIBUTOR', 'END_USER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE organization_type AS ENUM ('RESELLER', 'DISTRIBUTOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_type AS ENUM ('DEAL_REGISTRATION', 'BIDDING', 'DIRECT_QUERY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_status AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'QUOTED', 'WON', 'LOST', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE query_urgency AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE query_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESPONDED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE engagement_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE credit_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('TO_SUBMIT', 'DRAFT', 'SUBMITTED', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'UPDATED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_type AS ENUM ('BOQ', 'DEAL', 'DIRECT_QUERY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_status AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'ACKNOWLEDGED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'DEMO', 
    'POC', 
    'SITE_VISIT', 
    'MEETING', 
    'PROPOSAL', 
    'NEGOTIATION',
    'BOQ_REVISION',
    'TECHNICAL_DISCUSSION',
    'COMMERCIAL_DISCUSSION'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE boq_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'SELECTED_DISTRIBUTORS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add comments for documentation
COMMENT ON TYPE user_role IS 'User role types for access control';
COMMENT ON TYPE organization_type IS 'Organization types in the marketplace';
COMMENT ON TYPE deal_type IS 'Types of deals in the system';
COMMENT ON TYPE deal_status IS 'Deal lifecycle status';
COMMENT ON TYPE campaign_status IS 'Campaign lifecycle status';
COMMENT ON TYPE quote_status IS 'Quote lifecycle status';
COMMENT ON TYPE activity_type IS 'Types of deal activities for tracking';
COMMENT ON TYPE boq_visibility IS 'BOQ visibility options';
