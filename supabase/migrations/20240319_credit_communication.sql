-- Create credit request activities table for communication tracking
CREATE TABLE IF NOT EXISTS credit_request_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_request_id UUID NOT NULL REFERENCES credit_requests(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'INFO_REQUESTED', 'INFO_PROVIDED', 'COMMENT', 'STATUS_CHANGE'
  message TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to reseller
  attachments JSONB DEFAULT '[]'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_activities_request_id ON credit_request_activities(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_activities_created_at ON credit_request_activities(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE credit_request_activities IS 'Tracks all communication and activities related to credit requests';
COMMENT ON COLUMN credit_request_activities.activity_type IS 'Type of activity: INFO_REQUESTED, INFO_PROVIDED, COMMENT, STATUS_CHANGE';
COMMENT ON COLUMN credit_request_activities.is_internal IS 'If true, only visible to distributor/admin, not to reseller';
