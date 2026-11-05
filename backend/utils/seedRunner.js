import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[SeedRunner] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[SeedRunner] Error during seeding:', error);
    process.exit(1);
  }
};

run();
