import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
  clientName: string;
  companyName?: string;
  address?: string;
  proposalRef: string;
  date: Date;
  location: string;
  capacity: string;
  installationType?: string;
  moduleWp?: string;
  structureType?: string[];
  enableOpex?: boolean;
  perKwpCost?: number;
  gstPercentage?: number;
  projectCost?: number;
  carbonFootprint?: number;
  moduleTech: string;
  completionTime: string;
  bom: Array<{
    item: string;
    description: string;
    quantity: string;
    unit: string;
    included: boolean;
  }>;
  commercials: Array<{
    milestone: string;
    percentage: number;
    description: string;
  }>;
  paymentTerms?: Array<{
    milestone: string;
    percentage: number;
  }>;
  opexDetails?: string;
  opexCompanyName?: string;
  opexSystemSize?: number;
  opexRate?: number;
  opexCarbonRate?: number;
  feasibilityDetails?: string;
  feasibilitySystemSize?: number;
  feasibilityCosting?: number;
  feasibilityTariff?: number;
  feasibilityUnitGenerated?: number;
  arrayAttachment?: string;
  pdfPath?: string;
  status: 'draft' | 'generated';
}

const ProposalSchema: Schema = new Schema({
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

export default mongoose.model<IProposal>('Proposal', ProposalSchema);
