# Setup Guide - Quote, Deal & Chat System

## 🚀 Quick Start

Follow these steps to set up the complete quote, deal registration, and chat functionality.

---

## 📋 Prerequisites

- Supabase project set up
- Node.js and npm installed
- Repository cloned

---

## Step 1: Run Database Migrations

### **1.1 Run Foreign Key Migration**

In your Supabase SQL Editor, run this migration:

```sql
-- File: supabase/migrations/20240312_add_missing_foreign_keys.sql

-- Add foreign key constraint to product_images
ALTER TABLE product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add foreign key constraint to product_documents
ALTER TABLE product_documents 
ADD CONSTRAINT product_documents_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add foreign key constraint to product_tags
ALTER TABLE product_tags 
ADD CONSTRAINT product_tags_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_documents_product_id ON product_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product_id ON chat_conversations(product_id);
```

### **1.2 Verify Tables Exist**

Run this query to ensure all required tables are present:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'products',
    'product_images',
    'product_documents',
    'product_tags',
    'product_inquiries',
    'product_services',
    'product_tech_specs',
    'product_reviews',
    'chat_conversations',
    'chat_messages',
    'chat_participants',
    'quotes',
    'quote_line_items',
    'deals',
    'deal_products',
    'boqs',
    'notifications'
  )
ORDER BY table_name;
```

If any tables are missing, run the enhanced products migration first:
- File: `supabase/migrations/20240310_enhanced_products_and_chat.sql`

---

## Step 2: Install Missing Dependencies

Add these packages if not already installed:

```bash
npm install date-fns
npm install sonner  # Toast notifications
```

Verify these are in your `package.json`:
```json
{
  "dependencies": {
    "date-fns": "^3.0.0",
    "sonner": "^1.0.0"
  }
}
```

---

## Step 3: Configure Row Level Security (RLS)

### **3.1 Product Inquiries**

```sql
-- Enable RLS
ALTER TABLE product_inquiries ENABLE ROW LEVEL SECURITY;

-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
ON product_inquiries FOR SELECT
USING (user_id = auth.uid());

-- Users can create inquiries
CREATE POLICY "Users can create inquiries"
ON product_inquiries FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Distributors can view inquiries for their products
CREATE POLICY "Distributors can view inquiries for their products"
ON product_inquiries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_inquiries.product_id
    AND products.organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Distributors can update inquiries for their products
CREATE POLICY "Distributors can update inquiries"
ON product_inquiries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_inquiries.product_id
    AND products.organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);
