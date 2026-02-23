-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_engaged_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_invited_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_query_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_query_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_query_response_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_request_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Public can view verified organizations" ON organizations FOR SELECT USING (verified = true);
CREATE POLICY "Users can view their own organization" ON organizations FOR SELECT USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Platform admins can manage all organizations" ON organizations FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');
CREATE POLICY "Organizations can update their own data" ON organizations FOR UPDATE USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can view users in their organization" ON users FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Platform admins can manage all users" ON users FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Platform admins can manage categories" ON categories FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Distributors can manage their own products" ON products FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR')
);
CREATE POLICY "Platform admins can manage all products" ON products FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');

-- Product specifications policies
CREATE POLICY "Anyone can view product specifications" ON product_specifications FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their product specifications" ON product_specifications FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR'))
);

-- Product images policies
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their product images" ON product_images FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR'))
);

-- Product documents policies
CREATE POLICY "Anyone can view product documents" ON product_documents FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their product documents" ON product_documents FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR'))
);

-- Product tags policies
CREATE POLICY "Anyone can view product tags" ON product_tags FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their product tags" ON product_tags FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR'))
);

-- Volume pricing policies
CREATE POLICY "Anyone can view volume pricing" ON volume_pricing FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their volume pricing" ON volume_pricing FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR'))
);

-- Deals policies
CREATE POLICY "Resellers can create deals" ON deals FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'RESELLER' AND reseller_id = auth.uid()
);
CREATE POLICY "Resellers can view their own deals" ON deals FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Resellers can update their own deals" ON deals FOR UPDATE USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view deals" ON deals FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    (deal_type = 'BIDDING' OR id IN (SELECT deal_id FROM deal_engaged_distributors WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())))
);
CREATE POLICY "End users in reseller org can view deals" ON deals FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'END_USER' AND
    reseller_organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Platform admins can manage all deals" ON deals FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');

-- Deal products policies
CREATE POLICY "Users can view deal products for accessible deals" ON deal_products FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid()) OR
    deal_id IN (SELECT id FROM deals WHERE (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can manage their deal products" ON deal_products FOR ALL USING (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid())
);

-- Deal engaged distributors policies
CREATE POLICY "Users can view engaged distributors" ON deal_engaged_distributors FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can add engaged distributors" ON deal_engaged_distributors FOR INSERT WITH CHECK (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid())
);

