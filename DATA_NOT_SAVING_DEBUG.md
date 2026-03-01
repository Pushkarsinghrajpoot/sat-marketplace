# 🔍 Data Not Saving - Debug & Fix Guide

## 🚨 CRITICAL FIXES APPLIED

### **1. Deal Registration Flow - FIXED** ✅

**Problem:** Deals were being auto-converted from `DEAL_REGISTRATION` to `BIDDING`, breaking the requirements.

**Fix Applied:**
```typescript
// BEFORE ❌
const finalDealType = dealType === 'DEAL_REGISTRATION' ? 'BIDDING' : dealType;

// AFTER ✅
deal_type: dealType, // Keep original type - don't auto-convert
```

**File:** `app/reseller/deals/register/page.tsx`

---

### **2. Added Comprehensive Error Logging** ✅

**File:** `lib/data-helpers.ts` → `createDeal()`

```typescript
console.log('=== CREATE DEAL START ===');
console.log('Deal data being inserted:', JSON.stringify(dealData, null, 2));

// ... database insert ...

if (error) {
  console.error('=== CREATE DEAL ERROR ===');
  console.error('Error message:', error.message);
  console.error('Error details:', error.details);
  console.error('Error hint:', error.hint);
  console.error('Error code:', error.code);
}

console.log('=== CREATE DEAL SUCCESS ===');
console.log('Created deal data:', JSON.stringify(data, null, 2));
```

**This will help you see EXACTLY what's failing.**

---

## 🧪 HOW TO TEST IF DATA IS SAVING

### **Step 1: Open Browser Console**
1. Go to your app in the browser
2. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Go to **Console** tab

### **Step 2: Try Creating a Deal**
1. Go to Reseller → Register Deal
2. Fill in all fields
3. Click through the steps
4. Submit the deal

### **Step 3: Check Console Output**

**If Successful, you'll see:**
```
=== CREATE DEAL START ===
Deal data being inserted: {
  "opportunity_name": "Test Deal",
  "deal_type": "DEAL_REGISTRATION",
  "customer_name": "John Doe",
  ...
}

=== CREATE DEAL SUCCESS ===
Created deal data: {
  "id": "uuid-here",
  "opportunity_name": "Test Deal",
  ...
}
```

**If Failed, you'll see:**
```
=== CREATE DEAL ERROR ===
Error message: "some error"
Error details: "detailed info"
Error code: "42501" (or other code)
```

---

## 🔴 COMMON ERRORS & FIXES

### **Error 1: "new row violates row-level security policy"**
**Cause:** Supabase RLS (Row Level Security) is blocking inserts

**Fix:**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert deals"
ON deals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to view their own deals"
ON deals FOR SELECT
TO authenticated
USING (reseller_id = auth.uid());
```

---

### **Error 2: "null value in column violates not-null constraint"**
**Cause:** Required fields are missing

**Check:** Look at console output for which field is null:
```
Error details: "null value in column 'customer_email' violates not-null constraint"
```

**Fix:** Make sure all required fields are filled in the form.

---

### **Error 3: "invalid input syntax for type uuid"**
**Cause:** User ID or Organization ID is not a valid UUID

**Fix in `app/reseller/deals/register/page.tsx`:**
```typescript
if (!user?.id || !user?.organizationId) {
  toast.error('User not properly authenticated');
  console.error('User data:', user);
  return;
}
```

---

### **Error 4: "permission denied for table deals"**
**Cause:** Database permissions not set correctly

**Fix:**
```sql
-- Grant permissions
GRANT ALL ON deals TO authenticated;
GRANT ALL ON deals TO anon;
```

---

## 📊 VERIFY DATA IN DATABASE

### **Option 1: Supabase Dashboard**
1. Go to https://supabase.com
2. Open your project
3. Go to **Table Editor** → **deals**
4. Check if rows exist

### **Option 2: SQL Query**
```sql
-- Run in SQL Editor
SELECT 
  id,
  opportunity_name,
  deal_type,
  status,
  is_locked,
  locked_by,
  score,
  created_at
FROM deals
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 CORRECT FLOW (Per updated.md)

### **DEAL_REGISTRATION Flow:**
```
1. Reseller fills form
   ↓
2. System sends verification email (if DEAL_REGISTRATION)
   ↓
3. Reseller accepts declaration + signs
   ↓
4. Deal created with:
   - deal_type: 'DEAL_REGISTRATION' ✅ (NOT 'BIDDING')
   - status: 'ACTIVE'
   - is_locked: true
   - locked_by: reseller user ID
   - score: 0
   ↓
5. Reseller adds activities:
   - Meeting → +10 points
   - Demo → +10 points
   - BOQ Revision → +10 points
   ↓
6. Optional: Convert to BIDDING later
```

