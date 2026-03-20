import { genAI } from '../config/gemini';

export const generateQuestionPaper = async (
  title: string,
  assignment: {
    title: string;
    totalMarks: number;
    questionTypes: Array<{ type: string; count: number; marks: number }>;
    instructions: string;
  }
) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });

  // Create a strict breakdown text for the prompt
  const qTypeBreakdown = assignment.questionTypes.map((qt: any) =>
    `- Generate exactly ${qt.count} questions of type "${qt.type}". Each question must be worth ${qt.marks} marks.`
  ).join('\n');

  const prompt = `
    You are an expert academic evaluator. Create a professional question paper.

    Topic/Title: ${assignment.title}
    Difficulty Distribution: 10% Easy, 60% Medium, 30% Hard (Approximate)
    Target Total Marks: ${assignment.totalMarks}

    CRITICAL INSTRUCTIONS:
    ${qTypeBreakdown}

    Additional Instructions: ${assignment.instructions || "None"}

    IMPORTANT: You must return the output EXACTLY as a raw JSON string. Do not use markdown backticks or any other formatting.
    The JSON structure MUST strictly adhere to this exact format:
    {
      "sections": [
        {
          "title": "String (CRITICAL: This MUST be the same as the question type, e.g., 'Multiple Choice Questions' or 'Section A: Multiple Choice Questions')",
          "instruction": "String (e.g., Attempt all questions. Each carries 1 mark.)",
          "questions": [
            {
              "text": "String",
              "type": "String",
              "difficulty": "easy | medium | hard",
              "marks": Number,
              "options": ["Array of strings (ONLY IF type is MCQ)"],
              "answer": "String (The correct answer or a concise explanation)"
            }
          ]
        }
      ],
      "answerKey": "String (A comprehensive, well-formatted answer key for the entire paper, including question numbers and brief explanations for subjective answers)"
    }
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  if (!response) {
      throw new Error("Empty response from AI");
  }
  
  return JSON.parse(response);
};
