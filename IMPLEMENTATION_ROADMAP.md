# SAT Marketplace - Feature Implementation Roadmap

## Overview
This document outlines the implementation plan for new features aligned with the existing database schema and application structure.

---

## 📋 Feature Categories

### **PHASE 1: Deal Flow Enhancements**
### **PHASE 2: User Management & Team Collaboration**
### **PHASE 3: Rating & Review System**
### **PHASE 4: Admin & Qualification System**

---

## PHASE 1: Deal Flow Enhancements

### 1.1 Deal Registration Visibility Control
**Current State:**
- Deal registrations are visible to distributors immediately
- `deals` table has no visibility control field

**Required Changes:**
```sql
-- Add visibility control to deals table
ALTER TABLE deals ADD COLUMN visibility VARCHAR DEFAULT 'PRIVATE';
-- Values: 'PRIVATE' (reseller only), 'DISTRIBUTOR' (specific distributor), 'PUBLIC' (bidding/open)
```

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/register/page.tsx` - Set `visibility: 'PRIVATE'` for DEAL_REGISTRATION
  - `/app/distributor/deals/[id]/page.tsx` - Add access check logic
  
- **Backend:**
  - Update `lib/data-helpers.ts::getDeals()` to filter by visibility
  - Distributor sees only: `visibility = 'PUBLIC'` OR `visibility = 'DISTRIBUTOR'` (if invited)

**Acceptance Criteria:**
- ✅ Deal registration stays hidden from distributors until converted
- ✅ Only reseller who created it can see PRIVATE deals
- ✅ Visibility changes to PUBLIC when converted to BIDDING or DIRECT_QUERY

---

### 1.2 Distributor Selection in Deal Registration
**Current State:**
- Engagement request step exists but no distributor selection
- `engagement_requests` table has `distributor_id`

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/register/page.tsx` - Step 5 (Engagement)
  - Add distributor dropdown (fetch from `organizations` where `type = 'DISTRIBUTOR'`)
  - Update form state: `selectedDistributorId`
  
- **Backend:**
  - Save to `engagement_requests` table with selected `distributor_id`
  - When distributor selected, update `deals.visibility = 'DISTRIBUTOR'`

**Acceptance Criteria:**
- ✅ Distributor dropdown available in engagement step
- ✅ Selected distributor receives notification
- ✅ Selected distributor can view the deal

---

### 1.3 Convert Deal Registration to Direct Query
**Current State:**
- Only "Convert to Bidding" exists
- No conversion logic to DIRECT_QUERY

**Database Changes:**
```sql
-- Add conversion tracking
ALTER TABLE deals ADD COLUMN converted_to_query BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN converted_to_query_at TIMESTAMP;
ALTER TABLE direct_queries ADD COLUMN source_deal_id UUID REFERENCES deals(id);
```

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/[id]/page.tsx` - Add "Convert to Direct Query" button
  - Modal to select target distributor
  
- **Backend:**
  - Create new function: `convertDealToDirectQuery(dealId, distributorId)`
  - Creates entry in `direct_queries` table
  - Links to original deal via `source_deal_id`
  - Marks deal with `converted_to_query = true`

**Acceptance Criteria:**
- ✅ CTA appears for DEAL_REGISTRATION type deals
- ✅ Converts deal data to direct_query format
- ✅ Maintains reference to original deal

---

### 1.4 Post-Verification Success Message
**Current State:**
- Email verification completes silently
- No feedback about lock/points

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/register/page.tsx` - After verification success
  - Show modal/toast: "🎉 Deal Locked! You earned 15 points"
  - Display lock icon and deal score

**Acceptance Criteria:**
- ✅ Message shows immediately after email verification
- ✅ Displays: lock status, points earned, next steps

---

### 1.5 Reorder Deal Registration Steps
**Current State:**
```
1. Deal Type → 2. Customer Info → 3. Deal Details → 4. Verification → 5. Engagement → 6. Declaration
```

**New Order:**
```
1. Deal Type → 2. Customer Info → 3. Deal Details → 4. Verification → 5. Declaration → 6. Engagement
```

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/register/page.tsx`
  - Reorder step array: move Declaration before Engagement
  - Update step navigation logic

**Acceptance Criteria:**
- ✅ Declaration step appears immediately after verification
- ✅ Engagement step is last
- ✅ Progress indicator reflects new order

---

### 1.6 Direct Query Distributor Selection & Visibility
**Current State:**
- Direct queries always visible to all distributors
- No visibility control

**Database Changes:**
```sql
ALTER TABLE direct_queries ADD COLUMN visibility VARCHAR DEFAULT 'PUBLIC';
-- Values: 'PUBLIC' (all distributors), 'PRIVATE' (specific distributor only)
```

**Implementation:**
- **Frontend:**
  - `/app/reseller/queries/create/page.tsx` - Add visibility selector
  - Radio buttons: "Public" / "Private" (specific distributor)
  - If Private, show distributor dropdown
  
- **Backend:**
  - Save `distributor_id` and `visibility` in `direct_queries`
  - Filter queries based on visibility in distributor dashboard

**Acceptance Criteria:**
- ✅ Reseller can choose public or private query
- ✅ Private queries only visible to selected distributor
- ✅ Public queries visible to all verified distributors

---

### 1.7 BOQ Upload & Messaging from Deal Detail Page
**Current State:**
- BOQ upload only from `/reseller/boq/upload`
- No messaging functionality on deal page

**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/[id]/page.tsx` - Add action buttons:
    - "Upload BOQ" → Opens modal with BOQ upload form
    - "Message Distributor" → Opens chat conversation
  - `/app/distributor/deals/[id]/page.tsx` - Add "Message Reseller" button
  
