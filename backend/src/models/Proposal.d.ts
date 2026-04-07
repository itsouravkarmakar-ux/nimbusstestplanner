import mongoose, { Document } from 'mongoose';
export interface IProposal extends Document {
    clientName: string;
    proposalRef: string;
    date: Date;
    location: string;
    capacity: string;
    moduleTech: string;
    completionTime: string;
    bom: Array<{
        item: string;
        description: string;
        quantity: string;
        unit: string;
    }>;
    commercials: Array<{
        milestone: string;
        percentage: number;
        description: string;
    }>;
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