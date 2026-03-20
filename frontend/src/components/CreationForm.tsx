'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setAssignment, updateStatus, setError } from '../store/assignmentSlice';
import { socket } from '../services/socket';
import { FileUp, Sparkles, Calendar, AlertCircle, Plus, X, Minus, ChevronRight, ChevronLeft, Mic, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';

const formSchema = z.object({
  title: z.string().min(1, 'Assignment Title is required'),
  subject: z.string().optional(),
  standard: z.string().optional(),
  timeAllowed: z.string().optional(),
  dueDate: z.string().optional(),
  questionTypes: z.array(
    z.object({
      type: z.string().min(1, 'Question type is required'),
      count: z.number().min(1, 'Count must be positive'),
      marks: z.number().min(1, 'Marks must be positive'),
    })
  ).min(1, 'Add at least one question type'),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreationForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { status, currentAssignment, error } = useSelector((state: RootState) => state.assignment);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      dueDate: '',
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 1, marks: 1 },
      ],
      instructions: '',
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'questionTypes',
  });

  const watchedQuestionTypes = form.watch('questionTypes');
  const totalQuestions = watchedQuestionTypes?.reduce((sum, qt) => sum + (qt.count || 0), 0) || 0;
  const totalMarks = watchedQuestionTypes?.reduce((sum, qt) => sum + ((qt.count || 0) * (qt.marks || 0)), 0) || 0;

  useEffect(() => {
    socket.connect();
    if (currentAssignment?._id) socket.emit('join_assignment_room', currentAssignment._id);
    socket.on('generation_complete', (data) => {
      if (currentAssignment && data.assignmentId === currentAssignment._id) {
         dispatch(updateStatus('completed'));
         router.push(`/assignment/${data.assignmentId}`);
      }
    });
    socket.on('generation_failed', (data) => {
        if (currentAssignment && data.assignmentId === currentAssignment._id) {
           dispatch(setError(data.error || 'Generation failed'));
        }
    });
    return () => {
      socket.off('generation_complete');
      socket.off('generation_failed');
      socket.disconnect();
    };
  }, [currentAssignment, dispatch, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      dispatch(updateStatus('loading'));
      const payload = {
        ...values,
        totalMarks: totalMarks,
        userId: user?.id || 'demo_user',
        institutionName: 'Greenwood Academy'
      };
      const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/api/assignments`, payload);
      dispatch(setAssignment(res.data));
    } catch (err: any) {
      dispatch(setError(err.response?.data?.error || 'Failed to create assignment'));
    }
  };

  const Q_TYPES = ['Multiple Choice Questions', 'Short Questions', 'Diagram/Graph-Based Questions', 'Numerical Problems', 'Long Answer Questions', 'Coding Questions'];

  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownIndex !== null) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownIndex]);

  return (
    <div className="bg-[#E5E7EB] min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Top Progress Bar Wrapper */}
      <div className="w-full max-w-4xl mb-6">
         <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-[#1A1A1A] w-1/2 rounded-full"></div>
         </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-2xl font-semibold text-[#1A1A1A]">Assignment Details</h1>
           <p className="text-sm text-gray-400 font-normal">Basic information about your assignment</p>
        </div>

        {status === 'loading' ? (
           <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
             <div className="relative">
               <div className="w-20 h-20 border-4 border-gray-100 rounded-full" />
               <div className="w-20 h-20 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
               <Sparkles className="w-8 h-8 text-[#1A1A1A] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
             </div>
             <h3 className="text-xl font-medium text-gray-900">Generating Assessment...</h3>
           </div>
        ) : (
          <form id="creation-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Title & Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-sm font-medium text-gray-900">Assignment Title</label>
                 <input 
                   type="text" 
                   {...form.register('title')}
                   placeholder="e.g. Operating System" 
                   className="w-full bg-[#F3F4F6] border border-transparent rounded-2xl px-6 py-4 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-sm font-medium text-gray-900">Subject</label>
                 <input 
                   type="text" 
                   {...form.register('subject')}
                   placeholder="e.g. Computer Science" 
                   className="w-full bg-[#F3F4F6] border border-transparent rounded-2xl px-6 py-4 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                 />
              </div>
            </div>

            {/* Upload Area */}
            <div className="group relative">
               <div 
                 className="w-full border-2 border-dashed border-gray-200 rounded-[30px] p-10 flex flex-col items-center justify-center transition-all hover:bg-gray-50/50 hover:border-gray-300 cursor-pointer"
                 onClick={() => document.getElementById('file-upload')?.click()}
               >
                  <UploadCloud className="w-10 h-10 text-gray-900 mb-4" />
                  <p className="text-sm font-medium text-gray-900 mb-1">Choose a file or drag & drop it here</p>
                  <p className="text-xs text-gray-400 font-normal mb-6">JPEG, PNG, upto 10MB</p>
                  
                  <div className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-8 py-2.5 rounded-full text-xs font-medium transition-colors">
                     {file ? file.name : "Browse Files"}
                  </div>
                  <input type="file" id="file-upload" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
               </div>
               <p className="text-center text-[13px] text-gray-400 font-normal mt-3">Upload images of your preferred document/image</p>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
               <label className="text-sm font-medium text-gray-900">Due Date</label>
               <div className="relative">
                  <input 
                    type="date" 
                    {...form.register('dueDate')}
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-2xl px-6 py-4 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400 appearance-none"
                  />
                  <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
               </div>
            </div>

            {/* Question Type Table */}
            <div className="space-y-6">
               <div className="grid grid-cols-[1fr_auto_140px_140px] gap-4 items-center px-2">
                  <label className="text-sm font-medium text-gray-900">Question Type</label>
                  <div className="w-8"></div>
                  <label className="text-sm font-medium text-gray-900 text-center">No. of Questions</label>
                  <label className="text-sm font-medium text-gray-900 text-center">Marks</label>
               </div>

               <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_auto_140px_140px] gap-4 items-center px-1">
                       {/* Custom Type Dropdown */}
                       <div className="relative">
                         <div 
                           className="w-full bg-[#F3F4F6] border border-transparent rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-gray-200 transition-all select-none"
                           onClick={(e) => {
                             e.stopPropagation();
                             setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                           }}
                         >
                            <span>{watchedQuestionTypes[index]?.type}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDropdownIndex === index ? 'rotate-180' : ''}`} />
                         </div>

                         {openDropdownIndex === index && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 z-[100] py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                               {Q_TYPES.map((type) => (
                                 <button
                                   key={type}
                                   type="button"
                                   className={`w-full text-left px-5 py-3 text-sm transition-colors ${watchedQuestionTypes[index]?.type === type ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                   onClick={() => {
                                      update(index, { ...watchedQuestionTypes[index], type });
                                      setOpenDropdownIndex(null);
                                   }}
                                 >
                                   {type}
                                 </button>
                               ))}
                            </div>
                         )}
                       </div>

                       {/* Delete icon (X) */}
                       <button 
                         type="button" 
                         onClick={() => remove(index)}
                         className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                       </button>

                       {/* Question Counter */}
                       <div className="bg-[#F3F4F6] rounded-full flex items-center justify-between px-2 py-1.5">
                          <button type="button" onClick={() => update(index, { ...watchedQuestionTypes[index], count: Math.max(1, watchedQuestionTypes[index].count - 1) })} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-colors"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-medium text-gray-900">{watchedQuestionTypes[index]?.count || 1}</span>
                          <button type="button" onClick={() => update(index, { ...watchedQuestionTypes[index], count: watchedQuestionTypes[index].count + 1 })} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus className="w-4 h-4" /></button>
                       </div>

                       {/* Marks Counter */}
                       <div className="bg-[#F3F4F6] rounded-full flex items-center justify-between px-2 py-1.5">
                          <button type="button" onClick={() => update(index, { ...watchedQuestionTypes[index], marks: Math.max(1, watchedQuestionTypes[index].marks - 1) })} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-colors"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-medium text-gray-900">{watchedQuestionTypes[index]?.marks || 1}</span>
                          <button type="button" onClick={() => update(index, { ...watchedQuestionTypes[index], marks: watchedQuestionTypes[index].marks + 1 })} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Add Button */}
               <button 
                 type="button" 
                 onClick={() => append({ type: 'Long Answer Questions', count: 1, marks: 5 })}
                 className="flex items-center gap-3 text-sm font-medium text-gray-900 hover:opacity-80 transition-opacity"
               >
                 <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white">
                    <Plus className="w-4 h-4" />
                 </div>
                 Add Question Type
               </button>

               {/* Totals */}
               <div className="text-right space-y-1 pr-4">
                  <p className="text-sm font-medium text-gray-900 uppercase">Total Questions : <span className="text-gray-400">{totalQuestions}</span></p>
                  <p className="text-sm font-medium text-gray-900 uppercase">Total Marks : <span className="text-gray-400">{totalMarks}</span></p>
               </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
               <label className="text-sm font-medium text-gray-900">Additional Information (For better output)</label>
               <div className="relative group">
                  <textarea 
                    {...form.register('instructions')}
                    rows={4}
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-[30px] px-8 py-6 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400 resize-none"
                  />
                  <button type="button" className="absolute right-6 bottom-6 p-2 bg-transparent text-gray-900 transition-transform hover:scale-110">
                     <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                     </svg>
                  </button>
               </div>
            </div>
          </form>
        )}
      </div>

      {/* Nav Buttons Footer */}
      <div className="w-full max-w-4xl mt-12 flex justify-between items-center px-4">
         <button 
           type="button"
           className="bg-white hover:bg-gray-100 text-[#1A1A1A] font-medium py-4 px-10 rounded-full border border-gray-200 shadow-sm flex items-center gap-3 transition-all active:scale-95"
         >
           <ChevronLeft className="w-5 h-5" /> Previous
         </button>
         
         <button 
           type="submit"
           form="creation-form"
           className="bg-[#1A1A1A] hover:bg-black text-white font-medium py-4 px-12 rounded-full shadow-xl flex items-center gap-3 transition-all active:scale-95"
         >
           Next <ChevronRight className="w-5 h-5" />
         </button>
      </div>

    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
