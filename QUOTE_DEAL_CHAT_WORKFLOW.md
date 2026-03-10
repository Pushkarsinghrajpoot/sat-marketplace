# Complete Quote, Deal & Chat Workflow Guide

## Overview
This document describes the complete end-to-end workflow for quote requests, deal registration, and human chat interactions in the marketplace platform.

---

## 🎯 Workflow Summary

```
Customer → Product Page → [Request Quote | Register Deal | Chat with Sales]
    ↓
Product Inquiry Created + Chat Conversation Initiated
    ↓
Agent/Distributor Receives Notification
    ↓
Agent Responds via Chat or Creates Quote
    ↓
Reseller Reviews Quote
    ↓
Quote Accepted/Rejected
    ↓
Deal Closed or Revised
```

---

## 📋 Components & Pages Implemented

### **1. Product Detail Page**
**Location:** `app/(public)/products/[id]/page.tsx`

**Features:**
- ✅ Request Quote button → Creates inquiry + chat conversation
- ✅ Start Deal Registration → Navigates to deal form
- ✅ Chat with Sales → Opens product chat modal

**Database Actions:**
- Creates `product_inquiries` record
- Creates `chat_conversations` record
- Links product, customer, distributor

---

### **2. Quote Request Flow**

#### **Customer Side:**
**Component:** `components/request-quote-modal.tsx`

**Process:**
1. Customer clicks "Request Quote" on product page
2. Modal opens with quantity and message fields
3. On submit:
   - Creates `product_inquiries` record (type: PRICING)
   - Creates `chat_conversations` record (type: QUOTE_REQUEST)
   - Links customer, product, distributor
   - Optionally redirects to inquiry tracking page

**Database Tables:**
```sql
product_inquiries:
  - id
  - product_id
  - user_id
  - inquiry_type: 'PRICING'
  - subject: "Quote Request for {product}"
  - question: "{quantity} units. {message}"
  - status: 'OPEN'

chat_conversations:
  - conversation_type: 'QUOTE_REQUEST'
  - product_id
  - customer_id
  - distributor_id
  - reseller_id
  - subject
  - priority
```

#### **Distributor Side:**

**Inquiries Dashboard:** `app/(protected)/distributor/inquiries/page.tsx`
- Lists all product inquiries for distributor's products
- Filter by status: All, Open, Responded
- Shows customer info, product details, inquiry message

**Inquiry Detail:** `app/(protected)/distributor/inquiries/[id]/page.tsx`
- Full inquiry details
- Customer and product information
- Two response options:
  1. Send text response (updates status to RESPONDED)
  2. Create quote (launches quote builder)

**Quote Builder:** `components/quote-builder.tsx`
- Add multiple line items
- Set pricing, quantities, discounts
- Define payment terms (net days, method, early discount)
- Define delivery terms (date, method, location, incoterms)
- Add notes and terms & conditions
- Set quote validity period
- On submit:
  - Creates `quotes` record
  - Creates `quote_line_items` records
  - Updates inquiry status to RESPONDED
  - Notifies reseller

**Quote Management:** `app/(protected)/distributor/quotes/page.tsx`
- View all quotes (draft, submitted, accepted)
- Edit draft quotes
- Submit quotes to reseller
- Track quote status

---

### **3. Deal Registration Flow**

**Page:** `app/(protected)/reseller/deals/register/page.tsx`

**Process:**
1. Reseller navigates to deal registration (optionally from product page)
2. Fills out form:
   - Deal type: Direct or Competitive Bidding
   - Customer information (name, email, company, contact)
   - Opportunity details (name, value, close date, priority)
   - Product selection (from URL or manual)
   - BOQ upload (optional)
   - Additional notes
3. Accepts declaration
4. On submit:
   - Creates `deals` record
   - Creates `deal_products` records for selected products
   - Uploads BOQ to `boqs` table (if provided)
   - Creates `chat_conversations` for deal discussion
   - Redirects to deal detail page

**Database Tables:**
```sql
deals:
  - deal_type: 'DIRECT' | 'BIDDING'
  - reseller_id
  - reseller_organization_id
  - customer_email, customer_name, customer_company, customer_contact
  - opportunity_name, estimated_value, close_date, priority
  - status: 'DRAFT'
  - declaration_accepted: true

deal_products:
  - deal_id
  - product_id
  - quantity

boqs:
  - deal_id
  - reseller_id
  - file_name
  - file_url
  - visibility: 'PRIVATE'
```

---

### **4. Chat System**

