// create-admin.js
import bcrypt from 'bcryptjs';
import prisma from './src/prisma.js';

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Rut', 10);
    
    const admin = await prisma.admin.create({
      data: {
        username: 'Rut',
        email: 'admin@skillarena.com',
        password: hashedPassword,
        role: 'super_admin'
      }
    });
    
    console.log('✅ Admin created successfully:', admin);
    
    // Also create platform user
    const platformUser = await prisma.user.upsert({
      where: { email: 'platform@skillarena.com' },
      update: {},
      create: {
        username: 'Rut',
        email: 'platform@skillarena.com',
        password: hashedPassword,
        isVerified: true
      }
    });
    
    console.log('✅ Platform user created:', platformUser);
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();