/**
 * Script to manually initialize the default "Team Turistas" team
 * Note: This is now also done automatically on backend startup
 * Run this script if you need to manually initialize or verify Team Turistas
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import the initialization service
import { initializeTeamTuristas } from '../src/services/team-init.service.js';

async function runInitialization() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Initialize Team Turistas using the service
    await initializeTeamTuristas();

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
runInitialization()
  .then(() => {
    console.log('✅ Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