#### **Product Chat Modal**
**Component:** `components/product-chat-modal.tsx`

**Features:**
- Product-specific chat interface
- Real-time messaging
- Creates conversation on first open
- Links to product and distributor
- Agent receives notification

**Process:**
1. Customer clicks "Chat with Sales"
2. Modal opens with chat interface
3. Creates `chat_conversations` (type: PRODUCT_INQUIRY)
4. Customer sends messages
5. Messages stored in `chat_messages`
6. Agent receives notification and responds

#### **Agent Dashboard**
**Page:** `app/(protected)/agent/dashboard/page.tsx`

**Features:**
- View all active conversations
- View pending product inquiries
- Stats dashboard (active chats, pending inquiries, resolved today)
- Quick actions to respond

#### **Agent Conversation Handler**
**Page:** `app/(protected)/agent/conversations/[id]/page.tsx`

**Features:**
- Full conversation view with message history
- Real-time message updates (Supabase subscriptions)
- Send messages as agent
- View product context
- Mark conversation as resolved
- Create inquiry or quote from conversation
- Attach documents

**Actions Available:**
- Send text messages
- Create product inquiry
- Create quote
- Attach documents
- Mark conversation as closed/resolved

---

### **5. Reseller Quote Review**

**Page:** `app/(protected)/reseller/quotes/page.tsx`

**Features:**
- View all received quotes
- Filter by status: All, Pending, Accepted, Rejected
- See quote details:
  - Distributor name
  - Total amount
  - Line items preview
  - Quote status and validity
- Navigate to quote detail for full review

**Quote Detail Page** (to be created):
- Full line item breakdown
- Payment and delivery terms
- Accept or reject quote
- Request revisions
- Download PDF

---

### **6. Notification System**

**Helper:** `lib/notification-helpers.ts`

**Functions:**
- `createNotification()` - Create notification
- `getUserNotifications()` - Get user's notifications
- `markNotificationAsRead()` - Mark as read
- `getUnreadNotificationCount()` - Get count

**Notification Types:**
- `QUOTE_REQUEST` - New quote request received
- `QUOTE_READY` - Quote is ready for review
- `DEAL_ENGAGEMENT` - Deal engagement invitation
- `CHAT_MESSAGE` - New chat message

**Usage Example:**
```typescript
import { notifyQuoteRequest } from '@/lib/notification-helpers';

await notifyQuoteRequest({
  distributorUserId: 'user-id',
  productName: 'Product Name',
  resellerName: 'Reseller Company',
  inquiryId: 'inquiry-id'
});
```

---

## 🔄 Complete Flow Examples

### **Example 1: Simple Quote Request**

```
1. Customer browses product → /products/[id]
2. Clicks "Request Quote"
3. Enters quantity: 10, message: "Need delivery by Q2"
4. Submits request

Backend:
- Creates product_inquiries record
- Creates chat_conversations record
- Sends notification to distributor

5. Distributor sees notification
6. Goes to /distributor/inquiries
7. Clicks "Respond" on inquiry
8. Clicks "Create Quote"
9. Adds line items, sets terms
10. Submits quote

Backend:
- Creates quotes record
- Creates quote_line_items records
- Updates inquiry status to RESPONDED
- Sends notification to reseller

11. Reseller sees notification
12. Goes to /reseller/quotes
13. Reviews quote
14. Accepts quote

Backend:
- Updates quote status to ACCEPTED
- Can proceed to order creation
```

### **Example 2: Deal Registration with Chat**

```
1. Reseller navigates to product page
2. Clicks "Start Deal Registration"
3. Fills out:
   - Customer: John Doe, john@company.com
   - Opportunity: Q1 Server Refresh, $50,000
   - Product: Dell PowerEdge R750 (qty: 5)
4. Uploads BOQ file
5. Accepts declaration
6. Submits deal

Backend:
- Creates deals record (status: DRAFT)
- Creates deal_products records
- Creates boqs record
- Creates chat_conversations for deal
- Sends verification request to admin

7. Admin verifies deal → status: VERIFIED
8. Reseller engages distributor(s)
9. Distributor receives notification
10. Distributor provides quote via chat or quote builder
11. Reseller reviews and selects winning quote
12. Deal status → WON
```

### **Example 3: Live Chat Support**

