import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
async function testConnection() {
    console.log('Testing connection to:', process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        console.log('Success: Connected to MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('Failure: MongoDB connection error:', error);
        process.exit(1);
    }
}
testConnection();
//# sourceMappingURL=test_db.js.map