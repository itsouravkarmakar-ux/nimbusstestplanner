import mongoose, { Schema, Document } from 'mongoose';
const ProposalSchema = new Schema({
    clientName: { type: String, required: true },
    companyName: String,
    address: String,
    proposalRef: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    capacity: { type: String, required: true },
    installationType: String,
    moduleWp: String,
    structureType: [String],
    enableOpex: { type: Boolean, default: false },
    perKwpCost: Number,
    gstPercentage: Number,
    projectCost: Number,
    carbonFootprint: Number,
    moduleTech: { type: String, required: true },
    completionTime: { type: String, required: true },
    bom: [{
            item: String,
            description: String,
            quantity: String,
            unit: String,
            included: { type: Boolean, default: true }
        }],
    commercials: [{
            milestone: String,
            percentage: Number,
            description: String
        }],
    paymentTerms: [{
            milestone: String,
            percentage: Number
        }],
    opexDetails: String,
    opexCompanyName: String,
    opexSystemSize: Number,
    opexRate: Number,
    opexCarbonRate: Number,
    feasibilityDetails: String,
    feasibilitySystemSize: Number,
    feasibilityCosting: Number,
    feasibilityTariff: Number,
    feasibilityUnitGenerated: Number,
    arrayAttachment: String,
    pdfPath: String,
    status: { type: String, enum: ['draft', 'generated'], default: 'draft' }
}, { timestamps: true });
export default mongoose.model('Proposal', ProposalSchema);
//# sourceMappingURL=Proposal.js.map