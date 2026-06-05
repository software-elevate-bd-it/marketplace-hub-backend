# Marketplace Hub Backend - Complete Schema Documentation

## Architecture Overview

This backend follows a layered architecture pattern with the following structure for each module:

```
src/modules/{module}/
├── dto/              # Data Transfer Objects
├── repository/       # Data Access Layer
├── service/          # Business Logic Layer
├── {module}.controller.ts    # API Endpoints
└── {module}.module.ts        # Module Definition
```

## Common Utilities

### Pagination DTO
**File**: `src/common/dto/pagination.dto.ts`

```typescript
export class PaginationDto {
  page: number = 1;
  perPage: number = 20;
  sort?: string;
}

export class PaginationMeta {
  page: number;
  perpage: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
```

### Response DTOs
**File**: `src/common/dto/response.dto.ts`

```typescript
export class SuccessResponse<T = any> {
  success: boolean = true;
  message: string;
  data: T;
  timestamp: string;
}

export class ErrorResponse {
  success: boolean = false;
  code: string;
  message: string;
  details?: Record<string, any> | any[];
  timestamp: string;
}

export class ValidationError {
  field: string;
  rule: string;
  message: string;
}
```

---

## Authentication Module

**Base Path**: `/auth`

### Register User
```
POST /auth/register
Request: { email, password, name, country }
Response: { id, email, name, token, verificationRequired }
Status: 201
```

**DTO**: `src/modules/auth/dto/register.dto.ts`
**Service**: `src/modules/auth/auth.service.ts`
**Controller**: `src/modules/auth/auth.controller.ts`

### Login
```
POST /auth/login
Request: { email, password }
Response: { token, user: { id, name } }
Status: 200
```

### Request OTP
```
POST /auth/otp/request
Request: { channel: "phone|email", destination }
Response: { success: true, ttl: 300 }
Status: 200
```

### Verify OTP
```
POST /auth/otp/verify
Request: { destination, code }
Response: { token }
Status: 200
```

### Password Reset
```
POST /auth/password/forgot
Request: { email }
Response: { success: true }
Status: 200

POST /auth/password/reset
Request: { token, password }
Response: { success: true }
Status: 200
```

---

## Users & Profile Module

**Base Path**: `/users`

**DTO Files**:
- `src/modules/users/dto/create-user.dto.ts`
  - `CreateUserDto`: { name, email, password, country? }
  - `UpdateUserDto`: { name?, avatar?, country?, language? }
  - `UserResponseDto`: { id, name, email, avatar?, country?, language?, isVerified, createdAt }

**Repository**: `src/modules/users/repository/user.repository.ts`
- `create(data)`: Create new user
- `findById(id)`: Get user by ID
- `findByEmail(email)`: Get user by email
- `findAll(skip, take)`: Paginated user list
- `update(id, data)`: Update user
- `delete(id)`: Delete user
- `count()`: Count total users

**Service**: `src/modules/users/service/user.service.ts`
- `createUser(dto)`: Create new user
- `getUserById(id)`: Get user profile
- `updateUser(id, dto)`: Update profile
- `deleteUser(id)`: Delete account
- `getAllUsers(page, perPage)`: List all users

**Controller**: `src/modules/users/users.controller.ts`

### Get Current User
```
GET /users/me
Auth: Required (Bearer token)
Response: UserResponseDto
Status: 200
```

### Update Profile
```
PATCH /users/me
Auth: Required
Request: UpdateUserDto
Response: UserResponseDto
Status: 200
```

### Delete Account
```
DELETE /users/me
Auth: Required
Response: { success: true }
Status: 200
```

### Get Public Profile
```
GET /users/:id
Response: UserResponseDto
Status: 200
```

---

## Listings Module

**Base Path**: `/listings`

**DTO Files**:
- `src/modules/listings/dto/listing.dto.ts`
  - `CreateListingDto`: { title, price, currency, category, location, country, description, condition, images[], attributes? }
  - `UpdateListingDto`: { title?, price?, description?, images[]? }
  - `QueryListingDto`: { q?, category?, country?, minPrice?, maxPrice?, sort?, page?, limit? }
  - `ListingResponseDto`: { id, title, price, currency, category, location, country, image, condition, createdAt }

**Repository**: `src/modules/listings/repository/listing.repository.ts`
- `create(data)`: Create listing
- `findById(id)`: Get listing
- `findAll(skip, take, where)`: List listings
- `findByCategory(category, skip, take)`: Filter by category
- `findByCountry(country, skip, take)`: Filter by country
- `search(query, skip, take, where)`: Full-text search
- `findBySeller(sellerId, skip, take)`: Seller's listings
- `update(id, data)`: Update listing
- `delete(id)`: Delete listing
- `count(where)`: Count listings

