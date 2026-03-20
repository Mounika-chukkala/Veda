import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a Redis connection using Upstash URI or local
export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redisConnection.on('connect', () => {
    console.log('Redis connected');
});

redisConnection.on('error', (err) => {
    console.log('Redis error:', err.message);
});
