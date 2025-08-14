const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

// User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'coordinator'],
    default: 'teacher',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@nade.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const adminUser = new User({
      email: 'admin@nade.com',
      password: hashedPassword,
      name: 'Administrador do Sistema',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@nade.com');
    console.log('Password: admin123');

    // Create some sample users
    const sampleUsers = [
      {
        email: 'professor@nade.com',
        password: await bcrypt.hash('professor123', saltRounds),
        name: 'Professor Exemplo',
        role: 'teacher',
      },
      {
        email: 'coordenador@nade.com',
        password: await bcrypt.hash('coord123', saltRounds),
        name: 'Coordenador Pedagógico',
        role: 'coordinator',
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`User created: ${userData.email}`);
      }
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();