- **Backend:**
  - Create API: `/api/deals/[id]/upload-boq` (reuse existing BOQ logic)
  - Create/fetch `chat_conversations` with `deal_id`
  - Link to existing messaging system

**Acceptance Criteria:**
- ✅ BOQ can be uploaded directly from deal detail page
- ✅ Messaging opens conversation linked to deal
- ✅ Both reseller and distributor can initiate messages

---

## PHASE 2: User Management & Team Collaboration

### 2.1 Team Member Onboarding
**Current State:**
- Only single user per organization can access
- No team management

**Database Changes:**
```sql
-- Users table already supports multiple users per organization
-- Add team role management
ALTER TABLE users ADD COLUMN team_role VARCHAR;
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN invitation_status VARCHAR DEFAULT 'PENDING';

-- Create team invitations table
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  team_role VARCHAR,
  permissions JSONB,
  invited_by UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'PENDING',
  token VARCHAR NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation:**
- **Frontend:**
  - Create `/app/[role]/team/page.tsx` - Team management dashboard
  - "Invite Member" button → Modal with email, role, permissions
  - List all team members with status
  
- **Backend:**
  - API: `/api/team/invite` - Send invitation email with token
  - API: `/api/team/accept-invitation` - Complete signup for invited user
  - Validate permissions before actions

**Acceptance Criteria:**
- ✅ Admin can invite team members via email
- ✅ Invitees receive email with signup link
- ✅ Team members inherit organization context
- ✅ Different permission levels assignable

---

### 2.2 Assignment Logic for Messaging & Products
**Current State:**
- No assignment system
- All messages go to organization, not specific users

**Database Changes:**
```sql
-- Create user assignments table
CREATE TABLE user_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  assignment_type VARCHAR NOT NULL, -- 'PRODUCT', 'CATEGORY', 'TICKET', 'SALES', 'SUPPORT'
  reference_id UUID, -- product_id, category_id, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Add assigned_to to conversations and inquiries
ALTER TABLE chat_conversations ADD COLUMN assigned_to UUID REFERENCES users(id);
ALTER TABLE product_inquiries ADD COLUMN assigned_to UUID REFERENCES users(id);
```

**Implementation:**
- **Frontend:**
  - `/app/[role]/team/assignments/page.tsx` - Assignment management
  - Assign users to:
    - Specific products
    - Product categories
    - Ticket handling
    - Sales responsibilities
  - Auto-route messages based on assignments
  
- **Backend:**
  - When conversation created, check assignments and auto-assign
  - API: `/api/assignments/create`, `/api/assignments/update`

**Acceptance Criteria:**
- ✅ Users can be assigned to products/categories/responsibilities
- ✅ Incoming messages auto-route to assigned user
- ✅ Unassigned items go to admin/default user

---

## PHASE 3: Rating & Review System

### 3.1 User Rating System
**Current State:**
- Only product ratings exist
- No user-to-user ratings

**Database Changes:**
```sql
-- Create user ratings table
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  transaction_type VARCHAR, -- 'QUOTE', 'DEAL', 'BOQ', 'SUPPORT'
  reference_id UUID, -- quote_id, deal_id, etc.
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_rating_per_transaction UNIQUE (from_user_id, to_user_id, reference_id)
);

-- Add rating fields to users
ALTER TABLE users ADD COLUMN average_rating NUMERIC DEFAULT 0.0;
ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0;
```

**Implementation:**
- **Frontend:**
  - Create `/app/[role]/ratings/page.tsx` - View all ratings
  - Rating trigger after:
    - Quote accepted
    - Deal closed
    - BOQ processed
  - Display ratings on user profile pages
  
- **Backend:**
  - API: `/api/ratings/create` - Submit rating
  - API: `/api/ratings/calculate` - Update average ratings
  - Only allow rating after verified interaction

**Acceptance Criteria:**
- ✅ Users can rate each other after transactions
- ✅ Ratings are publicly visible on profiles
- ✅ Cannot rate without verified interaction
- ✅ Average rating displayed on user/org profile

---

### 3.2 Rating Moderation
**Implementation:**
- **Frontend:**
  - Admin dashboard: `/app/admin/ratings/page.tsx`
  - Review pending ratings
  - Approve/reject with reason
  
- **Backend:**
  - Ratings stay `status = 'PENDING'` until admin approval
  - Auto-check for offensive content
  - Users can report inappropriate ratings

---

## PHASE 4: Admin & Qualification System

### 4.1 Central Admin Dashboard
**Current State:**
- No admin role or dashboard
- No user qualification workflow

**Database Changes:**
```sql
-- Add ADMIN role to user_role enum
ALTER TYPE user_role ADD VALUE 'ADMIN';

