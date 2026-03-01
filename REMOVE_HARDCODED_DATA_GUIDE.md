# Remove Hardcoded Data - Use Only Supabase Realtime Data

## ✅ COMPLETED FIXES

### 1. **Platform Configuration** ✅
**Files:**
- `supabase/migrations/20240302000006_create_platform_config.sql` - New migration
- `lib/data-helpers.ts` - Added platform config helpers
- `app/admin/config/page.tsx` - Now uses database instead of localStorage

**What Changed:**
```typescript
// Before: localStorage
localStorage.setItem('platformSettings', JSON.stringify(settings));

// After: Supabase database
await updatePlatformConfig('platform_name', settings.platformName);
await updatePlatformConfig('support_email', settings.supportEmail);
// etc...
```

**Migration to Run:**
```bash
supabase db push --file supabase/migrations/20240302000006_create_platform_config.sql
```

---

### 2. **BOQ Upload - Parsed Data** ✅
**File:** `app/reseller/boq/upload/page.tsx`

**What Changed:**
- Removed `mockPreviewData` hardcoded array
- Added `parsedData` state to store actual parsed file data
- File preview now shows real parsed data (placeholder for now, needs actual Excel/CSV parser)

**Next Step:** Implement real file parsing using `xlsx` or `papaparse` library

---

## 🔴 PAGES STILL USING localStorage (Need Fixes)

### **Public Pages**

#### 1. **Landing Page** - `app/(public)/page.tsx`
```typescript
// Lines 23-28 - NEEDS FIX
const cats = JSON.parse(localStorage.getItem('categories') || '[]');
const prods = JSON.parse(localStorage.getItem('products') || '[]');
const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
```

**Fix Needed:**
```typescript
// Use Supabase data helpers
const cats = await getCategories();
const prods = await getProducts({ featured: true });
const orgs = await getOrganizations();
```

---

#### 2. **Categories Page** - `app/(public)/categories/page.tsx`
```typescript
// Line 21 - NEEDS FIX
const cats = JSON.parse(localStorage.getItem('categories') || '[]');
```

**Fix Needed:**
```typescript
const cats = await getCategories();
```

---

#### 3. **Category Detail Page** - `app/(public)/categories/[slug]/page.tsx`
```typescript
// Lines 25-30 - NEEDS FIX
const cats = JSON.parse(localStorage.getItem('categories') || '[]');
const cat = cats.find((c: Category) => c.slug === params.slug);

const prods = JSON.parse(localStorage.getItem('products') || '[]');
const categoryProds = prods.filter((p: Product) => p.category === cat?.id);
```

**Fix Needed:**
```typescript
const cat = await getCategoryBySlug(params.slug);
const prods = await getProducts({ categoryId: cat.id });
```

---

#### 4. **Distributors Page** - `app/(public)/distributors/page.tsx`
```typescript
// Lines 19-21 - NEEDS FIX
const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
const dists = orgs.filter((o: Organization) => o.type === 'DISTRIBUTOR');

// Line 65 - NEEDS FIX
const products = JSON.parse(localStorage.getItem('products') || '[]');
```

**Fix Needed:**
```typescript
const dists = await getOrganizations({ type: 'DISTRIBUTOR' });
const products = await getProducts({ organizationId: distributor.id });
```

---

#### 5. **Product Detail Page** - `app/(public)/products/[id]/page.tsx`
```typescript
// Lines 26-33 - NEEDS FIX
const products = JSON.parse(localStorage.getItem('products') || '[]');
const prod = products.find((p: Product) => p.id === params.id);

const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
const org = orgs.find((o: Organization) => o.id === prod.organizationId);
```

**Fix Needed:**
```typescript
const prod = await getProductById(params.id);
const org = await getOrganizationById(prod.organizationId);
```

---

#### 6. **Services Detail Page** - `app/(public)/services/[id]/page.tsx`
```typescript
// Lines 20-27 - NEEDS FIX
const services = JSON.parse(localStorage.getItem('services') || '[]');
const svc = services.find((s: Service) => s.id === params.id);

const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
const org = orgs.find((o: Organization) => o.id === svc.organizationId);
```

