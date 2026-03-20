import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  dueDate?: string;
  totalMarks: number;
  questionTypes: {
    type: string;
    count: number;
    marks: number;
  }[];
  instructions?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  userId: string;
  institutionName?: string;
  subject?: string;
  standard?: string;
  timeAllowed?: string;
  createdAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: String, default: '' },
  totalMarks: { type: Number, required: true },
  questionTypes: [{
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marks: { type: Number, required: true }
  }],
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
  error: { type: String },
  userId: { type: String, required: true },
  institutionName: { type: String, default: '' },
  subject: { type: String, default: '' },
  standard: { type: String, default: '' },
  timeAllowed: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
