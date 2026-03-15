import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../src/config/env.js';
import User from '../src/models/User.model.js';

const createAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URL);
    const email = 'admin@mediconnect.com';
    const password = 'AdminPass@123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
