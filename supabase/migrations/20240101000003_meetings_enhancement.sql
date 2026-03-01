-- Enhanced Meeting System for Deal Activities
-- This migration adds proper meeting structure with attendees, decisions, and tasks

-- Add metadata column to deal_activities for flexible meeting data
ALTER TABLE deal_activities 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Meeting attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES deal_activities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting decisions table
CREATE TABLE IF NOT EXISTS meeting_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES deal_activities(id) ON DELETE CASCADE,
    decision_text TEXT NOT NULL,
    decision_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting tasks table
CREATE TABLE IF NOT EXISTS meeting_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES deal_activities(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_activity_id ON meeting_attendees(activity_id);
CREATE INDEX IF NOT EXISTS idx_meeting_decisions_activity_id ON meeting_decisions(activity_id);
CREATE INDEX IF NOT EXISTS idx_meeting_tasks_activity_id ON meeting_tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_meeting_tasks_status ON meeting_tasks(status);
CREATE INDEX IF NOT EXISTS idx_meeting_tasks_deadline ON meeting_tasks(deadline);

-- Add trigger for meeting_tasks updated_at
CREATE TRIGGER update_meeting_tasks_updated_at 
BEFORE UPDATE ON meeting_tasks 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Update deal_activities to have proper points
-- Meeting = 10 points, Demo = 10 points, BOQ_REVISION = 10 points
CREATE OR REPLACE FUNCTION set_activity_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set points for DEAL_REGISTRATION and deals converted to bidding
    IF NEW.points IS NULL OR NEW.points = 0 THEN
        CASE NEW.activity_type
            WHEN 'MEETING' THEN NEW.points := 10;
            WHEN 'DEMO' THEN NEW.points := 10;
            WHEN 'BOQ_REVISION' THEN NEW.points := 10;
            ELSE NEW.points := 0;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deal_activity_points
BEFORE INSERT ON deal_activities
FOR EACH ROW
EXECUTE FUNCTION set_activity_points();

-- Function to update deal score when activity is added
CREATE OR REPLACE FUNCTION update_deal_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update deal score only for DEAL_REGISTRATION and converted bidding deals
    UPDATE deals
    SET score = COALESCE((
        SELECT SUM(points)
        FROM deal_activities
        WHERE deal_id = NEW.deal_id
        AND status = 'ACKNOWLEDGED'
    ), 0)
    WHERE id = NEW.deal_id
    AND (deal_type = 'DEAL_REGISTRATION' OR converted_to_bidding = true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_score_on_activity
AFTER INSERT OR UPDATE ON deal_activities
FOR EACH ROW
EXECUTE FUNCTION update_deal_score();

-- Add comments for documentation
COMMENT ON TABLE meeting_attendees IS 'Stores attendees for each meeting activity';
COMMENT ON TABLE meeting_decisions IS 'Records decisions made during meetings';
COMMENT ON TABLE meeting_tasks IS 'Tracks action items from meetings with owners and deadlines';
COMMENT ON COLUMN deal_activities.metadata IS 'Flexible JSON storage for additional meeting data';
COMMENT ON COLUMN deal_activities.title IS 'Meeting title or subject';
COMMENT ON COLUMN deal_activities.description IS 'Meeting description or agenda';
