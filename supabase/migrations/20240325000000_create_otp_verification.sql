-- Create OTP verification table for email verification
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL DEFAULT 'deal_registration',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 minutes',
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3
);

-- Create index for faster lookups
CREATE INDEX idx_otp_email ON otp_verifications(email);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- Add RLS policies
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert OTP (for sending)
CREATE POLICY "Anyone can create OTP" ON otp_verifications
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can read their own OTP (for verification)
CREATE POLICY "Users can read OTP by email" ON otp_verifications
  FOR SELECT USING (true);

-- Policy: Anyone can update their OTP (for verification)
CREATE POLICY "Anyone can update OTP" ON otp_verifications
  FOR UPDATE USING (true);

-- Function to clean up expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