-- Add qualification fields to organizations
ALTER TABLE organizations ADD COLUMN qualification_status VARCHAR DEFAULT 'PENDING';
ALTER TABLE organizations ADD COLUMN qualification_submitted_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN qualification_reviewed_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN qualification_reviewed_by UUID REFERENCES users(id);
ALTER TABLE organizations ADD COLUMN qualification_notes TEXT;
ALTER TABLE organizations ADD COLUMN badge VARCHAR; -- 'TOP_RATED', 'TRUSTED', 'VERIFIED'

-- Create organization documents table
CREATE TABLE organization_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  document_type VARCHAR NOT NULL, -- 'GST', 'PAN', 'TRADE_LICENSE', etc.
  file_url TEXT NOT NULL,
  file_name VARCHAR,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  uploaded_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT
);

-- User qualification tracking
ALTER TABLE users ADD COLUMN qualification_status VARCHAR DEFAULT 'INCOMPLETE';
```

**Implementation:**
- **Frontend:**
  - Create `/app/admin/dashboard/page.tsx`
  - Tabs: Pending Users, Documents Review, Badge Management
  - `/app/admin/users/[id]/review/page.tsx` - Review user qualification
  
- **Backend:**
  - API: `/api/admin/users/approve`
  - API: `/api/admin/users/reject`
  - API: `/api/admin/users/request-info`
  - API: `/api/admin/badges/assign`

---

### 4.2 User Onboarding Qualification Flow
**Implementation:**
- **Frontend:**
  - `/app/onboarding/qualification/page.tsx` - Forced after signup
  - Document upload interface
  - Cannot access marketplace until approved
  
- **Backend:**
  - After signup, `users.qualification_status = 'INCOMPLETE'`
  - After submission, `qualification_status = 'PENDING'`
  - Admin approval → `qualification_status = 'APPROVED'`
  - Block access to features until approved

---

### 4.3 Activity Assignment to Team Members
**Implementation:**
- **Frontend:**
  - `/app/reseller/deals/[id]/page.tsx` - "Add Activity" dropdown
  - Show team members list
  - Assign activity to specific team member
  
- **Backend:**
  - `deal_activities.reseller_id` can be any team member
  - Fetch users from same organization for dropdown

---

## 🗂️ Database Schema Extensions Summary

### New Tables Required:
1. ✅ `team_invitations` - Team member invitation management
2. ✅ `user_assignments` - Product/category/responsibility assignments
3. ✅ `user_ratings` - User-to-user ratings
4. ✅ `organization_documents` - Qualification documents

### Modified Tables:
1. ✅ `deals` - Add visibility, converted_to_query fields
2. ✅ `direct_queries` - Add visibility, source_deal_id
3. ✅ `users` - Add team_role, permissions, ratings, qualification_status
4. ✅ `organizations` - Add qualification fields, badge
5. ✅ `chat_conversations` - Add assigned_to
6. ✅ `product_inquiries` - Add assigned_to

### New Enums:
- `user_role`: Add 'ADMIN'
- `deal_visibility`: 'PRIVATE', 'DISTRIBUTOR', 'PUBLIC'
- `qualification_status`: 'INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED', 'INFO_REQUIRED'

---

## 📊 Implementation Priority

### **Sprint 1 (Week 1-2):** Deal Flow Enhancements
- 1.1 Visibility Control
- 1.2 Distributor Selection
- 1.3 Convert to Query
- 1.5 Step Reordering

### **Sprint 2 (Week 3-4):** Advanced Deal Features
- 1.4 Success Messages
- 1.6 Query Visibility
- 1.7 BOQ & Messaging Integration

### **Sprint 3 (Week 5-6):** Team Management
- 2.1 Team Member Onboarding
- 2.2 Assignment Logic

### **Sprint 4 (Week 7-8):** Rating System
- 3.1 User Ratings
- 3.2 Rating Moderation

### **Sprint 5 (Week 9-10):** Admin & Qualification
- 4.1 Admin Dashboard
- 4.2 Qualification Flow
- 4.3 Activity Assignment

---

## ✅ Success Metrics

- All deal types have proper visibility controls
- Team collaboration enabled across all modules
- Public trust system via ratings
- Qualified vendors only in marketplace
- Clear audit trail for all actions

---

## 🔐 Security Considerations

1. **Role-Based Access Control (RBAC)**
   - Admin role has superuser permissions
   - Team members inherit organization permissions
   - Strict validation on all sensitive operations

2. **Data Privacy**
   - Private deals only visible to involved parties
   - Document encryption for qualification files
   - Rating anonymization options

3. **Audit Logging**
   - Track all admin actions
   - Log qualification decisions
   - Monitor rating submissions

---

**Next Steps:**
1. Review and approve this roadmap
2. Create database migration scripts
3. Begin Sprint 1 implementation
4. Set up testing environment for each phase
