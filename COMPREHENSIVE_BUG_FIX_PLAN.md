# COMPREHENSIVE BUG FIX PLAN

## Database Schema Analysis (from db.md)

### Key Tables:
- **deals**: deal_type, estimated_value (numeric), status, deal_type
- **direct_queries**: title, requirement, estimated_budget (numeric), urgency, status
- **products**: category_id (uuid FK to categories table)
- **campaigns**: distributor_id, status, start_date, end_date
- **organizations**: verified (boolean), type
- **categories**: id (uuid), name, slug
- **quotes**: quote_type, status, total
- **credit_requests**: status, amount

---

## RESELLER BUGS TO FIX

### ✅ CRITICAL - Already Fixed
1. ✅ Direct Query - Using Context API now, inserts to correct table

### 🔧 TO FIX NOW

#### 1. Bidding Deal Shows NaN
**Root Cause**: estimatedValue display not handling null/undefined
**Fix**: Add Number() conversion in deals page display
**File**: `app/reseller/deals/page.tsx`

#### 2. BOQ Upload Validation Order
**Root Cause**: Checking file upload before deal selection
**Fix**: Reorder validation checks
**File**: `app/reseller/boq/upload/page.tsx`

#### 3. Organization Details Not Editable
**Root Cause**: Already fixed in previous session
**Status**: Verify implementation

---

## DISTRIBUTOR BUGS TO FIX

#### 1. Product Category Schema Error
**Root Cause**: Using wrong column name 'category' instead of 'category_id'
**Fix**: Update product creation to use category_id (uuid)
**File**: `app/distributor/products/new/page.tsx`

#### 2. Campaign Not Reflecting
**Root Cause**: Missing refresh after creation
**Fix**: Add router.refresh() after campaign creation
**File**: `app/distributor/campaigns/new/page.tsx`

#### 3. Campaign CTAs Non-Functional
**Root Cause**: Missing implementations
**Fix**: Wire up pause, resume, edit, analytics functions
**File**: `app/distributor/campaigns/page.tsx`

#### 4. Campaign Tabs Show Same Data
**Root Cause**: Filter logic incorrect for status values
**Fix**: Update tab filtering based on campaign.status
**File**: `app/distributor/campaigns/page.tsx`

#### 5. Engagement Requests No Data
**Root Cause**: Already has fallback data
**Status**: Verify fallback is showing

#### 6. Quote CTAs Non-Functional
**Root Cause**: Placeholder implementations
**Fix**: Wire up update and generate invoice functions
**File**: `app/distributor/quotes/[id]/page.tsx`

#### 7. Credit Request CTAs
**Root Cause**: Missing implementations
**Fix**: Add approve, decline, request info functions
**File**: `app/distributor/credit/page.tsx`

---

## ADMIN BUGS TO FIX

#### 1. Organization Approval CTAs Missing
**Root Cause**: Already fixed in previous session
**Status**: Verify conditional rendering

#### 2. Organization Filters Not Working
**Root Cause**: Filter logic may be incorrect
**Fix**: Verify filter implementation
**File**: `app/admin/organizations/page.tsx`

#### 3. Category Add Not Persisting
**Root Cause**: Already fixed in previous session
**Status**: Verify refresh logic

#### 4. Qualification Band Add Non-Functional
**Root Cause**: Already fixed in previous session
**Status**: Verify implementation

#### 5. General Settings Not Persisting
**Root Cause**: Missing save implementation
**Fix**: Wire up actual database save
**File**: `app/admin/config/page.tsx`

---

## NON-IMPLEMENTED FEATURES (BY DESIGN)

### Email Services
- Team invitations
- Verification emails
**Reason**: Requires external email service (Resend/SendGrid)
**Status**: Show toast notifications for now

### CSV Import/Export
- Product import/export
**Reason**: Requires file parsing library and implementation
**Status**: Show "coming soon" toast

### Analytics Filtering
- Date range filtering
**Reason**: Requires analytics data aggregation
**Status**: Static demo data for now

---

## PRIORITY ORDER

1. **Critical Data Flow**: Product category, Bidding NaN, Direct Query
2. **Campaign Issues**: Creation, display, CTAs
3. **Organization Admin**: Filters, approvals
4. **Quote & Credit**: CTAs functionality
5. **Polish**: Empty states, error messages
