# Implementation Guide - Marketplace Hub Backend

## Overview

This document provides step-by-step instructions to complete and test the full schema implementation.

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   ├── response.dto.ts
│   │   └── pagination-query.dto.ts
│   └── repository/
│       └── base.repository.ts
│
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── dto/
│   │   │   └── create-user.dto.ts
│   │   ├── repository/
│   │   │   └── user.repository.ts
│   │   ├── service/
│   │   │   └── user.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   │
│   ├── listings/
│   │   ├── dto/
│   │   │   └── listing.dto.ts
│   │   ├── repository/
│   │   │   └── listing.repository.ts
│   │   ├── service/
│   │   │   └── listing.service.ts
│   │   ├── listings.controller.ts
│   │   └── listings.module.ts
│   │
│   ├── orders/
│   │   ├── dto/
│   │   │   └── order.dto.ts
│   │   ├── enums/
│   │   │   └── order-status.enum.ts
│   │   ├── repository/
│   │   │   └── order.repository.ts
│   │   ├── service/
│   │   │   └── order.service.ts
│   │   ├── orders.controller.ts
│   │   └── orders.module.ts
│   │
│   ├── chat/
│   │   ├── dto/
│   │   │   └── message.dto.ts
│   │   ├── repository/
│   │   │   └── chat.repository.ts
│   │   ├── service/
│   │   │   └── chat.service.ts
│   │   ├── chat.controller.ts
│   │   └── chat.module.ts
│   │
│   ├── favorites/
│   │   ├── dto/
│   │   │   └── favorite.dto.ts
│   │   ├── repository/
│   │   │   └── favorite.repository.ts
│   │   ├── service/
│   │   │   └── favorite.service.ts
│   │   ├── favorites.controller.ts
│   │   └── favorites.module.ts
│   │
│   ├── cart/
│   │   ├── dto/
│   │   │   └── cart.dto.ts
│   │   ├── repository/
│   │   │   └── cart.repository.ts
│   │   ├── service/
│   │   │   └── cart.service.ts
│   │   ├── cart.controller.ts
│   │   └── cart.module.ts
│   │
│   └── categories/
│       ├── dto/
│       │   └── category.dto.ts
│       ├── service/
│       │   └── category.service.ts
│       ├── categories.controller.ts
│       └── categories.module.ts
│
├── prisma/
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── prisma.service.spec.ts
│
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

prisma/
├── schema.prisma
└── migrations/
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Environment Variables

Create/update `.env` file:
```
DATABASE_URL="mysql://user:password@localhost:3306/marketplace_hub"
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRATION="86400"
```

### 3. Update Prisma Schema

The schema has been updated in `prisma/schema.prisma` with:
- New models: Favorite, Cart
- Updated User model with avatar, language, updatedAt
- Updated Listing model with images, attributes, updatedAt
- ChatThread and Message models

### 4. Run Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name init

# Or push schema directly (development only)
npx prisma db push
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Verify Installation

```bash
# Check syntax
npm run lint

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## Key Implementation Details

### Authentication Flow

1. User registers/logs in via `/auth/register` or `/auth/login`
2. Backend returns JWT token
3. Client includes token in Authorization header
4. `JwtAuthGuard` validates token on protected routes
5. `@CurrentUser()` decorator extracts user info from token

### Authorization

All protected endpoints require:
- Valid JWT token in Authorization header
- Token should be extracted in `@CurrentUser()` and verified

### Data Access Layer (Repositories)

Each repository provides:
- CRUD operations specific to the entity
- Custom queries for filtering, searching
- Transaction support where needed

Example:
```typescript
async findByUserAndListing(userId: string, listingId: string) {
  return this.prisma.favorite.findFirst({ where: { userId, listingId } });
}
```

### Business Logic Layer (Services)

Services contain:
- Input validation
- Authorization checks
- Business logic
- Error handling
- Data transformation

Example:
```typescript
async addFavorite(userId: string, listingId: string) {
  const listing = await this.listingRepository.findById(listingId);
  if (!listing) throw new NotFoundException('Listing not found');
  
  const isFavored = await this.favoriteRepository.isFavored(userId, listingId);
  if (isFavored) return existing;
  
  return this.favoriteRepository.create({ userId, listingId });
}
```

### API Layer (Controllers)

Controllers:
- Map HTTP requests to service methods
- Handle decorators (@CurrentUser, @Body, @Query, etc.)
- Define route metadata (ApiTags, ApiOperation, etc.)
- Return responses

### Error Handling

```typescript
// In services
if (!resource) throw new NotFoundException('Resource not found');
if (ownership check fails) throw new BadRequestException('You cannot access this');

