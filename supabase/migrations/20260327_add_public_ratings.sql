-- Create public ratings table for resellers and distributors
CREATE TABLE IF NOT EXISTS public_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES users(id),
  rater_organization_id UUID REFERENCES organizations(id),
  rated_user_id UUID REFERENCES users(id),
  rated_organization_id UUID REFERENCES organizations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR,
  review_text TEXT,
  rating_categories JSONB DEFAULT '{}',
  visibility VARCHAR DEFAULT 'PUBLIC',
  is_verified BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  response_text TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id, rater_id)
);

-- Create indexes for ratings
CREATE INDEX IF NOT EXISTS idx_public_ratings_rated_user ON public_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_public_ratings_rated_org ON public_ratings(rated_organization_id);
CREATE INDEX IF NOT EXISTS idx_public_ratings_rater ON public_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_public_ratings_deal ON public_ratings(deal_id);
CREATE INDEX IF NOT EXISTS idx_public_ratings_rating ON public_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_public_ratings_visibility ON public_ratings(visibility);

-- Comments
COMMENT ON TABLE public_ratings IS 'Public ratings and reviews for resellers and distributors';
COMMENT ON COLUMN public_ratings.rating_categories IS 'JSON object with category-specific ratings: {communication: 5, pricing: 4, delivery: 5, quality: 5}';
COMMENT ON COLUMN public_ratings.visibility IS 'PUBLIC, PRIVATE, HIDDEN';
COMMENT ON COLUMN public_ratings.is_verified IS 'Whether this rating is from a verified transaction';

-- Create rating aggregates table for performance
CREATE TABLE IF NOT EXISTS rating_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  category_averages JSONB DEFAULT '{}',
  last_30_days_count INTEGER DEFAULT 0,
  last_30_days_average DECIMAL(3,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(organization_id)
);

-- Create indexes for aggregates
CREATE INDEX IF NOT EXISTS idx_rating_aggregates_user ON rating_aggregates(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_aggregates_org ON rating_aggregates(organization_id);
CREATE INDEX IF NOT EXISTS idx_rating_aggregates_avg ON rating_aggregates(average_rating);

-- Create helpful votes table
CREATE TABLE IF NOT EXISTS rating_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating_id UUID REFERENCES public_ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rating_helpful_votes_rating ON rating_helpful_votes(rating_id);

-- Function to update rating aggregates
CREATE OR REPLACE FUNCTION update_rating_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  target_org_id UUID;
  new_avg DECIMAL(3,2);
  new_dist JSONB;
  new_total INTEGER;
  recent_avg DECIMAL(3,2);
  recent_count INTEGER;
BEGIN
  -- Determine target user/org based on operation
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.rated_user_id;
    target_org_id := OLD.rated_organization_id;
  ELSE
    target_user_id := NEW.rated_user_id;
    target_org_id := NEW.rated_organization_id;
  END IF;

  -- Calculate new aggregates for user
  IF target_user_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      AVG(rating)::DECIMAL(3,2),
      jsonb_object_agg(rating::TEXT, count)
    INTO new_total, new_avg, new_dist
    FROM (
      SELECT rating, COUNT(*) as count
      FROM public_ratings
      WHERE rated_user_id = target_user_id AND visibility = 'PUBLIC'
      GROUP BY rating
    ) counts;

    -- Calculate last 30 days stats
    SELECT COUNT(*), AVG(rating)::DECIMAL(3,2)
    INTO recent_count, recent_avg
    FROM public_ratings
    WHERE rated_user_id = target_user_id 
      AND visibility = 'PUBLIC'
      AND created_at > NOW() - INTERVAL '30 days';

    -- Upsert aggregate
    INSERT INTO rating_aggregates (
      user_id,
      total_ratings,
      average_rating,
      rating_distribution,
      last_30_days_count,
      last_30_days_average,
      updated_at
    ) VALUES (
      target_user_id,
      COALESCE(new_total, 0),
      COALESCE(new_avg, 0),
      COALESCE(new_dist, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'),
      COALESCE(recent_count, 0),
      COALESCE(recent_avg, 0),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_ratings = EXCLUDED.total_ratings,
      average_rating = EXCLUDED.average_rating,
      rating_distribution = EXCLUDED.rating_distribution,
      last_30_days_count = EXCLUDED.last_30_days_count,
      last_30_days_average = EXCLUDED.last_30_days_average,
      updated_at = NOW();
  END IF;

  -- Calculate new aggregates for organization
  IF target_org_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      AVG(rating)::DECIMAL(3,2),
      jsonb_object_agg(rating::TEXT, count)
    INTO new_total, new_avg, new_dist
    FROM (
      SELECT rating, COUNT(*) as count
      FROM public_ratings
      WHERE rated_organization_id = target_org_id AND visibility = 'PUBLIC'
      GROUP BY rating
    ) counts;

    -- Calculate last 30 days stats
    SELECT COUNT(*), AVG(rating)::DECIMAL(3,2)
    INTO recent_count, recent_avg
    FROM public_ratings
    WHERE rated_organization_id = target_org_id 
      AND visibility = 'PUBLIC'
      AND created_at > NOW() - INTERVAL '30 days';

    -- Upsert aggregate
    INSERT INTO rating_aggregates (
      organization_id,
      total_ratings,
      average_rating,
      rating_distribution,
      last_30_days_count,
      last_30_days_average,
      updated_at
    ) VALUES (
      target_org_id,
      COALESCE(new_total, 0),
      COALESCE(new_avg, 0),
      COALESCE(new_dist, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'),
      COALESCE(recent_count, 0),
      COALESCE(recent_avg, 0),
      NOW()
    )
    ON CONFLICT (organization_id) DO UPDATE SET
      total_ratings = EXCLUDED.total_ratings,
      average_rating = EXCLUDED.average_rating,
      rating_distribution = EXCLUDED.rating_distribution,
      last_30_days_count = EXCLUDED.last_30_days_count,
      last_30_days_average = EXCLUDED.last_30_days_average,
      updated_at = NOW();
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for aggregate updates
DROP TRIGGER IF EXISTS trigger_update_rating_aggregates ON public_ratings;
CREATE TRIGGER trigger_update_rating_aggregates
  AFTER INSERT OR UPDATE OR DELETE ON public_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_aggregates();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public_ratings 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.rating_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public_ratings 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.rating_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON rating_helpful_votes;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR DELETE ON rating_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_helpful_count();
