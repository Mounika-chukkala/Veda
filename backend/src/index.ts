import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import assignmentRoutes from './routes/assignmentRoutes';
import './workers/generationWorker'; // Initialize the worker to start listening

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
}));

export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);

// Socket.io connection handle
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Clients can join a room specific to an assignment ID to get updates on it
    socket.on('join_assignment_room', (assignmentId) => {
        socket.join(assignmentId);
        console.log(`Socket ${socket.id} joined room ${assignmentId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