```

### **3.2 Chat Conversations**

```sql
-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
ON chat_conversations FOR SELECT
USING (
  customer_id = auth.uid() 
  OR agent_id = auth.uid()
  OR reseller_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON chat_conversations FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Users can update conversations they're part of
CREATE POLICY "Users can update own conversations"
ON chat_conversations FOR UPDATE
USING (
  customer_id = auth.uid() 
  OR agent_id = auth.uid()
);
```

### **3.3 Chat Messages**

```sql
-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND (
      customer_id = auth.uid() 
      OR agent_id = auth.uid()
      OR reseller_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
      OR distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  )
);

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());
```

### **3.4 Quotes**

```sql
-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own quotes
CREATE POLICY "Distributors can view own quotes"
ON quotes FOR SELECT
USING (
  distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Resellers can view quotes sent to them
CREATE POLICY "Resellers can view received quotes"
ON quotes FOR SELECT
USING (reseller_id = auth.uid());

-- Distributors can create quotes
CREATE POLICY "Distributors can create quotes"
ON quotes FOR INSERT
WITH CHECK (
  distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Distributors can update their own quotes
CREATE POLICY "Distributors can update own quotes"
ON quotes FOR UPDATE
USING (
  distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Resellers can update quote status (accept/reject)
CREATE POLICY "Resellers can update quote status"
ON quotes FOR UPDATE
USING (reseller_id = auth.uid());
```

### **3.5 Deals**

```sql
-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Resellers can view their own deals
CREATE POLICY "Resellers can view own deals"
ON deals FOR SELECT
USING (
  reseller_id = auth.uid()
  OR reseller_organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Resellers can create deals
CREATE POLICY "Resellers can create deals"
ON deals FOR INSERT
WITH CHECK (reseller_id = auth.uid());

-- Resellers can update their own deals
CREATE POLICY "Resellers can update own deals"
ON deals FOR UPDATE
USING (reseller_id = auth.uid());

-- Distributors can view deals they're engaged with
CREATE POLICY "Distributors can view engaged deals"
ON deals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM deal_engaged_distributors
    WHERE deal_engaged_distributors.deal_id = deals.id
    AND deal_engaged_distributors.distributor_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);
```

### **3.6 Notifications**

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());
```

---

## Step 4: Test Database Access

Run these test queries to verify everything works:

### **4.1 Test Product Fetch**

```sql
SELECT 
  p.*,
  json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) as product_images,
  json_agg(DISTINCT ps.*) FILTER (WHERE ps.id IS NOT NULL) as product_services,
  json_agg(DISTINCT pts.*) FILTER (WHERE pts.id IS NOT NULL) as product_tech_specs
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
LEFT JOIN product_services ps ON ps.product_id = p.id
LEFT JOIN product_tech_specs pts ON pts.product_id = p.id
WHERE p.id = 'your-product-id'
GROUP BY p.id;
```

### **4.2 Test Chat Query**

```sql
SELECT 
  cc.*,
  json_agg(cm.*) as messages
FROM chat_conversations cc
LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id
WHERE cc.id = 'your-conversation-id'
GROUP BY cc.id;
```

---

## Step 5: Verify Pages & Routes

### **5.1 Public Pages**
- ✅ `/products/[id]` - Product detail with quote/deal/chat buttons

### **5.2 Reseller Pages**
- ✅ `/reseller/deals/register` - Deal registration form
- ✅ `/reseller/quotes` - View received quotes
- ✅ `/reseller/inquiries/[id]` - View inquiry tracking

### **5.3 Distributor Pages**
- ✅ `/distributor/inquiries` - List of product inquiries
- ✅ `/distributor/inquiries/[id]` - Inquiry detail & quote creation
- ✅ `/distributor/quotes` - Manage quotes

### **5.4 Agent Pages**
- ✅ `/agent/dashboard` - Agent overview
- ✅ `/agent/conversations/[id]` - Handle chat conversations

---

## Step 6: Test Workflows

### **6.1 Test Quote Request**

1. **As Customer:**
   - Navigate to `/products/[product-id]`
   - Click "Request Quote"
   - Enter quantity and message
   - Submit

2. **Verify Database:**
   ```sql
   SELECT * FROM product_inquiries ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM chat_conversations ORDER BY created_at DESC LIMIT 1;
   ```

3. **As Distributor:**
   - Navigate to `/distributor/inquiries`
   - Should see the new inquiry
   - Click "Respond"
   - Click "Create Quote"
   - Fill quote builder
   - Submit quote

4. **Verify Quote:**
   ```sql
   SELECT * FROM quotes ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM quote_line_items WHERE quote_id = 'quote-id';
   ```

### **6.2 Test Deal Registration**

1. **As Reseller:**
   - Navigate to `/reseller/deals/register`
   - Fill customer info
   - Fill opportunity details
   - Add products (or upload BOQ)
   - Accept declaration
   - Submit

2. **Verify Database:**
   ```sql
   SELECT * FROM deals ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM deal_products WHERE deal_id = 'deal-id';
   ```

### **6.3 Test Chat**

1. **As Customer:**
   - Navigate to product page
   - Click "Chat with Sales"
   - Send message

2. **Verify:**
   ```sql
   SELECT * FROM chat_conversations ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;
   ```

3. **As Agent:**
   - Navigate to `/agent/dashboard`
   - Should see active conversation
   - Click "Respond"
   - Send reply

---

## Step 7: Configure Notifications

### **7.1 Email Notifications (Optional)**

To enable email notifications, integrate with a service like:
- Resend
- SendGrid
- AWS SES

Example using Supabase Edge Functions:

```typescript
// supabase/functions/send-notification-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, body } = await req.json()
  
  // Send email using your provider
  // ...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### **7.2 In-App Notifications**

Already implemented via:
- `lib/notification-helpers.ts`
- `notifications` table

To display notifications in UI, create a notification bell component:

```typescript
// Example notification component
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/notification-helpers';

// Fetch notifications
const notifications = await getUserNotifications(userId);
const unreadCount = await getUnreadNotificationCount(userId);
```

---

## Step 8: Environment Variables

Ensure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🎯 Verification Checklist

- [ ] All migrations run successfully
- [ ] Foreign keys exist on product_images, product_documents, product_tags
- [ ] RLS policies configured for all tables
- [ ] Product page loads without errors
- [ ] Quote request creates inquiry + conversation
- [ ] Distributor can view inquiries
- [ ] Quote builder creates quote successfully
- [ ] Deal registration creates deal + products
- [ ] Chat modal opens and sends messages
- [ ] Agent dashboard shows conversations
- [ ] Notifications are created

---

## 🐛 Troubleshooting

### **Issue: Products not loading**
- Check foreign key constraints exist
- Verify RLS policies allow SELECT
- Check Supabase logs

### **Issue: Chat not working**
- Verify chat_conversations and chat_messages tables exist
- Check real-time subscriptions are enabled in Supabase
- Verify RLS policies

### **Issue: Quote creation fails**
- Check quote_line_items table exists
- Verify foreign key from quote_line_items to quotes
- Check user has permission

### **Issue: 404 on protected routes**
- Verify authentication is working
- Check route exists in app directory
- Verify layout.tsx for protected routes

---

## 📞 Support

For additional help:
1. Check the workflow documentation: `QUOTE_DEAL_CHAT_WORKFLOW.md`
2. Review database schema: `db.md`
3. Check type definitions: `lib/types.ts`
4. Review helper functions in `lib/` directory

---

## 🚀 Next Steps

After setup is complete:
1. Add sample data for testing
2. Configure email notifications
3. Customize UI/branding
4. Add analytics tracking
5. Set up monitoring and logging
6. Configure backup/disaster recovery
