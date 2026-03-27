-- Add team management fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_role VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_status VARCHAR DEFAULT 'ACTIVE';

-- Add comments
COMMENT ON COLUMN users.team_role IS 'Role within the team: ADMIN, MANAGER, MEMBER, etc.';
COMMENT ON COLUMN users.permissions IS 'JSON object containing specific permissions';
COMMENT ON COLUMN users.invitation_status IS 'PENDING, ACTIVE, SUSPENDED';

-- Create team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  team_role VARCHAR,
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'PENDING',
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org ON team_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- Create user assignments table
CREATE TABLE IF NOT EXISTS user_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignment_type VARCHAR NOT NULL,
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(user_id, assignment_type, reference_id)
);

-- Create indexes for assignments
CREATE INDEX IF NOT EXISTS idx_user_assignments_user ON user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_type ON user_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_user_assignments_ref ON user_assignments(reference_id);

COMMENT ON COLUMN user_assignments.assignment_type IS 'PRODUCT, CATEGORY, DEAL, SUPPORT, SALES, etc.';
COMMENT ON COLUMN user_assignments.reference_id IS 'ID of the assigned resource (product_id, category_id, deal_id, etc.)';

-- Add assigned_to columns to relevant tables
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE product_inquiries ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE direct_queries ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Create indexes for assigned_to
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned ON chat_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_assigned ON product_inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_direct_queries_assigned ON direct_queries(assigned_to);

-- Update existing users to have default team_role based on role
UPDATE users SET team_role = 'ADMIN' WHERE team_role IS NULL;
UPDATE users SET invitation_status = 'ACTIVE' WHERE invitation_status IS NULL;

-- Function to auto-assign based on user assignments
CREATE OR REPLACE FUNCTION auto_assign_conversation()
RETURNS TRIGGER AS $$
DECLARE
  assigned_user_id UUID;
BEGIN
  -- Try to find user assigned to this product/category
  SELECT user_id INTO assigned_user_id
  FROM user_assignments
  WHERE assignment_type = 'PRODUCT' 
    AND reference_id = NEW.product_id
  LIMIT 1;
  
  -- If found, assign to that user
  IF assigned_user_id IS NOT NULL THEN
    NEW.assigned_to = assigned_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_conversation ON chat_conversations;
CREATE TRIGGER trigger_auto_assign_conversation
  BEFORE INSERT ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_conversation();
