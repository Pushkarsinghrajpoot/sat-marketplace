# B2B Marketplace - Test Credentials

## How to Login
1. Go to `/auth/login`
2. Enter any email from the list below
3. Enter ANY 6-digit OTP (e.g., 123456) - it will accept any OTP
4. You'll be automatically logged in and redirected to the appropriate dashboard

---

## 🔵 DISTRIBUTOR Accounts
These users can view deal registrations, bidding deals, and direct queries. They can acknowledge activities and submit quotes.

### TechDist Global (Main Distributor)
- **Email:** `john@techdist.satmz.com`
- **Name:** John Smith
- **Role:** Distributor
- **Dashboard:** `/distributor/dashboard`
- **Features:** 
  - View Deal Registrations (with lock status and scores)
  - View Bidding Deals
  - View Direct Queries
  - Acknowledge/Reject Activities
  - Submit Quotes
  - Add/Edit Products
  - Create Campaigns

### NetSupply Corp
- **Email:** `mike@netsupply.satmz.com`
- **Name:** Mike Davis
- **Role:** Distributor

### CloudFirst Distribution
- **Email:** `emily@cloudfirst.satmz.com`
- **Name:** Emily Wilson
- **Role:** Distributor

---

## 🟢 RESELLER Accounts
These users can create deal registrations, bidding deals, and direct queries. They can track activities and scores.

### ABC Resellers Inc
- **Email:** `robert@abcresellers.satmz.com`
- **Name:** Robert Brown
- **Role:** Reseller
- **Dashboard:** `/reseller/dashboard`
- **Features:**
  - Create Deal Registration (with verification & e-sign)
  - Create Bidding Deals (no verification required)
  - Send Direct Queries to Distributors
  - Add Activities (Meeting, Demo, BOQ Revision)
  - Track Deal Score (points system)
  - Upload BOQ (Protected or Bidding)
  - Convert Deals to Bidding
  - View Deal Lock Status

### Premier Solutions Group
- **Email:** `lisa@premiersolutions.satmz.com`
- **Name:** Lisa Martinez
- **Role:** Reseller

---

## 👁️ END USER Accounts (View Only)
These users have read-only access to view deals and queries from their organization.

### ABC Resellers Inc (End User)
- **Email:** `enduser@abcresellers.satmz.com`
- **Name:** End User Demo
- **Role:** End User (View Only)
- **Dashboard:** `/end-user/dashboard`
- **Features:**
  - View Deal Registrations (lock status, scores, dates)
  - View Bidding Deals
  - View Direct Queries
  - View Activity History
  - **Restrictions:**
    - Cannot create deals or queries
    - Cannot lock deals
    - Cannot upload BOQs
    - Cannot perform activities
    - Cannot acknowledge/reject

### TechDist Global (End User)
- **Email:** `sarah@techdist.satmz.com`
- **Name:** Sarah Johnson
- **Role:** End User (View Only)

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
2. Create a **Deal Registration**:
   - Select deal type (Deal Registration/Bidding/Direct Query)
   - Enter customer info with corporate email
   - Verify customer email (any 6-digit code)
   - Accept declaration and provide e-signature
   - Deal automatically locks to you
3. Add **Activities** to build score:
   - Schedule Meeting (+10 points)
   - Request Demo (+10 points)
   - BOQ Revision (+10 points)
4. Create **Direct Query** for quick pricing
5. Create **Bidding Deal** for open competition
6. View tabs: Registrations | Bidding | Queries

### For Distributors:
1. Login as: `john@techdist.satmz.com`
2. View **Deal Registrations** tab:
   - See locked deals with lock owner and date
   - View deal scores (activity points)
   - Acknowledge or reject activities
3. View **Bidding Deals** tab:
   - See open bidding opportunities
   - Submit quotes
4. View **Direct Queries** tab:
   - Respond to reseller queries
5. Manage products and campaigns

### For End Users (View Only):
1. Login as: `enduser@abcresellers.satmz.com`
2. View deal registrations from your organization
3. See lock status, scores, and activity history
4. No creation or modification permissions

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
End User: enduser@abcresellers.satmz.com
OEM: david@cisco.satmz.com
Admin: admin@marketplace.satmz.com
```

All use OTP: `123456` (or any 6 digits)

---

## 🆕 New Features Overview

### Deal Types
1. **Deal Registration** - Full verification with lock protection
2. **Bidding** - Open to multiple distributors
3. **Direct Query** - Simple inquiry without verification

### Activity & Scoring System
- Meeting: +10 points
- Demo: +10 points
- BOQ Revision: +10 points
- Gold Deal: 70+ points
- Distributors can acknowledge/reject activities

### Lock Mechanism
- First to register locks the deal
- No one else (even from same company) can lock
- Lock visible to distributors and end users
- Lock owner and date displayed

### Role Permissions
- **Reseller**: Create deals, queries, activities
- **Distributor**: View deals, acknowledge, quote
- **End User**: View only, no actions
- **Platform Admin**: Full platform access