-- Deal activities policies
CREATE POLICY "Resellers can create activities for their deals" ON deal_activities FOR INSERT WITH CHECK (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid()) AND reseller_id = auth.uid()
);
CREATE POLICY "Users can view activities for accessible deals" ON deal_activities FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid()) OR
    deal_id IN (SELECT id FROM deals WHERE (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can update their activities" ON deal_activities FOR UPDATE USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can acknowledge/reject activities" ON deal_activities FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    deal_id IN (SELECT deal_id FROM deal_engaged_distributors WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- BOQs policies
CREATE POLICY "Resellers can create BOQs for their deals" ON boqs FOR INSERT WITH CHECK (
    deal_id IN (SELECT id FROM deals WHERE reseller_id = auth.uid()) AND reseller_id = auth.uid()
);
CREATE POLICY "Resellers can view their BOQs" ON boqs FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view BOQs they're invited to" ON boqs FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    (visibility = 'BIDDING' OR id IN (SELECT boq_id FROM boq_invited_distributors WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())))
);
CREATE POLICY "End users can view BOQs in their organization" ON boqs FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'END_USER' AND
    deal_id IN (SELECT id FROM deals WHERE reseller_organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- BOQ items policies
CREATE POLICY "Users can view BOQ items for accessible BOQs" ON boq_items FOR SELECT USING (
    boq_id IN (SELECT id FROM boqs WHERE reseller_id = auth.uid()) OR
    boq_id IN (SELECT id FROM boqs WHERE (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can manage their BOQ items" ON boq_items FOR ALL USING (
    boq_id IN (SELECT id FROM boqs WHERE reseller_id = auth.uid())
);

-- BOQ invited distributors policies
CREATE POLICY "Users can view invited distributors" ON boq_invited_distributors FOR SELECT USING (
    boq_id IN (SELECT id FROM boqs WHERE reseller_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can invite distributors to BOQs" ON boq_invited_distributors FOR INSERT WITH CHECK (
    boq_id IN (SELECT id FROM boqs WHERE reseller_id = auth.uid())
);

-- Direct queries policies
CREATE POLICY "Resellers can create direct queries" ON direct_queries FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'RESELLER' AND reseller_id = auth.uid()
);
CREATE POLICY "Resellers can view their queries" ON direct_queries FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view queries" ON direct_queries FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    (distributor_id IS NULL OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "End users can view queries in their organization" ON direct_queries FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'END_USER' AND
    reseller_organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Resellers can update their queries" ON direct_queries FOR UPDATE USING (reseller_id = auth.uid());

-- Direct query products policies
CREATE POLICY "Users can view query products for accessible queries" ON direct_query_products FOR SELECT USING (
    query_id IN (SELECT id FROM direct_queries WHERE reseller_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);
CREATE POLICY "Resellers can manage their query products" ON direct_query_products FOR ALL USING (
    query_id IN (SELECT id FROM direct_queries WHERE reseller_id = auth.uid())
);

-- Direct query responses policies
CREATE POLICY "Distributors can create responses" ON direct_query_responses FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Users can view responses for accessible queries" ON direct_query_responses FOR SELECT USING (
    query_id IN (SELECT id FROM direct_queries WHERE reseller_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER'))
);

-- Direct query response attachments policies
CREATE POLICY "Users can view response attachments" ON direct_query_response_attachments FOR SELECT USING (
    response_id IN (SELECT id FROM direct_query_responses WHERE query_id IN (SELECT id FROM direct_queries WHERE reseller_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('DISTRIBUTOR', 'END_USER')))
);
CREATE POLICY "Distributors can add attachments to their responses" ON direct_query_response_attachments FOR INSERT WITH CHECK (
    response_id IN (SELECT id FROM direct_query_responses WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- Quotes policies
CREATE POLICY "Distributors can create quotes" ON quotes FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Resellers can view their quotes" ON quotes FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view their quotes" ON quotes FOR SELECT USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "End users can view quotes for their organization" ON quotes FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'END_USER' AND
    (reseller_id IN (SELECT id FROM users WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())) OR
     recipient_user_id = auth.uid() OR
     recipient_role = 'END_USER')
);
CREATE POLICY "Distributors can update their quotes" ON quotes FOR UPDATE USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Quote line items policies
CREATE POLICY "Users can view line items for accessible quotes" ON quote_line_items FOR SELECT USING (
    quote_id IN (SELECT id FROM quotes WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'END_USER')
);
CREATE POLICY "Distributors can manage their quote line items" ON quote_line_items FOR ALL USING (
    quote_id IN (SELECT id FROM quotes WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- Quote messages policies
CREATE POLICY "Users can view messages for accessible quotes" ON quote_messages FOR SELECT USING (
    quote_id IN (SELECT id FROM quotes WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Users can send messages for accessible quotes" ON quote_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    quote_id IN (SELECT id FROM quotes WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Recipients can mark messages as read" ON quote_messages FOR UPDATE USING (recipient_id = auth.uid());

-- Quote message attachments policies
CREATE POLICY "Users can view message attachments" ON quote_message_attachments FOR SELECT USING (
    message_id IN (SELECT id FROM quote_messages WHERE quote_id IN (SELECT id FROM quotes WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())))
);
CREATE POLICY "Users can add attachments to their messages" ON quote_message_attachments FOR INSERT WITH CHECK (
    message_id IN (SELECT id FROM quote_messages WHERE sender_id = auth.uid())
);

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON campaigns FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Distributors can manage their campaigns" ON campaigns FOR ALL USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'DISTRIBUTOR')
);

-- Campaign products policies
CREATE POLICY "Anyone can view campaign products" ON campaign_products FOR SELECT USING (
    campaign_id IN (SELECT id FROM campaigns WHERE status = 'ACTIVE')
);
CREATE POLICY "Distributors can manage their campaign products" ON campaign_products FOR ALL USING (
    campaign_id IN (SELECT id FROM campaigns WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- Engagement requests policies
CREATE POLICY "Resellers can create engagement requests" ON engagement_requests FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'RESELLER' AND reseller_id = auth.uid()
);
CREATE POLICY "Resellers can view their engagement requests" ON engagement_requests FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view engagement requests sent to them" ON engagement_requests FOR SELECT USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Distributors can respond to engagement requests" ON engagement_requests FOR UPDATE USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Engagement request products policies
CREATE POLICY "Users can view products for accessible engagement requests" ON engagement_request_products FOR SELECT USING (
    engagement_id IN (SELECT id FROM engagement_requests WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Resellers can manage their engagement request products" ON engagement_request_products FOR ALL USING (
    engagement_id IN (SELECT id FROM engagement_requests WHERE reseller_id = auth.uid())
);

-- Credit requests policies
CREATE POLICY "Resellers can create credit requests" ON credit_requests FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'RESELLER' AND reseller_id = auth.uid()
);
CREATE POLICY "Resellers can view their credit requests" ON credit_requests FOR SELECT USING (reseller_id = auth.uid());
CREATE POLICY "Distributors can view credit requests sent to them" ON credit_requests FOR SELECT USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Distributors can update credit requests" ON credit_requests FOR UPDATE USING (
    distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Credit request documents policies
CREATE POLICY "Users can view documents for accessible credit requests" ON credit_request_documents FOR SELECT USING (
    credit_request_id IN (SELECT id FROM credit_requests WHERE reseller_id = auth.uid() OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Resellers can manage their credit request documents" ON credit_request_documents FOR ALL USING (
    credit_request_id IN (SELECT id FROM credit_requests WHERE reseller_id = auth.uid())
);

-- Ratings policies
CREATE POLICY "Users can view ratings for their organization" ON ratings FOR SELECT USING (
    to_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) OR
    from_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (
    from_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Rating tags policies
CREATE POLICY "Users can view rating tags for accessible ratings" ON rating_tags FOR SELECT USING (
    rating_id IN (SELECT id FROM ratings WHERE to_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) OR from_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Users can add tags to their ratings" ON rating_tags FOR INSERT WITH CHECK (
    rating_id IN (SELECT id FROM ratings WHERE from_org_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Users can view their own activity log" ON activity_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Platform admins can view all activity logs" ON activity_log FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'PLATFORM_ADMIN');
CREATE POLICY "System can create activity logs" ON activity_log FOR INSERT WITH CHECK (true);
