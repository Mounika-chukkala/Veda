import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AssignmentState {
  currentAssignment: any | null;
  questionPaper: any | null;
  status: 'idle' | 'loading' | 'completed' | 'failed';
  error: string | null;
}

const initialState: AssignmentState = {
  currentAssignment: null,
  questionPaper: null,
  status: 'idle',
  error: null,
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssignment: (state, action: PayloadAction<any>) => {
      state.currentAssignment = action.payload;
      state.status = action.payload.status === 'generating' ? 'loading' : action.payload.status;
    },
    setQuestionPaper: (state, action: PayloadAction<any>) => {
      state.questionPaper = action.payload;
    },
    updateStatus: (state, action: PayloadAction<'idle' | 'loading' | 'completed' | 'failed'>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const { setAssignment, setQuestionPaper, updateStatus, setError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
