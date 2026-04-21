import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IProposal, {}, {}, {}, mongoose.Document<unknown, {}, IProposal, {}, mongoose.DefaultSchemaOptions> & IProposal & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProposal>;
export default _default;
//# sourceMappingURL=Proposal.d.ts.map