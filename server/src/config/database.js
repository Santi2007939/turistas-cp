import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdminIfNotExists = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('ℹ️  No users found in database. First registered user will be admin.');
    }
  } catch (err) {
    console.error('Error checking for users:', err);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Check for admin user
    await createAdminIfNotExists();
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
