export type OrganizationType = 'DISTRIBUTOR' | 'RESELLER' | 'OEM' | 'INDIVIDUAL';

export type UserRole = 'RESELLER' | 'DISTRIBUTOR' | 'END_USER' | 'PLATFORM_ADMIN';

export type DealType = 'DEAL_REGISTRATION' | 'BIDDING' | 'DIRECT_QUERY';

export type QuoteType = 'NORMAL' | 'BIDDING';

export type ActivityType = 'MEETING' | 'DEMO' | 'BOQ_REVISION';

export type DealPriority = 'NORMAL' | 'GOLD';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

export type DealStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'PENDING_DECLARATION' | 'ACTIVE' | 'CONVERTED_TO_BIDDING' | 'QUOTED' | 'WON' | 'LOST';

export type QuoteStatus = 'TO_SUBMIT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'WON' | 'LOST' | 'EXPIRED';

export type EngagementStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type CampaignStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type CreditRequestStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organizationId?: string;
  role: UserRole;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  type: OrganizationType;
  logo?: string;
  description: string;
  industry: string;
  companySize: string;
  yearEstablished: number;
  website?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  address: Address;
  contact: ContactInfo;
  socialMedia?: SocialMedia;
  members: string[];
  createdAt: string;
}

export interface Address {
  country: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface ContactInfo {
  phone: string;
  altPhone?: string;
  supportEmail: string;
  salesEmail: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  parent?: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  volumePricing: VolumePricing[];
  inventory: number;
  lowStockThreshold: number;
  availability: 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  leadTime: string;
  specifications: Specification[];
  images: string[];
  videos?: string[];
  documents?: Document[];
  status: ProductStatus;
  views: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  pricing: ServicePricing;
  deliverables: string[];
  sla: string;
  team: TeamMember[];
  caseStudies: CaseStudy[];
  images: string[];
  status: ProductStatus;
  views: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface VolumePricing {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discount: number;
}

export interface ServicePricing {
  basic: number;
  professional: number;
  enterprise: string;
}

export interface Specification {
  group: string;
  label: string;
  value: string;
  unit?: string;
}

export interface Document {
  name: string;
  url: string;
  type: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  certifications: string[];
}

export interface CaseStudy {
  title: string;
  industry: string;
  description: string;
  metrics: string[];
}

export interface Deal {
  id: string;
  dealType: DealType;
  resellerId: string;
  resellerOrganizationId: string;
  customerEmail: string;
  customerName: string;
  customerCompany: string;
  customerContact: string;
  opportunityName: string;
  estimatedValue: number;
  closeDate: string;
  status: DealStatus;
  products: string[];
  services: string[];
  priority: DealPriority;
  score: number;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  isVerified: boolean;
  verificationToken?: string;
  verifiedAt?: string;
  declarationAccepted: boolean;
  declarationSignature?: string;
  declarationAcceptedAt?: string;
  convertedToBidding: boolean;
  convertedToBiddingAt?: string;
  parentDealId?: string;
  engagedDistributors: string[];
  quotes: string[];
  activities: string[];
  wonQuoteId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BOQ {
  id: string;
  dealId: string;
  resellerId: string;
  fileName: string;
  fileUrl: string;
  items: BOQItem[];
  visibility: 'PROTECTED' | 'BIDDING';
  distributorsInvited: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BOQItem {
  id: string;
  productSku: string;
  productName: string;
  quantity: number;
  specifications?: string;
}

export interface DealActivity {
  id: string;
  dealId: string;
  resellerId: string;
  activityType: ActivityType;
  points: number;
  scheduledDate?: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'REJECTED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectQuery {
  id: string;
  resellerId: string;
  resellerOrganizationId: string;
  distributorId?: string;
  title: string;
  requirement: string;
  products?: string[];
  estimatedBudget?: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'RESPONDED' | 'CLOSED';
  responses: DirectQueryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface DirectQueryResponse {
  id: string;
  queryId: string;
  distributorId: string;
  message: string;
  quoteId?: string;
  attachments?: string[];
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteType: QuoteType;
  boqId?: string;
  dealId?: string;
  queryId?: string;
  distributorId: string;
  resellerId: string;
  recipientUserId?: string;
  recipientRole?: UserRole;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  status: QuoteStatus;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  validUntil: string;
  submittedAt?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface PaymentTerms {
  netDays: number;
  method: string;
  earlyPaymentDiscount?: number;
}

export interface DeliveryTerms {
  estimatedDelivery: string;
  method: string;
  location: string;
  incoterms?: string;
}

export interface Campaign {
  id: string;
  distributorId: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  targetAudience: TargetAudience;
  products: string[];
  incentives: Incentives;
  goals: CampaignGoals;
  analytics: CampaignAnalytics;
  bannerImage?: string;
  createdAt: string;
}

export interface TargetAudience {
  type: 'ALL' | 'QUALIFIED' | 'SPECIFIC';
  revenueRange?: string[];
  certifications?: string[];
  locations?: string[];
  industries?: string[];
  companySize?: string[];
  specificResellers?: string[];
}

export interface Incentives {
  type: string;
  discount?: number;
  freeShipping?: boolean;
  extendedWarranty?: boolean;
  paymentTerms?: number;
}

export interface CampaignGoals {
  targetRevenue?: number;
  targetEngagements?: number;
  targetConversions?: number;
}

export interface CampaignAnalytics {
  views: number;
  engagements: number;
  quotes: number;
  conversions: number;
  revenue: number;
}

export interface EngagementRequest {
  id: string;
  resellerId: string;
  distributorId: string;
  dealId: string;
  products: string[];
  message: string;
  status: EngagementStatus;
  declineReason?: string;
  quoteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditRequest {
  id: string;
  resellerId: string;
  distributorId: string;
  amount: number;
  terms: string;
  documents: string[];
  status: CreditRequestStatus;
  approvedLimit?: number;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  fromOrgId: string;
  toOrgId: string;
  dealId: string;
  overallRating: number;
  categoryRatings: CategoryRatings;
  tags: string[];
  review?: string;
  anonymous: boolean;
  createdAt: string;
}

export interface CategoryRatings {
  communication: number;
  pricing: number;
  delivery: number;
  support: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  description: string;
  metadata?: any;
  createdAt: string;
}
