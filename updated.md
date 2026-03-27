1.	Deal registration should be only visible to reseller no visibility to distributor until it is converted to bidding or direct query.
2.	In deal registration there shoul be option to select distributor on engagement request step.
3.	Add convert to direct query CTA in deal registration similar to convert to biddding CTA.
4.	Need to show message after email verification that your deal has been locked & you have earned these many points like that.
5.	Swap deal registration steps such as after email verification,show declaration step then engagement step. 
6.	Direct query should also have the option to be raised to specific distributor, also we can visibility setting just like upload BOQ
7.	Within deal details page provide the options to upload BOQ from there,also provide messaging option as well.
8.	Add User management feature to onboard there team members
9.	For messaging user management implement assignment logic to specific user for specific product or we can assign the user to a specific responsibility or he can manage it , like in a team someone will look on tickets someone on sales and some will assigned to products or one or more responsibilty can assigned .
10.	Also add central admin for reviewing users and provide badging from there.  Also should be able to do distributor/resller qualification, based on reviewing documents uploaded while sign up. -----need to discuss
11.	Deal detail page add activity fucntion should be connected with user module and provide drop down list of user
12.	Need to add user rating system which should be public. Also one user can rate other user as well.

RATING FLOW

Great—this is a very important trust-building feature for your marketplace. Since you want:
✅ Users can rate other users (Reseller ↔ Distributor)
✅ Customers can rate users / representatives
✅ Ratings should be publicly visible
Below is a complete, refined User Rating System Flow aligned with your marketplace model.
 
Marketplace User Rating & Review System
(Public Rating – Customer, Reseller, Distributor, Representative)
This system allows:
•	Customers → Rate Resellers / Representatives
•	Resellers → Rate Distributors
•	Distributors → Rate Resellers (optional)
•	Ratings are public and visible on profile & listings
 
1. Who Can Rate Whom
Allowed Rating Relationships
Customer → Reseller / Representative
•	After:
o	Quote interaction
o	Product purchase
o	Service delivery
 
Reseller → Distributor
•	After:
o	BOQ processing
o	Quote received
o	Deal execution
 
Distributor → Reseller (Optional)
•	Based on:
o	Order quality
o	Payment behavior
o	Communication
 
Internal Rating (Optional)
•	Representative rating by:
o	Customer
o	Reseller Admin
 
2. Rating Trigger Points
Ratings should NOT be open randomly, only triggered after valid interactions.
Trigger Events
For Product Flow
•	Quote accepted
•	Order completed
 
For Service Flow
•	Service marked as completed
 
For Support Flow
•	Ticket resolved
 
For Interaction-Based Rating
•	After chat / engagement request closure
 
3. Rating Submission Flow
Step 1 – Rating Request Trigger
System Action
After completion of interaction:
•	System sends:
o	Notification
o	Email
o	In-app popup
Example:
“Please rate your experience with this seller.”
 
Step 2 – User Submits Rating
User Action
User provides:
Rating Fields
•	⭐ Star Rating (1 to 5)
•	Review Comment
•	Tags (optional):
Example:
•	Communication
•	Pricing
•	Delivery
•	Technical Support
 
Step 3 – Submit Review
System Action
•	Rating is saved
•	Linked with:
o	Order ID / Quote ID / Ticket ID
 
4. Public Display of Ratings
Where Ratings Are Visible
Product Listing Page
•	Seller rating shown with product
 
User Profile Page
Each reseller/distributor profile shows:
•	Average Rating
•	Total Reviews
•	Recent Reviews
 
Representative Profile (Optional)
•	Individual performance rating
 
Example Display
⭐⭐⭐⭐☆ (4.2 / 5)
“Very good pricing and quick response.”
 
5. Rating Calculation Logic
Average Rating Formula
Average Rating =
(Total Rating Score) / (Number of Reviews)
 
Weighted Rating (Advanced – Recommended)
Give more weight to:
•	Recent ratings
•	Verified transactions
 
6. Review Moderation (Important)
Since ratings are public, moderation is required.
Step 1 – Auto Moderation
System checks:
•	Offensive language
•	Spam content
 
Step 2 – Admin Moderation
Admin can:
•	Approve review
•	Reject review
•	Hide inappropriate content
 
Step 3 – Dispute Handling
User can:
•	Report a review
•	Request removal
Admin reviews and takes action.
 
7. Fraud & Abuse Prevention
Controls
•	Only verified interactions can be rated
•	One rating per transaction
•	No anonymous ratings
 
Restrictions
•	Self-rating not allowed
•	Fake accounts blocked
 
8. Rating Impact on Marketplace
Use Cases
For Customers
•	Choose best reseller
 
For Resellers
•	Select reliable distributors
 
For Platform
•	Rank sellers in search results
 
