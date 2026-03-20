import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { generateQuestionPaper } from '../services/aiService';
import { io } from '../index';
import mongoose from 'mongoose';

const worker = new Worker(
  'generation-queue',
  async (job) => {
    const { assignmentId, title, totalMarks, questionTypes, instructions } = job.data;
    console.log(`Processing job for assignment: ${assignmentId}`);

    try {
      // 1. Call Gemini AI
      const assignmentPayload = { title, totalMarks, questionTypes, instructions };
      const generatedData = await generateQuestionPaper(
        title,
        assignmentPayload
      );

      // 2. Save QuestionPaper
      const paper = new QuestionPaper({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        sections: generatedData.sections || [],
        answerKey: generatedData.answerKey || ''
      });
      await paper.save();

      // 3. Update Assignment status
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });

      // 4. Emit WebSocket event to the specific room
      io.to(assignmentId).emit('generation_complete', {
          assignmentId,
          status: 'completed'
      });

      console.log(`Job completed for assignment: ${assignmentId}`);
    } catch (error) {
      console.error(`Job failed for assignment ${assignmentId}:`, error);
      
      await Assignment.findByIdAndUpdate(assignmentId, { 
          status: 'failed', 
          error: (error as Error).message || 'Generation failed' 
      });
      
      io.to(assignmentId).emit('generation_failed', {
          assignmentId,
          status: 'failed',
          error: (error as Error).message || 'Generation failed'
      });
    }
  },
  { connection: redisConnection as any }
);

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
