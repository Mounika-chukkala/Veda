import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  answerKey: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  options: { type: [String], default: [] },
  answer: { type: String, required: true }
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, default: '' },
  questions: { type: [QuestionSchema], required: true },
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sections: { type: [SectionSchema], required: true },
  answerKey: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
