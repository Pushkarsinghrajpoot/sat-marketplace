-- Credit Request Module Schema Updates
-- Add missing fields to credit_requests table

ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS expected_monthly_volume NUMERIC,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50),
ADD COLUMN IF NOT EXISTS credit_validity_period DATE,
ADD COLUMN IF NOT EXISTS used_credit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS additional_info_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS additional_info_notes TEXT;

-- Update credit_request_documents to include document type
ALTER TABLE credit_request_documents
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Create credit_transactions table for tracking credit usage
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_request_id UUID NOT NULL REFERENCES credit_requests(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'USAGE', 'PAYMENT', 'ADJUSTMENT'
  amount NUMERIC NOT NULL,
  reference_type VARCHAR(50), -- 'ORDER', 'INVOICE', 'PAYMENT'
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_request_id ON credit_transactions(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_reseller_id ON credit_requests(reseller_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status);

-- Create view for credit summary
CREATE OR REPLACE VIEW credit_summary AS
SELECT 
  cr.id,
  cr.reseller_id,
  cr.distributor_id,
  cr.approved_limit,
  cr.used_credit,
  (cr.approved_limit - cr.used_credit) as available_credit,
  cr.payment_terms,
  cr.credit_validity_period,
  cr.status,
  cr.created_at,
  u.name as reseller_name,
  u.email as reseller_email,
  o.name as reseller_organization_name
FROM credit_requests cr
JOIN users u ON cr.reseller_id = u.id
JOIN organizations o ON u.organization_id = o.id
WHERE cr.status = 'APPROVED';

-- Add comment for documentation
COMMENT ON TABLE credit_transactions IS 'Tracks all credit usage, payments, and adjustments for approved credit limits';
COMMENT ON VIEW credit_summary IS 'Provides quick overview of active credit limits with calculated available credit';
