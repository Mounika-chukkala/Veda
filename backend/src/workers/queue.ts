import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Define the queue
export const generationQueue = new Queue('generation-queue', {
  connection: redisConnection as any,
});

export const addGenerationJob = async (assignmentId: string, payload: any) => {
  await generationQueue.add('generate-paper', {
    assignmentId,
    ...payload,
  });
};
