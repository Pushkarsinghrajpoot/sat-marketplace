-- ============================================================
-- Phase 1: Customer Leads (Quote Requests from Buyers)
-- ============================================================

CREATE TABLE public.customer_leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  -- Product context
  product_id uuid,
  product_name character varying,
  -- Buyer info (works for guests and registered END_USERs)
  buyer_user_id uuid,           -- NULL for guests
  buyer_name character varying NOT NULL,
  buyer_email character varying NOT NULL,
  buyer_phone character varying,
  buyer_company character varying,
  -- Request details
  inquiry_type character varying NOT NULL DEFAULT 'QUOTE_REQUEST',
  requirement text,
  bulk_quantity integer DEFAULT 1,
  budget_range character varying,
  -- Assignment
  assigned_reseller_id uuid,
  assigned_reseller_org_id uuid,
  -- Status: NEW → ASSIGNED → CONTACTED → QUOTED → WON | LOST | CLOSED
  status character varying NOT NULL DEFAULT 'NEW',
  -- Reseller response
  response_notes text,
  responded_at timestamp with time zone,
  -- Source tracking
  source character varying DEFAULT 'MARKETPLACE',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_leads_pkey PRIMARY KEY (id),
  CONSTRAINT customer_leads_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
  CONSTRAINT customer_leads_buyer_user_id_fkey
    FOREIGN KEY (buyer_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT customer_leads_assigned_reseller_id_fkey
    FOREIGN KEY (assigned_reseller_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT customer_leads_assigned_reseller_org_id_fkey
    FOREIGN KEY (assigned_reseller_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL
);

CREATE TRIGGER update_customer_leads_updated_at
  BEFORE UPDATE ON public.customer_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (guest or logged-in) can create a lead
CREATE POLICY "Anyone can create leads"
  ON public.customer_leads FOR INSERT WITH CHECK (true);

-- Registered buyers can see their own leads
CREATE POLICY "Buyers can view their leads"
  ON public.customer_leads FOR SELECT
  USING (buyer_user_id = auth.uid());

-- Resellers can view leads assigned to them
CREATE POLICY "Resellers can view assigned leads"
  ON public.customer_leads FOR SELECT
  USING (assigned_reseller_id = auth.uid());

-- Resellers can update leads assigned to them
CREATE POLICY "Resellers can update assigned leads"
  ON public.customer_leads FOR UPDATE
  USING (assigned_reseller_id = auth.uid());


-- ============================================================
-- Phase 3: Cart Items
-- ============================================================

CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id),
  CONSTRAINT cart_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own cart"
  ON public.cart_items FOR ALL USING (user_id = auth.uid());


-- ============================================================
-- Phase 3: Orders
-- ============================================================

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number character varying NOT NULL UNIQUE,
  buyer_user_id uuid NOT NULL,
  buyer_name character varying NOT NULL,
  buyer_email character varying NOT NULL,
  buyer_phone character varying,
  buyer_company character varying,
  assigned_reseller_id uuid,
  reseller_org_id uuid,
  lead_id uuid,
  -- Status: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED | CANCELLED
  status character varying NOT NULL DEFAULT 'PENDING',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric DEFAULT 0,
  shipping numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  shipping_address jsonb,
  payment_method character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_buyer_user_id_fkey
    FOREIGN KEY (buyer_user_id) REFERENCES public.users(id),
  CONSTRAINT orders_assigned_reseller_id_fkey
    FOREIGN KEY (assigned_reseller_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT orders_reseller_org_id_fkey
    FOREIGN KEY (reseller_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL,
  CONSTRAINT orders_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES public.customer_leads(id) ON DELETE SET NULL
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their orders"
  ON public.orders FOR SELECT USING (buyer_user_id = auth.uid());

CREATE POLICY "Resellers can view their orders"
  ON public.orders FOR SELECT USING (assigned_reseller_id = auth.uid());

CREATE POLICY "Resellers can update their orders"
  ON public.orders FOR UPDATE USING (assigned_reseller_id = auth.uid());
