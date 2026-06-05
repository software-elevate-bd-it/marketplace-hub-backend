import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==================== CLEANUP ====================
  await prisma.auditLog.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listingAttribute.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.categoryFieldOption.deleteMany();
  await prisma.categoryField.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned up existing data');

  // ==================== USERS ====================
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'John Seller',
        email: 'john@example.com',
        phone: '+1-555-0101',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        country: 'US',
        language: 'en',
        isVerified: true,
      },
      {
        name: 'Jane Buyer',
        email: 'jane@example.com',
        phone: '+1-555-0102',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        country: 'US',
        language: 'en',
        isVerified: true,
      },
      {
        name: 'Alice Merchant',
        email: 'alice@example.com',
        phone: '+1-555-0103',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        country: 'UK',
        language: 'en',
        isVerified: true,
      },
      {
        name: 'Bob Consumer',
        email: 'bob@example.com',
        phone: '+1-555-0104',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        country: 'CA',
        language: 'en',
        isVerified: false,
      },
    ],
  });

  console.log(`✓ Created ${users.count} users`);

  // Get user IDs
  const userList = await prisma.user.findMany();
  const john = userList.find(u => u.email === 'john@example.com')!;
  const jane = userList.find(u => u.email === 'jane@example.com')!;
  const alice = userList.find(u => u.email === 'alice@example.com')!;

  // ==================== ADMINS ====================
  const adminHash = await bcrypt.hash('AdminPass123!', 10);

  await prisma.admin.createMany({
    data: [
      {
        email: 'admin@marketplace.com',
        password: adminHash,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
      },
      {
        email: 'moderator@marketplace.com',
        password: adminHash,
        name: 'Content Moderator',
        role: 'moderator',
        isActive: true,
      },
    ],
  });

  console.log('✓ Created admins');

  // ==================== CATEGORIES ====================
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      icon: '📱',
      image: 'https://via.placeholder.com/300x200?text=Electronics',
      order: 1,
    },
  });

  const phones = await prisma.category.create({
    data: {
      name: 'Phones & Accessories',
      slug: 'phones-accessories',
      description: 'Mobile phones, tablets, and accessories',
      icon: '📱',
      image: 'https://via.placeholder.com/300x200?text=Phones',
      order: 1,
      parentId: electronics.id,
    },
  });

  const computers = await prisma.category.create({
    data: {
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, desktops, and computer parts',
      icon: '💻',
      image: 'https://via.placeholder.com/300x200?text=Computers',
      order: 2,
      parentId: electronics.id,
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories',
      icon: '👔',
      image: 'https://via.placeholder.com/300x200?text=Fashion',
      order: 2,
    },
  });

  console.log('✓ Created categories');

  // ==================== CATEGORY FIELDS ====================
  const conditionField = await prisma.categoryField.create({
    data: {
      categoryId: phones.id,
      label: 'Condition',
      fieldKey: 'condition',
      fieldType: 'select',
      required: true,
      filterable: true,
      order: 1,
    },
  });

  await prisma.categoryFieldOption.createMany({
    data: [
      { fieldId: conditionField.id, label: 'New', value: 'new', order: 1 },
      { fieldId: conditionField.id, label: 'Like New', value: 'like_new', order: 2 },
      { fieldId: conditionField.id, label: 'Good', value: 'good', order: 3 },
      { fieldId: conditionField.id, label: 'Fair', value: 'fair', order: 4 },
    ],
  });

  const storageField = await prisma.categoryField.create({
    data: {
      categoryId: phones.id,
      label: 'Storage',
      fieldKey: 'storage',
      fieldType: 'select',
      required: true,
      filterable: true,
      order: 2,
    },
  });

  await prisma.categoryFieldOption.createMany({
    data: [
      { fieldId: storageField.id, label: '64GB', value: '64gb', order: 1 },
      { fieldId: storageField.id, label: '128GB', value: '128gb', order: 2 },
      { fieldId: storageField.id, label: '256GB', value: '256gb', order: 3 },
      { fieldId: storageField.id, label: '512GB', value: '512gb', order: 4 },
    ],
  });

  console.log('✓ Created category fields');

  // ==================== LISTINGS ====================
  const listing1 = await prisma.listing.create({
    data: {
      sellerId: john.id,
      categoryId: phones.id,
      title: 'iPhone 13 Pro - Like New',
      description:
        'Excellent condition iPhone 13 Pro 256GB in Space Black. Comes with original box and accessories.',
      price: 899.99,
      currency: 'USD',
      location: 'New York, NY',
      country: 'US',
      image:
        'https://images.unsplash.com/photo-1592286927505-cd966f3b3fcb?w=500&h=400&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1592286927505-cd966f3b3fcb?w=500&h=400&fit=crop',
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=400&fit=crop',
      ],
      condition: 'like_new',
      status: 'active',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      viewCount: 45,
      attributes: {
        create: [
          {
            fieldId: conditionField.id,
            value: 'like_new',
          },
          {
            fieldId: storageField.id,
            value: '256gb',
          },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      sellerId: alice.id,
      categoryId: computers.id,
      title: 'MacBook Pro 14" M1 Max',
      description:
        '2021 MacBook Pro with M1 Max chip. 16GB RAM, 512GB SSD. Minimal use, perfect condition.',
      price: 1299.99,
      currency: 'USD',
      location: 'London, UK',
      country: 'UK',
      image:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop',
      ],
      condition: 'new',
      status: 'active',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      viewCount: 28,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      sellerId: john.id,
      categoryId: fashion.id,
      title: 'Designer Leather Jacket',
      description: 'Genuine leather jacket, Italian made. Size M, black color.',
      price: 299.99,
      currency: 'USD',
      location: 'New York, NY',
      country: 'US',
      image:
        'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=400&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=400&fit=crop',
      ],
      status: 'active',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      viewCount: 12,
    },
  });

  console.log('✓ Created listings');

  // ==================== FAVORITES ====================
  await prisma.favorite.createMany({
    data: [
      {
        userId: jane.id,
        listingId: listing1.id,
      },
      {
        userId: jane.id,
        listingId: listing2.id,
      },
    ],
  });

  console.log('✓ Created favorites');

  // ==================== CART ====================
  await prisma.cart.create({
    data: {
      userId: jane.id,
      items: [
        { listingId: listing1.id.toString(), quantity: 1 },
        { listingId: listing3.id.toString(), quantity: 1 },
      ],
    },
  });

  console.log('✓ Created carts');

  // ==================== ORDERS ====================
  const order1 = await prisma.order.create({
    data: {
      buyerId: jane.id,
      sellerId: john.id,
      listingId: listing3.id,
      listingTitle: listing3.title,
      listingImage: listing3.image,
      amount: listing3.price,
      currency: listing3.currency,
      status: 'completed',
      escrowStatus: 'released',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
      trackingNumber: 'TRK123456789',
      items: {
        create: [
          {
            listingId: listing3.id,
            title: listing3.title,
            price: listing3.price,
            quantity: 1,
            currency: listing3.currency,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: jane.id,
      sellerId: alice.id,
      listingId: listing2.id,
      listingTitle: listing2.title,
      listingImage: listing2.image,
      amount: listing2.price,
      currency: listing2.currency,
      status: 'confirmed',
      escrowStatus: 'funds_held',
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'New York',
        state: 'NY',
        zip: '10002',
        country: 'US',
      },
      items: {
        create: [
          {
            listingId: listing2.id,
            title: listing2.title,
            price: listing2.price,
            quantity: 1,
            currency: listing2.currency,
          },
        ],
      },
    },
  });

  console.log('✓ Created orders');

  // ==================== ORDER EVENTS ====================
  await prisma.orderEvent.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'confirmed',
        note: 'Order created and confirmed',
      },
      {
        orderId: order1.id,
        status: 'shipped',
        note: 'Item shipped to buyer',
      },
      {
        orderId: order1.id,
        status: 'delivered',
        note: 'Item delivered',
      },
      {
        orderId: order1.id,
        status: 'completed',
        escrowStatus: 'released',
        note: 'Order completed and funds released',
      },
    ],
  });

  console.log('✓ Created order events');

  // ==================== REVIEWS ====================
  await prisma.review.createMany({
    data: [
      {
        orderId: order1.id,
        reviewerId: jane.id,
        sellerId: john.id,
        rating: 5,
        title: 'Excellent seller!',
        comment: 'Great quality item, fast shipping, highly recommend!',
      },
    ],
  });

  console.log('✓ Created reviews');

  // ==================== CHAT THREADS ====================
  const chatThread = await prisma.chatThread.create({
    data: {
      buyerId: jane.id,
      sellerId: john.id,
      listingId: listing1.id,
      messages: {
        create: [
          {
            senderId: jane.id,
            text: 'Hi, is this phone still available?',
          },
          {
            senderId: john.id,
            text: 'Yes, it is! Still in excellent condition.',
          },
          {
            senderId: jane.id,
            text: 'Can you do any discount for bulk purchase?',
          },
        ],
      },
    },
  });

  console.log('✓ Created chat threads');

  // ==================== NOTIFICATIONS ====================
  await prisma.notification.createMany({
    data: [
      {
        userId: jane.id,
        type: 'order_update',
        title: 'Order Confirmed',
        message: 'Your order for Designer Leather Jacket has been confirmed',
        data: { orderId: order1.id.toString() },
        isRead: false,
      },
      {
        userId: john.id,
        type: 'new_message',
        title: 'New Message',
        message: 'Jane sent you a message',
        data: { threadId: chatThread.id.toString() },
        isRead: false,
      },
      {
        userId: jane.id,
        type: 'review_received',
        title: 'New Review',
        message: 'You received a 5-star review',
        isRead: true,
      },
    ],
  });

  console.log('✓ Created notifications');

  // ==================== UPLOADS ====================
  await prisma.upload.createMany({
    data: [
      {
        userId: john.id,
        fileName: 'iphone-13-pro-1.jpg',
        path: 'uploads/john/iphone-13-pro-1.jpg',
        url: 'https://images.unsplash.com/photo-1592286927505-cd966f3b3fcb',
        fileSize: 245312n,
        mimeType: 'image/jpeg',
      },
      {
        userId: alice.id,
        fileName: 'macbook-pro-1.jpg',
        path: 'uploads/alice/macbook-pro-1.jpg',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        fileSize: 389456n,
        mimeType: 'image/jpeg',
      },
    ],
  });

  console.log('✓ Created uploads');

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Database Summary:');
  console.log('- Users: 4');
  console.log('- Admins: 2');
  console.log('- Categories: 4 (1 electronics parent, 2 subcategories, 1 fashion)');
  console.log('- Listings: 3');
  console.log('- Orders: 2');
  console.log('- Reviews: 1');
  console.log('- Chat Threads: 1');
  console.log('- Notifications: 3');
  console.log('\n🔐 Test Credentials:');
  console.log('- Seller (John): john@example.com / Password123!');
  console.log('- Buyer (Jane): jane@example.com / Password123!');
  console.log('- Admin: admin@marketplace.com / AdminPass123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
