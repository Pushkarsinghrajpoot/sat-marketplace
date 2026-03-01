1️⃣ USER & ROLE STRUCTURE
Three types of user:
1. Reseller
The Reseller is the primary operational user of the system. This role initiates business opportunities and manages the full lifecycle of a deal. The reseller is responsible for creating deal registrations, initiating direct queries, creating bidding opportunities, scheduling meetings, conducting demos, uploading BOQs, and maintaining all related documentation. The reseller drives engagement and progresses the deal toward closure or competitive bidding.
2. Distributor
The Distributor functions as a governance and oversight role. This role does not initiate or modify deals but monitors reseller activity and deal maturity. The distributor tracks who locked a deal, when it was locked, how the score is progressing, and how actively the reseller is engaging through meetings, demos, and revisions. The objective of this role is to maintain transparency, performance tracking, and structured opportunity management.
3. End User (View Only)
Strictly read-only access.
Cannot create or modify anything.
The End User role is designed for visibility and transparency. Users under this role can view deal progress, meeting records, scoring, and lock details but are not allowed to create, edit, or modify any system data. This ensures information access without operational interference.
 
Important Notes:
• Deals and quotes are created by individual users, not by the company itself.
Every deal is associated with a specific user for accountability and traceability. Deals are not generated at the company entity level.
• Quotes can be sent to:
o A specific user
o OR a specific role within a company
This ensures targeted and structured communication.
• Quotes are not publicly visible.
Quotes remain restricted to authorized recipients only.
• Meeting documentation is visible based on role permissions.
Access to meeting records is controlled through role-based visibility.
2️⃣ ROLE PERMISSIONS
2.1 Reseller (Operational Role)
The reseller is the primary active user in the system.
Can:
• Create Deal Registration
The reseller can initiate a structured opportunity that includes verification, declaration, locking, and scoring mechanisms.
• Create Direct Query
The reseller can initiate a quick requirement-based inquiry without going through the full registration process.
• Create Direct Bidding
The reseller can create a competitive bidding opportunity directly without deal registration.
• Upload BOQ
After engagement and discussions, the reseller can upload a detailed Bill of Quantities (BOQ) document.
• Perform activities:
o Meeting
The reseller can schedule and document structured meetings related to the deal.
o Demo
The reseller can record product demonstrations conducted for the opportunity.
o BOQ Revision
The reseller can upload revised BOQs to reflect updated commercial or technical discussions.
• Lock a deal (if first to register)
If the reseller completes a valid registration first, the system automatically locks the deal to that reseller.
• Convert a registered deal into bidding
A structured and locked deal can later be converted into competitive bidding.
• Add meeting documentation
The reseller can update meeting details after completion.
• Add decisions taken
The reseller can formally document agreements reached during meetings.
• Add structured meeting tasks (with owner & deadline)
The reseller can create actionable tasks with clear ownership and deadlines to ensure accountability.
2.2 Distributor
Can:
• View Deal Registrations
The distributor can monitor all structured registered deals.
• View Bidding Deals
The distributor can track competitive opportunities.
• View Direct Queries
The distributor can review simple requirement-based inquiries.
• See who locked the deal
The distributor can view which reseller secured ownership of the deal.
• See lock date and time
The exact timestamp of lock assignment is visible.
• See deal score
The distributor can evaluate engagement strength through scoring.
• Track reseller history
The distributor can review the reseller’s past performance and activity levels.
• View meeting details
All scheduled and completed meetings are visible.
• View decisions taken
Agreements documented during meetings can be reviewed.
• View meeting tasks and deadlines
Defined tasks and their completion timelines can be monitored.
Cannot:
• Create deals
The distributor does not initiate business opportunities.
• Lock deals
Lock authority remains with the reseller.
• Modify meeting records
Meeting documentation cannot be edited by the distributor.
2.3 End User (Strictly View-Only Role)
Can View:
• Deal Registrations
• Bidding Deals
• Direct Queries
• Quotes
• Lock status
• Lock owner
• Lock date
• Deal score
• Activity history
• Meeting details
• Decisions taken
• Meeting tasks & deadlines
This ensures complete transparency without operational control.
Cannot:
• Create deals
• Create bidding
• Send queries
• Lock deals
• Upload BOQ
• Perform activities
• Modify meeting data
This role is completely read-only.


