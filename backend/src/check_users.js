import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
const userSchema = new mongoose.Schema({
    username: String,
    role: String,
});
async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', userSchema);
        const users = await User.find({});
        console.log('--- Users in Database ---');
        console.log(users.map(u => ({ username: u.username, role: u.role })));
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
checkUsers();
//# sourceMappingURL=check_users.js.map