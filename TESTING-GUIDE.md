# 🧪 Complete Testing Guide - B2B Marketplace

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```
   Application runs on: `http://localhost:3001`

2. **Open browser:** Navigate to `http://localhost:3001`

3. **Use any test credentials** from the CREDENTIALS.md file

---

## 📋 Complete Feature Testing Checklist

### ✅ 1. PUBLIC PAGES (No Login Required)

#### Homepage (`/`)
- [ ] Hero section displays
- [ ] Categories are visible
- [ ] Featured products load
- [ ] Trust signals section shows

#### Browse Products
- [ ] Go to Categories page
- [ ] Click on "Networking & Infrastructure"
- [ ] Products display with filters
- [ ] Click on "Cisco Catalyst 9300" product

#### Product Detail Page
- [ ] Product information loads
- [ ] Specifications tab works
- [ ] Volume pricing shows
- [ ] **Click "Request Quote"** - Should show login modal if not logged in

---

### ✅ 2. RESELLER WORKFLOW (Complete Journey)

#### A. Login as Reseller
```
Email: robert@abcresellers.example.com
OTP: 123456 (any 6 digits work)
```

1. Go to `/auth/login`
2. Enter email
3. Click "Send OTP"
4. Enter any 6-digit OTP (e.g., 123456)
5. You'll be redirected to `/reseller/dashboard`

#### B. Register a New Deal
**Path:** Reseller Dashboard → Register Deal

**Step 1: Customer Information**
- [ ] Fill in Customer Company Name: "XYZ Corporation"
- [ ] Contact Person: "John Doe"
- [ ] Customer Email: "john@xyzcorp.com"
- [ ] Click "Next"

**Step 2: Deal Details**
- [ ] Opportunity Name: "Enterprise Network Upgrade"
- [ ] Estimated Value: 125000
- [ ] Close Date: Select future date
- [ ] Products Needed: "Cisco switches, Fortinet firewalls"
- [ ] Click "Next"

**Step 3: Declaration**
- [ ] Check "I confirm my relationship with customer"
- [ ] Check "I agree to terms and conditions"
- [ ] Click "Next"

**Step 4: Select Distributors**
- [ ] Select 2-3 distributors
- [ ] Click "Register & Send Requests"
- [ ] ✅ Should see success message

#### C. Upload BOQ (Bill of Quantities)
**Path:** Reseller Dashboard → Upload BOQ

1. [ ] Create a simple Excel/CSV file with:
   - SKU, Product, Quantity, Specs columns
   - Example row: CAT9300-48P, Cisco Catalyst, 5, 48-port switch
2. [ ] Upload file (or use drag and drop area)
3. [ ] Select associated deal from dropdown
4. [ ] Choose visibility: Public or Private
5. [ ] Click "Submit BOQ"
6. [ ] ✅ Should see success confirmation

