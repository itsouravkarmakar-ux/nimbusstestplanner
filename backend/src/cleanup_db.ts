import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for cleanup');
    
    // Use raw collection to find and delete entries where username is missing or null
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }
    const usersCollection = db.collection('users');
    
    const count = await usersCollection.countDocuments({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" }
      ]
    });
    
    console.log(`Found ${count} corrupted user records.`);
    
    if (count > 0) {
      await usersCollection.deleteMany({ 
        $or: [
          { username: { $exists: false } },
          { username: null },
          { username: "" }
        ]
      });
      console.log('✅ Corrupted records deleted successfully.');
    } else {
      console.log('No corrupted records to delete.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
