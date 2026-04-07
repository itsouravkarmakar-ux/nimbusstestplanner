import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  try {
    await mongoose.connection.collection('proposals').dropIndex('refNo_1');
    console.log('Dropped refNo_1 index successfully');
  } catch (err) {
    console.error('Error dropping index:', err.message);
  }
  process.exit(0);
}
run();
