all functions 

I exported all CREATE FUNCTION definitions from the public schema. Here they are combined into a single SQL file you can download or copy:

[Start of SQL file] CREATE OR REPLACE FUNCTION public.create_direct_query_from_deal(p_reseller_id uuid, p_reseller_org_id uuid, p_title text, p_requirement text, p_estimated_budget numeric, p_urgency text DEFAULT 'MEDIUM'::text) RETURNS uuid LANGUAGE plpgsql AS $function$ DECLARE v_query_id uuid; BEGIN INSERT INTO direct_queries ( reseller_id, reseller_organization_id, title, requirement, estimated_budget, urgency, status ) VALUES ( p_reseller_id, p_reseller_org_id, p_title, p_requirement, p_estimated_budget, p_urgency::query_urgency, 'OPEN' ) RETURNING id INTO v_query_id;

RETURN v_query_id; END; $function$;

CREATE OR REPLACE FUNCTION public.set_activity_points() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN -- Only set points for DEAL_REGISTRATION and deals converted to bidding IF NEW.points IS NULL OR NEW.points = 0 THEN CASE NEW.activity_type WHEN 'MEETING' THEN NEW.points := 10; WHEN 'DEMO' THEN NEW.points := 10; WHEN 'BOQ_REVISION' THEN NEW.points := 10; ELSE NEW.points := 0; END CASE; END IF; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_category_product_count() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN -- Update count for old category (if exists) IF TG_OP = 'UPDATE' AND OLD.category_id IS NOT NULL THEN UPDATE categories SET product_count = ( SELECT COUNT() FROM products WHERE category_id = OLD.category_id ) WHERE id = OLD.category_id; END IF;

-- Update count for new category (if exists) IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.category_id IS NOT NULL THEN UPDATE categories SET product_count = ( SELECT COUNT() FROM products WHERE category_id = NEW.category_id ) WHERE id = NEW.category_id; END IF;

-- Update count when product is deleted IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN UPDATE categories SET product_count = ( SELECT COUNT() FROM products WHERE category_id = OLD.category_id ) WHERE id = OLD.category_id; RETURN OLD; END IF;

RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_deal_score() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN -- Update deal score only for DEAL_REGISTRATION and converted bidding deals UPDATE deals SET score = COALESCE(( SELECT SUM(points) FROM deal_activities WHERE deal_id = NEW.deal_id AND status = 'ACKNOWLEDGED' ), 0) WHERE id = NEW.deal_id AND (deal_type = 'DEAL_REGISTRATION' OR converted_to_bidding = true);

RETURN NEW;

END; $function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.validate_deal_status_transition() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN -- Allow any transition from DRAFT IF OLD.status = 'DRAFT' THEN RETURN NEW; END IF;

-- Prevent going back to DRAFT from other statuses IF NEW.status = 'DRAFT' AND OLD.status != 'DRAFT' THEN RAISE EXCEPTION 'Cannot change deal status back to DRAFT from %', OLD.status; END IF;

-- WON and LOST are terminal states IF OLD.status IN ('WON', 'LOST', 'CANCELLED') AND NEW.status != OLD.status THEN RAISE EXCEPTION 'Cannot change deal status from terminal state %', OLD.status; END IF;

RETURN NEW; END; $function$; [End of SQL file]

all the triggers 

