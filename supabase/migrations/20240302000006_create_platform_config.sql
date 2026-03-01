-- Migration: Create platform_config table for storing platform settings
-- Replaces localStorage with database persistence

CREATE TABLE IF NOT EXISTS public.platform_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  config_key character varying NOT NULL UNIQUE,
  config_value text NOT NULL,
  config_type character varying DEFAULT 'string',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT platform_config_pkey PRIMARY KEY (id)
);

-- Add trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_platform_config_updated_at ON platform_config;
CREATE TRIGGER update_platform_config_updated_at
  BEFORE UPDATE ON platform_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default platform settings
INSERT INTO platform_config (config_key, config_value, config_type, description, is_public) VALUES
  ('platform_name', 'B2B Marketplace', 'string', 'Platform display name', true),
  ('support_email', 'support@marketplace.example.com', 'string', 'Support contact email', true),
  ('support_phone', '+1-415-555-9999', 'string', 'Support contact phone', true),
  ('currency', 'USD', 'string', 'Default currency', true),
  ('timezone', 'PST', 'string', 'Default timezone', false)
ON CONFLICT (config_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_config_key ON platform_config(config_key);

-- Add comments
COMMENT ON TABLE platform_config IS 'Stores platform-wide configuration settings';
COMMENT ON COLUMN platform_config.config_key IS 'Unique key identifier for the setting';
COMMENT ON COLUMN platform_config.config_value IS 'Setting value stored as text';
COMMENT ON COLUMN platform_config.config_type IS 'Data type hint (string, number, boolean, json)';
COMMENT ON COLUMN platform_config.is_public IS 'Whether this setting is publicly accessible';