### **BIDDING Flow (Direct):**
```
1. Reseller creates bidding deal directly
   ↓
2. Deal created with:
   - deal_type: 'BIDDING' ✅
   - status: 'ACTIVE'
   - is_locked: false (no lock for bidding)
   - score: N/A (no scoring)
   ↓
3. Multiple resellers can participate
```

### **DIRECT_QUERY Flow:**
```
1. Reseller creates query
   ↓
2. Query created with:
   - No verification
   - No locking
   - No scoring
   ↓
3. Distributor responds
```

---

## 🔧 FIXES NEEDED (Next Steps)

### **1. Add Activity Creation** 🔴
Currently missing - need to implement:

**File:** `lib/data-helpers.ts`
```typescript
export async function createDealActivity(activityData: any) {
  const { data, error } = await supabase
    .from('deal_activities')
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }

  return data;
}
```

**Trigger exists:** `set_deal_activity_points` - auto-adds points
**Trigger exists:** `update_deal_score_on_activity` - updates deal score

---

### **2. Verify Triggers Are Working** 🟡

Check if database triggers are active:
```sql
-- Check triggers
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('deals', 'deal_activities', 'quotes');
```

**Expected triggers:**
- `set_deal_activity_points` - Sets points when activity created
- `update_deal_score_on_activity` - Updates deal.score
- `validate_deal_status` - Validates status transitions

---

### **3. Add Meeting Task Creation** 🔴

**File:** `lib/data-helpers.ts`
```typescript
export async function createMeetingTask(taskData: any) {
  const { data, error } = await supabase
    .from('meeting_tasks')
    .insert([taskData])
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting task:', error);
    throw error;
  }

  return data;
}

export async function createMeetingDecision(decisionData: any) {
  const { data, error } = await supabase
    .from('meeting_decisions')
    .insert([decisionData])
    .select()
    .single();

  if (error) {
    console.error('Error creating decision:', error);
    throw error;
  }

  return data;
}
```

---

## 📝 TESTING CHECKLIST

Run through this checklist:

### **Deal Registration Test:**
- [ ] Fill out deal registration form
- [ ] Check console for "CREATE DEAL START" log
- [ ] Verify all fields are populated
- [ ] Check for "CREATE DEAL SUCCESS" log
- [ ] Go to Supabase → Table Editor → deals
- [ ] Verify row exists with:
  - [ ] `deal_type = 'DEAL_REGISTRATION'`
  - [ ] `status = 'ACTIVE'`
  - [ ] `is_locked = true`
  - [ ] `locked_by = your_user_id`
  - [ ] `score = 0`

### **Activity Creation Test:**
- [ ] Create a deal first
- [ ] Try to add a meeting
- [ ] Check console for activity creation logs
- [ ] Verify in database: `deal_activities` table
- [ ] Check if `score` updated on `deals` table

### **Quote Submission Test:**
- [ ] Distributor creates quote
- [ ] Submit quote
- [ ] Check if deal status changes to 'QUOTED'
- [ ] Verify in `quotes` table
- [ ] Verify `deals.status = 'QUOTED'`

---

## 🚨 IF DATA STILL NOT SAVING

### **Check 1: Supabase Connection**
```typescript
// Add to any page temporarily
import { supabase } from '@/lib/supabase';

async function testConnection() {
  const { data, error } = await supabase.from('deals').select('count');
  console.log('Connection test:', { data, error });
}
```

### **Check 2: Authentication**
```typescript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### **Check 3: RLS Policies**
```sql
-- Check existing policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'deals';
```

---

## 💡 QUICK WIN: Disable RLS Temporarily for Testing

**⚠️ ONLY FOR TESTING - RE-ENABLE FOR PRODUCTION**

```sql
-- Disable RLS on deals table
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

-- Test creating a deal

-- Re-enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
```

---

## 📞 WHAT TO SHARE IF STILL BROKEN

1. **Console output** - Copy the entire console log from browser
2. **Error message** - The exact error from "CREATE DEAL ERROR"
3. **Deal data** - Copy the JSON from "Deal data being inserted"
4. **User info** - Copy the user object from auth
5. **Database screenshot** - Screenshot of the deals table

---

**Status:** Debugging infrastructure added ✅  
**Next:** Test deal creation and check console logs  
**Goal:** Identify exact failure point and fix
