B2B Marketplace Platform - Complete Development Guide
Based on your requirements and the AWS Marketplace inspiration, I'll provide you with a comprehensive development plan for building this B2B marketplace in Next.js.
🎯 Project Overview
You're building a neutral B2B marketplace connecting Distributors, Resellers, and OEMs with:

Product/Service discovery
Deal Registration (effort-backed)
BOQ bidding system
Campaign management
Credit management
Rating system


📋 Complete Page Structure & Prompts
1. PUBLIC PAGES (No Auth Required)
Homepage (/)
Create a modern B2B marketplace homepage with:
- Hero section with search bar (products/services search)
- Category grid (6-8 main categories with icons)
- Featured distributors carousel
- Featured products section
- How it works (3-step process for resellers and distributors)
- Statistics counter (active distributors, products listed, deals closed)
- CTA sections for "List Your Products" and "Find Solutions"
- Footer with company info, quick links, categories
Design: Clean, professional, AWS Marketplace style with blue/white color scheme
Category Browse (/categories, /categories/[slug])
Create a category browsing page with:
- Breadcrumb navigation
- Left sidebar with filters (price range, distributor, availability, location)
- Product/service grid view with cards showing:
  - Product image, name, distributor
  - Starting price, availability status
  - Quick view button
- Sorting options (relevance, price, newest)
- Pagination
- "Request Quote" quick action on each card
Design: Grid layout, clean filters, easy scanning
Product/Service Detail (/products/[id], /services/[id])
Create a detailed listing page with:
- Product/service name and distributor info
- Image gallery (if product)
- Key specifications table
- Pricing information (or "Request Quote")
- Availability status
- Description tabs (Overview, Specifications, Support)
- Distributor profile card with rating
- "Start Deal Registration" CTA
- "Request BOQ Quote" CTA
- Related products section
Design: Professional, information-dense but organized, trust signals prominent

2. AUTHENTICATION PAGES
Login/Register (/auth/login, /auth/register)
Create a modern authentication page with:
- Email + OTP login (no password)
- Organization type selection (Distributor/Reseller/OEM/Individual)
- Email input → Send OTP → Verify OTP flow
- "Continue as visitor" option
- Benefits sidebar showing platform features
Design: Split screen, illustration on left, form on right
Organization Setup (/auth/org-setup)
Create organization onboarding wizard with steps:
Step 1: Organization Type (Distributor/Reseller/OEM)
Step 2: Basic Info (name, description, logo upload)
Step 3: Contact Details (address, phone, website)
Step 4: Verification Documents (business license, tax ID)
Step 5: Team Invitation (invite team members via email)
Progress indicator at top
Design: Multi-step form, clear progress, save draft option

3. DISTRIBUTOR DASHBOARD
Distributor Dashboard (/distributor/dashboard)
Create distributor dashboard with:
- KPI cards (total products, active campaigns, pending quotes, revenue this month)
- Recent activity feed (new engagement requests, quotes submitted, deals won)
- Quick actions (Add Product, Create Campaign, View Quotes)
- Charts (monthly revenue, top products, deal pipeline)
- Notifications panel
Design: Professional dashboard, data visualization, action-oriented
Product Management (/distributor/products)
Create product management page with:
- "Add New Product" button
- Product list table with columns:
  - Product name/image, SKU, category
  - Price, inventory, status (active/draft)
  - Actions (edit, duplicate, archive)
- Bulk actions (export, bulk edit, bulk publish)
- Search and filters
- Import CSV option
Design: Data table with inline editing, Excel-like feel
Add/Edit Product (/distributor/products/new, /distributor/products/[id]/edit)
Create product form with sections:
- Basic Info (name, SKU, category, brand)
- Pricing (base price, volume discounts)
- Inventory (quantity, location, ETA)
- Specifications (dynamic key-value pairs)
- Images (drag-drop upload, max 10)
- Visibility settings (public/campaign-only)
- SEO (title, description)
Auto-save drafts, rich text editor for description
Design: Clean form, organized sections, visual feedback
Campaign Management (/distributor/campaigns)
Create campaign builder with:
- Campaign list showing active/scheduled/ended campaigns
- "Create Campaign" wizard:
  Step 1: Campaign details (name, dates, goals)
  Step 2: Target audience (qualification filters - revenue, certifications, location)
  Step 3: Product selection (choose products to promote)
  Step 4: Incentives (special pricing, terms)
  Step 5: Review & launch
- Campaign analytics (views, engagement, conversions)
Design: Marketing-focused, visual campaign cards
Engagement Requests (/distributor/engagements)
Create engagement management page with:
- Request list with filters (pending/accepted/declined)
- Each request card shows:
  - Reseller info, company, rating
  - Products interested in
  - Deal registration details
  - Accept/Decline buttons with reason input
- Quick profile view modal
Design: Inbox-style layout, quick decision making
Quotes (/distributor/quotes)
Create quote management with:
- Quote list (pending, submitted, won, lost)
- Quote detail view showing:
  - BOQ items with reseller specifications
  - Your pricing table (editable)
  - Comparison with other quotes (if visible)
  - Submit/Update quote button
  - Chat with reseller
- Quote templates for quick responses
Design: Spreadsheet-like for BOQ, clean submission flow

4. RESELLER DASHBOARD
Reseller Dashboard (/reseller/dashboard)
Create reseller dashboard with:
- KPI cards (active deals, quotes requested, deals won, pipeline value)
- Deal pipeline (stages: Prospecting, Registered, Quoted, Won, Lost)
- Recent activity timeline
- Quick actions (Register Deal, Upload BOQ, Browse Products)
- Notifications center
Design: Sales-focused, pipeline visualization, actionable insights
Deal Registration (/reseller/deals/register)
Create deal registration wizard:
Step 1: Customer Information
  - Company name, contact person, email
  - Customer email verification (send code)
Step 2: Deal Details
  - Opportunity name, value estimate, close date
  - Products/services needed (search and select)
Step 3: Reseller Declaration
  - Confirm relationship with customer
  - Agree to terms
  - Lock registration (cannot be changed)
Step 4: Distributor Selection
  - Browse distributors offering selected products
  - Send engagement requests
Visual progress, clear CTA on each step
Design: Wizard format, trust indicators, legal clarity
BOQ Upload (/reseller/boq/upload)
Create BOQ upload interface with:
- Drag-drop file upload (Excel/CSV)
- File parsing and preview
- Map columns (SKU, quantity, specifications)
- Add deal association
- Visibility settings (public bidding / private invites)
- Send to specific distributors option
Design: File-centric, clear mapping, validation feedback
My Deals (/reseller/deals)
Create deal management with:
- Deal cards in pipeline stages
- Drag-drop between stages
- Each card shows:
  - Customer name, value, close date
  - Status, engaged distributors
  - Quote count, best quote
  - Actions (view quotes, update, close)
- Filters (date range, status, value)
Design: Kanban board style, visual pipeline
Quote Comparison (/reseller/deals/[id]/quotes)
Create quote comparison view with:
- Side-by-side distributor quotes
- Comparison table highlighting:
  - Pricing differences (absolute & percentage)
  - Delivery terms
  - Payment terms
  - Support included
  - Distributor ratings
- Award deal button (mark winner)
- Feedback form for losing distributors
Design: Clean comparison, easy scanning, decision support
Services & Capabilities (/reseller/services)
Create service management with:
- Service catalog (managed services, implementation, support)
- Capability listing (certifications, partnerships, case studies)
- Competency matrix (technologies, industries, project sizes)
- Team showcase (presales, sales engineers)
Design: Portfolio style, credibility building

5. OEM PAGES
OEM Dashboard (/oem/dashboard)
Create OEM dashboard with:
- Partner directory statistics
- Program rules display (static content)
- Partner activity overview
- Content management (program rules, resources)
Design: Informational, partner ecosystem focused
Partner Directory (/oem/partners)
Create authorized partner directory with:
- Partner list with certifications and tiers
- Filters (location, capabilities, tier)
- Partner profile cards
- Export partner list
Design: Directory style, clean listings

6. CREDIT MANAGEMENT
Credit Request (/credit/request)
Create credit request flow:
- Request amount and terms
- Document upload (financial statements, bank references)
- Company information verification
- Submit for review
- Track status (pending, under review, approved, rejected)
Design: Financial form, secure upload, status tracking
Credit Review (/distributor/credit-requests)
Create credit review dashboard for distributors:
- Request list with reseller details
- Document viewer (encrypted)
- Approve/Reject/Request More Info actions
- Credit limit assignment
- Audit trail
Design: Secure, compliance-focused, clear actions

7. INDIVIDUAL PROFILE
Individual Profile (/profile/[id])
Create individual profile page with:
- Profile photo, name, title
- Current organization(s)
- Activity counters (deals registered, quotes submitted, deals won)
- Tier badge (Unproven/Emerging/Proven)
- Skills and certifications
- Activity timeline
- Join/leave organization buttons (if own profile)
Design: Professional LinkedIn-style, credibility signals

8. RATINGS & REVIEWS
Rate Transaction (/deals/[id]/rate)
Create rating interface:
- Rate organization (1-5 stars)
- Rate individuals involved
- Category ratings (communication, pricing, delivery, support)
- Written review (optional)
- Tag selection (professional, responsive, reliable, etc.)
- Submit anonymously option
Design: Clean form, constructive feedback encouraged

9. ADMIN PANEL
Admin Dashboard (/admin/dashboard)
Create admin control panel with:
- Platform statistics (users, orgs, deals, GMV)
- Pending verifications (organizations, documents)
- Abuse reports
- System health monitors
- Quick actions (verify org, configure categories, manage tags)
Design: Data-dense, operational, quick access
Organization Verification (/admin/organizations)
Create org verification with:
- Organization list (pending, verified, rejected)
- Document review interface
- Verify/Reject with notes
- Request additional info
- Audit trail
Design: Compliance-focused, secure document viewing
Configuration (/admin/config)
Create configuration pages for:
- Categories management (add, edit, arrange)
- Qualification bands (revenue tiers, certification types)
- Rating tags
- Email templates
- Platform settings
Design: Settings panel, organized tabs

10. SHARED COMPONENTS
Search Interface (Global)
Create universal search with:
- Search bar with autocomplete
- Recent searches
- Search results grouped by type (products, services, distributors, resellers)
- Advanced filters panel
- Save search option
Design: Fast, predictive, comprehensive
Notifications Center (/notifications)
Create notification center with:
- Notification list (all, unread, by type)
- Mark as read/unread
- Notification preferences
- Real-time updates
Design: Clean inbox, categorized, actionable
Chatbot (Global widget)
Create AI chatbot widget with:
- Floating button (bottom right)
- Chat interface
- Pre-defined quick questions
- Context-aware help
- Handoff to support
Design: Unobtrusive, helpful, modern chat UI

🎨 UI/UX Design System
Color Palette
Primary: #0066CC (AWS Blue)
Secondary: #FF9900 (AWS Orange accent)
Success: #1D8102
Warning: #FF9900
Error: #D13212
Neutral: #232F3E (dark), #F3F3F3 (light background)
Typography
Headings: Inter or Helvetica Neue (Bold)
Body: Inter or Helvetica Neue (Regular)
Code/Numbers: JetBrains Mono
Component Style

Clean, minimal borders
Ample white space
Card-based layouts
Subtle shadows
Rounded corners (4px-8px)
Smooth transitions


🛠️ Technical Stack Recommendations
javascript// Next.js 14+ with App Router
// TypeScript
// Tailwind CSS
// shadcn/ui components
// React Hook Form + Zod validation
// TanStack Query for data fetching
// Zustand for state management
// NextAuth.js for authentication
// Prisma ORM
// PostgreSQL database

📦 Database Schema (Key Entities)
typescript// Organizations
Organization {
  id, name, type (DISTRIBUTOR/RESELLER/OEM), 
  verified, rating, documents, members[]
}

// Products & Services
Listing {
  id, org_id, type (PRODUCT/SERVICE),
  name, sku, category, price, inventory, specs
}

// Deals
Deal {
  id, reseller_id, customer_email, status,
  value, close_date, products[], locked_at
}

// BOQ
BOQ {
  id, deal_id, reseller_id, file_url,
  items[], visibility, distributors_invited[]
}

// Quotes
Quote {
  id, boq_id, distributor_id,
  line_items[], total, status, submitted_at
}

// Campaigns
Campaign {
  id, distributor_id, name, targets{},
  products[], incentives{}, analytics{}
}

// Credit
CreditRequest {
  id, reseller_id, distributor_id,
  amount, documents[], status, approved_limit
}

// Ratings
Rating {
  id, from_org, to_org, deal_id,
  stars, categories{}, tags[], review
}

🚀 Implementation Phases
Phase 1: Foundation (Week 1-2)

Setup Next.js project
Design system & component library
Authentication flow
Database schema

Phase 2: Core Marketplace (Week 3-4)

Homepage & category browsing
Product/service listings
Search functionality
Basic profiles

Phase 3: Deal Flow (Week 5-6)

Deal registration
Engagement requests
BOQ upload & bidding
Quote comparison

Phase 4: Distributor Tools (Week 7-8)

Product management
Campaign builder
Quote submission
Credit review

Phase 5: Polish (Week 9-10)

Ratings system
Admin panel
Notifications
Chatbot
Mobile optimization


💡 Key Features to Emphasize

One-Click Actions: Register deal, send quote, accept engagement
Visual Trust Signals: Verified badges, ratings, tier badges
Effort Transparency: Show deal registration effort in bidding
Mobile-First: All core flows work perfectly on mobile
Real-Time: Live notifications, instant search, chat
Security: Encrypted credit docs, RBAC, audit trails


Would you like me to create ready-to-use React components for any specific page? I can generate complete, production-ready code with dummy data that you can directly integrate into your Next.js project!now give me the UI  prmopt for each pages look there should not be any pages we leave , not we cover all the pages and each features and the functionalities01:46Complete UI Prompts for B2B Marketplace - All Pages & Features
I'll provide detailed UI prompts for every single page with all functionalities. Use these with AI image generators or give to your design team.

🌐 PUBLIC PAGES (No Authentication)
1. Homepage (/)
Design a modern B2B marketplace homepage with these sections:

HEADER (Sticky):
- Logo (left) with tagline "B2B Marketplace for Technology Solutions"
- Navigation: Categories | Distributors | How It Works | Pricing
- Search bar (center, prominent): "Search products, services, or distributors"
- Right side: Login | Sign Up buttons (outlined)
- Language selector (EN/AR flag icon)

HERO SECTION:
- Large headline: "Connect. Trade. Grow Your Business"
- Subheadline: "The trusted B2B marketplace connecting distributors and resellers"
- Advanced search bar with 3 fields: [What are you looking for?] [Category dropdown] [Search button (blue)]
- Below search: "Popular searches: Network Equipment, Cloud Services, Security Solutions"
- Right side: Abstract 3D illustration of connected business nodes
- Stats bar: "5,000+ Products | 500+ Distributors | 1,200+ Resellers | $50M+ GMV"

CATEGORY GRID:
- Heading: "Browse by Category"
- 8 category cards in 4x2 grid:
  - Networking & Infrastructure (icon: network nodes)
  - Cloud Services (icon: cloud)
  - Cybersecurity (icon: shield)
  - Storage Solutions (icon: database)
  - Software Licensing (icon: key)
  - Hardware & Servers (icon: server)
  - Professional Services (icon: briefcase)
  - Training & Certification (icon: certificate)
- Each card: Icon, category name, product count, hover effect (lift + shadow)

HOW IT WORKS:
- Two tabs: "For Resellers" | "For Distributors"
- Reseller flow (3 steps):
  1. Register Deal (icon: clipboard) - "Protect your customer opportunity"
  2. Get Quotes (icon: calculator) - "Compare offers from distributors"
  3. Close & Earn (icon: trophy) - "Win deals with best pricing"
- Each step: Large number, icon, title, description, connecting line
- CTA: "Start Your First Deal" (orange button)

FEATURED DISTRIBUTORS:
- Heading: "Trusted Distributors"
- Carousel with 4 distributor cards visible:
  - Company logo (square)
  - Star rating (4.8★) + review count
  - "2,450 Products" badge
  - Specialization tags: "Enterprise Networking" "Cloud Solutions"
  - "View Profile" button
- Auto-scroll carousel with navigation dots

FEATURED PRODUCTS:
- Heading: "Trending Products"
- 6 product cards in 3x2 grid:
  - Product image (square, white background)
  - Product name (truncated)
  - Distributor name (smaller, gray)
  - Starting price: "$4,999/unit"
  - Availability badge: "In Stock" (green) or "3-5 days" (yellow)
  - "Quick View" icon (eye) + "Request Quote" button
- "View All Products →" link

TRUST SIGNALS:
- Section with light gray background
- Heading: "Why Choose Our Marketplace"
- 4 feature cards:
  1. Verified Distributors (checkmark icon) - "Every distributor is verified"
  2. Transparent Pricing (tag icon) - "Compare quotes side-by-side"
  3. Deal Protection (lock icon) - "Your deals are protected"
  4. Rated & Reviewed (star icon) - "Real ratings from real businesses"

CTA SECTIONS:
- Two side-by-side cards (50/50 split):
  Left: "Are you a Distributor?" 
  - "Reach thousands of qualified resellers"
  - "List Products →" button (blue)
  Right: "Are you a Reseller?"
  - "Find the best deals for your customers"
  - "Browse Solutions →" button (orange)

