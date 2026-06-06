const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client as a singleton
const prisma = new PrismaClient();

module.exports = prisma;