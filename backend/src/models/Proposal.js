import mongoose, { Schema, Document } from 'mongoose';
const ProposalSchema = new Schema({
    clientName: { type: String, required: true },
    proposalRef: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    capacity: { type: String, required: true },
    moduleTech: { type: String, required: true },
    completionTime: { type: String, required: true },
    bom: [{
            item: String,
            description: String,
            quantity: String,
            unit: String
        }],
    commercials: [{
            milestone: String,
            percentage: Number,
            description: String
        }],
    pdfPath: String,
    status: { type: String, enum: ['draft', 'generated'], default: 'draft' }
}, { timestamps: true });
export default mongoose.model('Proposal', ProposalSchema);
//# sourceMappingURL=Proposal.js.map