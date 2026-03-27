-- Add qualification fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS qualification_status VARCHAR DEFAULT 'PENDING';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS qualification_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS qualification_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS qualification_reviewed_by UUID REFERENCES users(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS qualification_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS badge VARCHAR;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add qualification fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification_status VARCHAR DEFAULT 'INCOMPLETE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_access_marketplace BOOLEAN DEFAULT false;

-- Create organization documents table
CREATE TABLE IF NOT EXISTS organization_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR,
  file_size BIGINT,
  status VARCHAR DEFAULT 'PENDING',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_docs_org ON organization_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_docs_status ON organization_documents(status);
CREATE INDEX IF NOT EXISTS idx_organizations_qual_status ON organizations(qualification_status);
CREATE INDEX IF NOT EXISTS idx_users_qual_status ON users(qualification_status);

-- Comments
COMMENT ON COLUMN organizations.qualification_status IS 'INCOMPLETE, PENDING, APPROVED, REJECTED, INFO_REQUIRED';
COMMENT ON COLUMN organizations.badge IS 'TOP_RATED, TRUSTED, VERIFIED, PREFERRED_PARTNER';
COMMENT ON COLUMN organization_documents.document_type IS 'GST_CERTIFICATE, PAN_CARD, TRADE_LICENSE, COMPANY_REGISTRATION, BANK_STATEMENT, etc.';

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  activity_type VARCHAR NOT NULL,
  target_type VARCHAR,
  target_id UUID,
  action VARCHAR NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin logs
CREATE INDEX IF NOT EXISTS idx_admin_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_activity_type ON admin_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_log_created ON admin_activity_log(created_at);

COMMENT ON TABLE admin_activity_log IS 'Audit trail for all admin actions';
COMMENT ON COLUMN admin_activity_log.activity_type IS 'USER_REVIEW, DOCUMENT_REVIEW, BADGE_ASSIGNMENT, STATUS_CHANGE, etc.';
COMMENT ON COLUMN admin_activity_log.target_type IS 'USER, ORGANIZATION, DOCUMENT, RATING, etc.';

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_activity_type VARCHAR,
  p_target_type VARCHAR,
  p_target_id UUID,
  p_action VARCHAR,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (
    admin_id,
    activity_type,
    target_type,
    target_id,
    action,
    description,
    metadata
  ) VALUES (
    p_admin_id,
    p_activity_type,
    p_target_type,
    p_target_id,
    p_action,
    p_description,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Create qualification requests table for tracking
CREATE TABLE IF NOT EXISTS qualification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  additional_info_requested TEXT,
  resubmission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for qualification requests
CREATE INDEX IF NOT EXISTS idx_qual_requests_user ON qualification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_qual_requests_org ON qualification_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_qual_requests_status ON qualification_requests(status);

-- Update existing users to have marketplace access (for existing data)
UPDATE users SET can_access_marketplace = true WHERE can_access_marketplace IS NULL;
UPDATE users SET qualification_status = 'APPROVED' WHERE qualification_status = 'INCOMPLETE';

-- Update existing organizations
UPDATE organizations SET qualification_status = 'APPROVED' WHERE qualification_status = 'PENDING';
UPDATE organizations SET is_verified = true WHERE is_verified IS NULL;