```
1. Customer on product page
2. Clicks "Chat with Sales"
3. Modal opens with chat interface
4. Sends message: "Do you support installation in Canada?"

Backend:
- Creates chat_conversations (type: PRODUCT_INQUIRY)
- Creates chat_messages record
- Sends notification to available agent

5. Agent sees notification in /agent/dashboard
6. Opens conversation in /agent/conversations/[id]
7. Responds: "Yes, we provide installation across North America"

Backend:
- Creates chat_messages record
- Real-time update to customer's chat

8. Customer sees response immediately
9. Conversation continues...
10. Agent marks conversation as resolved when complete
```

---

## 🗄️ Database Schema Summary

### **Key Tables:**

**product_inquiries:**
- Stores quote requests and product questions
- Links customer, product
- Status: OPEN, RESPONDED, CLOSED

**chat_conversations:**
- Stores conversation metadata
- Types: PRODUCT_INQUIRY, QUOTE_REQUEST, TECHNICAL_SUPPORT, etc.
- Links all relevant entities (product, deal, customer, agent, etc.)

**chat_messages:**
- Individual messages in conversations
- Sender info and role
- Message type and content

**quotes:**
- Quote header with totals and terms
- Links distributor, reseller
- Status: TO_SUBMIT, SUBMITTED, ACCEPTED, REJECTED

**quote_line_items:**
- Individual products in quote
- Quantity, price, discount

**deals:**
- Deal registration details
- Customer info, opportunity info
- Status tracking

**deal_products:**
- Products in a deal
- Quantity

**boqs:**
- Bill of Quantities files
- Links to deal

**notifications:**
- User notifications
- Type, message, link
- Read status

---

## 🚀 Setup Instructions

### **1. Run Database Migrations**

```sql
-- Run in Supabase SQL Editor

-- First: Enhanced products schema
-- File: supabase/migrations/20240310_enhanced_products_and_chat.sql

-- Second: Add missing foreign keys
-- File: supabase/migrations/20240312_add_missing_foreign_keys.sql

-- Third: Seed data (optional)
-- File: supabase/migrations/20240311_seed_products_data.sql
```

### **2. Verify Foreign Keys**

```sql
-- Check that foreign keys exist
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('product_images', 'product_documents', 'product_tags');
```

### **3. Test Quote Flow**

1. Sign in as reseller
2. Go to product page
3. Click "Request Quote"
4. Submit quote request
5. Sign in as distributor
6. Go to /distributor/inquiries
7. Respond or create quote

### **4. Test Deal Flow**

1. Sign in as reseller
2. Go to /reseller/deals/register
3. Fill out deal form
4. Submit deal
5. Verify deal created in database

### **5. Test Chat Flow**

1. Go to product page
2. Click "Chat with Sales"
3. Send message
4. Sign in as agent
5. Go to /agent/dashboard
6. View and respond to conversation

---

## 📝 API Endpoints Used

All operations use Supabase client with the following tables:
- `products`
- `product_inquiries`
- `chat_conversations`
- `chat_messages`
- `quotes`
- `quote_line_items`
- `deals`
- `deal_products`
- `boqs`
- `notifications`

---

## 🔐 Security & Permissions

**Row Level Security (RLS) should be configured for:**
- Product inquiries (user can only see their own)
- Quotes (distributor/reseller specific)
- Deals (reseller specific)
- Chat conversations (participants only)
- Notifications (user specific)

---

## 📱 User Roles

**Customer:**
- Browse products
- Request quotes
- Chat with sales

**Reseller:**
- All customer actions
- Register deals
- Review quotes
- Manage opportunities

**Distributor:**
- View inquiries for their products
- Create and manage quotes
- Respond to chat

**Agent:**
- Handle chat conversations
- Create inquiries/quotes on behalf
- Mark conversations resolved

---

## 🎨 UI Components Created

1. `RequestQuoteModal` - Quote request form
2. `ProductChatModal` - Product-specific chat
3. `QuoteBuilder` - Quote creation interface
4. `Tabs` - Tab navigation component

---

## ✅ Next Steps & Enhancements

**Immediate:**
- Test all workflows end-to-end
- Configure RLS policies
- Add email notifications

**Future Enhancements:**
- Quote PDF generation
- Quote versioning
- Multi-distributor bidding
- Deal analytics
- Chat file attachments
- Video call integration
- AI chat assistance

---

## 🐛 Known Issues

1. Tabs component import error in agent dashboard (minor, doesn't affect functionality)
2. BOQ file upload is mocked (needs actual storage integration)
3. Date-fns library should be added to package.json

---

## 📞 Support

For issues or questions about this workflow, refer to:
- Database schema: `/db.md`
- Type definitions: `/lib/types.ts`
- Helper functions: `/lib/*-helpers.ts`