**Service**: `src/modules/listings/service/listing.service.ts`
- `createListing(sellerId, dto)`: Create new listing
- `getListingById(id)`: Get listing details
- `searchListings(query, page, perPage)`: Search & filter
- `updateListing(id, sellerId, dto)`: Update own listing
- `deleteListing(id, sellerId)`: Delete own listing
- `getSellerListings(sellerId, page, perPage)`: Get seller's listings
- `getTopPicks(page, perPage)`: Get popular listings

**Controller**: `src/modules/listings/listings.controller.ts`

### Create Listing
```
POST /listings
Auth: Required
Request: CreateListingDto
Response: ListingResponseDto
Status: 201
```

### Search Listings
```
GET /listings?q=search&category=category&country=country&minPrice=0&maxPrice=1000&sort=newest&page=1&perPage=20
Response: { data: ListingResponseDto[], pagination: PaginationMeta }
Status: 200
```

### Get Top Picks
```
GET /listings/top-picks?page=1&perPage=20
Response: { data: ListingResponseDto[], pagination: PaginationMeta }
Status: 200
```

### Get Recent Listings
```
GET /listings/recent?page=1&perPage=20
Response: { data: ListingResponseDto[], pagination: PaginationMeta }
Status: 200
```

### Get Listing Details
```
GET /listings/:id
Response: ListingResponseDto
Status: 200
```

### Update Listing
```
PATCH /listings/:id
Auth: Required
Request: UpdateListingDto
Response: ListingResponseDto
Status: 200
```

### Delete Listing
```
DELETE /listings/:id
Auth: Required
Response: { success: true }
Status: 200
```

### Report Listing
```
POST /listings/:id/report
Auth: Required
Request: { reason, details? }
Response: { success: true }
Status: 200
```

---

## Orders & Escrow Module

**Base Path**: `/orders`

**DTO Files**:
- `src/modules/orders/dto/order.dto.ts`
  - `CreateOrderDto`: { shippingAddress?, paymentMethod? }
  - `UpdateOrderStatusDto`: { status: OrderStatus }
  - `DisputeOrderDto`: { reason, evidence?: string[] }
  - `OrderResponseDto`: { id, buyerId, sellerId, listingId, amount, currency, status, createdAt }

**Enums**: `src/modules/orders/enums/order-status.enum.ts`
```typescript
enum OrderStatus {
  pending_payment = "pending_payment",
  funds_held = "funds_held",
  shipped = "shipped",
  delivered = "delivered",
  released = "released",
  disputed = "disputed",
  refunded = "refunded",
  cancelled = "cancelled"
}
```

**Repository**: `src/modules/orders/repository/order.repository.ts`
- `create(data)`: Create order
- `findById(id)`: Get order
- `findByBuyerId(buyerId, skip, take)`: Buyer's orders
- `findBySellerId(sellerId, skip, take)`: Seller's orders
- `findAll(skip, take)`: All orders
- `findByStatus(status, skip, take)`: Filter by status
- `update(id, data)`: Update order
- `delete(id)`: Delete order

**Service**: `src/modules/orders/service/order.service.ts`
- `createOrder(buyerId, listingId, dto)`: Create order
- `getOrderById(id)`: Get order details
- `getBuyerOrders(buyerId, page, perPage)`: Buyer's orders
- `getSellerOrders(sellerId, page, perPage)`: Seller's orders
- `updateOrderStatus(id, status)`: Update status
- `releaseEscrow(id, buyerId)`: Release funds
- `disputeOrder(id, reason, evidence)`: Open dispute

**Controller**: `src/modules/orders/orders.controller.ts`

### Create Order
```
POST /orders
Auth: Required
Request: CreateOrderDto
Response: { orderId, paymentUrl }
Status: 201
```

### List User Orders
```
GET /orders?page=1&perPage=20
Auth: Required
Response: { data: OrderResponseDto[], pagination: PaginationMeta }
Status: 200
```

### Get Order Details
```
GET /orders/:id
Auth: Required
Response: { id, items, escrow: { stage, history } }
Status: 200
```

### Release Escrow
```
POST /orders/:id/release
Auth: Required
Response: { success: true }
Status: 200
```

### Dispute Order
```
POST /orders/:id/dispute
Auth: Required
Request: DisputeOrderDto
Response: { disputeId, reason }
Status: 201
```

