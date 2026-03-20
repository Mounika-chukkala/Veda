import express, { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { addGenerationJob } from '../workers/queue';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, dueDate, totalMarks, questionTypes, instructions, userId, institutionName, subject, standard, timeAllowed } = req.body;
    
    // Validate basics
    if (!title || !dueDate || !totalMarks || !questionTypes || questionTypes.length === 0 || !userId) {
      res.status(400).json({ error: "Missing required fields, including userId" });
      return;
    }

    const assignment = new Assignment({
      title: subject || title, // Fallback to title if subject not provided
      dueDate,
      totalMarks,
      questionTypes,
      instructions,
      userId,
      institutionName,
      subject,
      standard,
      timeAllowed,
      status: 'pending'
    });

    await assignment.save();

    // Add job to queue
    await addGenerationJob(assignment._id.toString(), {
      title: subject || title,
      totalMarks,
      questionTypes,
      instructions,
      institutionName,
      subject,
      standard,
      timeAllowed
    });

    assignment.status = 'generating';
    await assignment.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/assignments
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    let paper = null;
    if (assignment.status === 'completed') {
      paper = await QuestionPaper.findOne({ assignmentId: assignment._id });
    }

    res.json({ assignment, paper });
  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    assignment.status = 'generating';
    await assignment.save();

    await QuestionPaper.deleteOne({ assignmentId: assignment._id });

    // @ts-ignore
    await addGenerationJob(assignment._id.toString(), {
      title: assignment.title,
      totalMarks: assignment.totalMarks,
      questionTypes: assignment.questionTypes,
      instructions: assignment.instructions
    });

    res.json(assignment);
  } catch (error) {
    console.error("Regenerate assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // Also delete the associated question paper if it exists
    await QuestionPaper.deleteOne({ assignmentId: req.params.id });

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
