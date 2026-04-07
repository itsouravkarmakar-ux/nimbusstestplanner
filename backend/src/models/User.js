import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
}, { timestamps: true });
UserSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map