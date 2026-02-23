USER & ROLE STRUCTURE
Each company can have the following roles:
1.	Reseller
2.	Distributor
3.	End User (View Only)
Quotes and deals are created by individual users (not by company).
Quotes can be sent to:
•	A specific user
OR
•	A specific role inside a company
Quotes are not publicly visible.
2️⃣ ROLE PERMISSIONS
2.1 Reseller
•	Create Deal Registration
•	Create Direct Query
•	Create Bidding
•	Upload BOQ
•	Perform Activities (Meeting, Demo, BOQ Revision)
•	Lock deal (if first to register)
•	Convert deal to bidding
2.2 Distributor
•	View Deal Registrations
•	View Bidding Deals
•	View Direct Queries
•	See who locked first
•	See lock date/time
•	See deal score
•	Acknowledge or Reject
•	Track reseller history
2.3 End User (View Only)
•	View Deal Registrations
•	View Bidding Deals
•	View Direct Queries
•	View Quotes
•	View lock status
•	View lock owner
•	View lock date
•	View deal score
•	View activity history
Restrictions:
•	Cannot create deal
•	Cannot create bidding
•	Cannot send query
•	Cannot lock deal
•	Cannot upload BOQ
•	Cannot perform activities
•	Cannot acknowledge or reject
This role is strictly read-only.
3️⃣ DEAL TYPES (SYSTEM LEVEL)
System must support:
1.	Deal Registration
2.	Bidding
3.	Direct Query
Each deal/quote must have a tag:
•	Normal Quote
•	Bidding Quote
Deal can be marked as high value (Gold Deal) based on scoring parameters.
4️⃣ DIRECT QUERY FLOW (PATH C)
Reseller
→ Create Query
→ Enter requirement
→ Send to Distributor
System Behavior:
•	No customer verification
•	No locking
•	No scoring
Distributor can respond with quote.
End User:
•	Can view query and responses.
5️⃣ DEAL REGISTRATION FLOW
Deal Registration is a process, not just a form.
5.1 Registration Step
Reseller
→ Start Deal Registration
→ Enter:
•	Customer details
•	Corporate email
→ Submit
System:
→ Sends verification email to corporate email

5.2 Declaration Step
Reseller must:
•	Accept declaration via checkbox
•	Provide e-sign
After declaration:
→ Deal becomes Active
5.3 Lock Mechanism
If first to register:
System automatically:
•	Locks deal to that specific user
•	Shows lock badge
•	Prevents others from locking
Rules:
•	Even users from same company cannot lock if already locked
•	No reassignment
•	Lock remains for entire MVP
•	Distributor can see:
o	Lock owner
o	Lock date/time
End User:
•	Can view lock badge and details
•	Cannot modify
6️⃣ DEAL ACTIVITIES & POINT SYSTEM
After deal becomes Active:
Reseller can perform:
•	Meeting request
•	Demo
•	BOQ revision
6.1 Meeting
Frontend:
•	Calendar date selection
•	On click → email sent to distributor
No external API integration required.
6.2 Point System
Each activity adds fixed points:
•	Meeting requested → +10
•	Demo → +10
•	BOQ Revision → +10
Frontend must display:
•	Activity log
•	Total score (example: 30/100)
Higher score = Higher deal capability.
Distributor:
•	Can acknowledge
•	Can reject
End User:
•	Can view score and activity log
7️⃣ BOQ SUBMISSION FLOW
After activities:
Reseller uploads BOQ.
Then selects:
Option A: Protected Quoting
Option B: Open BOQ Bidding
End User:
•	Can view uploaded BOQ
•	Cannot upload
8️⃣ BIDDING FLOW
Two possible flows:
8.1 From Registered Deal (Path A)
Deal Registration
→ Points accumulated
→ Convert to Bidding
In bidding:
•	Other resellers can participate
•	Original lock remains visible
•	Deal score remains visible
8.2 Fresh Bidding (Path B)
Reseller directly creates bidding deal.
System Behavior:
•	No deal registration
•	No scoring
•	No lock
Distributor sees:
•	Fresh bidding deal
End User:
•	Can view bidding status
9️⃣ LOCK CONFLICT LOGIC
If another reseller tries to register:
Case 1:
Same product already locked
→ Can register
→ Cannot lock
Case 2:
Different product not part of locked deal
→ Can lock
Case 3:
Increase quantity
→ Can lock increased quantity
→ Original locked deal remains
System must display:
•	Lock badge
•	Locked by user
•	Lock date
End User:
•	View only
🔟 DISTRIBUTOR VIEW
Distributor must have tabs:
•	Deal Registrations
•	Bidding
•	Direct Queries
•	Quotes
For each deal:
•	Lock owner
•	Lock date
•	Deal score
•	Reseller history
Distributor can:
•	Acknowledge
•	Reject
•	Track scoring
End User:
•	Same view without action buttons
1️⃣1️⃣ COMPLETE SYSTEM FLOW
Reseller
→ Choose:
•	Direct Query
•	Deal Registration
•	Direct Bidding
If Deal Registration:
→ Verification
→ Declaration
→ Lock
→ Activities
→ Scoring
→ BOQ Upload
→ Protected Quote OR Convert to Bidding
Distributor
→ View deals
→ See lock + score
→ Acknowledge / Reject
End User
→ View all deal types
→ View lock, score, activities
→ No action permissions

