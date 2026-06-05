// Lightweight runtime wrapper to avoid depending on Prisma codegen during CI builds.
// Re-export the installed runtime client so compiled code that requires
// '../../generated/prisma/client' resolves correctly to the installed package.
export * from '@prisma/client';
