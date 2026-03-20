# VedaAI Assessment Creator

A full-stack web application designed for teachers to generate intelligent, structured question papers using AI. Developed as part of the Full Stack Engineering Assessment.

## Core Features
1. **Assignment Creation**: Dynamic form with React Hook Form & Zod validation to specify title, due date, marks, and question types.
2. **AI Generation**: BullMQ background workers integrated with Google Gemini generate structured JSON representing diverse and difficulty-controlled sections and questions.
3. **Real-time Status**: Socket.io provides real-time updates to the Next.js frontend once the BullMQ job succeeds or fails.
4. **Premium Output UI**: Clean, responsive layout for viewing student papers with difficulty badges, marks division, and student info fields. 
5. **PDF Export**: Natively formatted print view utilizing Tailwind `@media print` rules for clean, raw-html-free PDF generations.

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Redux Toolkit** (Global state management)
- **Tailwind CSS** (Premium styling, glassmorphism, dark mode base, custom print layers)
- **Socket.io-client** (Real-time syncing)

### Backend
- **Node.js + Express** (TypeScript)
- **MongoDB** (Mongoose ODM for Assignments & Papers)
- **Redis + BullMQ** (Reliable async queueing for AI tasks)
- **Socket.io** (Emitting generation status)
- **Google Gemini API** (Prompt structured AI generation)

---

## Architecture Overview

1. **User Request**: Teacher fills the frontend form.
2. **API Layer**: `POST /api/assignments` stores a `pending` assignment in MongoDB.
3. **Queue Layer**: Express immediately pushes a job to BullMQ `generation-queue` backed by Redis and returns the Assignment ID.
4. **Real-time Loop**: Frontend joins a WebSocket room using the Assignment ID and shows a loading state.
5. **Worker Execution**: `generationWorker` pulls the job, constructs a rigid JSON-schema prompt, and queries Google Gemini.
6. **Data Storage**: Gemini returns structured sections and questions, which the worker saves to `QuestionPaper` schema in MongoDB. The Assignment is marked `completed`.
7. **Client Notification**: Worker emits a `generation_complete` event targeting the Assignment ID's socket room.
8. **UI Update**: Frontend transitions automatically to the detailed view page routing.

---

## Local Setup Instructions

1. **Clone the repository**

2. **Backend Setup**

First, start the local Redis instance using Docker:
```bash
docker-compose up -d
```

Then, configure the backend:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
```
Run the backend:
```bash
npm run dev
# Or run with tsc explicitly if needed
```

3. **Frontend Setup**
```bash
cd frontend
npm install
# Optional: create a .env.local for NEXT_PUBLIC_SOCKET_URL if different
npm run dev
```

4. **Visit `http://localhost:3000`** in your browser.

---

## Bonus Features Implemented
- **PDF Export**: Tailored `print:` utilities in Tailwind ensure the final paper looks like a real exam sheet, hiding digital UI elements.
- **Improved UI Polish**: Added customized background blobs, glassmorphic panels, and loading animations for a highly premium aesthetic.
- **Difficulty Badges**: Dynamically colored Tags (Easy/Medium/Hard) make the paper easily skimmable. 
- **WebSocket Streaming Feedback**: Zero-polling architecture, saving server load and providing immediate UX response times.