#### D. Request Quote from Product Page
1. [ ] Go to homepage or browse products
2. [ ] Click on any product (e.g., Cisco Catalyst)
3. [ ] Click "Request Quote" button
4. [ ] Modal appears (since you're logged in as reseller)
5. [ ] Enter quantity: 10
6. [ ] Add message: "Need best pricing for enterprise client"
7. [ ] Click "Send Quote Request"
8. [ ] ✅ Should see success toast

#### E. View Deals Pipeline
**Path:** Reseller Dashboard → My Deals

- [ ] See deals organized in Kanban columns:
  - Prospecting
  - Registered
  - Quoted
  - Won
- [ ] Click on a deal card to view details
- [ ] Click "Compare Quotes" on quoted deals

---

### ✅ 3. DISTRIBUTOR WORKFLOW

#### A. Login as Distributor
```
Email: john@techdist.example.com
OTP: 123456
```

#### B. Manage Products
**Path:** Distributor Dashboard → Products → Add Product

**Add New Product:**
- [ ] Product Name: "HPE ProLiant ML350 Server"
- [ ] SKU: "HPE-ML350-001"
- [ ] Category: Hardware & Servers
- [ ] Brand: HP
- [ ] Description: Fill detailed description
- [ ] Base Price: 6999
- [ ] Add Volume Pricing tier
- [ ] Inventory: 50
- [ ] Add specifications
- [ ] Click "Publish Product"
- [ ] ✅ Product appears in product list

#### C. Create Campaign
**Path:** Distributor Dashboard → Campaigns → Create Campaign

- [ ] Campaign Name: "Spring Server Sale 2024"
- [ ] Select products to promote
- [ ] Set start and end dates
- [ ] Target audience settings
- [ ] Add special offers/discounts
- [ ] Click "Launch Campaign"
- [ ] ✅ Campaign shows as "Active"

#### D. Review Engagement Requests
**Path:** Distributor Dashboard → Engagements

- [ ] See engagement requests from resellers
- [ ] View "Effort Signals" (Deal registered, BOQ uploaded, etc.)
- [ ] Review request details
- [ ] Click "Accept & Quote" or "Decline"
- [ ] ✅ Status updates

#### E. Submit Quotes
**Path:** Distributor Dashboard → Quotes

- [ ] Find quotes with status "TO_SUBMIT"
- [ ] Click "Complete & Submit"
- [ ] Fill in pricing details
- [ ] Add line items
- [ ] Set terms (Net 30, Net 60)
- [ ] Click "Submit Quote to Reseller"
- [ ] ✅ Quote status changes to "SUBMITTED"

#### F. Review Credit Requests
**Path:** Distributor Dashboard → Credit Requests

- [ ] View credit applications from resellers
- [ ] Download submitted documents
- [ ] Review financial information
- [ ] Click "Approve" or "Decline"
- [ ] Set approved credit limit
- [ ] ✅ Status updates

---

### ✅ 4. OEM WORKFLOW

#### Login as OEM
```
Email: david@cisco.example.com
OTP: 123456
```

#### View Partner Directory
**Path:** OEM Dashboard → Partner Directory

- [ ] See all authorized partners
- [ ] Filter by tier (Platinum, Gold, Silver, Bronze)
- [ ] View partner certifications
- [ ] Check partner ratings
- [ ] View partner deal activity
- [ ] Export partner list

---

### ✅ 5. ADMIN WORKFLOW

#### Login as Admin
```
Email: admin@marketplace.example.com
OTP: 123456
```

#### Platform Management
**Path:** Admin Dashboard

**A. View Platform Statistics**
- [ ] Total users count
- [ ] Organization count
- [ ] Active deals
- [ ] GMV (Gross Merchandise Value)

**B. Verify Organizations**
**Path:** Admin Dashboard → Organizations

- [ ] View pending verifications
- [ ] Click "Review" on pending org
- [ ] View submitted documents
- [ ] Click "Approve" or "Reject"
- [ ] ✅ Organization status changes

**C. System Health**
- [ ] Check API status
- [ ] Database health
- [ ] Storage capacity
- [ ] System uptime

---

### ✅ 6. NOTIFICATIONS

**Path:** Any dashboard → Bell icon (top right)

- [ ] Click notifications icon
- [ ] View unread notifications
- [ ] Filter by type (Engagements, Quotes, Deals)
- [ ] Mark notifications as read
- [ ] Click notification to navigate to relevant page

---

### ✅ 7. PROFILE PAGES

**Path:** Click on any user name/avatar

- [ ] View user profile
- [ ] See organization details
- [ ] View stats (deals, quotes, wins)
- [ ] Check skills & certifications
- [ ] View recent activity

---

## 🎯 Critical User Journeys to Test

### Journey 1: Complete Deal Flow (Reseller → Distributor)
1. Login as Reseller
2. Register a new deal
3. Upload BOQ
4. Logout
5. Login as Distributor
6. Review engagement request
7. Accept and create quote
8. Submit quote
9. Logout
10. Login as Reseller
11. View quotes
12. Compare quotes
13. Accept winning quote

### Journey 2: Product Discovery and Quote
1. Browse products (not logged in)
2. Click on product
3. Click "Request Quote" → See login prompt
4. Login as Reseller
5. Click "Request Quote" again → Modal opens
6. Submit quote request
7. Logout
8. Login as Distributor
9. See quote request in dashboard
10. Respond with pricing

### Journey 3: Credit Application
1. Login as Reseller
2. Navigate to Credit section
3. Apply for credit line
4. Upload financial documents
5. Submit application
6. Logout
7. Login as Distributor
8. Review credit request
9. Approve with limit
10. Logout
11. Login as Reseller
12. See approved credit

---

## 🐛 Common Issues & Solutions

### Issue: "OTP Not Working"
**Solution:** Any 6-digit number works (123456, 000000, etc.). The system accepts all OTPs.

### Issue: "Redirected to Login After Logging In"
**Solution:** Clear browser localStorage and try again:
- Open DevTools (F12)
- Go to Application tab
- Clear Storage
- Refresh page

### Issue: "Products Not Loading"
**Solution:** localStorage needs initialization:
- Refresh the page once
- Data should load automatically

### Issue: "Quote Request Not Working"
**Solution:** 
- Make sure you're logged in as a RESELLER
- Distributors and OEMs cannot request quotes
- Only resellers can request quotes

---

## 📊 Test Data Available

### Pre-loaded Products:
- Cisco Catalyst 9300 48-Port Switch ($4,999)
- Dell PowerEdge R750 Server ($8,999)
- Juniper EX4300 Switch ($3,999)
- Fortinet FortiGate 600E Firewall ($15,999)
- HPE ProLiant DL380 Server ($7,499)
- NetApp AFF A400 Storage ($45,000)

### Pre-loaded Distributors:
- TechDist Global
- NetSupply Corp
- CloudFirst Distribution

### Pre-loaded Resellers:
- ABC Resellers Inc
- Premier Solutions Group

### Pre-loaded OEMs:
- Cisco Systems

---

## ✨ Success Criteria

Your testing is successful if you can:

✅ Login with any test account
✅ Register a deal as reseller
✅ Upload BOQ as reseller
✅ Request quote from product page
✅ Add product as distributor
✅ Create campaign as distributor
✅ Review and accept engagements as distributor
✅ Submit quotes as distributor
✅ View partner directory as OEM
✅ Verify organizations as admin
✅ Receive and view notifications
✅ Navigate between all dashboards smoothly

---

## 📝 Report Issues

If something doesn't work as expected:
1. Note which account you were using
2. Note the exact page/URL
3. Note what action you tried
4. Check browser console for errors (F12)
5. Clear localStorage and try again

---

**Happy Testing! 🎉**
