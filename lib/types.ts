export type OrganizationType = 'DISTRIBUTOR' | 'RESELLER' | 'OEM' | 'INDIVIDUAL';

export type UserRole = 'ADMIN' | 'SALES_MANAGER' | 'PRODUCT_MANAGER' | 'SUPPORT' | 'SALES_REP' | 'PRESALES_ENGINEER' | 'ACCOUNT_MANAGER' | 'PLATFORM_ADMIN';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

export type DealStatus = 'PROSPECTING' | 'REGISTERED' | 'QUOTED' | 'WON' | 'LOST';

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
  createdAt: string;
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
  resellerId: string;
  customerEmail: string;
  customerName: string;
  customerContact: string;
  opportunityName: string;
  estimatedValue: number;
  closeDate: string;
  status: DealStatus;
  products: string[];
  services: string[];
  lockedAt?: string;
  engagedDistributors: string[];
  quotes: string[];
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
  visibility: 'PUBLIC' | 'PRIVATE';
  distributorsInvited: string[];
  createdAt: string;
}

export interface BOQItem {
  id: string;
  productSku: string;
  productName: string;
  quantity: number;
  specifications?: string;
}

export interface Quote {
  id: string;
  boqId: string;
  dealId: string;
  distributorId: string;
  resellerId: string;
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