FOOTER:
- Dark background (#1a1a2e)
- 4 columns:
  1. Company: About, Careers, Blog, Press
  2. Resources: Help Center, API Docs, Partner Program, Terms
  3. Categories: (list top 6 categories)
  4. Contact: Email, Phone, Social icons
- Bottom bar: Copyright, Privacy Policy, Cookie Settings

Design specs: Clean, professional, AWS-inspired blue/orange theme, plenty of white space, subtle shadows, rounded corners (8px), smooth transitions, mobile-responsive grid

2. Category Browse Page (/categories & /categories/[slug])
Design a category browsing and filtering page:

BREADCRUMB:
- Home > Categories > Networking & Infrastructure
- Clean, gray text with > separators

PAGE HEADER:
- Category icon (large, left)
- Category name (H1): "Networking & Infrastructure"
- Description: "Discover enterprise networking equipment, routers, switches, and infrastructure solutions"
- Product count: "2,450 products available"
- View toggle: Grid view ▦ | List view ≡ (icons)

LAYOUT:
- Left sidebar (25% width): Filters
- Right main area (75% width): Products

LEFT SIDEBAR - FILTERS:
Header: "Filters" with "Clear All" link

Filter sections (collapsible accordions):

1. PRICE RANGE:
   - Slider with two handles
   - Min: $0 - Max: $100,000
   - Input fields below for manual entry

2. AVAILABILITY:
   - Checkboxes:
     ☐ In Stock (green dot)
     ☐ Ships in 3-5 days
     ☐ Ships in 1-2 weeks
     ☐ Pre-order

3. DISTRIBUTOR:
   - Search box: "Search distributors..."
   - Checkboxes with distributor names + product count:
     ☐ TechDist Global (450)
     ☐ NetSupply Corp (320)
     ☐ CloudFirst Distribution (280)
   - "Show more" link (if >5)

4. BRAND:
   - Similar to distributor
   - Cisco, Dell, HP, Juniper, etc.

5. LOCATION:
   - Country dropdown
   - City input

6. SPECIFICATIONS (dynamic per category):
   - For networking: Port count, Speed (1G/10G/40G), PoE support
   - Checkboxes/dropdowns based on spec type

7. RATING:
   - Star filter: 
     ☆☆☆☆☆ & up
     ☆☆☆☆ & up
     ☆☆☆ & up

Active filters shown at top: 
- "Price: $500-$5000 ✕" "In Stock ✕" "Cisco ✕"

MAIN AREA - TOP BAR:
- Results count: "Showing 1-24 of 2,450 products"
- Sort dropdown (right): "Sort by: Relevance | Price: Low-High | Price: High-Low | Newest | Rating"
- Items per page: 24 | 48 | 96

PRODUCT GRID (or LIST):
Grid view (4 columns):
- Product card:
  - Image (square, 1:1 ratio)
  - Wishlist icon (heart, top right)
  - Product name (2 lines max, ellipsis)
  - Distributor name (gray, smaller)
  - Star rating ★★★★☆ (4.2) + review count (45)
  - Price: "Starting at $2,499/unit" or "Request Quote"
  - Availability badge (green/yellow/red dot + text)
  - Hover: "Quick View" button overlay + "Add to Compare" checkbox
  - "Request Quote" button (full width)

List view (1 column, horizontal cards):
- Left: Product image (smaller)
- Center: 
  - Name, distributor, rating
  - Key specs (bullet points)
  - Short description (2 lines)
- Right:
  - Price (larger)
  - Availability
  - Action buttons (Quick View, Request Quote)

PAGINATION:
- Bottom of page
- ‹ Previous | 1 2 3 ... 10 | Next ›
- "Jump to page" input

COMPARISON DRAWER (if products added):
- Sticky bottom drawer
- "Comparing 3 products" with product thumbnails
- "Compare Now →" button
- "Clear all" link

Design specs: Clean grid, clear hierarchy, easy scanning, filter results update instantly, smooth animations, responsive (2 columns on tablet, 1 on mobile)

3. Product Detail Page (/products/[id])
Design a comprehensive product detail page:

BREADCRUMB:
- Home > Networking & Infrastructure > Switches > Cisco Catalyst 9300

TOP SECTION (Split layout):

LEFT (60%):
- Main product image (large, zoomable)
- Thumbnail gallery below (5-6 thumbnails, scroll if more)
- 360° view badge (if available)
- Zoom on hover

RIGHT (40%):
- Product name (H1): "Cisco Catalyst 9300 48-Port Switch"
- SKU: #CAT9300-48P
- Star rating: ★★★★★ (4.8) + "(145 reviews)" link
- Availability: "In Stock" (green badge) or "Ships in 3-5 days"

DISTRIBUTOR CARD (inline):
- "Sold by:" 
- Distributor logo (small)
- Name: "TechDist Global"
- Rating: ★★★★☆ (4.6) + "Visit Store" link
- "Verified Distributor" badge (checkmark)

PRICING:
- Large price: "$4,999.00 /unit"
- Volume pricing table:
  - 1-10 units: $4,999
  - 11-50 units: $4,750 (5% off)
  - 51+ units: $4,500 (10% off)
  - "Contact for bulk pricing" link

QUANTITY SELECTOR:
- [-] [50] [+] units
- Stock indicator: "248 available"

ACTION BUTTONS (stacked):
1. "Request Quote" (blue, primary, large)
2. "Start Deal Registration" (orange, secondary)
3. "Add to Wishlist" (outlined) + "Share" icon

KEY FEATURES (bullet points):
- ✓ 48x 1G/10G ports
- ✓ 4x 10G/25G uplinks
- ✓ PoE+ supported (740W)
- ✓ Stackable (up to 8 units)
- ✓ 3-year warranty included

TABS SECTION:

Tab navigation:
- Overview | Specifications | Support | Reviews | Related Products

TAB 1 - OVERVIEW:
- Rich text description with images
- "What's in the box" section (checklist)
- Use cases / applications
- Compatibility information

TAB 2 - SPECIFICATIONS:
- Two-column table:
  - Category headers (bold): Hardware, Performance, Power, Physical
  - Spec rows: Label | Value
  - Expandable sections for detailed specs
- "Download spec sheet" button (PDF)

TAB 3 - SUPPORT:
- Warranty information card
- Support options: Email, Phone, Chat
- Documentation downloads:
  - Quick Start Guide (PDF)
  - User Manual (PDF)
  - Driver & Firmware (ZIP)
- Video tutorials (embedded)
- FAQ accordion

TAB 4 - REVIEWS:
- Rating breakdown:
  - 5 stars: ████████ 60%
  - 4 stars: ████ 25%
  - 3 stars: ██ 10%
  - 2 stars: █ 4%
  - 1 star: 1%
- Filter: All | Verified Purchase | Most Recent
- Review cards:
  - Reviewer name + company type (Reseller/IT Manager)
  - Rating + date
  - Review title (bold)
  - Review text
  - Helpful? 👍 (45) 👎 (2)

TAB 5 - RELATED PRODUCTS:
- 4-column grid of similar products
- Same card style as category page

STICKY RIGHT SIDEBAR (on scroll):
- Price summary
- Quantity selector
- "Request Quote" button
- Availability
- "Talk to sales" chat button

BOTTOM SECTION:

DISTRIBUTOR PROFILE PREVIEW:
- "More from TechDist Global"
- Company info (short description)
- Product categories they offer
- "View all products →" button

RECENTLY VIEWED:
- Horizontal scroll of 5 products
- "Recently Viewed Products" heading

Design specs: Professional, trust-building, detailed but scannable, sticky CTA, mobile-responsive, fast image loading, accessible

4. Service Detail Page (/services/[id])
Design a service listing detail page:

Similar structure to product page but adjusted for services:

HERO SECTION:
- Service icon/illustration (left)
- Service name: "Managed Network Operations 24/7"
- Provider info (instead of distributor)
- Rating + reviews
- "Service" badge

PRICING:
- Monthly pricing: "$2,500/month"
- Annual pricing: "$27,000/year" (Save 10%)
- Pricing tiers:
  - Basic: $2,500/mo (features list)
  - Professional: $4,500/mo
  - Enterprise: Custom pricing
- "Get Custom Quote" button

SERVICE INCLUDES:
- Checkmark list of what's included
- SLA information highlighted
- Response times
- Coverage hours

TABS:
- Overview | Deliverables | Team | Case Studies | Reviews

DELIVERABLES TAB:
- Timeline of service delivery
- Milestones and checkpoints
- Expected outcomes

TEAM TAB:
- Team members (photos, roles, certifications)
- Average experience level
- Certifications held

CASE STUDIES TAB:
- Real customer success stories
- Before/after metrics
- Industry-specific examples

CTA:
- "Schedule Consultation" (primary)
- "Request Proposal" (secondary)
- "Chat with Expert" (chat icon)

Design specs: Professional, outcome-focused, trust-building, clear value proposition

🔐 AUTHENTICATION & ONBOARDING
5. Login/Register Page (/auth/login)
Design a modern authentication page (split screen):

LEFT SIDE (40%):
- Background: Gradient (blue to purple) with abstract pattern
- Large white logo
- Headline: "Welcome to the B2B Marketplace"
- Subheadline: "Connect with thousands of verified distributors and resellers"
- Feature highlights (with icons):
  ✓ Verified distributors only
  ✓ Transparent pricing
  ✓ Deal protection
  ✓ Rated & reviewed
- Testimonial card (rotating):
  - Quote: "This marketplace helped us close 30% more deals"
  - Photo + name + company
  - Star rating

RIGHT SIDE (60%):
- White background, centered form
- Toggle tabs: "Login" | "Sign Up" (active tab has underline)

LOGIN TAB:
- Heading: "Login to your account"
- Email input: "Work email address" (with @ icon)
- "Continue with Email" button (blue, full width)
- Divider: "OR"
- Social login buttons (outlined):
  - "Continue with Google" (Google icon)
  - "Continue with Microsoft" (Microsoft icon)
- "Continue as visitor" link (gray text)
- Footer: "Don't have an account? Sign up"

SIGN UP TAB:
- Heading: "Create your account"
- Organization type selector (4 cards, selectable):
  [Distributor] [Reseller] [OEM] [Individual]
  - Each card: Icon, label, short description
  - Selected card has blue border
- Email input
- Checkbox: "I agree to Terms of Service and Privacy Policy"
- "Create Account" button (blue, full width)
- Social signup options
- Footer: "Already have an account? Login"

OTP VERIFICATION MODAL (overlay):
- "Verify your email"
- "We sent a code to user@example.com"
- 6-digit code input (large boxes, auto-focus)
- "Verify" button
- "Didn't receive code? Resend" link
- Timer: "Resend in 0:45"

Design specs: Modern, clean, trust-building, accessible, responsive, smooth transitions

6. Organization Setup Wizard (/auth/org-setup)
Design a multi-step organization onboarding wizard:

PROGRESS BAR (top):
- Step indicators: 1 → 2 → 3 → 4 → 5
- Labels under each: Type | Info | Contact | Verification | Team
- Completed steps: blue checkmark
- Current step: blue circle
- Upcoming steps: gray circle
- Connecting lines between steps

STEP 1 - ORGANIZATION TYPE:
- Heading: "Tell us about your organization"
- 3 large cards (selectable):

  DISTRIBUTOR CARD:
  - Icon: warehouse/distribution
  - Title: "I'm a Distributor"
  - Description: "I supply products/services to resellers"
  - Features:
    • List your products
    • Receive quote requests
    • Manage campaigns
  - "Select" button

  RESELLER CARD:
  - Icon: handshake
  - Title: "I'm a Reseller"
  - Description: "I sell to end customers"
  - Features:
    • Register deals
    • Get quotes
    • Compare pricing
  - "Select" button

  OEM CARD:
  - Icon: factory
  - Title: "I'm an OEM"
  - Description: "I manufacture products"
  - Features:
    • Manage partner program
    • Partner directory
    • Program rules
  - "Select" button

- "Next" button (bottom right)

STEP 2 - BASIC INFORMATION:
- Form layout (2 columns where applicable):

  Organization Name*: [text input]
  Legal Business Name*: [text input]
  
  Logo Upload:
  - Dotted border square (200x200)
  - "Drag & drop logo or click to browse"
  - Accepted: PNG, JPG (max 2MB)
  - Preview thumbnail when uploaded
  
  Industry*: [dropdown]
  - IT Distribution
  - Cloud Services
  - Networking
  - etc.
  
  Company Size*: [dropdown]
  - 1-10 employees
  - 11-50 employees
  - 51-200 employees
  - 201-500 employees
  - 500+ employees
  
  Year Established*: [number input]
  
  Website: [URL input]
  
  Description*: [textarea, rich text]
  - "Tell resellers/distributors about your company"
  - Character counter: 0/500

- "Back" | "Save & Continue" buttons

STEP 3 - CONTACT DETAILS:
- Form with map integration:

  Headquarters Address*:
  - Country: [dropdown with flags]
  - Street Address: [text]
  - City: [text]
  - State/Province: [text]
  - Postal Code: [text]
  - Map preview showing location pin

  Contact Information:
  - Phone*: [phone input with country code]
  - Alt Phone: [phone input]
  - Support Email*: [email]
  - Sales Email*: [email]

  Business Hours:
  - Checkboxes for days
  - Time pickers for each day
  - "Same hours every day" checkbox

  Social Media (optional):
  - LinkedIn: [URL input]
  - Twitter: [URL input]
  - Facebook: [URL input]

- "Back" | "Save & Continue"

STEP 4 - VERIFICATION DOCUMENTS:
- Heading: "Verify your organization"
- Subheading: "Upload documents to verify your business (encrypted & secure)"

  Document Upload Cards:

  BUSINESS LICENSE*:
  - Upload area (drag & drop)
  - "Business registration or trade license"
  - File name shown when uploaded
  - "Remove" option
  - Status: "Pending review" (after upload)

  TAX ID / VAT*:
  - Similar upload area
  - "Tax identification number certificate"

  BANK REFERENCE (optional):
  - Upload area
  - "Bank reference letter"

  ADDITIONAL DOCUMENTS:
  - "+Add more documents" button
  - Optional supporting documents

  Security note:
  - 🔒 "All documents are encrypted and reviewed by our team within 24 hours"

- Verification timeline:
  1. Upload documents → 2. Under review → 3. Approved
  - Current step highlighted

- "Back" | "Submit for Review"

STEP 5 - INVITE TEAM:
- Heading: "Invite your team members"
- Subheading: "Add team members who will manage your organization"

  Team Member Form:
  - Email*: [email input]
  - Role*: [dropdown]
    - For Distributors: Admin, Sales Manager, Product Manager, Support
    - For Resellers: Admin, Sales Rep, Presales Engineer, Account Manager
  - "Add Member" button

  Invited Members Table:
  - Columns: Email | Role | Status | Actions
  - Status: Pending (send invite) | Invited | Accepted
  - Actions: Edit | Remove icons

  Bulk Invite:
  - "Import from CSV" button
  - CSV template download link

  Permissions Preview (for selected role):
  - Checkbox list showing what this role can do
  - "Customize permissions" link

- "Skip for now" | "Send Invitations & Complete"

COMPLETION SCREEN:
- Success animation (checkmark)
- "Welcome to the marketplace!"
- Next steps checklist:
  ☐ Complete your profile
  ☐ Add your first product/service (distributors)
  ☐ Browse distributors (resellers)
  ☐ Set up payment methods
  ☐ Complete verification (if pending)
- "Go to Dashboard" button (large, blue)

SIDE PANEL (right side, all steps):
- "Need help?" card
  - Chat support icon
  - "Chat with us"
  - "View setup guide" link
  - "Schedule onboarding call"

- Progress checklist:
  ✓ Account created
  ⚬ Organization type
  ⚬ Basic information
  ⚬ Contact details
  ⚬ Verification
  ⚬ Team setup

Design specs: Clean wizard, clear progress, helpful hints, validation feedback, mobile-friendly, auto-save drafts, skip options where appropriate

📊 DISTRIBUTOR PAGES
7. Distributor Dashboard (/distributor/dashboard)
Design a comprehensive distributor dashboard:

TOP BAR:
- Organization name + logo (left)
- Notification bell icon (badge with count)
- User avatar + dropdown (right)

SIDEBAR NAVIGATION (left, collapsible):
- Dashboard (home icon) ← active
- Products (box icon) + badge "245"
- Campaigns (megaphone icon)
- Engagement Requests (handshake icon) + badge "12"
- Quotes (document icon) + badge "8"
- Credit Requests (credit card icon) + badge "3"
- Inventory (warehouse icon)
- Analytics (chart icon)
- Settings (gear icon)
- Collapse/expand button

MAIN CONTENT AREA:

WELCOME SECTION:
- "Good morning, TechDist Global 👋"
- Quick date/time
- "Verification Status: ✓ Verified" badge (green)

KPI CARDS (4 cards, equal width):

1. TOTAL PRODUCTS:
   - Large number: "2,450"
   - Label: "Active Products"
   - Trend: "↑ 12 added this week" (green)
   - Icon: package box

2. ACTIVE CAMPAIGNS:
   - Number: "8"
   - Label: "Running Campaigns"
   - Metric: "1,240 views this month"
   - Icon: megaphone

3. PENDING QUOTES:
   - Number: "24"
   - Label: "Quote Requests"
   - Alert: "8 expiring soon" (orange)
   - Icon: document

4. THIS MONTH REVENUE:
   - Number: "$485,000"
   - Label: "Revenue (MTD)"
   - Trend: "↑ 18% vs last month" (green)
   - Icon: dollar sign

QUICK ACTIONS (horizontal buttons):
- "+ Add Product"
- "Create Campaign"
- "View Pending Quotes"
- "Invite Resellers"

CHARTS SECTION (2 columns):

LEFT COLUMN (66%):
  
  REVENUE CHART:
  - Title: "Revenue Overview"
  - Tab toggle: 7 Days | 30 Days | 90 Days | 12 Months
  - Line/area chart showing revenue trend
  - Y-axis: Revenue ($)
  - X-axis: Time
  - Hover tooltip with exact values
  - Legend: This year | Last year (comparison)
  - Download icon (export data)

  DEAL PIPELINE:
  - Title: "Deal Pipeline by Stage"
  - Horizontal bar chart:
    - Engaged: 45 deals ($450K)
    - Quoted: 24 deals ($380K)
    - Negotiation: 12 deals ($180K)
    - Won: 8 deals ($120K)
    - Lost: 6 deals
  - Click to view details

RIGHT COLUMN (33%):
  
  TOP PRODUCTS:
  - Title: "Best Sellers This Month"
  - List of 5 products:
    1. Product thumbnail + name
       Sales: 145 units | $72K
    2. [repeat for top 5]
  - "View all products →" link

  CATEGORY BREAKDOWN:
  - Title: "Sales by Category"
  - Donut chart with categories:
    - Networking: 45%
    - Storage: 25%
    - Security: 20%
    - Software: 10%
  - Legend with percentages

ACTIVITY FEED:
- Title: "Recent Activity" with "View All" link
- Timeline-style feed (last 10 items):
  
  Each item:
  - Icon (color-coded by type)
  - Activity text: "New engagement request from **Reseller Co**"
  - Product/deal context
  - Timestamp: "2 hours ago"
  - Quick action button if applicable

  Activity types:
  - 🤝 New engagement request (blue)
  - 📋 Quote submitted (green)
  - 🏆 Deal won (gold)
  - ❌ Deal lost (red)
  - 📦 Low inventory alert (orange)
  - ⭐ New review received (yellow)
  - 👥 New reseller followed you (blue)

ENGAGEMENT REQUESTS PREVIEW:
- Title: "Pending Engagement Requests" with count badge
- Table preview (5 rows):
  
  Columns:
  - Reseller (logo + name)
  - Deal Value (estimated)
  - Products (count + icons)
  - Requested (time ago)
  - Actions (Accept/Decline buttons)
  
- "View All Requests →" link

NOTIFICATIONS PANEL (right sidebar, collapsible):
- Title: "Notifications" with "Mark all read"
- Grouped notifications:
  
  TODAY:
  - Notification items (icon, text, time)
  - Click to view details
  - Unread: blue dot
  
  YESTERDAY:
  - [similar format]
  
  OLDER:
  - [similar format]

- "View all notifications" link

HELP WIDGET (bottom right, floating):
- Chat bubble icon
- "Need help?" tooltip
- Click to open chatbot

Design specs: Information-dense but organized, scannable, actionable, real-time updates, smooth animations, color-coded alerts, mobile-responsive (stack on small screens)

8. Product Management (/distributor/products)
Design a product inventory management page:

PAGE HEADER:
- Heading: "Product Management"
- Right side:
  - "Import CSV" button (outlined)
  - "Export Products" button (outlined)
  - "+ Add New Product" button (blue, prominent)

FILTERS & SEARCH BAR:
- Search box: "Search by name, SKU, or category..." (with search icon)
- Filter dropdown buttons:
  - Category: All Categories ▼
  - Status: All Status ▼ (Active, Draft, Out of Stock, Archived)
  - Inventory: All ▼ (In Stock, Low Stock, Out of Stock)
- Active filter pills shown below:
  "Category: Networking ✕" "Status: Active ✕"
- "Clear all filters" link

VIEW OPTIONS:
- Toggle: Table view | Grid view
- Items per page: 25 | 50 | 100

BULK ACTIONS (when items selected):
- Floating action bar appears
- "12 items selected"
- Actions: Bulk Edit | Change Status | Duplicate | Delete | Export
- "Deselect all" link

PRODUCT TABLE:

Header row (with sorting):
- ☐ Checkbox (select all)
- Image (small icon)
- Product Name ↕ (sortable)
- SKU ↕
- Category ↕
- Price ↕
- Inventory ↕
- Status ↕
- Views (last 30d) ↕
- Actions

Data rows (striped for readability):
- ☐ Checkbox
- Product thumbnail (50x50)
- Product name (clickable, opens detail)
  SKU below in gray text
- Category badge
- Price: "$4,999" + "Edit" icon (inline edit)
- Inventory: "248 units" 
  Low stock warning: "⚠️ Low (< 50)" if applicable
- Status badge:
  - Active (green)
  - Draft (gray)
  - Out of Stock (red)
  - Archived (dark gray)
  Toggle switch for Active/Inactive
- Views: "1,245"
- Actions dropdown (3 dots):
  - Quick Edit
  - View Details
  - Duplicate
  - Archive
  - Delete

GRID VIEW (alternative):
- Product cards (4 columns):
  - Product image (top)
  - Name (truncated)
  - SKU
  - Price + inventory
  - Status badge
  - Quick actions: Edit | Duplicate | Delete icons
  - Click anywhere to open detail

PAGINATION:
- Bottom of table
- Showing 1-25 of 2,450 products
- ‹ Previous | 1 2 3 ... 98 | Next ›
- Jump to page input

EMPTY STATE (if no products):
- Illustration (empty box)
- "No products yet"
- "Add your first product to start selling"
- "Add Product" button
- "Import from CSV" option

INLINE EDITING:
- Click price field → input appears
- Enter new price → checkmark to save
- Real-time validation
- Success toast notification

LOW STOCK ALERTS:
- Top banner (if any low stock items):
  "⚠️ You have 8 products with low inventory. Review now"
  "View Low Stock Items" button

PRODUCT ANALYTICS WIDGET (right sidebar):
- "Product Performance"
- Chart showing total views/sales over time
- Top 5 viewed products
- Top 5 sold products

Design specs: Data-dense table, efficient bulk actions, inline editing, clear status indicators, fast search/filter, responsive (horizontal scroll on mobile)

9. Add/Edit Product (/distributor/products/new & /products/[id]/edit)
Design a comprehensive product creation/editing form:

HEADER:
- Breadcrumb: Products > Add New Product
- Page title: "Add New Product" or "Edit: [Product Name]"
- Right side:
  - "Save as Draft" button (outlined)
  - "Publish Product" button (blue)
  - Last saved: "Auto-saved 2 minutes ago" (gray text)

PROGRESS INDICATOR (if step-by-step):
- Basic Info → Pricing → Inventory → Media → SEO
- Or single-page with sections

LAYOUT:
- Main form (70% width, left)
- Preview card (30% width, right, sticky)

MAIN FORM SECTIONS:

1. BASIC INFORMATION:
   Section header with icon

   Product Name*:
   - Text input
   - Character counter: 0/100
   - Validation: Real-time check for duplicates
   - Helper text: "Use a clear, descriptive name"

   SKU*Continue01:49:

Text input
"Auto-generate" button
Validation: Must be unique
Format: "CAT9300-48P"

Category*:

Searchable dropdown (hierarchical)
Networking > Switches > Enterprise
"Can't find category? Request new" link

Brand:

Searchable dropdown
Auto-suggest as you type
"+Add new brand" option

Product Description*:

Rich text editor (bold, italic, lists, links)
Toolbar: B I U • List Link Image
Character counter: 0/5000
Preview mode toggle
Helper: "Describe features, benefits, use cases"

Short Description:

Textarea (plain text)
0/200 characters
"Used in product cards and search results"


PRICING:
Section header
Base Price*:

Currency selector: USD ▼
Price input: $ [____]
"per unit" label

Volume Pricing (optional):

"+ Add pricing tier" button
Tier rows:
Min Quantity: [10] units
Max Quantity: [49] units (or "No limit")
Price: $ [4,750]
Discount: [5]%
Remove icon
Can add multiple tiers
Visual preview: Tier chart

Price Visibility:

Radio buttons:
○ Show price publicly
○ "Request Quote" only (hide price)

Tax/VAT:

Checkbox: "Price includes tax"
Tax rate: [15]%


INVENTORY:
Section header
Stock Tracking:

Toggle: Track inventory ⚪
If enabled:
Available Quantity*:

Number input
Unit label
Warning if < 50: "Low stock threshold"

Low Stock Alert:

"Alert me when stock falls below [20] units"
Checkbox: "Show 'low stock' badge on listing"

Stock Locations (if multi-warehouse):

"+ Add location" button
Location rows:
Warehouse: [dropdown]
Quantity: [number]
Remove

Lead Time:

"In Stock" badge or
"Ships in [3-5] business days"

Restocking:

Expected restock date: [date picker]
"Notify customers when available" checkbox



Availability Status:

Radio buttons:
○ In Stock
○ Limited Stock
○ Out of Stock
○ Pre-order
○ Discontinued


SPECIFICATIONS:
Section header: "Technical Specifications"
Specification Groups:

Accordion sections (Hardware, Performance, Physical, etc.)

Within each group:

"+ Add specification" button
Spec rows:
Label: [text input] e.g., "Port Count"
Value: [text input] e.g., "48"
Unit: [dropdown] e.g., "ports"
Remove icon

Common specs auto-suggest based on category
Import specs:

"Import from template" button
"Import from datasheet" (AI parse - optional)


MEDIA:
Section header: "Product Images & Videos"
Primary Image*:

Large upload box (drag & drop)
"This will be the main product image"
Aspect ratio: 1:1 (square)
Max size: 5MB
Accepted: JPG, PNG
Image editor: Crop, rotate

Additional Images:

Gallery grid (up to 10 images)
Drag to reorder
Each image:

Thumbnail
"Set as primary" button
Remove icon


"+ Add more images" button

360° View (optional):

Upload 360 image sequence
Or link to 360 viewer

Videos (optional):

YouTube/Vimeo URL input
Or upload video file
Thumbnail preview
"+ Add video" (up to 3)

Documents:

Datasheet upload (.PDF)
User manual (.PDF)
Quick start guide (.PDF)
"+ Add document" button


SEO & VISIBILITY:
Section header
SEO Title:

Text input
Character counter (60 recommended)
Preview: How it appears in search

SEO Description:

Textarea
160 characters recommended
Search preview below

URL Slug:

Auto-generated from product name
Editable
Format: cisco-catalyst-9300-48-port
Validation: No special characters

Search Keywords:

Tag input (add multiple)
"switch, cisco, networking, catalyst"
Auto-suggest popular keywords

Visibility Settings:

Radio buttons:
○ Public (visible to all)
○ Campaign Only (only in targeted campaigns)
○ Private (requires link)

Featured Product:

Checkbox: "Feature on homepage"


SHIPPING & LOGISTICS (optional):
Section header
Weight: [____] kg
Dimensions: L [] × W [] × H [__] cm
Shipping Methods:

Checkboxes:
☐ Standard Shipping
☐ Express Shipping
☐ Freight
☐ Pickup Available

Shipping Restrictions:

"Cannot ship to certain regions"
Region selector


RELATED PRODUCTS:
Section header

Search to add related products
Selected products shown as pills
"Customers who bought this also viewed..."



PREVIEW CARD (right sidebar, sticky):

"Live Preview"
Shows how product card will appear:

Product image
Name
Price
Availability
"Request Quote" button


Updates in real-time as form is filled

BOTTOM ACTION BAR (sticky):

"Cancel" button
"Save as Draft" button (outlined)
"Publish Product" button (blue, primary)
Validation errors shown here if any

VALIDATION:

Real-time field validation
Required fields marked with *
Error messages below fields (red text)
Cannot publish until all required fields valid
Success message after save/publish

AUTOSAVE:

Saves draft every 30 seconds
"Saving..." indicator
"Last saved" timestamp

Design specs: Clean form, clear sections, helpful hints, visual preview, validation feedback, mobile-responsive, accessibility (proper labels, keyboard nav)

---

### **10. Campaign Management (`/distributor/campaigns`)**
Design a campaign management and creation interface:
PAGE HEADER:

Heading: "Campaigns"
"+ Create Campaign" button (blue)

CAMPAIGN TABS:

Active (12) | Scheduled (5) | Ended (48) | All

CAMPAIGN LIST:
Each campaign card (horizontal):

Left section (campaign info):

Campaign name (H3): "Q1 Networking Promo"
Status badge: "Active" (green pulse animation)
Date range: "Jan 15 - Mar 31, 2026"
Target audience: "250 qualified resellers"
Products: "12 products" with thumbnail stack


Middle section (metrics):

Views: 1,240 👁️
Engagements: 45 🤝
Quotes: 12 📋
Conversions: 5 💰
Progress bar: "20% to goal"


Right section (actions):

"View Analytics" button
"Edit Campaign" button
More menu (⋮):

Duplicate
Pause/Resume
End Campaign
Delete





EMPTY STATE (if no campaigns):

Illustration (megaphone)
"Create your first campaign"
"Target qualified resellers with special offers"
"Create Campaign" button
"Watch tutorial" link

CREATE CAMPAIGN BUTTON → Opens wizard modal/page:
CAMPAIGN CREATION WIZARD:
Step indicator:

Details → 2. Audience → 3. Products → 4. Incentives → 5. Review

STEP 1 - CAMPAIGN DETAILS:
Campaign Name*:

Text input
"Q1 Networking Promotion"

Campaign Description:

Textarea/rich text
"Describe your campaign goals and offers"

Campaign Type:

Radio buttons:
○ Product Promotion
○ New Product Launch
○ Seasonal Sale
○ Clearance
○ Partner Exclusive

Date Range*:

Start date: [date picker]
End date: [date picker]
Or "No end date" checkbox

Campaign Goals (optional):

Target revenue: $ [____]
Target engagements: [____]
Target conversions: [____]

Banner Image:

Upload campaign banner
Used in campaign page
Recommended size: 1200x400

"Next" button
STEP 2 - TARGET AUDIENCE:
Heading: "Who should see this campaign?"
Targeting options:
A. ALL RESELLERS:

Radio: ○ Make this campaign public to all resellers

B. QUALIFIED RESELLERS ONLY:

Radio: ○ Target specific reseller qualifications

If selected, show filters:
Annual Revenue:

Checkboxes:
☐ < $1M
☐ $1M - $5M
☐ $5M - $10M
☐ $10M+

Certifications:

Multi-select dropdown:
Cisco Certified
Dell Partner
AWS Partner
Microsoft Gold

Geographic Location:

Country selector
State/Province selector
City input

Industry Focus:

Checkboxes:
☐ Healthcare
☐ Finance
☐ Education
☐ Government
☐ Retail

Company Size:

Checkboxes for employee count ranges

Past Performance:

☐ Has completed deals with us
☐ Rating ≥ 4 stars
☐ Active in last 90 days

Estimated Reach:

Live counter: "~250 resellers match these criteria"
"Preview audience" link

C. SPECIFIC RESELLERS:

Radio: ○ Invite specific resellers only
Search and select resellers
Upload CSV of reseller emails

"Back" | "Next"
STEP 3 - SELECT PRODUCTS:
Heading: "Choose products for this campaign"
Product selection interface:

Search bar: "Search your products..."
Filter by category
Product grid (checkbox on each):

Product image
Name
Current price
Stock status
Checkbox to include


"Select All" | "Deselect All"

Selected products panel (right):

"12 products selected"
List of selected products
Remove option for each
Total value shown

"Back" | "Next"
STEP 4 - INCENTIVES & OFFERS:
Heading: "Set special pricing or terms"
Incentive type:

Radio buttons:
○ Special Pricing
○ Volume Discounts
○ Extended Payment Terms
○ Free Shipping
○ Bundle Deals
○ Custom Offer

If "Special Pricing" selected:
Discount Method:

○ Percentage discount: [15]%
○ Fixed amount discount: $ [500]
○ Fixed price: $ [4,500]

Apply to:

○ All selected products
○ Individual product pricing (table shown)

Volume Tiers (optional):

Similar to product volume pricing
Applies across all campaign products

Additional Incentives:

Checkboxes:
☐ Free shipping over $X
☐ Extended warranty included
☐ Free installation support
☐ Priority support

Payment Terms:

Net 30 / Net 60 / Net 90
Early payment discount

Campaign Message:

Rich text editor
"Special message to resellers"
This appears on campaign page

"Back" | "Next"
STEP 5 - REVIEW & LAUNCH:
Summary view (all info from previous steps):
CAMPAIGN DETAILS:

Name: Q1 Networking Promotion
Duration: Jan 15 - Mar 31, 2026
Type: Product Promotion
Edit button for each section

TARGET AUDIENCE:

Qualified resellers only
Criteria summary
Estimated reach: 250 resellers
Edit

PRODUCTS:

12 products selected
Product thumbnail stack
Total value: $85,000
Edit

INCENTIVES:

15% discount on all products
Free shipping over $5,000
Extended payment: Net 60
Edit

LAUNCH OPTIONS:

Radio:
○ Launch immediately
○ Schedule for later: [date/time picker]

Notification:

☐ Send email notification to targeted resellers
Email preview: "View email template"

"Back" | "Save as Draft" | "Launch Campaign"
LAUNCHED CONFIRMATION:

Success animation
"Campaign launched successfully!"
"250 resellers will be notified"
"Go to Campaign Dashboard"

Design specs: Wizard-style, clear steps, live previews, audience estimator, easy editing, mobile-responsive

---

### **11. Engagement Requests (`/distributor/engagements`)**
Design an engagement request management page:
PAGE HEADER:

Heading: "Engagement Requests"
Filter tabs: Pending (12) | Accepted (45) | Declined (8) | All

FILTERS & SEARCH:

Search: "Search by reseller name or deal..."
Filter dropdowns:

Date range
Deal value range
Product category



REQUEST LIST:
Each request card (vertical cards in grid, 3 columns):
CARD LAYOUT:

Top banner: Status indicator

Pending: Orange left border
Accepted: Green
Declined: Red



Header section:

Reseller logo (left, circular)
Company name: "ABC Resellers Inc."
Rating: ★★★★☆ (4.5) + review count
Verification badge if verified
Time: "Requested 2 hours ago"

Deal Information:

Deal title: "Enterprise Network Upgrade - XYZ Corp"
Estimated value: "$125,000"
Close date: "Expected: Mar 15, 2026"
Customer: "XYZ Corporation"

Industry: Healthcare
Size: 500+ employees



Products Requested:

Thumbnail stack (first 3 products)
"+5 more products" if more
Click to expand full list
Categories: "Networking, Security, Storage"

Reseller Details (expandable):

Click "View Reseller Profile"
Slides out drawer showing:

Full company profile
Past deals with you
Overall rating
Certifications
Team members
Recent activity



Effort Signals (visual indicators):

🎯 Deal registered: ✓ (shows commitment)
📄 BOQ uploaded: ✓ (detailed requirements)
⏱️ Time invested: "Active for 15 days"
🤝 Customer verified: ✓ (email confirmed)
Effort score: "High" badge (green)

Messages/Notes:

Text from reseller:
"Looking for best pricing on Cisco Catalyst switches for healthcare client. Need quote by Jan 20."
Attachment icon if files attached

Action Buttons (for Pending):

"Accept & Quote" (blue, primary)

Opens quote submission


"Decline" (outlined, gray)

Opens decline reason modal


"Request More Info" (outlined)

Opens message composer



If Accepted:

"Submitted Quote" status
"View Quote" button
Quote amount shown
"Update Quote" option

If Declined:

"Declined" status
Reason shown (if provided)
"Reconsider" button

DETAIL VIEW (click on card):
Opens modal or full page with:
LEFT PANEL (60%):

Full deal details
Complete product list
BOQ (if uploaded) - view/download
Customer information
Timeline of interactions
Message thread with reseller

RIGHT PANEL (40%):

Reseller profile card
Related past deals
Quick stats
Action buttons
Notes section (internal, private)

ACCEPT & QUOTE FLOW:
When "Accept & Quote" clicked:
Modal/page opens:

Acknowledge acceptance

"You're accepting this engagement request"
Reseller will be notified


Prepare quote

Product list with your pricing
Editable price table
Volume discounts
Payment terms
Delivery timeline
Validity period


Add message

Text editor
"Add personal message to reseller"


Submit quote

"Accept & Submit Quote" button



DECLINE FLOW:
When "Decline" clicked:
Modal opens:

"Decline Engagement Request"
Reason dropdown:
○ Products not available
○ Cannot meet timeline
○ Deal value too low
○ Region not covered
○ Other (specify)
Optional message to reseller
"Professional decline" suggestions
"Confirm Decline" button

BULK ACTIONS:

Checkbox selection
"Accept Selected" | "Decline Selected"
Batch operations

NOTIFICATION SETTINGS:

Gear icon (top right)
"How do you want to be notified?"

Email: Immediately / Daily digest / Off
Push: On / Off
SMS: On / Off



ANALYTICS SIDEBAR:

"Engagement Stats"
Acceptance rate: 85%
Average response time: 2.5 hours
Conversion rate: 35%
Charts showing trends

EMPTY STATE (no pending requests):

Illustration
"No pending engagement requests"
"Check back later or promote your products"
"Create Campaign" button

Design specs: Card-based, scannable, clear status, quick actions, detailed drill-down, mobile-responsive, real-time updates

---

### **12. Quote Management (`/distributor/quotes`)**
Design a quote submission and management interface:
PAGE HEADER:

Heading: "Quotes"
Tabs: To Submit (8) | Submitted (24) | Won (12) | Lost (6) | All

FILTERS:

Search: "Search by customer, reseller, or deal..."
Filters:

Date range
Quote value range
Status
Product category


Sort: Newest | Oldest | Value: High-Low | Expiring Soon

QUOTE LIST:
List/table view (switchable):
TABLE COLUMNS:

Quote ID (clickable)
Customer / Deal Name
Reseller
Quote Value
Status
Submitted Date
Expires In
Actions

QUOTE CARD VIEW (alternative):
Each card shows:

Header:

Quote #Q-2024-1234
Status badge (color-coded):

To Submit: Orange
Submitted: Blue
Under Review: Yellow
Won: Green
Lost: Red
Expired: Gray




Deal info:

Customer: "XYZ Corporation"
Reseller: "ABC Resellers" + logo
Deal value: "$125,000"


Quote details:

Your quote: "$118,500" (5% discount highlight)
Products: 15 line items
Validity: "Valid until Feb 15" or "Expires in 5 days" (urgent: red)


Comparison (if visible):

"You're competing with 3 other distributors"
Your rank: "2nd lowest price" or "Best price" (green badge)
Price difference: "-$2,500 vs average"


Actions:

"View Details"
"Edit Quote" (if not submitted)
"Update Quote" (if allowed)
"Withdraw"



QUOTE DETAIL PAGE:
Click on quote → full page view
TOP SECTION:

Breadcrumb: Quotes > Q-2024-1234
Quote header:

Quote number + status badge
Created: date
Last updated: date
Expires: date + countdown


Customer information card:

Company name
Contact person
Email, phone
Industry, size
Location


Reseller information card:

Company name + logo
Rating
Past deals with you
"Contact Reseller" button



TABS:

Line Items | Terms | Documents | Activity | Messages

TAB 1 - LINE ITEMS:
Spreadsheet-style table:
Columns:


(row number)

Product/SKU
Description
Reseller Requested Qty
Your Stock
Unit Price
Discount %
Subtotal
Actions

Features:

Editable cells (if quote not submitted)
Bulk discount apply
Add/remove line items
Import from template
Auto-calculate totals

Summary section (right):

Subtotal: $115,000
Discount: -$3,500 (3%)
Tax (15%): $16,725
Shipping: $1,000
TOTAL: $129,225

Volume discount bands (if applicable):

Shows automatic discounts at different qty
Visual tier chart

TAB 2 - TERMS & CONDITIONS:
Payment Terms:

Net days: [dropdown] 30/60/90
Payment method: Bank transfer / Credit / LC
Early payment discount: [input]% if paid within [input] days

Delivery Terms:

Estimated delivery: [date picker]
Delivery method: Standard / Express / Freight
Shipping location: [address]
Incoterms: EXW / FOB / CIF / etc.

Warranty & Support:

Warranty period: [dropdown]
Support level: Basic / Premium / Enterprise
SLA included: [checkbox]

Special Conditions:

Rich text editor
Pre-filled templates
Common clauses library

Validity:

Quote valid until: [date picker]
Auto-extend: [checkbox]

TAB 3 - DOCUMENTS:
Attachments:

Quote PDF (auto-generated)

Download
Preview
Send to reseller


Supporting documents:

Product datasheets
Compliance certificates
Case studies
Reference letters


Upload additional files:

Drag & drop area
File type restrictions
Size limit



TAB 4 - ACTIVITY:
Timeline view:

Quote created (timestamp, user)
Line items added
Price updated
Quote submitted
Reseller viewed quote (timestamp)
Competitor quotes submitted (count)
Quote won/lost (if closed)

Each event:

Icon (color-coded)
Description
User/actor
Timestamp
Details (expandable)

TAB 5 - MESSAGES:
Chat thread with reseller:

Message history
New message composer
Attach files
Real-time updates
Read receipts
Typing indicators

Quick replies:

Template responses
"Request more time"
"Clarify requirements"
"Update pricing"

ACTION PANEL (sticky right):
For "To Submit" quotes:

"Submit Quote" (blue, large)
"Save Draft"
"Preview Quote"
"Delete Draft"

For "Submitted" quotes:

"Update Quote" (if allowed)
"Withdraw Quote"
"Download PDF"
"Send Reminder"

For "Won" quotes:

"Generate Invoice"
"View Order"
"Leave Rating"

For "Lost" quotes:

"View Feedback"
"Request Feedback" (if none)
"Archive"

COMPARISON VIEW (if multiple quotes):

"Compare with Other Quotes" button
Side-by-side table:

Your quote | Competitor A | Competitor B
Line items comparison
Price differences highlighted
Terms comparison
Your advantages/disadvantages



NOTIFICATIONS:

Real-time alerts:

Reseller viewed your quote
New message from reseller
Quote about to expire
Status changed
You won/lost the quote



QUOTE TEMPLATES:

"Save as Template" option
Load from template library
Quick quote generation

ANALYTICS WIDGET:

Your quote statistics:

Win rate: 35%
Average response time
Price competitiveness
Improvement suggestions



Design specs: Professional, data-dense, clear pricing, comparison-friendly, real-time collaboration, audit trail, mobile-responsive

---

## 🏪 **RESELLER PAGES**

### **13. Reseller Dashboard (`/reseller/dashboard`)**
Design a reseller-focused dashboard with sales pipeline:
TOP BAR:

Organization name + logo
"Deal Pipeline Value: $2.5M" (prominent)
Notifications
User menu

SIDEBAR:

Dashboard
My Deals + badge "24"
Browse Products
Register Deal (prominent, blue)
Upload BOQ
Quotes Received + badge "12"
Services & Capabilities
Settings

MAIN AREA:
KPI CARDS (4 cards):

ACTIVE DEALS:

Number: "24"
Label: "Deals in Pipeline"
Trend: "↑ 6 new this month"
Icon: handshake


QUOTES RECEIVED:

Number: "12"
Label: "Pending Quotes"
Alert: "3 expiring soon"
Icon: document


DEALS WON (THIS MONTH):

Number: "5"
Label: "Deals Closed"
Value: "$425K"
Icon: trophy


WIN RATE:

Percentage: "38%"
Label: "Win Rate (90d)"
Trend: "↑ 5% vs last quarter"
Icon: target



QUICK ACTIONS:

"+ Register New Deal"
"Upload BOQ"
"Browse Distributors"
"View Pending Quotes"

DEAL PIPELINE (KANBAN BOARD):
Heading: "Deal Pipeline" with filter dropdown (All / This Month / This Quarter)
Columns (drag & drop):

PROSPECTING (8):

New opportunities
Not yet registered


REGISTERED (12):

Deal registered
Customer verified
Engaging distributors


QUOTED (7):

Received quotes
Comparing options


NEGOTIATING (4):

In discussion
Finalizing terms


WON (3):

Deal closed
Awaiting delivery


LOST (2):

Did not win
Feedback logged



Each column:

Header with count + total value
"+ Add deal" button
Cards (vertical scrollable)

Deal cards in columns:

Customer name (bold)
Deal title
Value: "$125,000"
Close date: "Mar 15, 2026" (red if overdue)
Products icon stack (3 thumbnails)
Distributor count: "3 engaged"
Status indicators:

📄 BOQ uploaded
💬 3 quotes received
⭐ Best quote: $118K


Urgency badge (if close date near)
Click to view details
Drag handle

Pipeline value by stage shown at top:

Bar chart showing value distribution

ACTIVITY FEED:

"Recent Activity"
Timeline of events:

New quote received
Distributor accepted engagement
Deal moved to Won
New review received
Quote expiring soon alert


"View All" link

QUOTES TO REVIEW:

"Quotes Awaiting Review"
Card list (3 most recent):

Deal name
Distributor name + logo
Quote amount
Received: time ago
Expires: countdown
"View Quote" button


"See All Quotes →"

PERFORMANCE METRICS:

"This Quarter Performance"
Charts:

Monthly deal closure trend
Win/loss breakdown (pie)
Average deal size
Average time to close
Top distributors worked with



CALENDAR WIDGET:

"Upcoming Deadlines"
List of:

Quote expiration dates
Customer follow-ups
Demo schedules
Deal close dates


Calendar view toggle

DISTRIBUTOR RECOMMENDATIONS:

"Recommended Distributors"
Based on your recent deals
3 distributor cards
"Match score" indicator
"Connect" button

NOTIFICATIONS PANEL:

Right sidebar (collapsible)
Categorized notifications
Action buttons in notifications

Design specs: Sales-focused, pipeline visualization, drag & drop, real-time updates, actionable insights, mobile-responsive

---

### **14. Deal Registration (`/reseller/deals/register`)**
Design a deal registration wizard with verification:
PROGRESS INDICATOR:

Step 1: Customer → 2: Deal → 3: Declaration → 4: Distributors
Current step highlighted

STEP 1 - CUSTOMER INFORMATION:
Heading: "Tell us about your customer"
Customer Company Information:

Company Name*: [text input]

Auto-suggest from company database
"New customer" vs "Existing customer" toggle


Industry*: [dropdown]

Healthcare
Finance
Education
Manufacturing
Retail
Government
etc.


Company Size*: [dropdown]

1-50 employees
51-200 employees
201-500 employees
500-1000 employees
1000+ employees


Location*:

Country: [dropdown with flags]
State/Province: [dropdown]
City: [text input]



Customer Contact Person:

Full Name*: [text input]
Job Title*: [text input]
Email Address*: [email input]

"This email will receive a verification code"
Info icon: "We'll verify this is a real customer"


Phone Number: [phone input with country code]

CUSTOMER EMAIL VERIFICATION:
When email entered, "Send Verification Code" button appears
Verification flow:

Click "Send Verification Code"
Email sent to customer
Customer receives:
"ABC Resellers is registering a deal with us. Please confirm by entering this code: 123456"
Input field appears: "Enter verification code received by customer"
6-digit code input boxes
"Verify" button
Success: ✓ "Customer verified" (green checkmark)
Timer: "Code expires in 10:00"
"Resend code" link

Customer Relationship:

Radio buttons:
○ New customer (first deal)
○ Existing customer
If existing:

"How long have you worked with them?" [dropdown]
"Previous deals completed:" [number]



"Next" button (enabled only after email verified)
STEP 2 - DEAL DETAILS:
Heading: "Describe the opportunity"
Opportunity Information:

Deal Name*: [text input]

"e.g., Network Infrastructure Upgrade - ABC Corp"
Helper text: "Use a descriptive name"


Opportunity Description*: [textarea]

"Describe the customer's needs and requirements"
Rich text editor
0/1000 characters


Estimated Deal Value*: [currency input]

Currency: [USD ▼]
Amount: $ [______]
Range selector (optional): $X - $Y


Expected Close Date*: [date picker]

Calendar widget
"Not sure? Estimate" helper


Deal Stage*: [dropdown]

Prospect (early stage)
Qualified (needs confirmed)
Proposal (preparing solution)
Negotiation (discussing terms)



Project Timeline:

Project Start Date: [date picker]
Implementation Duration: [number] weeks/months
Critical deadline: [date picker] (if any)

Products/Services Needed:

Search bar: "Search products or services..."
Continue01:53
Category browser
Selected items list:

Product name
Estimated quantity
Remove option


"+ Add more products" button

Special Requirements:

Checkbox options:
☐ Urgent delivery required
☐ Special financing needed
☐ Installation required
☐ Training required
☐ Custom configuration
☐ Other: [text input]

Attachments (optional):

Upload BOQ (Bill of Quantities)

Drag & drop or click
Excel, CSV, PDF accepted
"Upload BOQ" button (prominent)
If uploaded: ✓ "BOQ attached" with file name


Supporting documents:

Customer RFP
Technical requirements
Budget approval
"+ Add document"



"Back" | "Next"
STEP 3 - RESELLER DECLARATION:
Heading: "Confirm your commitment"
⚠️ Important Notice Box:
"Deal registration protects your opportunity. Once registered and verified, this customer is locked to you for this specific opportunity."
Declarations (checkboxes required):
☐ "I confirm that I have a legitimate business relationship with this customer"*
☐ "I confirm that this customer has requested a quote for the specified products/services"*
☐ "I confirm that this opportunity is not already registered by another reseller"*
☐ "I understand that providing false information may result in account suspension"*
☐ "I have customer authorization to share their information for quote purposes"*
Terms of Deal Registration:

Expandable section showing full terms
"Read full terms" link
Key points highlighted:
• Deal locked for 90 days
• Cannot be transferred
• Customer email must be verified
• Distributors will see your effort signals

☐ "I agree to the Deal Registration Terms & Conditions"*
Lock Confirmation:

Visual lock icon
"Once registered, you cannot modify customer details"
"Deal expires in 90 days if not closed"

Attestation:

"By proceeding, I attest that all information provided is accurate and truthful"
Digital signature field: [______] (type full name)
Date: [auto-filled]

"Back" | "Register & Continue to Distributors"
STEP 4 - SELECT DISTRIBUTORS:
Heading: "Find distributors for your deal"
Info banner:
"Your deal is now registered and protected. Find distributors to request quotes."
Search & Filter:

Search bar: "Search distributors by name, products, or location..."
Filters:

Products/categories they carry
Location
Rating (min rating)
Certifications
Past performance



Distributor Cards (grid view):
Each card:

Distributor logo (top)
Company name
Rating: ★★★★★ (4.8) + reviews (145)
Verification badge: "✓ Verified"
Location: "Dubai, UAE"
Product match indicator:

"Carries 12/15 of your products" (green bar: 80%)


Key info:

"2,450 products"
"24/7 support"
"Ships nationwide"


Certifications badges:

Cisco Gold
Dell Premier
AWS Partner


"Average response time: 2 hours"
Engagement status:

If already engaged: "✓ Engaged" (green)
If not: "Send Request" button


"View Profile" link

Selected Distributors Panel (sticky right):

"Selected Distributors (3)"
List of selected distributors
"Send Engagement Requests" button (blue, large)
"Or invite via email" option

Recommended Distributors:

"Based on your deal, we recommend:"
3 top-matched distributors
"Why recommended" tooltip
One-click add

Send Engagement Request Modal:
When "Send Request" clicked:

Distributor name + logo
"Send Engagement Request"
Message to distributor:

Auto-populated with deal details
Editable text area
"Include BOQ" checkbox (if uploaded)
"Urgent" flag checkbox


Deal summary preview (what they'll see):

Customer (name/industry)
Products needed
Deal value
Close date
Your effort signals shown


"Send Request" button

COMPLETION:
Success screen:

✓ "Deal registered successfully!"
Deal ID: #D-2024-5678
"Engagement requests sent to 3 distributors"

Next steps checklist:
☐ Wait for distributors to accept (typically 24-48h)
☐ Review quotes as they arrive
☐ Compare and select best offer
☐ Close the deal
Action buttons:

"Go to Deal Dashboard"
"View This Deal"
"Register Another Deal"

Confirmation email sent:

"We've sent you a confirmation with deal details"

Design specs: Clear steps, trust-building, legal clarity, email verification prominent, effort signals visible, mobile-responsive, save progress

---

### **15. BOQ Upload (`/reseller/boq/upload`)**
Design a BOQ (Bill of Quantities) upload and management interface:
PAGE HEADER:

Heading: "Upload Bill of Quantities"
Subheading: "Upload your detailed requirements to get accurate quotes"

UPLOAD OPTIONS (tabs):

Upload File | Enter Manually | Import from Template

TAB 1 - UPLOAD FILE:
Drag & Drop Area (large, centered):

Dotted border box
Upload icon (large)
"Drag & drop your BOQ file here"
"or click to browse"
Supported formats: "Excel (.xlsx, .xls), CSV, PDF"
Max size: "10 MB"

Uploaded file preview:

File name with icon
File size
Upload progress bar (if uploading)
"Remove" button
"Preview" button (if supported)

File Parsing:
After upload, automatic parsing screen:

"Parsing your file..."
Progress indicator
AI detection of columns

Column Mapping Interface:

"Map your columns to our fields"
Table preview (first 10 rows of uploaded file)
Dropdown mappers above each column:
Your Column → Our Field
[SKU/Part Number ▼] → SKU
[Description ▼] → Product Name
[Qty ▼] → Quantity
[Specifications ▼] → Specifications
[Notes ▼] → Notes
"Auto-detect" button (AI suggests mapping)
Unmapped columns shown with warning
"Add custom field" option

Validation:

Real-time validation as you map
Error indicators:
⚠️ Required field missing
⚠️ Invalid data format
⚠️ Duplicate SKUs detected
"Validation Summary":

✓ 145 valid items
⚠️ 5 items need attention
❌ 2 items rejected



Product Matching:

"Match products to marketplace catalog"
AI attempts to match SKUs
Match confidence indicator:

✓ Exact match (green)
~ Possible match (yellow) - show suggestions
✗ No match (red) - manual search or add custom



Match review table:

Your SKU | Matched Product | Confidence | Action
For uncertain matches:

"Confirm" button
"Search alternatives"
"Use as custom item"



TAB 2 - ENTER MANUALLY:
Manual entry form:

"+ Add Line Item" button
Table with inline editing:
Columns:


(row number)

SKU/Part Number
Product Name
Description
Quantity
Unit
Specifications
Notes
Actions (duplicate, delete)


Each row editable
Product search in SKU field
Auto-complete from marketplace
Bulk add: "Add 10 rows"

TAB 3 - IMPORT FROM TEMPLATE:
Template Library:

Pre-built templates for common scenarios:

Network Infrastructure
Server & Storage
Security Solutions
Cloud Migration
Office IT Setup


Each template card:

Template name
Description
Sample items count
"Use Template" button


Downloaded template is pre-formatted
Fill and re-upload

BOQ DETAILS SECTION:
After file processed/items added:
BOQ Information:

BOQ Name*: [text input]

"e.g., Network Upgrade - Building A"


Associated Deal: [dropdown]

Select from your registered deals
"Or register new deal" link


Project Name: [text input]
Customer PO Number: [text input] (if available)
Required Delivery Date*: [date picker]

BOQ Summary:

Total line items: 150
Total quantity: 1,245 units
Estimated value: $425,000 (if prices known)
Categories: "Networking (60%), Storage (25%), Security (15%)"

Visibility Settings:

"Who can see this BOQ?"
Radio buttons:
○ Public - Open to all qualified distributors
"Any distributor can bid on this BOQ"
○ Private - Invite specific distributors only
"Only distributors you invite can bid"
[Search and select distributors]
○ Campaign - Only campaign participants
"If this is part of a campaign"

Bidding Settings:

Bidding deadline: [date time picker]

"Distributors must submit quotes by this time"


Allow partial quotes: [checkbox]

"Distributors can quote on subset of items"


Price visibility:

Radio:
○ Hide prices from distributors
○ Show target prices
○ Show maximum budget


Quantity flexibility: [checkbox]

"Allow distributors to suggest alternative quantities"



Technical Requirements:

Expandable section
Add specific technical requirements
Compliance needs
Warranty requirements
Support needs

Additional Documents:

Upload supporting files:

Technical drawings
Site surveys
Requirements doc
Budget approval


Drag & drop area

Notifications:

☐ Notify me when distributors view BOQ
☐ Notify me when quotes are submitted
☐ Send daily digest of activity

PREVIEW SECTION:
"Preview BOQ" button opens modal:

Shows how distributors will see your BOQ
All line items in table format
Summary information
Requirements
Deadline countdown

ACTION BUTTONS:
Bottom of page (sticky):

"Save as Draft" (outlined)
"Publish BOQ" (blue, primary)

If public: "Open to all distributors"
If private: "Send to selected distributors"



After publishing:

Success message
"BOQ published successfully!"
Tracking URL shown
"X distributors can now bid"
"Go to BOQ Dashboard"

BOQ LISTING PAGE (/reseller/boq):
List of all BOQs:
Each BOQ card:

BOQ name
Associated deal
Status badge:

Draft (gray)
Open for Bidding (blue)
Closed (green)
Awarded (gold)


Line items count
Quote count: "5 quotes received"
Deadline: countdown or date
"View Quotes" button
Actions menu: Edit, Close, Delete

Filters:

Status filter
Date range
Associated deal

Analytics:

Total BOQs published
Average quotes per BOQ
Average time to first quote
Best performing BOQs

Design specs: File-friendly, intelligent parsing, flexible mapping, validation feedback, mobile-responsive (file upload works on mobile), progress saving

---

### **16. My Deals (`/reseller/deals`)**
Design a comprehensive deal management interface:
PAGE HEADER:

Heading: "My Deals"
"+ Register New Deal" button (blue)
View toggle: Kanban | List | Calendar

FILTERS & SEARCH:

Search: "Search deals, customers, products..."
Filters:

Status: All | Active | Won | Lost
Date range: This month ▼
Value range: Any ▼
Customer: All ▼
Stage: All stages ▼


Active filters shown as pills
"Save this view" option

KANBAN VIEW (default):
Pipeline Columns (horizontal scroll if needed):

PROSPECT (10) - $450K:

Early stage opportunities
Light gray header


REGISTERED (15) - $1.2M:

Deal registered, verified
Blue header


ENGAGING (12) - $980K:

Sent to distributors
Purple header


QUOTED (8) - $640K:

Received quotes
Orange header


NEGOTIATING (6) - $520K:

Finalizing details
Yellow header


WON (4) - $380K:

Closed deals
Green header


LOST (3):

Did not win
Red header



Deal Cards (in columns):
Compact view:

Customer name (bold)
Deal title (smaller text)
Value badge: "$125,000"
Close date: "Mar 15" (red if overdue)
Product thumbnails (max 3, stack)
Status indicators (icons):

🔒 Registered
📧 Email verified
📄 BOQ uploaded
💬 Quote count badge "3"


Distributor logos (overlapping circles, max 4)
Urgency indicator (flame icon if close soon)
Drag handle (top)

Hover state:

Card expands slightly
"View Details" button appears
Quick actions: Edit, Move, Delete icons

Drag & Drop:

Smooth animations
Drop zones highlighted
Confirmation for sensitive moves (e.g., Lost)
Auto-save on drop

Column Actions:

"+ Add deal" button in each column
Column menu (⋮):

Sort by: Value | Date | Name
Filter column
Export deals in this stage



LIST VIEW:
Table with columns:

☐ Checkbox (bulk select)
Deal Name (sortable)
Customer
Value (sortable)
Stage (with colored badge)
Engaged Distributors (count + logos)
Quotes (count)
Close Date (sortable)
Last Activity
Actions (⋮)

Features:

Inline editing (click to edit value, date)
Row expansion (click to see details)
Bulk actions: Move Stage, Export, Delete
Column customization (show/hide)

CALENDAR VIEW:
Calendar grid (month view):

Deals shown on close dates
Color-coded by stage
Day view shows deal cards
Drag to reschedule close date
Filter by stage (toggle visibility)
Today indicator
Overdue deals highlighted

DEAL DETAIL PAGE:
Click on any deal → opens full page or drawer
HEADER:

Deal name (editable)
Customer name + industry
Stage selector (dropdown, changes on select)
Value (large, editable)
Close date + countdown
Actions: Edit | Clone | Archive | Delete

TABS:

Overview | Quotes | Activity | Documents | Notes

TAB 1 - OVERVIEW:
Customer Card:

Company logo
Full name
Industry, size, location
Contact person details
Email verification status: ✓
"View customer profile" link

Deal Details:

Registration date
Deal ID
Expected close date
Project timeline
Deal stage history (visual timeline)

Products/Services:

List of requested products
Quantities
Specifications
"View BOQ" button (if uploaded)

Distributors Engaged:

List of distributors
Engagement status:

Invited
Accepted
Quoted
Declined (with reason)


"Invite more distributors" button

Key Metrics:

Days in pipeline: 24
Quotes received: 5
Average quote value: $120K
Best quote: $115K
Your target: $125K
Win probability: 65% (calculated)

TAB 2 - QUOTES:
Quote comparison interface:

Filter: All | Submitted | Under Review | Expired
Sort: Lowest price | Highest rated | Fastest delivery

Quote cards (vertical):
Each quote card:

Distributor logo + name
Rating: ★★★★☆ (4.6)
Quote value: "$118,500" (large)
Price comparison: "5% below target" (green) or "Above budget" (red)
Submitted: time ago
Valid until: date + countdown
Status badge: Active | Expired | Withdrawn

Quote details (expandable):

Line items summary
Payment terms: Net 60
Delivery: 3-5 business days
Warranty: 3 years
Support: 24/7
Special offers: "Free shipping"

Actions:

"View Full Quote" (opens detailed view)
"Request Revision"
"Accept Quote" (if you're ready)
"Decline" (with reason)
"Compare" (checkbox for comparison mode)

Comparison Mode:
When 2+ quotes selected:

"Compare 3 Quotes" button appears
Opens side-by-side comparison:

Line items comparison table
Price differences highlighted
Terms comparison
Delivery comparison
Support comparison
Pros/cons for each


"Select Winner" button

TAB 3 - ACTIVITY:
Timeline of all activities:

Deal registered (with details)
Email verified
Distributor engaged
Quote received (each quote)
Messages exchanged
Stage changes
Notes added
Documents uploaded

Each event:

Icon
Description
Timestamp
Actor (if applicable)
Details (expandable)

Filter:

All activities
By type
By date range

TAB 4 - DOCUMENTS:
Document manager:

BOQ file (if uploaded)
Customer RFP
Quotes received (PDFs)
Proposals sent
Contracts
Supporting docs

Each document:

File name + type icon
Size
Upload date
Uploaded by
Actions: Download | Preview | Delete

Upload area:

"+ Upload document"
Drag & drop
Organization folders

TAB 5 - NOTES:
Notes section:

"+ Add note" button
Rich text editor
Notes list (newest first):

Note text
Created by + date
Edit/Delete (if yours)


@mention team members
Pin important notes
Search notes

DEAL ACTIONS PANEL (sticky right):
Status:

Current stage with icon
"Move to next stage" button
Or stage selector dropdown

Quick Actions:

"Invite Distributor"
"Request Quote"
"Upload Document"
"Add Note"
"Set Reminder"

Team:

Assigned to: [user selector]
Collaborators: [+ Add]
Notify team checkbox

Mark as Won/Lost:
If ready to close:
"Mark as Won" button:

Opens modal:

Confirm deal value
Select winning distributor
Won date (default today)
Internal notes
"Deals are subject to distributor acceptance"
"Confirm" button


After confirmation:

Triggers rating flow
Generates reports
Moves to Won column



"Mark as Lost" button:

Opens modal:

Loss reason dropdown:

Price too high
Lost to competitor
Customer delayed/cancelled
Technical mismatch
Other


Optional details
Feedback notes
"Confirm" button


Moves to Lost column
Sends notifications

EMPTY STATE (no deals):

Illustration
"No deals yet"
"Register your first deal to get started"
"+ Register Deal" button
"Import deals" option

BULK OPERATIONS:
When deals selected (checkboxes):

Floating action bar
"X deals selected"
Actions:

Move to stage
Assign to user
Add tags
Export
Delete



ANALYTICS WIDGET:

Conversion funnel visualization
Win/loss ratio
Average deal size
Average time to close
"View full analytics" link

Design specs: Flexible views, drag & drop, real-time updates, visual pipeline, comparison tools, mobile-responsive, keyboard shortcuts for power users

---

### **17. Quote Comparison (`/reseller/deals/[id]/quotes`)**
Design a comprehensive quote comparison interface:
PAGE HEADER:

Breadcrumb: My Deals > [Deal Name] > Compare Quotes
Deal name (H1)
Customer: [Name]
Deal value: $125,000

QUOTE OVERVIEW:

Summary banner:

"5 quotes received"
Best price: "$115,000" (green highlight)
Average price: "$121,500"
Highest price: "$128,000"
Price range: "$13,000" (11% variance)



FILTER & SORT:

Show: All quotes | Active only | Expired only
Sort: Lowest price | Highest rated | Best terms | Fastest delivery
View: Side-by-side | List view

SIDE-BY-SIDE COMPARISON VIEW:
Horizontal scroll container with quote columns:
Each Quote Column (fixed width):
HEADER SECTION:

Distributor logo (large, centered)
Company name
Rating: ★★★★★ (4.8) + "(145 reviews)"
Verification badge: ✓ Verified
Quote ID: Q-2024-1234

QUOTE SUMMARY CARD:

Total Price: "$118,500" (very large, bold)
Price badge:

"Best Price" (gold medal icon)
"Above Average +2%" (orange)
"Below Target -5%" (green)


Submitted: "2 days ago"
Valid until: "Feb 15, 2026" (14 days left)

Green countdown if >7 days
Orange if 3-7 days
Red if <3 days



QUICK COMPARISON METRICS:
Price Breakdown (collapsible):

Subtotal: $115,000
Discount: -$2,500 (2%)
Tax: $5,175
Shipping: $1,000
Total: $118,500

Payment Terms:

Icon + "Net 60 days"
Early payment discount badge (if available)
Payment methods accepted

Delivery:

Icon + "3-5 business days"
Shipping method
Tracking included: ✓

Warranty & Support:

Warranty: "3 years manufacturer"
Support: "24/7 phone & email"
SLA: "4-hour response" (if applicable)

Special Offers:

🎁 Free installation
🎁 Extended warranty
🎁 Free training session
Badges for special offers

COMPARISON TABLE (horizontal scroll):
Sticky header row:

Line Item / SKU
Quote A (Distributor 1)
Quote B (Distributor 2)
Quote C (Distributor 3)
Quote D (Distributor 4)
Quote E (Distributor 5)

Product rows:
Each row:

Product name + image (left, sticky column)
SKU
Requested qty

For each quote column:

Unit price
Total price
Availability:

✓ In stock (green)
3-5 days (yellow)
Out of stock (red)


Price difference from average:

+$50 (2%) above average (red)
-$30 (1.5%) below average (green)
= At average (gray)



Color coding:

Lowest price per item: green highlight
Highest price per item: red highlight
Missing items: gray with "Not quoted"

Summary row (bottom):

Totals for each quote
Best overall highlighted

DETAILED COMPARISON SECTIONS:
Terms & Conditions Comparison:
Table format:

Payment terms
Delivery timeline
Warranty details
Return policy
Support level
SLA commitments

Each distributor's terms in columns
Differences highlighted
Value-Added Services:
Checkmark matrix:

Free installation: ✓ ✗ ✓ ✓ ✗
Training included: ✓ ✓ ✗ ✓ ✓
24/7 support: ✓ ✓ ✓ ✗ ✓
On-site support: ✗ ✓ ✓ ✗ ✓
Custom config: ✓ ✗ ✓ ✓ ✓

Distributor Profiles:
Side-by-side cards:

Company info
Years in business
Customer rating
Response time avg
Past deals with you
Certifications
Location/coverage

SCORING WIDGET:
Auto-calculated score for each quote:
Factors (weighted):

Price (40%): 95/100
Terms (20%): 85/100
Delivery (15%): 90/100
Distributor rating (15%): 88/100
Value-adds (10%): 80/100

Overall score: 89/100
Ranked: 1st, 2nd, 3rd, etc.
Visual bar chart showing scores
"How is this calculated?" info tooltip
ACTIONS PANEL (sticky right):
For each quote:

"View Full Details" button
"Request Changes" button

Opens message composer
Pre-filled templates:

"Can you improve pricing on items X, Y?"
"Can you match competitor's delivery time?"
"Can you add [service]?"




"Decline Quote" button
"Accept This Quote" button (primary, large, blue)

Print/Export:

"Print Comparison" button
"Export to PDF" button
"Export to Excel" button
"Email to Team" button

DECISION SUPPORT:
Recommendation Widget:

"Based on your criteria, we recommend:"
Recommended quote highlighted
"Why?" expandable explanation:

Best overall value
Fastest delivery
Highest rated distributor
Matches all requirements



Pros & Cons:
For each quote, auto-generated:
Quote A - TechDist Global:
Pros:
✓ Lowest total price
✓ Free installation
✓ 24/7 support
Cons:
✗ Longer delivery time
✗ Limited warranty
COLLABORATION:
Comments section:

Team members can comment on quotes
"@mention" colleagues
Attach notes to specific quotes
Discussion thread

Share comparison:

Generate shareable link
Set expiration
Track who viewed

ACCEPT QUOTE FLOW:
When "Accept This Quote" clicked:
Confirmation Modal:

"Accept quote from [Distributor Name]?"
Quote summary
Final price: $118,500
Terms summary
Checkboxes:
☐ I confirm this quote meets all requirements
☐ I have approval to proceed (if required)
☐ I understand other quotes will be declined
"Confirm Accept" button

After acceptance:

Success message
"Quote accepted!"
Next steps:

Distributor will be notified
Other distributors will be notified
You'll receive order confirmation
"Rate your experience" (later)


"View Order" button
"Download Quote" button

Auto-actions after acceptance:

Decline other quotes (with message)
Move deal to "Won" stage
Trigger notifications
Generate order doc

MOBILE VIEW:
Card stack instead of horizontal scroll:

Swipe between quotes
Tap to expand details
Comparison chart adapted to vertical
Actions at bottom of each card

Design specs: Comparison-optimized, scannable, decision support, visual differences highlighted, export options, collaborative, mobile-responsive

---

## 👤 **INDIVIDUAL & PROFILE PAGES**

### **18. Individual Profile (`/profile/[username]` or `/profile/[id]`)**
Design a professional individual profile page:
HEADER SECTION:
Cover Image (optional):

Professional banner
Default gradient if no image
Edit option if own profile

Profile Info (overlaying cover):

Left side:

Profile photo (large, circular, 150x150)

Verification badge overlay if verified
Online status indicator (green dot)
Edit photo button (if own profile)


Name (H1): "John Smith"
Title/Role: "Senior Sales Manager"
Current organization(s):

Company logo + name
Role badge
Multiple orgs if applicable


Location: Dubai, UAE (pin icon)
Member since: "January 2024"


Right side:

Tier Badge (large):

"PROVEN PROFESSIONAL" (gold)
or "EMERGING" (silver)
or "UNPROVEN" (bronze)
Tier icon/illustration


Activity Score: "850 points"
"What's this?" tooltip
Contact buttons:

"Send Message" (blue)
"Connect" or "Following" toggle
"Share Profile" (outlined)


More menu (⋮):

Report user
Block user
Export vCard





NAVIGATION TABS:

About | Activity | Deals | Ratings | Certifications

TAB 1 - ABOUT:
Bio Section:

"About" heading
Rich text bio (user-written)
"I'm a technology sales professional with 10+ years experience..."
Edit button (if own profile)

Skills & Expertise:

"Skills" heading
Skill tags (with endorsement counts):

Network Solutions (24 endorsements)
Cloud Architecture (18)
Enterprise Sales (31)
Solution Design (15)


"+ Add skill" (if own profile)
Endorsement feature (like LinkedIn)

Certifications:

Card grid showing certifications:

Cert logo/badge
Certification name
Issuing organization
Issue date
Expiry date (if applicable)
Credential ID
"Verify" link


"+ Add certification" (if own profile)

Languages:

Languages spoken with proficiency:

English (Native)
Arabic (Professional)
French (Basic)



Education:

Degree(s)
Institution
Year
Major

Contact Information:

Email (if public)
Phone (if public)
LinkedIn profile link
Website

Organizations:

Current organizations card:

Org logo
Name
Role
Since date
"View organization" link


Past organizations (collapsed)

TAB 2 - ACTIVITY:
Activity Score Breakdown:

Visual breakdown of 850 points:

Deals registered: 450 pts (53%)
Deals won: 280 pts (33%)
Reviews given: 70 pts (8%)
Profile completeness: 50 pts (6%)


Progress to next tier:

"150 points to ELITE tier"
Progress bar



Activity Timeline:

Recent activities (last 30 days):

Registered deal with ABC Corp
Won deal worth $125K
Received 5-star review
Joined new organization
Earned certification


Each item:

Icon (color-coded)
Description
Timestamp
View details link



Statistics Cards:
DEALS REGISTERED:

Large number: "45"
"Total deals registered"
Trend: "↑ 12 this quarter"
Chart: Mini line graph

DEALS WON:

Number: "17"
Win rate: "38%"
Total value: "$2.1M"
Chart: Win/loss pie

AVERAGE DEAL SIZE:

"$125,000"
Comparison: "15% above average"

RESPONSE TIME:

"2.3 hours"
"Average time to respond to quotes"

Monthly Activity Chart:

Bar/line chart showing activity over months
Deal registrations vs closures

TAB 3 - DEALS:
Public Deal Portfolio:

Note: "Sensitive details hidden for privacy"

Deal Cards (filtered view):

Deal title (generic): "Enterprise Network Upgrade"
Industry: Healthcare
Deal size range: "$100K - $250K"
Status: Won/Lost
Date: Closed Feb 2026
Products/categories involve
Continue01:57: "Networking, Security"

No customer names shown

Filters:

Status: Won | Lost | All
Date range
Industry
Size range

Deal Statistics:

Industries worked in (pie chart)
Average deal size by category
Success rate by product type

TAB 4 - RATINGS:
Rating Summary:

Overall rating: ★★★★★ 4.8/5.0
Based on: "24 reviews"
Rating distribution:

5 stars: ████████ 75%
4 stars: ███ 20%
3 stars: █ 4%
2 stars: 1%
1 star: 0%



Category Ratings:

Communication: ★★★★★ 4.9
Professionalism: ★★★★★ 4.8
Responsiveness: ★★★★☆ 4.7
Product Knowledge: ★★★★★ 4.9
Negotiation: ★★★★☆ 4.6

Review Tags (word cloud style):

"Professional" (24)
"Responsive" (20)
"Knowledgeable" (18)
"Reliable" (16)
"Fair pricing" (14)

Recent Reviews:
Each review card:

Reviewer info:

Role: "Distributor Sales Manager"
Company type (not name): "IT Distribution Company"
Verified badge


Rating: ★★★★★
Date: "2 months ago"
Review text:
"Excellent professional to work with. Always responsive and knows the products well..."
Tags: Professional, Responsive
Deal context: "Network infrastructure deal"
Helpful? 👍 (12) 👎 (0)

Filter reviews:

All | Verified Only | Recent

TAB 5 - CERTIFICATIONS:
Certification Gallery:

Visual badges/certificates
Grid layout

Each certification card (larger than in About):

Large badge/logo
Certification name (bold)
Issuing organization logo
Issue date
Expiry date (countdown if expiring soon)
Credential ID
"Verify Credential" button (external link)
Skills associated with this cert
Endorsement count for this cert

Certification Timeline:

Visual timeline of certifications earned
Shows professional growth

SIDEBAR (right, all tabs):
Quick Stats:

Profile views (last 30 days)
Connections
Endorsements received
Activity level badge

Achievements/Badges:

"Quick Responder" badge (icon)
"Top Performer" badge
"Trusted Partner" badge
Custom achievement badges

Similar Profiles:

"Professionals you may know"
3 profile cards
Connect button

EDIT MODE (if own profile):
Edit button (top right) → enables editing:

Inline editing of sections
"Save Changes" / "Cancel" buttons
Unsaved changes warning

Privacy Settings:

Who can see your profile:

Public
Registered users only
Connections only


What's visible:

Toggle visibility of each section
Hide sensitive info



EMPTY STATES:
No deals yet:

"No deals to display"
"Register your first deal"

No ratings:

"No reviews yet"
"Complete more deals to receive ratings"

Design specs: Professional LinkedIn-style, credibility-focused, privacy-respecting, achievements highlighted, mobile-responsive, verifiable credentials

---

## ⭐ **RATINGS & REVIEWS**

### **19. Rate Transaction (`/deals/[id]/rate`)**
Design a comprehensive post-deal rating interface:
PAGE HEADER:

Breadcrumb: My Deals > [Deal Name] > Rate Experience
Heading: "Rate Your Experience"
Subheading: "Help us build a trusted marketplace by sharing your feedback"

DEAL SUMMARY (top banner):

Deal name
Customer (if reseller rating)
Distributor (if rating distributor)
Deal value
Close date
"Your feedback will be public and visible to other users"

RATING SECTIONS:
SECTION 1 - ORGANIZATION RATING:
Heading: "Rate [Organization Name]"
Organization logo + name
Overall Rating (required):

"How was your overall experience?"
5-star selector (large, interactive)

Hover states show labels:
1 star: "Very Poor"
2 stars: "Poor"
3 stars: "Average"
4 stars: "Good"
5 stars: "Excellent"


Selected rating shows below

Category Ratings (sliders or stars):
For Distributors (when reseller rates):

Pricing Competitiveness: ★★★★★
Product Quality: ★★★★★
Delivery Time: ★★★★★
Communication: ★★★★★
Support Quality: ★★★★★
Documentation: ★★★★★

For Resellers (when distributor rates):

Professionalism: ★★★★★
Payment Timeliness: ★★★★★
Communication: ★★★★★
Requirements Clarity: ★★★★★
Volume Accuracy: ★★★★★

Each category:

Star rating
Optional comment field (expandable)

Rating Tags (multi-select):

"Select tags that describe your experience"
Positive tags (green):
☐ Professional
☐ Responsive
☐ Reliable
☐ Fair Pricing
☐ Quality Products
☐ Fast Delivery
☐ Great Support
☐ Clear Communication
☐ Flexible Terms
☐ Would Recommend
Negative tags (orange/red, only if rating <4):
☐ Slow Response
☐ Poor Communication
☐ Late Delivery
☐ Quality Issues
☐ Hidden Costs
☐ Unprofessional
☐ Payment Issues

SECTION 2 - INDIVIDUAL RATINGS:
Heading: "Rate the people you worked with"
Subheading: "Help recognize great professionals"
Individual cards:
For each person involved in deal:

Profile photo
Name
Role
Organization

Rating fields:

Overall rating: ★★★★★
Category ratings:

Knowledge: ★★★★★
Responsiveness: ★★★★★
Professionalism: ★★★★★


Tags:
☐ Expert
☐ Helpful
☐ Responsive
☐ Professional
☐ Patient
Optional comment

"+ Rate another person" button
SECTION 3 - WRITTEN REVIEW:
Heading: "Share your experience" (optional)
Review Guidelines:

"Your review will help other businesses"
Tips:
• Be specific and constructive
• Focus on facts, not emotions
• Mention what went well and what could improve
• Avoid sensitive business information

Review Input:

Rich text editor
Placeholder: "Describe your experience with this distributor..."
Character counter: 0/1000
Minimum: 50 characters for submission

Review Prompts (helpful starters):

"What did you like most about working with them?"
"How would you describe their service quality?"
"Would you work with them again? Why?"

SECTION 4 - ADDITIONAL FEEDBACK:
Would you work with them again?

Radio buttons:
○ Definitely yes
○ Probably yes
○ Maybe
○ Probably not
○ Definitely not

Recommend to others?

Radio buttons:
○ Highly recommend
○ Recommend
○ Neutral
○ Would not recommend

Deal-Specific Questions:
For product deals:

Product quality met expectations?
○ Exceeded ○ Met ○ Below
Delivery was:
○ Early ○ On time ○ Late
Documentation was:
○ Excellent ○ Good ○ Adequate ○ Poor
Support during implementation:
○ Excellent ○ Good ○ Fair ○ Poor ○ N/A

SECTION 5 - PRIVACY & VISIBILITY:
Review Visibility:

Radio buttons:
○ Public review (visible to all users) [recommended]
○ Anonymous review (your name hidden, but review visible)
○ Private feedback (only visible to recipient and admins)

Info box:
"Public reviews help build trust in the marketplace. Anonymous reviews have less weight in ratings."
Attribution:

Checkbox: ☐ "Show my name and organization with this review"

PREVIEW SECTION:
"Preview your review" button
Opens modal showing:

How your review will appear to others
All ratings and tags
Written review
Your attribution (if public)

SUBMISSION:
Bottom actions (sticky):

"Save as Draft" (outlined)
"Submit Review" (blue, large)

Validation:

Overall organization rating required
At least 3 category ratings required
Written review minimum 50 chars (if started)
Acknowledgment checkbox:
☐ "I confirm this review is based on my actual experience and is truthful"

AFTER SUBMISSION:
Success screen:

✓ "Thank you for your feedback!"
"Your review has been submitted"
Impact message:

"Your review helps [Organization] improve"
"Other users can now see your rating"


Next steps:

"View your review"
"Rate another deal"
"Go to dashboard"



Email confirmation sent
Points awarded (if applicable):

"+50 credibility points for completing review"

RATING REMINDERS:
For unrated deals (shown on dashboard):

Banner: "You have 3 deals waiting for feedback"
List of deals with "Rate now" buttons
Dismiss option

Email reminder (7 days after deal close):

"How was your experience with [Distributor]?"
Rate now link
Snooze/dismiss options

DISPUTE PROCESS:
If organization disputes rating:

"This review has been disputed"
Reason shown
You can:

Provide clarification
Modify review
Maintain review


Admin may review

Design specs: Comprehensive but not overwhelming, constructive feedback encouraged, fair to both parties, builds credibility system, mobile-friendly, encourages honest reviews

---

## 💳 **CREDIT MANAGEMENT**

### **20. Credit Request (`/credit/request` & `/reseller/credit`)**
Design a credit limit request and management interface:
RESELLER VIEW - REQUEST CREDIT:
PAGE HEADER:

Heading: "Request Credit Limit"
Subheading: "Establish credit terms with distributors"

INFO BANNER:
"Credit limits allow you to place orders with payment terms instead of upfront payment. Each distributor sets their own credit limits based on your business profile."
REQUEST FORM:
STEP 1 - SELECT DISTRIBUTOR:
Distributor Selection:

Search/browse distributors
Filter by:

Distributors you've worked with
Distributors you're currently engaged with
All distributors



Distributor cards:

Logo + name
Your relationship:

"5 deals completed" (green)
"Currently in 2 active deals"
or "No prior relationship"


Their credit policy:

"Offers credit terms"
Typical terms: "Net 30, Net 60"
Credit evaluation time: "2-3 business days"


"Request Credit" button

STEP 2 - CREDIT DETAILS:
Credit Request Information:
Requested Credit Limit:

Currency: [USD ▼]
Amount: $ [______]
Helper text: "Request based on your expected monthly purchases"
Suggested amounts: $10K | $25K | $50K | $100K | Custom

Payment Terms Requested:

Checkboxes (can select multiple):
☐ Net 30 (payment in 30 days)
☐ Net 60 (payment in 60 days)
☐ Net 90 (payment in 90 days)
☐ Other: [specify]

Purpose:

Textarea: "Explain why you need credit and how you'll use it"
"Example: Ongoing infrastructure projects for multiple clients requiring flexible payment terms"

Business Justification:

Expected monthly purchase volume: $ [______]
Number of expected transactions: [___] per month
Average deal size: $ [______]

STEP 3 - FINANCIAL DOCUMENTS:
Heading: "Upload financial documents"
Subheading: "Help distributors evaluate your creditworthiness"
Required Documents (minimum):

COMPANY REGISTRATION:

Upload area
"Business license or certificate of incorporation"
File types: PDF, JPG, PNG
Status: Not uploaded | Uploaded | Verified


TAX DOCUMENTS:

"Tax ID / VAT certificate"
Upload area


FINANCIAL STATEMENTS:

"Bank statements (last 3 months)"
Multiple file upload
Or "Latest audited financial statements"



Optional Documents (strengthen application):

BANK REFERENCE LETTER:

Upload area
"Letter from your bank confirming good standing"


TRADE REFERENCES:

"References from other suppliers"
Name: [____]
Company: [____]
Contact: [____]
"+ Add another reference"


CREDIT REPORT:

"Business credit report (if available)"
Upload or provide report number



All documents:

Encrypted storage icon: 🔒
"All documents are encrypted and only shared with selected distributors"
View/remove options after upload
File size limit: 10MB per file

Document Checklist:
Progress indicator:

✓ Business registration uploaded
✓ Tax documents uploaded
⚬ Bank statements (optional)
⚬ Reference letter (optional)
X/Y documents uploaded

STEP 4 - ADDITIONAL INFORMATION:
Company Financial Info:
Annual Revenue:

Range selector:
○ < $1M
○ $1M - $5M
○ $5M - $10M
○ $10M - $25M
○ $25M+

Years in Business: [number input]
Number of Employees:

Range selector

Existing Credit Lines:

"Do you have credit with other distributors?"
○ Yes ○ No
If yes:

Total existing credit: $ [______]
Credit utilization: [__]%
Payment history: ○ Excellent ○ Good ○ Fair



Payment History:

"Have you ever defaulted on payments?"
○ No ○ Yes (explain)
If yes: [textarea]

Bank Account Information:

Bank name: [____]
Account age: [____] years
Average balance: $ [____] (optional)

Contact Information:

Financial controller name: [____]
Phone: [____]
Email: [____]

REVIEW & SUBMIT:
Summary of Request:

Distributor: [Name + logo]
Credit limit requested: $50,000
Payment terms: Net 60
Documents uploaded: 5
Application status: Ready to submit

Declarations:
☐ "I certify that all information provided is accurate and truthful"
☐ "I authorize [Distributor] to verify the information provided"
☐ "I understand that false information may result in credit denial and account suspension"
☐ "I agree to the Credit Terms and Conditions" [link]
Digital Signature:

"Sign your application"
Signature pad or type name
Date (auto-filled)

Actions:

"Save as Draft"
"Submit Application" (blue, large)

AFTER SUBMISSION:
Confirmation screen:

✓ "Credit application submitted!"
Application ID: CR-2024-5678
"Submitted to: [Distributor Name]"
Expected response time: "2-3 business days"

Next steps:

Distributor will review your application
You may be contacted for additional information
You'll be notified of the decision

Action buttons:

"Track Application Status"
"Submit Another Application"
"Back to Dashboard"

CREDIT DASHBOARD (/reseller/credit):
PAGE HEADER:

Heading: "Credit Management"
"+ Request Credit" button

CREDIT SUMMARY CARDS:
Total Credit Available:

Large number: "$150,000"
Across: 3 distributors
Utilized: "$45,000" (30%)
Available: "$105,000"

Credit Utilization:

Progress bar (30% filled)
Status: "Healthy" (green)
Recommendation: "You have good credit headroom"

Outstanding Balance:

Amount: "$22,500"
Due within 30 days: "$15,000"
Overdue: "$0" (if any, show red)

Credit Applications:

Pending: 2
Approved: 5
Declined: 1

CREDIT LINES TABLE:
Active Credit Lines:
Columns:

Distributor (logo + name)
Credit Limit
Utilized
Available
Payment Terms
Status
Actions

Each row:

Distributor: TechDist Global (logo)
Credit Limit: $50,000
Utilized: $15,000 (bar: 30%)
Available: $35,000
Payment Terms: Net 60
Status: Active (green badge)
Actions:

"View Details"
"Request Increase"
"Make Payment"



Credit Applications:
Tabs: Active | Pending | Approved | Declined | All
Application cards:

Application ID
Distributor
Amount requested: $50,000
Terms requested: Net 60
Status:

Pending Review (orange)
Under Evaluation (blue)
Approved (green)
Declined (red)
More Info Needed (yellow)


Submitted: date
Last updated: date
Actions:

"View Application"
"Provide Info" (if requested)
"Withdraw" (if pending)



PAYMENT HISTORY:
Recent payments table:

Invoice #
Distributor
Amount
Due Date
Paid Date
Status: On-time (green) | Late (red)
"View Receipt"

Payment Performance:

On-time payment rate: 95%
Average days to payment: 28 days
Graph: Payment history over time

UPCOMING PAYMENTS:
Calendar view or list:

Next 30 days
Invoices due:

Date
Distributor
Amount
"Pay Now" button



Set payment reminders:

Email reminder X days before due
SMS alerts for overdue

CREDIT SCORE WIDGET:
Your Credit Score: 780/1000 (Good)

Based on:

Payment history (40%): Excellent
Credit utilization (30%): Good
Credit age (15%): Fair
Credit mix (10%): Good
New credit (5%): Fair



"How to improve your score" tips
Design specs: Financial, secure, document-centric, clear status tracking, payment management, creditworthiness building, mobile-responsive, encryption indicators

---

### **21. Credit Review (Distributor) (`/distributor/credit-requests`)**
Design a credit review and approval interface for distributors:
PAGE HEADER:

Heading: "Credit Requests"
Tabs: To Review (5) | Approved (42) | Declined (8) | All

FILTERS:

Search: "Search by company name..."
Filters:

Requested amount range
Date submitted
Relationship status (existing/new customer)
Risk level (if calculated)


Sort: Newest | Highest amount | Risk score

REQUEST LIST:
Each request card:
HEADER:

Reseller logo + company name
Request ID: CR-2024-5678
Status badge:

Pending Review (orange)
Under Review (blue)
Info Requested (yellow)
Approved (green)
Declined (red)


Submitted: "3 days ago"
Priority flag (if high value or existing customer)

SUMMARY INFO:

Requested credit limit: "$50,000" (large)
Payment terms requested: "Net 60"
Purpose summary (truncated)

QUICK METRICS:

Relationship status:

"Existing customer" (green) + "5 deals completed"
or "New customer" (gray)


Their rating: ★★★★☆ (4.5)
Past deal value: "$280,000" total
Payment history (if applicable):

"100% on-time payments"
or "2 late payments in last 12 months"



RISK INDICATORS:
Auto-calculated risk score (if available):

Risk Level: Low | Medium | High
Score: 75/100
Color-coded badge

Documents status:

✓ 5/5 required documents uploaded
⚠️ 3/5 documents (missing items)

ACTIONS:

"Review Application" button (primary)
Quick actions:

"Approve" (if confident)
"Decline"
"Request Info"



DETAILED REVIEW PAGE:
Click "Review Application" → full page
LEFT PANEL (70%):
TAB 1 - APPLICATION DETAILS:
Reseller Information Card:

Company name, logo
Industry, size, location
Years in business
Contact information
Website link
"View full profile" link

Requested Terms:

Credit limit: $50,000
Payment terms: Net 60
Monthly expected volume: $15,000
Average deal size: $5,000
Purpose: [full text shown]

Financial Summary (from application):

Annual revenue range
Years in business
Number of employees
Existing credit lines
Credit utilization

Relationship History:
If existing customer:

Timeline of deals:

Deal #1: $45,000 (Won, Feb 2025)
Deal #2: $62,000 (Won, Mar 2025)
etc.


Total business: $280,000
Payment history chart
Average days to payment
Issues (if any)

If new customer:

"No prior relationship"
"Trade references provided" (if any)
Show references

TAB 2 - DOCUMENTS:
Document Viewer:
Secure document interface:
Documents list:

Business Registration ✓

File: business_license.pdf
Uploaded: Jan 15, 2026
Size: 2.4 MB
Status: Verified
Actions:

"View Document" (opens in secure viewer)
"Download" (audit logged)
"Mark as Verified" toggle




Tax Documents ✓

[similar format]


Bank Statements (3 files) ✓

Jan 2026 statement
Dec 2025 statement
Nov 2025 statement


Bank Reference Letter ✓
Trade References ✓

Secure viewer (modal):

PDF viewer with controls
Zoom in/out
Navigate pages
Cannot right-click/save
Watermark: "Confidential - [Your Company] - [Date]"
View timer logged
"Close" button

Document verification:

Checkbox for each: ☐ "Document verified"
Notes field: "Add verification notes"
Verification date + user logged

Missing documents alert:

⚠️ "2 optional documents not provided"
"Request these documents" button

TAB 3 - FINANCIAL ANALYSIS:
Financial Metrics (from statements):

Average monthly balance
Revenue trends
Cash flow indicators
Debt obligations

Financial Ratios (if calculable):

Current ratio
Debt-to-equity
Quick ratio

Red Flags Checker:
Auto-scan for issues:

✓ No red flags detected
or
⚠️ Declining revenue trend
⚠️ High debt levels
⚠️ Recent late payments elsewhere

Credit Score Integration:
If credit report provided:

External credit score
Payment history summary
Public records check
Trade lines summary

TAB 4 - RISK ASSESSMENT:
Risk Score Calculator:
Factors evaluated:

Business Age (20%)

5+ years: Low risk
Score: 18/20


Financial Strength (30%)

Based on statements
Score: 24/30


Payment History (25%)

With you: 100% on-time
Score: 25/25


Credit Request (15%)

Request vs. revenue: Reasonable
Score: 12/15


Industry Risk (10%)

Industry stability
Score: 8/10



Total Risk Score: 87/100 (Low Risk)
Risk Recommendation:

"Low risk applicant"
"Recommended approval with standard terms"

Comparable Applications:

"Similar applications:"
5 similar cases shown
Approval rate: 80%
Average approved limit: $45K

Internal Credit Policy Check:

✓ Meets minimum revenue requirement
✓ Meets minimum business age
✓ Acceptable credit history
⚠️ Exceeds auto-approval limit (requires manager)

TAB 5 - ACTIVITY LOG:
Audit trail:

Application submitted (date, time)
Documents uploaded (each logged)
Application viewed by: [User] (timestamp)
Documents accessed by: [User] (which docs, when)
Info requested (if any)
Applicant responses
Internal notes added
Status changes
Approval/decline decision
Terms offered
Applicant acceptance

Each entry:

Timestamp
User/actor
Action
Details
IP address (if relevant)

RIGHT PANEL (30%, sticky):
DECISION PANEL:
Current Status:

Badge showing current status
Days since submission
SLA timer: "Review due in 18 hours"

Quick Actions:

APPROVE APPLICATION:
Button: "Approve Credit" (green)
Opens modal:

"Approve credit request?"
Adjust terms (if needed):

Approved limit: [editable] (default: requested amount)
Payment terms: [dropdown]
Conditions/notes: [textarea]
Approval valid for: [days]


Interest rate (if applicable): [%]
Late payment fees: [$]
Credit review frequency: [dropdown]
"Confirm Approval" button


DECLINE APPLICATION:
Button: "Decline" (outlined, gray)
Opens modal:

"Decline credit request"
Reason (required):
○ Insufficient financial information
○ High risk assessment
○ Below minimum requirements
○ Incomplete documentation
○ Other: [specify]
Message to applicant: [textarea]

Pre-filled professional templates


"Suggest reapplication timeline" [date]
"Confirm Decline" button


REQUEST MORE INFORMATION:
Button: "Request Info" (outlined, blue)
Opens modal:

"Request additional information"
Checklist of items to request:
☐ Additional bank statements
☐ Updated financial statements
☐ Trade references
☐ Explanation of: [specify]
☐ Other: [specify]
Message to applicant: [textarea]
Due date for response: [date picker]
"Send Request" button


ASSIGN TO COLLEAGUE:

"Assign for review"
User selector
Add note



Internal Notes:

Private notes section
Rich text editor
"@mention" colleagues
Notes visible only to your team
"Add note" button

Consultation:

"Request manager approval" (if needed)
"Discuss with finance team" chat

Document Requests:

List of requested additional docs
Status of each
Reminder options

APPROVAL WORKFLOW:
If approved:

Terms generated
Email sent to reseller
Credit line created
Reseller accepts terms
Credit activated
Logged in system

If declined:

Decline reason logged
Professional email sent
Suggest improvements (optional)
Reapplication allowed after X days

If info requested:

Specific items listed
Email sent with requests
Status: "Awaiting Info"
Resume review when received

CREDIT MONITORING (post-approval):
Active Credit Lines page:

List of approved credit customers
Current utilization
Payment status
Alerts for:

High utilization (>80%)
Late payments
Significant business changes


"Review credit limit" option
"Suspend credit" (if issues)

Credit Performance Dashboard:

Total credit extended
Total utilized
Default rate
Average days to payment
By customer metrics

Design specs: Secure, comprehensive, audit-friendly, risk-assessment tools, document encryption, approval workflows, compliance-focused, role-based access

---

## 🛠️ **ADMIN PANEL**

### **22. Admin Dashboard (`/admin/dashboard`)**
Design a comprehensive admin control panel:
SIDEBAR NAVIGATION:

Dashboard (active)
Organizations

Pending Verification
All Organizations
Verification Logs


Users

All Users
Roles & Permissions
Activity Logs


Deals

All Deals
Flagged Deals
Deal Analytics


Content

Categories
Products/Services
Campaigns


Reports & Abuse

Abuse Reports
Dispute Resolution


Configuration

Platform Settings
Email Templates
Rating Tags
Qualification Bands


Analytics

Platform Metrics
User Behavior
Revenue Analytics


System

Logs
Backups
API Status



MAIN DASHBOARD:
TOP KPI CARDS (4 cards):

TOTAL USERS:

Number: "5,240"
Breakdown:

Distributors: 512
Resellers: 3,890
OEMs: 45
Individuals: 793


Trend: "↑ 245 this month" (15%)


ACTIVE DEALS:

Number: "1,248"
Total value: "$58.5M"
Stages breakdown (mini chart)
Trend: "↑ 18% vs last month"


PENDING VERIFICATIONS:

Number: "24"
Alert badge (orange)
Types:

Organizations: 18
Documents: 6


"Review Now" link


PLATFORM GMV:

"Gross Merchandise Value"
This Month: "$12.4M"
YTD: "$145.2M"
Growth: "↑ 24% YoY"



ALERTS & TASKS:
High Priority Tasks:

Card with urgent items:

🔴 12 organizations awaiting verification (>3 days)
🟠 5 abuse reports need review
🟡 2 disputes require resolution
⚪ System backup scheduled tonight


"View All Tasks" link

Recent Alerts:

Suspicious activity detected: User XYZ
High value deal flagged: $500K+
API rate limit approaching: Distributor ABC
"View All Alerts" link

CHARTS SECTION:
PLATFORM GROWTH:

Line chart (last 12 months)
Metrics:

New users
New organizations
Active deals
GMV


Toggle between metrics
Download data option

USER ACTIVITY:

Bar chart showing daily/weekly active users
Segmented by user type
Trend analysis

DEAL FUNNEL:

Funnel visualization:

Deals registered: 1000
Engaged distributors: 850
Quotes received: 620
Deals won: 245


Conversion rates at each stage
Bottleneck identification

REVENUE ANALYTICS:

Revenue breakdown:

By user type
By category
By region


Monthly recurring patterns
Seasonality indicators

RECENT ACTIVITY FEED:
Real-time activity stream:

Organization verified: TechDist Global
New deal registered: $125K (Healthcare)
Quote submitted: ABC Resellers
User report filed: Suspicious activity
Campaign
Continue02:01created: Q1 Networking Promo

Each with timestamp and "View" link

ORGANIZATION OVERVIEW:
Organizations by Status:

Verified: 450 (green)
Pending: 24 (orange)
Rejected: 8 (red)
Suspended: 2 (dark red)
Pie chart visualization

Top Organizations (by activity):

List of top 10:

Logo, name
Activity score
Deals count
Rating
"View" link



CONTENT MODERATION:
Pending Reviews:

Products awaiting approval: 15
Services awaiting approval: 8
Reviews flagged: 3
"Review Queue" button

SYSTEM HEALTH:
System Status:

API: ✓ Operational (green)
Database: ✓ Operational
Search: ✓ Operational
Email Service: ✓ Operational
Payment Gateway: ⚠️ Degraded (yellow)
"View Details" link

Performance Metrics:

Response time: 245ms (avg)
Uptime: 99.98%
Error rate: 0.02%
Active sessions: 1,247

QUICK ACTIONS:
Button grid:

"Verify Organization"
"Review Abuse Report"
"Create Announcement"
"Export Data"
"View Logs"
"System Settings"

Design specs: Data-dense, real-time updates, alert-focused, quick access to common tasks, visual analytics, system monitoring, mobile-responsive (limited admin on mobile)

---

### **23. Organization Verification (`/admin/organizations`)**
Design an organization verification and management interface:
PAGE HEADER:

Heading: "Organization Management"
Tabs: Pending Verification (18) | Verified (450) | Rejected (8) | All

FILTERS & SEARCH:

Search: "Search by organization name, email, ID..."
Filters:

Organization type: All | Distributor | Reseller | OEM
Verification status
Date submitted
Industry
Location


Sort: Newest | Oldest | Priority

ORGANIZATION LIST:
Each organization card (for Pending):
HEADER SECTION:

Organization logo (or placeholder)
Company name (H3)
Type badge: "Distributor" | "Reseller" | "OEM"
Verification status: "Pending Verification" (orange badge)
Submitted: "3 days ago"
Priority flag (if >7 days or high-value)

QUICK INFO:

Industry: Technology Distribution
Location: Dubai, UAE
Website: www.techcorp.com (clickable, opens in new tab)
Contact: john@techcorp.com | +971-XXX-XXXX
Requested by: John Smith (profile link)

VERIFICATION CHECKLIST:

✓ Basic information complete
✓ Contact details provided
✓ Business license uploaded
✓ Tax documents uploaded
⚬ Bank reference (optional, not provided)
Completeness: 4/5 required items

ACTIONS:

"Review & Verify" button (primary, blue)
Quick actions:

"Approve" (if confident)
"Reject"
"Request Info"


"View Full Profile" link

DETAILED VERIFICATION PAGE:
Click "Review & Verify" → full page view
TOP SECTION:

Organization name + logo
Verification status with timeline:

Submitted → Under Review → Verified/Rejected
Current step highlighted


Assigned to: [Admin User] (reassignable)

LEFT PANEL (70%):
TAB 1 - BASIC INFORMATION:
Organization Profile:

Legal business name
Trade name (if different)
Organization type
Industry
Sub-industry
Year established
Company size (employees)
Annual revenue range
Website URL (verify it exists and matches)
Description (read for legitimacy)

Contact Information:

Headquarters address

Map integration (verify address)
Street view link


Phone numbers (verification status)
Email addresses
Social media links (check authenticity)

Verification Checks:
Website Verification:

"Visit Website" button
Checklist:
☐ Website exists and loads
☐ Professional appearance
☐ Contact info matches application
☐ Business activity matches claims
☐ SSL certificate present
Notes field for observations

Email Verification:

Domain matches website: ✓ or ✗
Email deliverability check
MX records verified

Phone Verification:

Country code matches location
Phone type: Mobile | Landline | VoIP
"Call to verify" button (logs call)

Social Media Verification:

Profiles exist: ✓
Activity level: Active | Moderate | Inactive
Follower count reasonable
Recent posts align with business

TAB 2 - DOCUMENTS:
Document Review Interface:
Required Documents:

BUSINESS REGISTRATION:

File: business_license.pdf
Uploaded: Jan 15, 2026
Size: 2.1 MB

Verification panel:

Document viewer (secure, watermarked)
Verification checklist:
☐ Document is clear and readable
☐ Company name matches application
☐ Document is current (not expired)
☐ Registration number visible
☐ Issuing authority legitimate
☐ No signs of tampering

Actions:

"Verify Document" button (green)
"Flag as Suspicious" button (red)
"Request Replacement" button
Notes: [textarea for admin notes]


TAX DOCUMENTS:

Similar verification interface
Additional checks:
☐ Tax ID matches
☐ Status is active/valid
☐ Jurisdiction matches location


ADDITIONAL DOCUMENTS:

Bank reference
Trade licenses
Professional certifications
etc.



Document Verification Tools:

Image metadata viewer
PDF properties checker
"Search registration number" (if registry available)
Cross-reference database

Suspicious Indicators:

⚠️ Metadata shows recent creation
⚠️ Image quality inconsistent
⚠️ Registration number format invalid
Auto-flagging system

TAB 3 - BACKGROUND CHECKS:
Automated Checks:
Business Registry Lookup:

"Search business registry" button
Results shown:

Company found: ✓ or ✗
Registration number matches: ✓
Status: Active
Directors/owners listed
Incorporation date matches



Credit Check (if available):

Business credit score
Payment history
Legal filings
Bankruptcies
Liens

Reputation Check:

Google search results summary
News mentions (auto-scraped)
Review sites (if B2B listed)
Complaint databases

Related Entities:

Search for related companies
Same address, phone, or owners
Previous applications
Duplicate detection

Risk Flags:
Auto-generated risk indicators:

🟢 Low risk: Established business, verified docs
🟡 Medium risk: New business, limited history
🔴 High risk: Suspicious documents, conflicting info

TAB 4 - TEAM & ROLES:
Requester Information:

Name: John Smith
Title: CEO
Email: john@techcorp.com (verified)
Phone: +971-XXX-XXXX
Profile completeness: 85%
Identity verification: ✓ Email | ⚬ Phone | ⚬ ID Document

Team Members (invited):

List of team members
Each member:

Name, email, role
Invitation status
Profile link (if accepted)
Roles assigned



Ownership Verification:

"Is requester authorized to represent company?"
Evidence of authority:

Listed as director (if registry checked)
Company email domain
Provided authorization letter



TAB 5 - HISTORY & NOTES:
Application Timeline:

Submitted: [date/time]
Documents uploaded: [dates]
Verification started: [date/time]
Info requested: [if any]
Responses received: [dates]
Status changes: [logged]

Admin Notes:

Internal notes section
Rich text editor
@mention other admins
Thread-style discussion
Attach screenshots or evidence
Notes only visible to admins

Previous Applications:

Check for prior applications
Same company/people
Previous outcomes
Reasons for rejection (if any)

Related Accounts:

Check for connections
Same IP addresses
Same documents used
Potential fraud indicators

TAB 6 - VERIFICATION DECISION:
Decision Checklist:
All checks complete:
☐ Basic information verified
☐ Website verified
☐ Contact details verified
☐ All required documents verified
☐ No red flags detected
☐ Background check passed
☐ Team/ownership verified
Risk Assessment Summary:

Overall risk: Low | Medium | High
Confidence level: 95%
Recommendation: Approve | Reject | Request More Info

Decision Panel:
APPROVE:
Button: "Approve & Verify Organization" (green, large)
Clicking opens modal:

"Approve this organization?"
Approval options:

Verification level:
○ Standard Verification
○ Premium Verification (if met higher standards)
Account limitations (if any):
☐ Limit product listings to: [number]
☐ Require manual approval for campaigns
☐ Review period: [days]
Welcome message: [textarea]

Template: "Congratulations! Your organization..."


Notify team members: ☐


"Confirm Approval" button

After approval:

Status updated to "Verified"
Verification badge assigned
Welcome email sent
Organization gains full access
Logged in verification history

REJECT:
Button: "Reject Application" (outlined, red)
Clicking opens modal:

"Reject this organization?"
Rejection reasons (checkboxes):
☐ Incomplete documentation
☐ Unverifiable business information
☐ Suspicious documents
☐ Failed background check
☐ Does not meet platform requirements
☐ Duplicate application
☐ Other: [specify]
Detailed explanation (required):

[textarea]
"Be specific and professional"
Templates available


Reapplication allowed:

○ Yes, after: [days/date]
○ No (permanent ban)


"Confirm Rejection" button

After rejection:

Status updated to "Rejected"
Professional email sent
Detailed reasons provided
Improvement suggestions (if reapplication allowed)
Logged in system

REQUEST MORE INFO:
Button: "Request Additional Information" (outlined, orange)
Clicking opens modal:

"Request more information"
Items to request (checkboxes):
☐ Updated business license
☐ Proof of address
☐ Authorization letter
☐ ID verification for team members
☐ Clarification on: [specify]
☐ Additional documents: [specify]
Message to organization: [textarea]

Professional templates


Response deadline: [date picker]
"Send Request" button

After sending request:

Status: "Awaiting Additional Info"
Email sent to organization
Timer starts
Auto-reminder if no response

RIGHT PANEL (30%, sticky):
VERIFICATION STATUS:

Current status badge
Days since submission
SLA status:

"Review due in 18 hours" (green)
"Overdue by 6 hours" (red)



QUICK FACTS:

Application ID
Submission date
Organization type
Industry
Location
Team size

SIMILAR ORGANIZATIONS:

"Similar verified organizations:"
3 comparable companies shown
Helps with benchmarking

VERIFICATION HISTORY:

"Past verifications by this admin:"
Approved: 45
Rejected: 8
Accuracy rate: 94%

HELP & GUIDELINES:

"Verification Guidelines" link
"Common Red Flags" checklist
"Contact Compliance Team"

BULK VERIFICATION (list view):
When multiple organizations selected:

Floating action bar
"X organizations selected"
Bulk actions:

Approve selected
Reject selected
Assign to admin
Export data



VERIFICATION ANALYTICS:
Dashboard showing:

Pending queue size (trend)
Average verification time
Approval rate
Rejection reasons (breakdown)
Admin performance
SLA compliance

Design specs: Thorough verification tools, fraud detection, audit trail, secure document viewing, risk assessment, professional communication, compliance-focused, detailed logging

---

### **24. Platform Configuration (`/admin/config`)**
Design a comprehensive platform configuration interface:
SIDEBAR MENU:

General Settings
Categories
Qualification Bands
Rating Tags
Email Templates
Notification Settings
Payment Settings
Security & Privacy
Integrations
API Configuration

GENERAL SETTINGS:
Platform Information:

Platform Name: [text input]
Tagline: [text input]
Logo Upload: [drag & drop]
Favicon: [upload]
Primary Color: [color picker] #0066CC
Secondary Color: [color picker] #FF9900

Contact Information:

Support Email: [email]
Sales Email: [email]
Phone: [phone input]
Address: [textarea]

Business Settings:

Default Currency: [dropdown] USD
Supported Currencies: [multi-select]
Time Zone: [dropdown]
Date Format: [dropdown]
Number Format: [dropdown]

Language Settings:

Default Language: English
Enabled Languages:
☐ English
☐ Arabic
☐ French

"+ Add language"



CATEGORY MANAGEMENT:
Page layout:

Tree view (left): Hierarchical category structure
Details panel (right): Selected category details

Category Tree:
└─ Networking & Infrastructure
   ├─ Switches
   │  ├─ Enterprise Switches
   │  ├─ SMB Switches
   │  └─ Data Center Switches
   ├─ Routers
   └─ Wireless
└─ Storage Solutions
   ├─ SAN
   ├─ NAS
   └─ Cloud Storage
└─ Security
   ...
Category actions:

Drag to reorder
Nest/unnest
"+ Add category" button
"Import categories" (CSV)

Selected Category Details:
Basic Info:

Category Name: [text input]
Display Name: [text input]
Description: [rich text]
Icon: [icon picker or upload]
Featured: [checkbox]

Settings:

Status: ○ Active ○ Inactive
Visibility: ○ Public ○ Hidden
Allow Products: [checkbox]
Allow Services: [checkbox]

Specifications Template:

"Define standard specs for this category"
"+ Add specification field"
Field list:

Field name: "Port Count"
Field type: Number | Text | Dropdown | Range
Required: [checkbox]
Options (if dropdown): [list]
Remove option



SEO:

Meta Title: [text]
Meta Description: [textarea]
URL Slug: [text]

Actions:

"Save Category"
"Delete Category" (with confirmation)
"View Products in Category"

QUALIFICATION BANDS:
Heading: "Define qualification criteria for targeting"
Revenue Bands:
Configuration table:

Band Name | Min Revenue | Max Revenue | Actions
Startup | $0 | $1M | Edit | Delete
Small Business | $1M | $5M | Edit | Delete
Mid-Market | $5M | $10M | Edit | Delete
Enterprise | $10M | + | Edit | Delete
"+ Add Revenue Band"

Certification Types:

List of recognized certifications
Certification name
Issuing body
Verification method
Tier/level
"+ Add Certification"

Industry Classifications:

Standard industry list
Custom additions
Grouping/categorization

Company Size Bands:

Employee count ranges
1-10
11-50
51-200
201-500
500+

Geographic Regions:

Define targetable regions
Country groups
State/province level
City level

RATING TAGS:
Heading: "Configure rating tags and bands"
Positive Tags:

Tag list (draggable to reorder):

"Professional" (icon, color)
"Responsive"
"Reliable"
"Fair Pricing"
"Quality Products"
etc.


Each tag:

Name: [text]
Icon: [icon picker]
Color: [color picker]
Description: [text]
Edit | Delete


"+ Add Positive Tag"

Negative Tags:

Similar list for negative feedback tags
Triggers (if selected, may affect scores)

Rating Bands:

Configure star rating interpretations
5.0 - 4.5: Excellent
4.4 - 4.0: Very Good
3.9 - 3.5: Good
3.4 - 3.0: Fair
<3.0: Poor

Credibility Tiers:

Define individual tiers:
Tier 1 - UNPROVEN:

Points required: 0-299
Badge color: Bronze
Badge icon: [upload]
Benefits: Basic access

Tier 2 - EMERGING:

Points: 300-699
Badge color: Silver
Benefits: [list]

Tier 3 - PROVEN:

Points: 700-1499
Badge color: Gold

Tier 4 - ELITE:

Points: 1500+
Badge color: Platinum
"Add Tier" button



Point System:

Configure point awards:

Deal registered: [50] points
Deal won: [100] points
Review given: [25] points
Review received (>4 stars): [10] points
Profile completed: [50] points
Certification added: [30] points


Penalties:

Late payment: [-50] points
Deal lost: [-10] points
Negative review: [-20] points



EMAIL TEMPLATES:
Template Categories:

Authentication
Deals
Quotes
Organizations
Notifications
Reminders
Admin

Template List:

Template name | Subject | Status | Actions

Example: "Welcome Email"

Subject: "Welcome to {{platform_name}}!"
From: {{support_email}}
Reply-to: {{support_email}}

Template Editor:

Rich text editor with variables
Available variables dropdown:

{{user_name}}
{{organization_name}}
{{deal_value}}
{{quote_amount}}
{{platform_name}}
etc.



Template sections:

Header (HTML)
Body (HTML with variables)
Footer (HTML)

Preview:

"Preview Email" button
Desktop/mobile preview
Test email sender:

Send to: [email]
"Send Test Email"



Template actions:

Save
Duplicate
Reset to default
Delete (if custom)

NOTIFICATION SETTINGS:
User Notifications Configuration:
For each event type:

Event: "New Deal Registered"
Channels:
☐ Email
☐ Push Notification
☐ SMS (if enabled)
☐ In-app
Default: On/Off (user can override)
Frequency: Immediate | Digest | Off

Events list:

Deal registered
Quote received
Deal won/lost
Engagement request
Credit approved
Document uploaded
Review received
etc.

Admin Notifications:

Critical alerts: Always email + SMS
Important: Email
Low priority: In-app only

Notification Templates:

Similar to email templates
For push notifications
Character limits
Rich notification support

PAYMENT SETTINGS:
(Note: Out of scope for MVP, but placeholder)
Payment Gateway Configuration:

Stripe: ○ Enabled ○ Disabled

API Keys (hidden)
Webhook URL
Test mode: [toggle]



Supported Payment Methods:

Credit Card
Bank Transfer
PayPal
Local payment methods

Currency Settings:

Exchange rate provider
Auto-update frequency
Manual rate override

SECURITY & PRIVACY:
Authentication Settings:

Password requirements:

Minimum length: [8]
Require uppercase: [checkbox]
Require numbers: [checkbox]
Require symbols: [checkbox]


OTP Settings:

OTP length: [6] digits
Validity: [10] minutes
Max attempts: [3]



Session Management:

Session timeout: [30] minutes
Remember me duration: [30] days
Max concurrent sessions: [3]

Two-Factor Authentication:

Enforce for admins: [checkbox]
Enforce for distributors: [checkbox]
Enforce for all: [checkbox]

Data Privacy:

GDPR compliance: [checkbox]
Data retention period: [365] days
Auto-delete inactive accounts: [checkbox]

After: [730] days



API Rate Limiting:

Requests per minute: [100]
Burst limit: [200]
IP-based limiting: [checkbox]

INTEGRATIONS:
Third-party Integrations:
Analytics:

Google Analytics: [toggle]

Tracking ID: [input]


Mixpanel: [toggle]

Communication:

SendGrid (email): [toggle]

API Key: [hidden input]


Twilio (SMS): [toggle]

CRM:

Salesforce: [toggle]
HubSpot: [toggle]

Payment:

Stripe: [toggle]
PayPal: [toggle]

Storage:

AWS S3: [toggle]

Bucket name: [input]
Region: [dropdown]



Each integration:

Enable/disable toggle
Configuration fields
Test connection button
Webhook URLs
"View Logs" link

API CONFIGURATION:
API Settings:

API Version: v1
Base URL: https://api.marketplace.com
Documentation URL: https://docs.marketplace.com

Rate Limits (per user tier):

Free tier: 100 requests/hour
Basic: 1000 requests/hour
Premium: 10000 requests/hour
Enterprise: Custom

API Keys Management:

"Generate New API Key"
Active keys list:

Key (partial): sk_live_xxxx...xxxx
Created: date
Last used: date
Permissions: Read | Write | Admin
"Revoke" button



Webhooks:

Event subscriptions
Webhook URLs
Retry policy
Webhook logs

SAVE & APPLY:
Bottom action bar (sticky):

"Save Changes" (blue, large)
"Discard Changes" (outlined)
"Reset to Defaults" (danger)
Unsaved changes warning

Change Log:

Track all configuration changes
Who changed what and when
Rollback capability

Design specs: Admin-focused, organized sections, validation, test capabilities, secure credential handling, change logging, backup/restore, mobile-limited (desktop primary)

---

## 🔔 **SHARED COMPONENTS**

### **25. Universal Search (`/search` & Global Search Bar)**
Design a comprehensive search interface:
GLOBAL SEARCH BAR (in header, all pages):
Minimal State:

Search icon + "Search products, services, distributors..."
Width: 300-400px
Click to expand

Expanded/Focused State:

Full-width bar (or modal overlay on mobile)
Search input (large)
Microphone icon (voice search)
Filter button

As-You-Type Features:
Autocomplete Dropdown:

Appears after 2+ characters
Sectioned results:
SUGGESTED SEARCHES:

"cisco catalyst switches"
"network security solutions"
Based on: trending, your history

PRODUCTS (top 3):

Product image thumbnail
Name (matching text highlighted)
Price or "Request Quote"
Distributor name
"View all products →" if more

SERVICES (top 3):

Service icon
Name
Provider
"View all services →"

DISTRIBUTORS (top 3):

Logo
Company name
Rating ★★★★☆
Products count
"View all distributors →"

CATEGORIES:

Matched categories
Icon + name

RECENT SEARCHES:

Your recent searches (if logged in)
Clock icon + search term
"Clear history" link



Keyboard Navigation:

Arrow keys to navigate results
Enter to select
Esc to close

Recent Searches (local storage):

Last 10 searches
Clear individual or all
Click to search again

FULL SEARCH RESULTS PAGE (/search?q=...):
PAGE HEADER:

Search query displayed: "Results for 'cisco switches'"
Result count: "248 results found"
Search time: "0.15 seconds"
Filters button (mobile)

LAYOUT:

Left sidebar (25%): Filters
Main area (75%): Results

LEFT SIDEBAR - FILTERS:
Search Within Results:

Mini search bar
"Refine search..."

Result Type Filter:

Checkboxes:
☐ Products (145)
☐ Services (42)
☐ Distributors (28)
☐ Resellers (33)

All other filters (similar to category page):

Price range
Availability
Distributor
Location
Category
Brand
Rating
etc.

Active Filters:

Show applied filters as pills
Clear individual or all

Save Search:

"Save this search" button
Get alerts for new matches

MAIN RESULTS AREA:
Sort Options:

Relevance (default)
Price: Low to High
Price: High to Low
Rating
Newest
Most Popular

View Toggle:

Grid view
List view

Tabbed Results (if mixed types):

All (248)
Products (145)
Services (42)
Distributors (28)
Resellers (33)

Result Cards:
PRODUCT RESULT:

Image (left)
Title (bold, clickable)

Matching text highlighted


SKU
Distributor name + logo
Price or "Request Quote"
Rating + reviews
Short description (snippet with matches highlighted)
Availability badge
"Quick View" | "Add to Compare"

SERVICE RESULT:

Icon
Title
Provider
Starting price
Description snippet
Category tags

DISTRIBUTOR RESULT:

Logo (large)
Company name
Rating ★★★★★ (4.8)
Location
Products: 2,450
Specializations: badges
"View Profile" button

Did You Mean:

If query has typos:
"Did you mean: network switches?"

Click to search correction



No Results:

"No results found for '[query]'"
Suggestions:
• Check spelling
• Try different keywords
• Browse categories
• "Search tips" link
Browse popular categories
Contact support

Related Searches:

"People also searched for:"
Similar query suggestions
Click to search

Pagination:

Load more (infinite scroll) or
Traditional pagination

ADVANCED SEARCH (/search/advanced):
Advanced Search Form:
All of these words: []
This exact phrase: []
Any of these words: []
None of these words: []
Category: [dropdown]
Price range: [min] to [max]
Location: [country] [state/city]
Product specific:

Brand: [multi-select]
Availability: [checkboxes]

Service specific:

Service type: [dropdown]
Delivery method: [checkboxes]

Distributor specific:

Certifications: [multi-select]
Rating: [minimum slider]

Date filters:

Added: [date range]
Updated: [date range]

"Search" button
SEARCH ANALYTICS (user dashboard):
Your Search History:

List of past searches
Date, query, results count
"Search again" button
Delete from history

Saved Searches:

Your saved searches
Enable email alerts
Manage notifications
Delete saved search

Search Suggestions:

"Based on your searches, you might like:"
Product recommendations
Category suggestions

SEARCH FOR ADMIN:
Admin Search Tools:

Search all content (including drafts, hidden)
Search by ID, SKU, email
Filter by status
Bulk operations on results

Design specs: Fast, predictive, highlighting, mobile-optimized, voice search, saved searches, comprehensive filters, keyboard shortcuts

---

### **26. Notifications Center (`/notifications`)**
Design a comprehensive notifications interface:
NOTIFICATION BELL (Header, all pages):
Bell Icon:

Badge with unread count (red dot)
Badge max: "99+"
Click to open dropdown

Notification Dropdown:
Header:

"Notifications" title
"Mark all as read" link
Settings gear icon

Notification List (scrollable):

Last 10 notifications
Each notification:

Icon (type-specific, color-coded)
Unread: blue background
Read: white background

Content:

Title (bold): "New quote received"
Message: "TechDist Global sent a quote for Deal #D-1234"
Timestamp: "2 hours ago"
Click to view details

Actions (on hover):

"Mark as read/unread"
"Delete"



Footer:

"View All Notifications" link
Takes to full notifications page

FULL NOTIFICATIONS PAGE (/notifications):
PAGE HEADER:

Heading: "Notifications"
Actions:

"Mark all as read"
"Settings" button



FILTER TABS:

All (42)
Unread (12)
Deals (18)
Quotes (8)
System (5)
Mentions (2)

FILTERS & SORT:

Date range filter
Type filter (multi-select):

Deals
Quotes
Engagements
Credit
Reviews
System
Mentions


Sort: Newest | Oldest | Unread First

NOTIFICATION LIST:
Grouped by date:

TODAY
YESTERDAY
THIS WEEK
EARLIER

Each Notification Card:
Layout:

Left: Type icon (colored circle)
Middle: Content
Right: Actions menu (⋮)

Notification Types:
DEAL NOTIFICATIONS:
Icon: 🤝 (blue)

"Deal registered: Enterprise Network Upgrade"
"Customer XYZ Corporation verified email"
"Deal moved to Quoted stage"
Click → Go to deal detail

QUOTE NOTIFICATIONS:
Icon: 📋 (orange)

"New quote received from TechDist Global"
"Quote expires in 2 days"
"Quote updated by distributor"
"Your quote was accepted!"
Click → Go to quote

ENGAGEMENT NOTIFICATIONS:
Icon: 👥 (purple)

"ABC Resellers sent engagement request"
"Engagement request accepted"
"Engagement request declined"
Click → Go to engagement

CREDIT NOTIFICATIONS:
Icon: 💳 (green)

"Credit request approved for $50K"
"Credit request needs more info"
"Payment due in 5 days"
Click → Go to credit details

REVIEW NOTIFICATIONS:
Icon: ⭐ (yellow)

"You received a 5-star review"
"Rate your experience with TechDist"
Click → Go to review

SYSTEM NOTIFICATIONS:
Icon: ⚙️ (gray)

"System maintenance scheduled"
"New features available"
"Your profile is 80% complete"
"Verification approved"
Click → Relevant page

MENTION NOTIFICATIONS:
Icon: @ (blue)

"@John mentioned you in a note"
Click → Go to mention context

Each notification shows:

Title (bold)
Message (2 lines max, ellipsis)
Timestamp: "2 hours ago" or specific date
Unread indicator (blue dot)
