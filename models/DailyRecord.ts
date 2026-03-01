import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyRecord extends Document {
  date: Date;
  profit: number;
  loss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  riskRewardRatio: number;
  notes: string;
  tags: string[];
}

const DailyRecordSchema: Schema = new Schema({
  date: { type: Date, required: true, unique: true },
  profit: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  winningTrades: { type: Number, default: 0 },
  losingTrades: { type: Number, default: 0 },
  riskRewardRatio: { type: Number, default: 0 },
  notes: { type: String },
  tags: [String],
}, { timestamps: true });

export default mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);
