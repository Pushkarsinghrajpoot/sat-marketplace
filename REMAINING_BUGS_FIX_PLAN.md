# REMAINING BUGS TO FIX

## DISTRIBUTOR SIDE

### 1. ✅ Product Category Error - ALREADY FIXED
**Issue:** "could not find the 'category' column"
**Status:** Fixed - we use `category_id` (UUID) not `category`
**Location:** `app/distributor/products/new/page.tsx:105`
```typescript
category_id: formData.category || null, // Correct
```

### 2. ⚠️ Import/Export CSV - NOT IMPLEMENTED
**Issue:** Import CSV and Export CTA non-functional
**Status:** Feature not implemented (placeholder buttons)
**Action:** Mark as "Coming Soon" or implement basic functionality

### 3. ✅ Campaign Not Reflecting - ALREADY FIXED
**Issue:** Campaign not showing after creation
**Status:** Fixed with `router.refresh()` in `app/distributor/campaigns/new/page.tsx:61`

### 4. ✅ Campaign CTAs - ALREADY IMPLEMENTED
**Issue:** View analytics, edit, pause buttons not working
**Status:** Already functional in `app/distributor/campaigns/page.tsx`
**Action:** Verify with actual data

### 5. ⚠️ Campaign Tabs Same Data - NEED TO CHECK
**Issue:** All tabs show same campaigns
**Status:** Need to verify tab filtering logic

### 6. ❌ Engagement Menu - NO DATA
**Issue:** No pending approvals visible
**Status:** Need to check if engagement requests exist in database

### 7. ❌ Quotes Display Issue
**Issue:** "No quotes found" but click go back shows quotes
**Status:** Navigation/routing issue

## RESELLER SIDE

### 8. ✅ Direct Query Not Showing - ALREADY FIXED
**Issue:** Direct query not appearing on frontend
**Status:** Fixed - now saves to `direct_queries` table and displays correctly

### 9. ❌ BOQ Upload - No Deals in Dropdown
**Issue:** Deal dropdown empty, error about file upload
**Status:** Need to fix deal fetching for BOQ page

---

## PRIORITY FIX ORDER

1. **BOQ Deal Dropdown** (High - blocks workflow)
2. **Verify Direct Query Display** (High - confirm fix works)
3. **Product Category** (Medium - verify fix works)
4. **Campaign Display** (Medium - verify fixes work)
5. **Engagement/Quotes Data** (Low - may be data issue)
6. **Import/Export CSV** (Low - feature not implemented)