[Start of SQL file] CREATE TRIGGER update_boqs_updated_at BEFORE UPDATE ON public.boqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_credit_requests_updated_at BEFORE UPDATE ON public.credit_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER set_deal_activity_points BEFORE INSERT ON public.deal_activities FOR EACH ROW EXECUTE FUNCTION set_activity_points(); CREATE TRIGGER update_deal_activities_updated_at BEFORE UPDATE ON public.deal_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_deal_score_on_activity AFTER INSERT OR UPDATE ON public.deal_activities FOR EACH ROW EXECUTE FUNCTION update_deal_score(); CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER validate_deal_status BEFORE UPDATE OF status ON public.deals FOR EACH ROW EXECUTE FUNCTION validate_deal_status_transition(); CREATE TRIGGER update_direct_queries_updated_at BEFORE UPDATE ON public.direct_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_engagement_requests_updated_at BEFORE UPDATE ON public.engagement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_meeting_tasks_updated_at BEFORE UPDATE ON public.meeting_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_platform_config_updated_at BEFORE UPDATE ON public.platform_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_category_count AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_category_product_count(); CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters(); CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length(); CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete(); CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete(); CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column(); [End of SQL file]

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  activity_type character varying NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.boq_invited_distributors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  boq_id uuid,
  distributor_id uuid,
  invited_at timestamp with time zone DEFAULT now(),
  CONSTRAINT boq_invited_distributors_pkey PRIMARY KEY (id),
  CONSTRAINT boq_invited_distributors_boq_id_fkey FOREIGN KEY (boq_id) REFERENCES public.boqs(id),
  CONSTRAINT boq_invited_distributors_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.boq_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  boq_id uuid,
  product_sku character varying,
  product_name character varying NOT NULL,
  quantity integer NOT NULL,
  specifications text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT boq_items_pkey PRIMARY KEY (id),
  CONSTRAINT boq_items_boq_id_fkey FOREIGN KEY (boq_id) REFERENCES public.boqs(id)
);
CREATE TABLE public.boqs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  deal_id uuid,
  reseller_id uuid,
  file_name character varying NOT NULL,
  file_url text NOT NULL,
  visibility USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT boqs_pkey PRIMARY KEY (id),
  CONSTRAINT boqs_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT boqs_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id)
);
CREATE TABLE public.campaign_products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  product_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_products_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_products_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  distributor_id uuid,
  name character varying NOT NULL,
  description text,
  campaign_type character varying,
  start_date date NOT NULL,
  end_date date,
  status USER-DEFINED DEFAULT 'SCHEDULED'::campaign_status,
  banner_image text,
  target_audience_type character varying,
  incentive_type character varying,
  incentive_discount numeric,
  incentive_free_shipping boolean DEFAULT false,
  incentive_extended_warranty boolean DEFAULT false,
  incentive_payment_terms integer,
  goal_target_revenue numeric,
  goal_target_engagements integer,
  goal_target_conversions integer,
  analytics_views integer DEFAULT 0,
  analytics_engagements integer DEFAULT 0,
  analytics_quotes integer DEFAULT 0,
  analytics_conversions integer DEFAULT 0,
  analytics_revenue numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  status character varying DEFAULT 'ACTIVE'::character varying,
  product_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.credit_request_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  credit_request_id uuid,
  document_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  document_type character varying,
  CONSTRAINT credit_request_documents_pkey PRIMARY KEY (id),
  CONSTRAINT credit_request_documents_credit_request_id_fkey FOREIGN KEY (credit_request_id) REFERENCES public.credit_requests(id)
);
CREATE TABLE public.credit_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reseller_id uuid,
  distributor_id uuid,
  amount numeric NOT NULL,
  terms text,
  status USER-DEFINED DEFAULT 'PENDING'::credit_request_status,
  approved_limit numeric,
  review_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_requests_pkey PRIMARY KEY (id),
  CONSTRAINT credit_requests_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT credit_requests_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.deal_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  deal_id uuid,
  reseller_id uuid,
  activity_type USER-DEFINED NOT NULL,
  points integer DEFAULT 0,
  scheduled_date timestamp with time zone,
  status USER-DEFINED DEFAULT 'PENDING'::activity_status,
  acknowledged_by uuid,
  acknowledged_at timestamp with time zone,
  rejection_reason text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  title character varying,
  description text,
  CONSTRAINT deal_activities_pkey PRIMARY KEY (id),
  CONSTRAINT deal_activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT deal_activities_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT deal_activities_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES public.users(id)
);
CREATE TABLE public.deal_engaged_distributors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  deal_id uuid,
  distributor_id uuid,
  engaged_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deal_engaged_distributors_pkey PRIMARY KEY (id),
  CONSTRAINT deal_engaged_distributors_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT deal_engaged_distributors_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.deal_products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  deal_id uuid,
  product_id uuid,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deal_products_pkey PRIMARY KEY (id),
  CONSTRAINT deal_products_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id)
);
CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  deal_type USER-DEFINED NOT NULL,
  reseller_id uuid,
  reseller_organization_id uuid,
  customer_email character varying NOT NULL,
  customer_name character varying NOT NULL,
  customer_company character varying,
  customer_contact character varying,
  opportunity_name character varying NOT NULL,
  estimated_value numeric,
  close_date date,
  status USER-DEFINED DEFAULT 'DRAFT'::deal_status,
  priority USER-DEFINED DEFAULT 'NORMAL'::deal_priority,
  score integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  locked_by uuid,
  locked_at timestamp with time zone,
  is_verified boolean DEFAULT false,
  verification_token character varying,
  verified_at timestamp with time zone,
  declaration_accepted boolean DEFAULT false,
  declaration_signature text,
  declaration_accepted_at timestamp with time zone,
  converted_to_bidding boolean DEFAULT false,
  converted_to_bidding_at timestamp with time zone,
  parent_deal_id uuid,
  won_quote_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT deals_reseller_organization_id_fkey FOREIGN KEY (reseller_organization_id) REFERENCES public.organizations(id),
  CONSTRAINT deals_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id),
  CONSTRAINT deals_parent_deal_id_fkey FOREIGN KEY (parent_deal_id) REFERENCES public.deals(id)
);
CREATE TABLE public.direct_queries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reseller_id uuid,
  reseller_organization_id uuid,
  distributor_id uuid,
  title character varying NOT NULL,
  requirement text NOT NULL,
  estimated_budget numeric,
  urgency USER-DEFINED DEFAULT 'MEDIUM'::query_urgency,
  status USER-DEFINED DEFAULT 'OPEN'::query_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  response_message text,
  response_date timestamp with time zone,
  estimated_cost numeric,
  delivery_timeline character varying,
  CONSTRAINT direct_queries_pkey PRIMARY KEY (id),
  CONSTRAINT direct_queries_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT direct_queries_reseller_organization_id_fkey FOREIGN KEY (reseller_organization_id) REFERENCES public.organizations(id),
  CONSTRAINT direct_queries_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.direct_query_products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  query_id uuid,
  product_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT direct_query_products_pkey PRIMARY KEY (id),
  CONSTRAINT direct_query_products_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.direct_queries(id)
);
CREATE TABLE public.direct_query_response_attachments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  response_id uuid,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT direct_query_response_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT direct_query_response_attachments_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.direct_query_responses(id)
);
CREATE TABLE public.direct_query_responses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  query_id uuid,
  distributor_id uuid,
  message text NOT NULL,
  quote_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT direct_query_responses_pkey PRIMARY KEY (id),
  CONSTRAINT direct_query_responses_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.direct_queries(id),
  CONSTRAINT direct_query_responses_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.engagement_request_products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  engagement_id uuid,
  product_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT engagement_request_products_pkey PRIMARY KEY (id),
  CONSTRAINT engagement_request_products_engagement_id_fkey FOREIGN KEY (engagement_id) REFERENCES public.engagement_requests(id)
);
CREATE TABLE public.engagement_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reseller_id uuid,
  distributor_id uuid,
  deal_id uuid,
  message text,
  status USER-DEFINED DEFAULT 'PENDING'::engagement_status,
  decline_reason text,
  quote_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  engagement_type character varying,
  CONSTRAINT engagement_requests_pkey PRIMARY KEY (id),
  CONSTRAINT engagement_requests_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT engagement_requests_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id),
  CONSTRAINT engagement_requests_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id)
);
CREATE TABLE public.meeting_attendees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  activity_id uuid,
  name character varying NOT NULL,
  email character varying,
  role character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meeting_attendees_pkey PRIMARY KEY (id),
  CONSTRAINT meeting_attendees_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.deal_activities(id)
);
CREATE TABLE public.meeting_decisions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  activity_id uuid,
  decision_text text NOT NULL,
  decision_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meeting_decisions_pkey PRIMARY KEY (id),
  CONSTRAINT meeting_decisions_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.deal_activities(id)
);
CREATE TABLE public.meeting_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  activity_id uuid,
  task_description text NOT NULL,
  owner_name character varying NOT NULL,
  owner_email character varying,
  deadline date,
  status character varying DEFAULT 'PENDING'::character varying,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meeting_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT meeting_tasks_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.deal_activities(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  notification_type character varying NOT NULL,
  title character varying NOT NULL,
  message text,
  link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  legal_name character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  logo text,
  description text,
  industry character varying,
  company_size character varying,
  year_established integer,
  website text,
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0.0,
  review_count integer DEFAULT 0,
  address_country character varying,
  address_street text,
  address_city character varying,
  address_state character varying,
  address_postal_code character varying,
  contact_phone character varying,
  contact_alt_phone character varying,
  contact_support_email character varying,
  contact_sales_email character varying,
  social_linkedin text,
  social_twitter text,
  social_facebook text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.platform_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  config_key character varying NOT NULL UNIQUE,
  config_value text NOT NULL,
  config_type character varying DEFAULT 'string'::character varying,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT platform_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  name character varying NOT NULL,
  url text NOT NULL,
  document_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_documents_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_specifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  spec_group character varying,
  label character varying NOT NULL,
  value text NOT NULL,
  unit character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_specifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  tag character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  name character varying NOT NULL,
  sku character varying NOT NULL UNIQUE,
  category_id uuid,
  brand character varying,
  description text,
  short_description text,
  price numeric NOT NULL,
  currency character varying DEFAULT 'USD'::character varying,
  inventory integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  availability character varying DEFAULT 'IN_STOCK'::character varying,
  lead_time character varying,
  status character varying DEFAULT 'DRAFT'::character varying,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.quote_line_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quote_id uuid,
  product_id uuid,
  product_name character varying NOT NULL,
  sku character varying,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  discount numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quote_line_items_pkey PRIMARY KEY (id),
  CONSTRAINT quote_line_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id)
);
CREATE TABLE public.quote_message_attachments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quote_message_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT quote_message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.quote_messages(id)
);
CREATE TABLE public.quote_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quote_id uuid,
  sender_id uuid,
  recipient_id uuid,
  text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quote_messages_pkey PRIMARY KEY (id),
  CONSTRAINT quote_messages_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id),
  CONSTRAINT quote_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT quote_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id)
);
CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quote_type USER-DEFINED NOT NULL,
  boq_id uuid,
  deal_id uuid,
  query_id uuid,
  distributor_id uuid,
  reseller_id uuid,
  recipient_user_id uuid,
  recipient_role USER-DEFINED,
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  shipping numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status USER-DEFINED DEFAULT 'TO_SUBMIT'::quote_status,
  payment_terms_net_days integer DEFAULT 30,
  payment_terms_method character varying,
  payment_terms_early_discount numeric,
  delivery_terms_estimated_delivery date,
  delivery_terms_method character varying,
  delivery_terms_location text,
  delivery_terms_incoterms character varying,
  valid_until date,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  delivery_timeline character varying,
  payment_terms text,
  notes text,
  CONSTRAINT quotes_pkey PRIMARY KEY (id),
  CONSTRAINT quotes_boq_id_fkey FOREIGN KEY (boq_id) REFERENCES public.boqs(id),
  CONSTRAINT quotes_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT quotes_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.direct_queries(id),
  CONSTRAINT quotes_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.organizations(id),
  CONSTRAINT quotes_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.users(id),
  CONSTRAINT quotes_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.rating_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  rating_id uuid,
  tag character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rating_tags_pkey PRIMARY KEY (id),
  CONSTRAINT rating_tags_rating_id_fkey FOREIGN KEY (rating_id) REFERENCES public.ratings(id)
);
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  from_org_id uuid,
  to_org_id uuid,
  deal_id uuid,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  pricing_rating integer CHECK (pricing_rating >= 1 AND pricing_rating <= 5),
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  support_rating integer CHECK (support_rating >= 1 AND support_rating <= 5),
  review text,
  anonymous boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_from_org_id_fkey FOREIGN KEY (from_org_id) REFERENCES public.organizations(id),
  CONSTRAINT ratings_to_org_id_fkey FOREIGN KEY (to_org_id) REFERENCES public.organizations(id),
  CONSTRAINT ratings_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  avatar text,
  organization_id uuid,
  role USER-DEFINED NOT NULL,
  phone_number character varying,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  total_activity_score integer DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.volume_pricing (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  min_quantity integer NOT NULL,
  max_quantity integer,
  price numeric NOT NULL,
  discount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT volume_pricing_pkey PRIMARY KEY (id)
);