9. Rating-Based Ranking (Advanced)
You can use rating for:
•	Product listing ranking
•	Featured sellers
•	Recommended vendors
 
Example Logic
Higher rating + more transactions
= Higher visibility
 
10. Badge System (Optional but Powerful)
Based on Rating
•	⭐ Top Rated Seller
•	⭐ Trusted Distributor
•	⭐ Fast Response Partner


Sign up flow with user qualification logic

Got it—your requirement is strict approval-based onboarding:
👉 No Distributor or Reseller becomes active until Admin reviews and approves them.
Below is the refined, clean, and enforceable onboarding + qualification flow aligned to that rule.
 
Marketplace Signup & Qualification Flow
(Strict Approval-Based Onboarding – Reseller & Distributor)
This flow ensures that:
✅ Users can register
❌ But cannot access marketplace features
✅ Until Admin/Reviewer approves them after qualification
 
1. User Signup (Registration Only – No Access Yet)
Step 1 – Select Role
User Action
User clicks Sign Up and selects:
•	Reseller
•	Distributor
 
Step 2 – Basic Account Creation
User enters:
•	Name
•	Company Name
•	Email
•	Mobile Number
•	Password
System Action
•	OTP / Email verification completed
•	Account created with status:
👉 Status: Registered (Inactive)
⚠️ User is NOT onboarded yet
 
2. Mandatory Qualification Step (Blocking Step)
Step 3 – Force Qualification Form
After login, user is forced to complete qualification.
User cannot skip this.
 
Step 4 – Business Qualification Form
For Reseller
•	Company details (GST, PAN, business type)
•	Industry & product categories
•	Revenue range
•	Years in business
•	Service locations
 
For Distributor
•	Trade License / CR
•	Regions covered
•	Warehouse & logistics capability
•	Brand authorization details
 
3. Document Upload (Mandatory for Submission)
Step 5 – Upload Documents
Reseller Documents
•	GST Certificate
•	PAN
•	Business Registration
Distributor Documents
•	Trade License / CR
•	Tax Certificate
•	Brand Authorization
 
Validation Rules
•	Minimum required documents must be uploaded
•	File validation (format, size)
•	Secure storage (encrypted)
 
4. Submit for Approval
Step 6 – Submission
User Action
User clicks Submit for Verification
System Action
•	Status updated to:
👉 Status: Pending Approval
•	Request appears in:
Admin Dashboard → User Qualification Review
 
5. Admin / Reviewer Qualification Process
Step 7 – Admin Review
Admin/Reviewer Actions
Admin reviews:
•	Business details
•	Uploaded documents
•	Market credibility
 
Available Actions
Admin can:
1️⃣ Approve
•	User becomes active
•	Role assigned (Reseller / Distributor)
 
2️⃣ Reject
•	User is blocked from onboarding
•	Reason is captured
 
3️⃣ Request More Information
•	User must re-submit missing data
 
6. Status Lifecycle (Strict Control)
Registered (Inactive)
↓
Qualification Pending
↓
Pending Approval
↓
→ Approved ✅
→ Rejected ❌
→ Info Required 🔁
 
7. Access Control Logic (Critical)
Before Approval
User CANNOT access:
•	Product pricing
•	BOQ upload
•	Quote requests
•	Deal registration
•	Credit request
•	Distributor/reseller interactions
User can only see:
•	Limited marketplace (optional)
•	“Under Verification” message
 
After Approval
If Reseller Approved
Access to:
•	Product catalog (with pricing)
•	BOQ Upload
•	Quote Requests
•	Deal Registration
•	Credit Request Module
 
If Distributor Approved
Access to:
•	Product listing
•	Quote management
•	Engagement requests
•	Reseller interactions
 
8. Rejection Flow
Step 8 – If Rejected
System Action
•	Status → Rejected
•	User receives:
•	Email notification
•	Portal message
User Options
•	Re-apply (optional)
•	Contact support
 
9. Re-Submission Flow
Step 9 – Info Required Case
If admin selects Request More Info:
Flow:
Pending Approval
↓
Info Required
↓
User updates data/documents
↓
Resubmits
↓
Back to Pending Approval
 
10. Audit & Security Layer
Security Requirements
•	Documents stored encrypted
•	Role-based access control
 
Audit Logs
Track:
•	Who approved/rejected user
•	Timestamp
•	Document access logs
 
Final Strict Onboarding Flow
User Registers
↓
Status: Registered (Inactive)
↓
Complete Qualification Form
↓
Upload Documents
↓
Submit for Verification
↓
Status: Pending Approval
↓
Admin Review
↓
Approved / Rejected / Info Required
↓
If Approved → User Onboarded & Activated
↓
Full Marketplace Access Enabled