---

## Chat & Messaging Module

**Base Path**: `/chat`

**DTO Files**:
- `src/modules/chat/dto/message.dto.ts`
  - `SendMessageDto`: { text, attachments?: string[] }
  - `MessageResponseDto`: { id, from, text, attachments?, createdAt }
  - `ChatThreadResponseDto`: { id, participant: { id, name }, lastMessage, unread, updatedAt }

**Repository**: `src/modules/chat/repository/chat.repository.ts`
- `createThread(userId1, userId2)`: Create thread
- `findThreadBetweenUsers(userId1, userId2)`: Find existing thread
- `findUserThreads(userId)`: User's threads
- `createMessage(data)`: Add message
- `findMessages(threadId, before, limit)`: Get messages
- `markThreadAsRead(threadId, userId)`: Mark as read

**Service**: `src/modules/chat/service/chat.service.ts`
- `sendMessage(threadId, senderId, dto)`: Send message
- `getThreadMessages(threadId, before, limit)`: Get messages
- `getUserThreads(userId)`: List threads
- `getOrCreateThread(userId1, userId2)`: Get or create thread
- `markThreadAsRead(threadId, userId)`: Mark read

**Controller**: `src/modules/chat/chat.controller.ts`

### List Chat Threads
```
GET /chat/threads
Auth: Required
Response: ChatThreadResponseDto[]
Status: 200
```

### Get Thread Messages
```
GET /chat/threads/:id/messages?before=2025-01-01T00:00:00Z&limit=50
Auth: Required
Response: { data: MessageResponseDto[], hasMore: boolean }
Status: 200
```

### Send Message
```
POST /chat/threads/:id/messages
Auth: Required
Request: SendMessageDto
Response: MessageResponseDto
Status: 201
```

### Get or Create Thread
```
POST /chat/threads
Auth: Required
Request: { participantId }
Response: ChatThreadResponseDto
Status: 201
```

---

## Favorites Module

**Base Path**: `/favorites`

**DTO Files**:
- `src/modules/favorites/dto/favorite.dto.ts`
  - `FavoriteDto`: { id, listingId, userId, createdAt }
  - `FavoriteListingDto`: { id, title, price, image, createdAt }

**Repository**: `src/modules/favorites/repository/favorite.repository.ts`
- `create(data)`: Add favorite
- `findById(id)`: Get favorite
- `findByUserAndListing(userId, listingId)`: Check if favorited
- `findByUserId(userId, skip, take)`: User's favorites
- `delete(id)`: Remove favorite
- `deleteByUserAndListing(userId, listingId)`: Remove by listing
- `countByUser(userId)`: Count user's favorites
- `isFavored(userId, listingId)`: Check if favorited

**Service**: `src/modules/favorites/service/favorite.service.ts`
- `addFavorite(userId, listingId)`: Add to favorites
- `removeFavorite(userId, listingId)`: Remove from favorites
- `getUserFavorites(userId, page, perPage)`: List favorites
- `isFavored(userId, listingId)`: Check status

**Controller**: `src/modules/favorites/favorites.controller.ts`

### List Favorites
```
GET /favorites?page=1&perPage=20
Auth: Required
Response: { data: FavoriteListingDto[], pagination: PaginationMeta }
Status: 200
```

### Add to Favorites
```
POST /favorites/:listingId
Auth: Required
Response: { success: true }
Status: 201
```

### Remove from Favorites
```
DELETE /favorites/:listingId
Auth: Required
Response: { success: true }
Status: 200
```

---

## Cart Module

**Base Path**: `/cart`

**DTO Files**:
- `src/modules/cart/dto/cart.dto.ts`
  - `AddToCartDto`: { listingId, qty }
  - `UpdateCartItemDto`: { qty }
  - `CartItemDto`: { listingId, qty, price, title?, image? }
  - `CartResponseDto`: { items: CartItemDto[], subtotal, currency, updatedAt }

**Repository**: `src/modules/cart/repository/cart.repository.ts`
- `create(data)`: Create cart
- `findByUserId(userId)`: Get cart
- `update(userId, data)`: Update cart
- `delete(userId)`: Delete cart
- `addItem(userId, cartItem)`: Add item
- `removeItem(userId, listingId)`: Remove item
- `updateItem(userId, listingId, qty)`: Update quantity
- `clearCart(userId)`: Clear all items