3️⃣ DEAL TYPES (System Level)
The system supports three types of deals:
• Deal Registration
A structured opportunity management process that includes verification, declaration, locking, engagement activities, and scoring.
• Bidding
A competitive opportunity format where multiple resellers can participate.
• Direct Query
A simplified inquiry-based communication flow without locking or scoring.
Each deal/quote must have a tag:
• Normal Quote
Standard quotation without competitive structure.
• Bidding Quote
Quotation generated within a competitive bidding environment.
Based on scoring parameters, a deal may be marked as a high-value or “Gold Deal.”
This classification reflects engagement intensity and commercial seriousness.
Meeting functionality is available in all three deal types.
Every deal type supports structured meeting documentation.
4️⃣ DIRECT QUERY FLOW
Flow:
Reseller
→ Creates Query
→ Enters requirement
→ Sends to Distributor
This flow is designed for quick communication without structured validation.
System Behavior:
• No customer verification
No corporate email validation is required.
• No locking mechanism
The opportunity is not exclusively secured.
• No scoring
No engagement score is generated in this flow.
Distributor:
→ Can respond with a quote
The distributor may provide pricing or clarification.
End User:
→ Can view the query and responses
Full transparency of communication is maintained.
🔔 Meeting Flow in Direct Query
Within a Direct Query, the reseller can create structured meeting records.
Meeting Structure:
• Meeting Title
Defines the subject or purpose of the meeting.
• Date & Time
Records the scheduled meeting timestamp.
• Attendees
Captures who participated in the discussion.
• Decisions Taken
Documents agreements, clarifications, or conclusions reached.
• Meeting Tasks:
o Task Description
Defines actionable follow-up steps.
o Owner
Specifies responsible individual.
o Deadline
Defines completion timeline.
Meetings serve as structured documentation and engagement tracking.
No lock impact.
No scoring impact.
5️⃣ DEAL REGISTRATION FLOW
Deal Registration is a structured process.
5.1 Registration Step
Reseller:
→ Enters customer details
Captures necessary customer information for opportunity validation.
→ Enters corporate email
Ensures authenticity and prevents false registrations.
→ Submits
System:
→ Sends verification email
Validates customer authenticity before activation.
5.2 Declaration Step
Reseller must:
• Accept declaration checkbox
Confirms compliance and ownership responsibility.
• Provide e-signature
Creates formal commitment record.
After completion:
→ Deal becomes Active
The opportunity enters the operational lifecycle.
5.3 Lock Mechanism
If a reseller is the first to register:
System:
• Automatically locks the deal to that specific user
Assigns exclusive ownership.
• Displays a lock badge
Provides visual clarity.
• Prevents others from locking
Avoids ownership conflicts.
Rules:
• Even users from the same company cannot lock it once locked
• No reassignment allowed
• Lock remains valid for the entire MVP phase
Distributor:
• Can view lock owner
• Can view lock date and time
End User:
• Can view lock badge and details
• Cannot modify anything
6️⃣ DEAL ACTIVITIES, MEETING FLOW & POINT SYSTEM
Once the deal becomes Active:
Reseller can perform:
• Meeting
• Demo
• BOQ Revision
6.1 Meeting Flow 
Meeting is treated as a formal engagement record.
When creating a meeting, reseller must enter:
1.	Meeting Title
2.	Date & Time
3.	Attendees
Post-Meeting Documentation:
Decisions Taken
Documents agreements, commercial direction, and technical clarifications.
Meeting Tasks (Structured):
For each task:
• Task Description
• Owner
• Deadline
Meeting history remains permanently attached to the deal for audit and tracking.
6.2 Point System (Updated)
Only applicable for Deal Registration and Converted Bidding.
Each activity adds fixed points:
• Meeting Scheduled → +10
• Demo → +10
• BOQ Revision → +10
Frontend displays:
• Activity log
• Meeting history
• Total score (example: 30/100)
Higher score indicates stronger engagement and seriousness.
Direct Query:
• No scoring applied.
7️⃣ BOQ Submission Flow
After performing activities:
Reseller:
→ Uploads BOQ
Then selects:
Option A: Protected Quoting
Controlled participation quoting model.
Option B: Open BOQ Bidding
Competitive participation enabled.
End User:
→ Can view uploaded BOQ
→ Cannot upload BOQ


8️⃣ BIDDING FLOW
Two possible scenarios:
8.1 Bidding from Registered Deal (Path A)
Flow:
Deal Registration
→ Lock
→ Activities (Meeting/Demo/BOQ)
→ Points accumulated
→ Convert to Bidding
In bidding:
• Other resellers can participate
• Original lock remains visible
• Deal score remains visible
• Meeting history remains visible
8.2 Fresh Bidding (Path B)
Reseller directly creates a bidding deal.
System Behavior:
• No deal registration
• No scoring
• No lock
However:
Meeting functionality is available for documentation.
Distributor:
• Can view bidding deal and meetings
End User:
• Can view bidding status and meeting history



9️⃣ LOCK CONFLICT LOGIC
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
System must always display:
• Lock badge
• Locked by user
• Lock date
End User:
→ View only
🔟 DISTRIBUTOR DASHBOARD VIEW
Distributor must have four tabs:
• Deal Registrations
• Bidding
• Direct Queries
• Quotes
For each deal, distributor can see:
• Lock owner
• Lock date
• Deal score
• Reseller history
• Meeting count
• Meeting details
• Task deadlines
End User:
→ Same view but without action button


