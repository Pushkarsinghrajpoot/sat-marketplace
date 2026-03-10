# Enhanced Products & Chat System Migration Guide

## Overview
This migration adds comprehensive product listing functionality and a real-time chat system to the marketplace application.

## What's New

### 1. Enhanced Product Schema
- **Comprehensive Product Information**: Model numbers, manufacturer details, key features
- **Technical Specifications**: Structured tech specs with categories
- **Service Bundling**: Installation, configuration, deployment services
- **Product Reviews**: Customer reviews and ratings
- **Enhanced Metadata**: Warranty info, delivery timeline, stock status
- **Trending & Featured**: Support for trending and featured products

### 2. Chat System
- **Real-time Messaging**: Live chat between customers, agents, resellers, and distributors
- **Conversation Types**: Product inquiries, quote requests, technical support
- **File Attachments**: Support for document sharing
- **Multi-participant**: Multiple users can join conversations
- **Read Receipts**: Track message read status
- **Priority Management**: Conversation priority levels

### 3. Product Inquiries & Demos
- **Technical Questions**: Customers can ask product questions
- **Demo Requests**: Schedule product demonstrations
- **Response Tracking**: Track inquiry responses and status

## Migration Steps

### Step 1: Run the Database Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
# Navigate to project directory
cd /Users/pushkarssingh/Desktop/marketplace-aws

# Run the migration
supabase db push

# Or if using migration files directly
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20240310_enhanced_products_and_chat.sql
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20240310_enhanced_products_and_chat.sql`
4. Paste and execute the SQL

### Step 2: Verify Migration

After running the migration, verify these tables were created:
- `product_services`
- `product_tech_specs`
- `product_reviews`
- `chat_conversations`
- `chat_messages`
- `chat_attachments`
- `chat_participants`
- `product_inquiries`
- `demo_requests`

Run this query to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'product_services',
  'product_tech_specs',
  'product_reviews',
  'chat_conversations',
  'chat_messages',
  'chat_attachments',
  'chat_participants',
  'product_inquiries',
  'demo_requests'
);
```

### Step 3: Build the Application

```bash
npm run build
```

### Step 4: Start the Application

```bash
npm run dev
```

## New Features Available

### For Resellers
1. **Product Browsing**
   - Navigate to `/reseller/products`
   - Search and filter products
   - View detailed product information
   - Request quotes directly from product page

2. **Product Actions**
   - Request Quote
   - Ask Technical Questions
   - Request Product Demo
   - View Product Details
   - Chat with Sales/Support

3. **Chat System**
   - Click the chat widget in bottom-right corner
   - Start new conversations
   - View conversation history
   - Real-time messaging

### For Distributors
1. **Product Management**
   - Enhanced product creation with all new fields
   - Add product services (installation, configuration, etc.)
   - Add technical specifications
   - Manage product reviews

2. **Customer Support**
   - Respond to product inquiries
   - Manage demo requests
   - Chat with resellers and customers

### For Platform Admins
1. **Chat Management**
   - Assign agents to conversations
   - Monitor all conversations
   - Close/archive conversations

## API Helpers Available

### Product Helpers (`lib/product-helpers.ts`)
```typescript
// Get enhanced products with filters
await getEnhancedProducts({ 
  status: 'ACTIVE', 
  featured: true 
});

// Get single product with all details
await getProductById(productId);

// Create product inquiry
await createProductInquiry({
  productId,
  userId,
  inquiryType: 'TECHNICAL',
  subject: 'Question about specs',
  question: 'What are the power requirements?'
});

// Request demo
await createDemoRequest({
  productId,
  userId,
  organizationId,
  locationType: 'ONLINE',
  attendeeCount: 5
});
```

### Chat Helpers (`lib/chat-helpers.ts`)
```typescript
// Create conversation
await createChatConversation({
  conversationType: 'PRODUCT_INQUIRY',
  customerId: user.id,
  subject: 'Product Question'
});

// Send message
await sendChatMessage({
  conversationId,
  senderId: user.id,
  senderRole: 'CUSTOMER',
  messageText: 'Hello, I need help'
});

// Get user conversations
await getUserConversations(userId, {
  status: 'ACTIVE'
});

// Subscribe to real-time messages
const subscription = subscribeToConversation(
  conversationId,
  (newMessage) => {
    console.log('New message:', newMessage);
  }
);
```

## Components Available

### Chat Widget
Already integrated in the application layout. Available to all logged-in users.

### Product Card
Used in `/reseller/products` page for displaying products with all actions.

## Database Schema Details

### Enhanced Products Table
New columns added to `products`:
- `model_number` - Product model identifier
- `manufacturer` - Manufacturer name
- `key_features` - Array of key product features
- `compatibility_details` - Compatibility information
- `performance_specs` - JSON field for performance data
- `min_order_quantity` - Minimum order quantity
- `stock_status` - Current stock status
- `delivery_timeline` - Expected delivery time
- `warranty_info` - Warranty details
- `is_trending` - Trending product flag
- `is_featured` - Featured product flag
- `view_count` - Number of product views
- `demo_available` - Demo availability flag
- `installation_available` - Installation service flag

### Chat Conversations
- Supports multiple conversation types
- Links to products, deals, quotes, BOQs
- Priority levels for support queues
- Status tracking (active, closed, archived)

### Chat Messages
- Real-time messaging
- Support for text, files, quotes, BOQs
- Read receipts
- Sender role tracking

## Testing the Features

### Test Product Browsing
1. Login as a reseller
2. Navigate to Products (should now be available in menu)
3. Search/filter products
4. Click "Request Quote" on any product
5. Click "Ask Question" to create inquiry
6. Click "Request Demo" if available

### Test Chat System
1. Click chat widget in bottom-right
2. Start new conversation
3. Send messages
4. Check real-time updates
5. Mark as read/unread

### Test Product Details
1. Click "View Details" on any product
2. See comprehensive product information
3. View technical specifications
4. See available services
5. Read reviews

## Troubleshooting

### Migration Errors
If you encounter errors during migration:
1. Check Supabase connection
2. Verify you have necessary permissions
3. Check for conflicting table names
4. Review error messages in SQL editor

### Build Errors
If build fails:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Build again
npm run build
```

### TypeScript Errors
Ensure all new types are imported correctly:
```typescript
import type { 
  EnhancedProduct, 
  ChatConversation, 
  ChatMessage 
} from '@/lib/types';
```

## Next Steps

1. **Populate Sample Data**: Add sample products with enhanced details
2. **Test Chat Flow**: Test customer → agent → reseller → distributor flow
3. **Configure Services**: Set up product services and pricing
4. **Enable Notifications**: Configure notifications for new inquiries/chats
5. **Set up Agents**: Assign support agents for chat handling

## Support

For issues or questions:
1. Check console logs for errors
2. Verify database migration completed
3. Check Supabase logs
4. Review TypeScript errors in IDE