**Service**: `src/modules/cart/service/cart.service.ts`
- `getCart(userId)`: Get cart
- `addToCart(userId, dto)`: Add item
- `updateCartItem(userId, listingId, dto)`: Update quantity
- `removeFromCart(userId, listingId)`: Remove item
- `clearCart(userId)`: Clear cart

**Controller**: `src/modules/cart/cart.controller.ts`

### Get Cart
```
GET /cart
Auth: Required
Response: CartResponseDto
Status: 200
```

### Add to Cart
```
POST /cart/items
Auth: Required
Request: AddToCartDto
Response: { success: true }
Status: 201
```

### Update Cart Item
```
PATCH /cart/items/:listingId
Auth: Required
Request: UpdateCartItemDto
Response: { success: true }
Status: 200
```

### Remove from Cart
```
DELETE /cart/items/:listingId
Auth: Required
Response: { success: true }
Status: 200
```

### Clear Cart
```
DELETE /cart
Auth: Required
Response: { success: true }
Status: 200
```

---

## Categories Module

**Base Path**: `/categories`

**DTO Files**:
- `src/modules/categories/dto/category.dto.ts`
  - `CategoryDto`: { id, name, icon, industry, children? }
  - `CategorySchemaDto`: { fields: Array<{ key, label, type, options?, min?, max? }> }

**Service**: `src/modules/categories/service/category.service.ts`
- `getAllCategories()`: Get all categories
- `getCategoryById(id)`: Get category
- `getCategorySchema(categoryId)`: Get filter schema

**Controller**: `src/modules/categories/categories.controller.ts`

### Get All Categories
```
GET /categories
Response: { data: CategoryDto[], industries: string[] }
Status: 200
```

### Get Category Schema
```
GET /categories/:id/schema
Response: CategorySchemaDto
Status: 200
```

---

## Database Schema (Prisma)

**File**: `prisma/schema.prisma`

### User Model
```prisma
model User {
  id        String @id @default(cuid())
  name      String
  email     String @unique
  password  String?
  avatar    String?
  country   String?
  language  String @default("en")
  isVerified Boolean @default(false)
  otpCode   String?
  otpExpires DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([email])
}
```

### Listing Model
```prisma
model Listing {
  id        String @id @default(cuid())
  sellerId  String
  title     String
  price     Float
  currency  String
  category  String
  location  String
  country   String
  image     String
  images    Json @default("[]")
  description String
  condition String
  attributes Json @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([sellerId])
  @@index([category])
  @@index([country])
  @@index([price])
}
```

### Order Model
```prisma
model Order {
  id                  String @id @default(cuid())
  buyerId             String
  sellerId            String
  listingId           String
  listingTitle        String
  listingImage        String
  sellerName          String
  amount              Float
  currency            String
  buyerProtectionFee  Float @default(10)
  status              OrderStatus @default(pending_payment)
  createdAt           DateTime @default(now())
  @@index([buyerId])
  @@index([sellerId])
  @@index([listingId])
  @@index([status])
}
```

### Favorite Model
```prisma
model Favorite {
  id        String @id @default(cuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())
  @@unique([userId, listingId])
  @@index([userId])
  @@index([listingId])
}
```

### Cart Model
```prisma
model Cart {
  id        String @id @default(cuid())
  userId    String @unique
  items     Json @default("[]")
  updatedAt DateTime @updatedAt
  @@index([userId])
}
```

### Chat Models
```prisma
model ChatThread {
  id           String @id @default(cuid())
  participants String[]
  updatedAt    DateTime @updatedAt
}

model Message {
  id         String @id @default(cuid())
  threadId   String
  from       String
  text       String
  attachments String?
  createdAt  DateTime @default(now())
  @@index([threadId])
  @@index([from])
}
```

---

## Authentication

All endpoints requiring authentication use Bearer token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

JWT should contain user information and be validated by `JwtAuthGuard`.

---

## Error Handling

All errors return ErrorResponse format:
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error description",
  "details": {},
  "timestamp": "2025-01-01T00:00:00Z"
}
```

Common error codes:
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Invalid or missing token
- `FORBIDDEN`: Access denied
- `BAD_REQUEST`: Invalid request data
- `CONFLICT`: Resource already exists
- `INTERNAL_SERVER_ERROR`: Server error

---

## Rate Limiting & Security

- Implement rate limiting per user/IP
- Use JWT expiration (recommend 24 hours)
- Validate all inputs using class-validators
- Hash passwords using bcrypt
- Use HTTPS in production
- Implement CORS policies
- Add request logging and monitoring

---

## Testing

Run tests with:
```bash
npm test                    # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```
