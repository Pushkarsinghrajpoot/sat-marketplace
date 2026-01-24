# B2B Marketplace - Test Credentials

## How to Login
1. Go to `/auth/login`
2. Enter any email from the list below
3. Enter ANY 6-digit OTP (e.g., 123456) - it will accept any OTP
4. You'll be automatically logged in and redirected to the appropriate dashboard

---

## 🔵 DISTRIBUTOR Accounts
These users can manage products, create campaigns, review engagement requests, and submit quotes.

### TechDist Global (Main Distributor)
- **Email:** `john@techdist.satmz.com`
- **Name:** John Smith
- **Role:** Admin
- **Dashboard:** `/distributor/dashboard`
- **Features:** 
  - Add/Edit Products
  - Create Campaigns
  - Review Engagement Requests from Resellers
  - Submit Quotes
  - Credit Request Reviews

### TechDist Global (Sales Manager)
- **Email:** `sarah@techdist.satmz.com`
- **Name:** Sarah Johnson
- **Role:** Sales Manager

### NetSupply Corp
- **Email:** `mike@netsupply.satmz.com`
- **Name:** Mike Davis
- **Role:** Admin

### CloudFirst Distribution
- **Email:** `emily@cloudfirst.satmz.com`
- **Name:** Emily Wilson
- **Role:** Admin

---

## 🟢 RESELLER Accounts
These users can register deals, upload BOQ, request quotes, and compare quotes.

### ABC Resellers Inc
- **Email:** `robert@abcresellers.satmz.com`
- **Name:** Robert Brown
- **Role:** Admin
- **Dashboard:** `/reseller/dashboard`
- **Features:**
  - Register Deals (4-step wizard)
  - Upload BOQ (Bill of Quantities)
  - Request Quotes from Distributors
  - Compare Quotes
  - Manage Deal Pipeline

### Premier Solutions Group
- **Email:** `lisa@premiersolutions.satmz.com`
- **Name:** Lisa Anderson
- **Role:** Admin

---

## 🟣 OEM Account
These users can view partner directory and manage partner programs.

### Cisco Systems
- **Email:** `david@cisco.satmz.com`
- **Name:** David Martinez
- **Role:** Admin
- **Dashboard:** `/oem/dashboard`
- **Features:**
  - View Partner Directory
  - Manage Partner Programs
  - View Partner Activity

---

## 🔴 ADMIN Account
Platform administrator with access to all management features.

### Platform Admin
- **Email:** `admin@marketplace.satmz.com`
- **Name:** Admin User
- **Role:** Platform Admin
- **Dashboard:** `/admin/dashboard`
- **Features:**
  - View Platform Statistics
  - Verify Organizations
  - Manage Platform Configuration
  - View All Activities

---

## 🎯 Recommended Testing Flow

### For Resellers (Start Here):
1. Login as: `robert@abcresellers.satmz.com`
2. Go to "Register Deal" → Complete the 4-step wizard
3. Go to "Upload BOQ" → Upload a sample spreadsheet
4. View "My Deals" → See the pipeline (Prospecting → Won)
5. Browse products and request quotes

### For Distributors:
1. Login as: `john@techdist.satmz.com`
2. Go to "Products" → Add a new product
3. Go to "Campaigns" → Create a marketing campaign
4. Go to "Engagements" → Review reseller engagement requests
5. Go to "Quotes" → Submit and manage quotes
6. Go to "Credit Requests" → Review credit applications

### For OEM:
1. Login as: `david@cisco.satmz.com`
2. View Partner Directory
3. Check partner certifications and activity

### For Admin:
1. Login as: `admin@marketplace.satmz.com`
2. View platform statistics
3. Review pending organization verifications

---

## 🔧 Technical Notes

- **OTP:** Any 6 digits will work (e.g., 123456, 000000, 111111)
- **Data Storage:** All data is stored in browser localStorage
- **Reset Data:** Clear browser localStorage to reset all data
- **Port:** Application runs on `http://localhost:3001`

---

## 📋 Quick Copy-Paste Emails

```
Distributor: john@techdist.satmz.com
Reseller: robert@abcresellers.satmz.com
OEM: david@cisco.satmz.com
Admin: admin@marketplace.satmz.com
```

All use OTP: `123456` (or any 6 digits)