// In controllers - handled by NestJS exception filters
// Returns ErrorResponse automatically
```

## Testing Strategy

### Unit Tests
```bash
npm test
```

Test each service and repository:
- Mock repositories
- Test business logic
- Verify error handling

### E2E Tests
```bash
npm run test:e2e
```

Test complete flows:
- User registration and login
- Listing creation and search
- Order management
- Cart operations

### Coverage
```bash
npm run test:cov
```

Aim for >80% coverage on services and repositories.

## Running the Application

### Development
```bash
npm run start:dev
```

Server runs on `http://localhost:3000`
Auto-reloads on file changes

### Production Build
```bash
npm run build
npm run start:prod
```

## API Documentation

Swagger documentation available at: `http://localhost:3000/api`

All endpoints are documented with:
- Summary and description
- Request/response schemas
- Required authentication
- Status codes

## Common Issues and Solutions

### Issue: JWT not validating

**Solution**: 
1. Verify JWT_SECRET matches between encoding and decoding
2. Check token expiration time
3. Ensure token is in correct format: `Bearer {token}`

### Issue: Database connection fails

**Solution**:
1. Verify DATABASE_URL is correct
2. Ensure MySQL server is running
3. Run migrations: `npx prisma migrate dev`

### Issue: Prisma schema changes not reflecting

**Solution**:
1. Run `npx prisma migrate dev`
2. Regenerate client: `npx prisma generate`
3. Restart development server

### Issue: CORS errors

**Solution**:
1. Update CORS configuration in `main.ts`
2. Add allowed origins to environment

## Performance Optimization

### Database
- Implement indexing (already in schema)
- Use database transactions for multi-entity operations
- Pagination for large queries

### Caching
- Consider Redis for frequently accessed data
- Cache category schema
- Cache user favorites count

### API Response
- Use DTOs to control response shape
- Implement selective field projection
- Compress responses (gzip)

## Security Checklist

- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens have expiration
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection in responses
- [ ] CORS configured appropriately
- [ ] HTTPS enforced in production
- [ ] Rate limiting implemented
- [ ] Sensitive data not logged
- [ ] Authentication required on all protected routes

## Next Steps

1. Complete Auth module implementation (if not done)
2. Add input validation using class-validator
3. Implement error handling middleware
4. Add request logging
5. Set up monitoring and alerting
6. Implement Redis caching
7. Add API rate limiting
8. Deploy to staging environment
9. Load testing
10. Production deployment

## File Checklist

### Created Files ✓
- [x] Common DTOs and utilities
- [x] All module DTOs
- [x] All repositories
- [x] All services
- [x] All controllers
- [x] All modules
- [x] Updated app.module.ts
- [x] Updated Prisma schema

### Updated Files ✓
- [x] Listings controller with new service calls
- [x] Orders controller with new service calls
- [x] Chat controller with new service calls
- [x] Listings module with repository pattern
- [x] Orders module with repository pattern
- [x] Chat module with repository pattern
- [x] App module with all module imports

### Still TODO
- [ ] Auth module (if not already complete)
- [ ] Auth service and DTOs
- [ ] Implement validation decorators in DTOs
- [ ] Error handling middleware
- [ ] Request logging middleware
- [ ] Swagger documentation review
- [ ] Database migration files
- [ ] Unit tests for services
- [ ] E2E tests for all endpoints
- [ ] CI/CD pipeline configuration

## Support

For questions or issues:
1. Check Swagger documentation at `/api`
2. Review SCHEMA.md for endpoint details
3. Check console logs for detailed errors
4. Review Prisma documentation: https://www.prisma.io/docs/
5. Review NestJS documentation: https://docs.nestjs.com/