**Fix Needed:**
```typescript
const svc = await getServiceById(params.id);
const org = await getOrganizationById(svc.organizationId);
```

---

### **Auth Pages**

#### 7. **Profile Page** - `app/profile/[id]/page.tsx`
```typescript
// Lines 19-26 - NEEDS FIX
const users = JSON.parse(localStorage.getItem('users') || '[]');
const foundUser = users.find((u: User) => u.id === params.id);

const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
const org = orgs.find((o: Organization) => o.id === foundUser.organizationId);
```

**Fix Needed:**
```typescript
const foundUser = await getUserById(params.id);
const org = await getOrganizationById(foundUser.organizationId);
```

---

#### 8. **Register Page** - `app/auth/register/page.tsx`
```typescript
// Lines 53-106 - NEEDS FIX
const users = JSON.parse(localStorage.getItem('users') || '[]');
const existingUser = users.find((u: any) => u.email === email);

const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
orgs.push(newOrg);
localStorage.setItem('organizations', JSON.stringify(orgs));

users.push(newUser);
localStorage.setItem('users', JSON.stringify(users));
```

**Fix Needed:**
```typescript
const existingUser = await getUserByEmail(email);
const newOrg = await createOrganization(orgData);
const newUser = await createUser(userData);
```

---

### **Settings Pages**

#### 9. **Distributor Settings** - `app/distributor/settings/page.tsx`
```typescript
// Lines 37-40 - NEEDS FIX
const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
invitations.push(invitation);
localStorage.setItem('invitations', JSON.stringify(invitations));
```

**Fix Needed:**
```typescript
await createInvitation(invitationData);
```

---

## 📝 REQUIRED MIGRATIONS

### **1. Create Invitations Table**
```sql
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL,
  email character varying NOT NULL,
  role character varying NOT NULL,
  status character varying DEFAULT 'PENDING',
  token character varying NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

### **2. Add Helper Function for Category by Slug**
```typescript
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return mapCategory(data);
}
```

### **3. Add Helper Functions for Products, Users, Services**
```typescript
export async function getProductById(id: string) { ... }
export async function getUserById(id: string) { ... }
export async function getUserByEmail(email: string) { ... }
export async function getServiceById(id: string) { ... }
export async function createInvitation(data: any) { ... }
```

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Add Missing Helper Functions**
1. Add `getCategoryBySlug` to `lib/data-helpers.ts`
2. Add `getProductById` to `lib/data-helpers.ts`
3. Add `getUserById` and `getUserByEmail` to `lib/data-helpers.ts`
4. Add `getServiceById` to `lib/data-helpers.ts`
5. Add `createInvitation` to `lib/data-helpers.ts`

### **Phase 2: Create Missing Tables**
1. Create `invitations` table migration
2. Create `services` table migration (if doesn't exist)
3. Run all migrations

### **Phase 3: Update Pages to Use Supabase**
1. Update all public pages (landing, categories, distributors, products)
2. Update auth pages (register, profile)
3. Update settings pages (distributor, oem, reseller settings)
4. Remove all `localStorage.getItem()` calls
5. Remove all `localStorage.setItem()` calls

### **Phase 4: Testing**
1. Test landing page loads categories and products from database
2. Test category filtering works with database data
3. Test product search works with database data
4. Test registration creates real database records
5. Test invitations save to database

---

## ⚠️ IMPORTANT NOTES

1. **NO MORE localStorage** - All data must come from Supabase
2. **NO MORE Mock Data** - All hardcoded arrays must be removed
3. **Real-time Updates** - Use Supabase subscriptions for live data
4. **Proper Error Handling** - Handle database errors gracefully
5. **Loading States** - Show loading spinners while fetching data

---

## 🔧 NEXT STEPS

1. **Run the platform_config migration** you just created
2. **Implement missing helper functions** for data access
3. **Create missing table migrations** (invitations, services)
4. **Update all pages** to use Supabase helpers
5. **Remove all localStorage references**
6. **Test thoroughly** - ensure all data is real-time

---

**Status:** 3/12 Pages Fixed (25% Complete)  
**Remaining:** 9 pages need localStorage → Supabase conversion
