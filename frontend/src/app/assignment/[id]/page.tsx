'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FileDown, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { socket } from '@/services/socket';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@clerk/nextjs';

interface Question {
  _id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

interface Section {
  _id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export default function AssignmentPage() {
  const { user } = useUser();
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/api/assignments/${id}`);
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
       fetchAssignment();
       socket.connect();
       socket.emit('join_assignment_room', id);
       
       socket.on('generation_complete', (data) => {
         if (data.assignmentId === id) {
            fetchAssignment();
            setShowIntro(true);
         }
       });
       
       socket.on('generation_failed', (data) => {
         if (data.assignmentId === id) {
            setError(data.error || 'Regeneration failed');
            fetchAssignment();
         }
       });
    }

    return () => {
       socket.off('generation_complete');
       socket.off('generation_failed');
       socket.disconnect();
    }
  }, [id]);

  const handlePrint = async () => {
    if (!data?.assignment || !data?.paper) return;
    try {
      setDownloading(true);
      
      // @ts-ignore
      const { jsPDF } = await import('jspdf');
      
      const { assignment, paper } = data;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 18;
      const contentW = pageW - marginX * 2;
      let y = 18;

      const checkPageBreak = (neededH: number) => {
        if (y + neededH > pageH - 15) {
          doc.addPage();
          y = 18;
        }
      };

      // ── Header ──────────────────────────────────────────────
      if (assignment.institutionName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(assignment.institutionName.toUpperCase(), pageW / 2, y, { align: 'center' });
        y += 7;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Subject: ${assignment.subject || assignment.title}`, pageW / 2, y, { align: 'center' });
      y += 5;

      if (assignment.standard) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Class: ${assignment.standard}`, pageW / 2, y, { align: 'center' });
        y += 5;
      }

      // Divider line
      y += 3;
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.5);
      doc.line(marginX, y, pageW - marginX, y);
      y += 4;

      const dateLabel = assignment.dueDate && assignment.dueDate.trim() !== ''
        ? `Due Date: ${format(new Date(assignment.dueDate), 'PPP')}`
        : `Time Allowed: ${assignment.timeAllowed || 'As per instructions'}`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(dateLabel.toUpperCase(), marginX, y);
      doc.text(`Maximum Marks: ${assignment.totalMarks}`, pageW - marginX, y, { align: 'right' });
      y += 3;
      doc.line(marginX, y, pageW - marginX, y);
      y += 5;

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(8.5);
      doc.text('All questions are compulsory unless stated otherwise.', marginX, y);
      y += 8;

      // ── Student Details Box ──────────────────────────────────
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.4);
      doc.rect(marginX, y, contentW, 18);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Name:', marginX + 3, y);
      doc.setLineWidth(0.2);
      doc.line(marginX + 18, y + 0.5, pageW - marginX - 3, y + 0.5);
      y += 7;
      doc.text('Roll No.:', marginX + 3, y);
      doc.line(marginX + 18, y + 0.5, marginX + contentW / 2 - 5, y + 0.5);
      doc.text('Class / Section:', marginX + contentW / 2 + 2, y);
      doc.line(marginX + contentW / 2 + 32, y + 0.5, pageW - marginX - 3, y + 0.5);
      y += 10;

      // ── Sections & Questions ─────────────────────────────────
      paper.sections?.forEach((sec: Section, sIdx: number) => {
        const secLabel = sIdx === 0 ? 'Section A'
          : sIdx === 1 ? 'Section B'
          : sIdx === 2 ? 'Section C'
          : `Section ${String.fromCharCode(65 + sIdx)}`;

        // Section heading
        checkPageBreak(14);
        y += 2;
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(marginX, y, marginX + contentW / 2 - 20, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(secLabel.toUpperCase(), pageW / 2, y + 1, { align: 'center' });
        doc.line(marginX + contentW / 2 + 20, y, pageW - marginX, y);
        y += 7;

        // Section title / type
        const secTitle = sec.title && !['Main Assessment', 'Assessment', 'Question Paper', 'Section'].some(t => sec.title.includes(t))
          ? sec.title
          : sec.questions?.[0]?.type || 'General Questions';

        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        const titleLines = doc.splitTextToSize(secTitle, contentW - 50);
        doc.text(titleLines, marginX, y);

        if (sec.questions?.length > 0) {
          const marksText = `${sec.questions.length} × ${sec.questions[0].marks} = ${sec.questions.length * sec.questions[0].marks}`;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text(marksText, pageW - marginX, y, { align: 'right' });
        }
        y += titleLines.length * 5.5;

        if (sec.instruction) {
          checkPageBreak(8);
          doc.setFont('helvetica', 'bolditalic');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 100, 100);
          const instrLines = doc.splitTextToSize(sec.instruction, contentW);
          doc.text(instrLines, marginX, y);
          doc.setTextColor(20, 20, 20);
          y += instrLines.length * 4.5 + 2;
        }

        // Questions
        sec.questions?.forEach((q: Question, qIdx: number) => {
          checkPageBreak(14);
          const qText = `${qIdx + 1}.  ${q.text.replace(/\*\*/g, '')}`;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(20, 20, 20);
          const qLines = doc.splitTextToSize(qText, contentW - 5);
          doc.text(qLines, marginX, y);
          y += qLines.length * 5.5 + 1;

          // MCQ Options
          if (q.options && q.options.length > 0) {
            const optLabels = ['A', 'B', 'C', 'D'];
            const colW = contentW / 2;
            for (let i = 0; i < q.options.length; i += 2) {
              checkPageBreak(7);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9.5);
              const leftLabel = `${optLabels[i]})`;
              doc.text(leftLabel, marginX + 8, y);
              doc.setFont('helvetica', 'normal');
              const leftOpt = doc.splitTextToSize(q.options[i], colW - 16);
              doc.text(leftOpt, marginX + 15, y);

              if (q.options[i + 1]) {
                doc.setFont('helvetica', 'bold');
                const rightLabel = `${optLabels[i + 1]})`;
                doc.text(rightLabel, marginX + colW + 8, y);
                doc.setFont('helvetica', 'normal');
                const rightOpt = doc.splitTextToSize(q.options[i + 1], colW - 16);
                doc.text(rightOpt, marginX + colW + 15, y);
              }
              y += Math.max(leftOpt.length, 1) * 4.5 + 1;
            }
            y += 2;
          } else {
            // Long-answer lines
            for (let l = 0; l < 3; l++) {
              checkPageBreak(6);
              doc.setDrawColor(180, 180, 180);
              doc.setLineWidth(0.2);
              doc.line(marginX + 8, y + 1, pageW - marginX, y + 1);
              y += 6;
            }
          }
          y += 2;
        });
        y += 4;
      });

      // ── Save ─────────────────────────────────────────────────
      const filename = `${assignment.title?.replace(/\s+/g, '_') || 'Assessment'}_Paper.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
     try {
       setIsRegenerating(true);
       await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/api/assignments/${id}/regenerate`);
       fetchAssignment(); // Instantly update UI status to 'generating'
     } catch (err) {
       console.error("Failed to regenerate", err);
     } finally {
       setIsRegenerating(false);
       setShowIntro(true);
     }
  };

  if (loading) return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
  );

  if (error || !data?.assignment) return (
      <div className="text-center py-20 text-red-500 min-h-[60vh] flex items-center justify-center font-bold">
         {error || 'Assignment Not found'}
      </div>
  );

  const { assignment, paper } = data;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 py-6 px-4 font-sans print:bg-white print:text-black print:p-0 print:py-0 w-full relative z-10">
      
      {/* Action Bar */}
      <div className="max-w-[210mm] mx-auto mb-8 flex items-center justify-between w-full print:hidden">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-full hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        <div className="flex gap-2">
          <button 
             onClick={handleRegenerate}
             disabled={isRegenerating}
             className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 font-bold text-[13px] shadow-sm active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
          <button 
            onClick={handlePrint}
            disabled={downloading}
            className={`flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all border border-black text-[13px] active:scale-95 whitespace-nowrap ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {downloading ? (
               <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
               <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{downloading ? "Generating PDF..." : "Download as PDF"}</span>
          </button>
        </div>
      </div>

      {/* AI Intro Message Bubble */}
      {showIntro && (
        <div className="max-w-[210mm] mx-auto mb-8 print:hidden">
          <div className="bg-[#2B2B2B] text-white p-7 rounded-[2rem] shadow-xl relative overflow-hidden">
            <p className="text-[0.95rem] font-medium leading-relaxed pr-4">
              Certainly, {user?.firstName || 'Teacher'}! Here are customized Question Paper for your classes on the requested chapters:
            </p>
          </div>
        </div>
      )}

      {assignment?.status === 'generating' && (
           <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 shadow-sm max-w-[210mm] mx-auto">
               <Loader2 className="w-12 h-12 animate-spin text-[#111827] mx-auto mb-4" />
               <h2 className="text-xl font-bold text-[#111827]">Generation in progress...</h2>
               <p className="text-gray-500 mt-2">Please wait while VedaAI constructs the paper.</p>
           </div>
      )}

      {/* Paper View Container */}
      {paper && (
         <div 
             ref={printRef}
             id="printable-content"
             className="bg-white text-[#111827] rounded-none sm:rounded-2xl sm:shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 max-w-[210mm] mx-auto"
         >
             {/* Header */}
             <div className="p-6 text-center bg-white print:p-6">
                 {assignment.institutionName && (
                     <h1 className="text-2xl font-black uppercase tracking-tight mb-1 text-[#111827]">{assignment.institutionName}</h1>
                 )}
                 <div className="space-y-0.5">
                     <p className="text-base font-bold text-[#1f2937]">Subject: {assignment.subject || assignment.title}</p>
                     {assignment.standard && <p className="text-sm font-semibold text-gray-600">Class: {assignment.standard}</p>}
                 </div>

                  <div className="flex justify-between items-center mt-6 border-t border-b border-[#111827] py-2 font-black text-xs uppercase tracking-wider">
                      <span>
                        {assignment.dueDate && assignment.dueDate.trim() !== "" 
                          ? `Due Date: ${format(new Date(assignment.dueDate), 'PPP')}` 
                          : `Time Allowed: ${assignment.timeAllowed || 'As per instructions'}`}
                      </span>
                      <span>Maximum Marks: {assignment.totalMarks}</span>
                  </div>

                 <div className="mt-3 text-left">
                     <p className="text-xs font-bold text-[#111827] italic">All questions are compulsory unless stated otherwise.</p>
                 </div>
             </div>

             {/* Student Details Section (For printing) */}
             <div className="px-6 pb-4 print:px-6">
                 <div className="space-y-3 border border-[#111827] p-4 rounded-none bg-white">
                     <div className="flex gap-3 items-end">
                         <span className="text-xs font-bold whitespace-nowrap">Name:</span>
                         <div className="flex-1 border-b border-gray-400 h-4" />
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="flex gap-3 items-end">
                            <span className="text-xs font-bold whitespace-nowrap">Roll Number:</span>
                            <div className="flex-1 border-b border-gray-400 h-4" />
                        </div>
                        <div className="flex gap-3 items-end">
                            <span className="text-xs font-bold whitespace-nowrap">Class: {assignment.standard} Section:</span>
                            <div className="flex-1 border-b border-gray-400 h-4" />
                        </div>
                     </div>
                 </div>

                 <div className="my-6 text-center flex items-center justify-center gap-3">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-base font-black uppercase tracking-[0.2em] text-[#111827]">Section A</span>
                    <div className="h-px bg-gray-200 flex-1" />
                 </div>

                  {/* Questions */}
                  <div className="space-y-6 px-6 print:px-6">
                      {paper.sections.map((sec: Section, sIdx: number) => (
                          <div key={sec._id || sIdx} className="break-inside-avoid">
                              <div className="mb-4 flex justify-between items-start gap-4">
                                   <div>
                                       <h3 className="text-base font-black text-[#111827]">
                                           {sec.title && !['Main Assessment', 'Assessment', 'Question Paper', 'Section'].some(t => sec.title.includes(t)) 
                                               ? sec.title 
                                               : (sec.questions?.[0]?.type || 'General Questions')}
                                       </h3>
                                       {sec.instruction && <p className="text-gray-500 italic font-serif text-xs leading-relaxed mt-1">{sec.instruction}</p>}
                                   </div>
                                   {sec.questions && sec.questions.length > 0 && (
                                       <div className="font-black text-[#111827] text-sm whitespace-nowrap pt-1">
                                           {sec.questions.length} × {sec.questions[0].marks} = {sec.questions.length * sec.questions[0].marks}
                                       </div>
                                   )}
                              </div>
                              
                              <div className="space-y-4 mt-2">
                                  {sec.questions?.map((q: Question, qIdx: number) => (
                                      <div key={q._id || qIdx} className="flex gap-4 group break-inside-avoid relative">
                                          <div className="font-bold text-[0.95rem] min-w-[1.8rem] font-serif text-[#111827] pt-0.5">
                                            {qIdx + 1}.
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-start gap-4">
                                                  <div className="text-[0.95rem] leading-relaxed text-[#1f2937] font-medium font-serif flex-1">
                                                    <ReactMarkdown components={{ p: 'span', strong: ({node, ...props}) => <strong className="font-bold text-[#111827]" {...props} /> }}>{q.text}</ReactMarkdown>
                                                  </div>
                                              </div>
                                              
                                              {q.options && q.options.length > 0 && (
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 mb-4 mt-2">
                                                     {q.options.map((opt, i) => (
                                                         <div key={i} className="flex gap-2 items-start p-0 text-[0.9rem] text-gray-700 font-serif">
                                                             <span className="font-bold text-[#111827] min-w-[1.2rem]">{String.fromCharCode(65 + i)})</span>
                                                             <span className="leading-snug">{opt}</span>
                                                         </div>
                                                     ))}
                                                 </div>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              {sIdx < paper.sections.length - 1 && (
                                 <div className="my-10 text-center flex items-center justify-center gap-3 break-before-avoid">
                                   <div className="h-px bg-gray-200 flex-1" />
                                   <span className="text-base font-black uppercase tracking-[0.2em] text-[#111827]">
                                     Section {String.fromCharCode(66 + sIdx)}
                                   </span>
                                   <div className="h-px bg-gray-200 flex-1" />
                                 </div>
                              )}
                          </div>
                      ))}
                  </div>
             </div>
             
             {/* Footer & Answer Key */}
             <div className="mt-10 p-6 border-t-2 border-double border-gray-200 print:p-6 break-before-page">
                 <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-black mb-10">
                     *** End of Question Paper ***
                 </div>

                 {paper.answerKey && (
                     <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 print:bg-white print:border-none print:p-0">
                         <h2 className="text-xl font-black text-[#111827] border-b border-[#111827] pb-2 mb-6 uppercase tracking-tight">
                           Answer Key / Multi-Choice Solutions
                         </h2>
                         <div className="text-gray-700 font-serif leading-relaxed text-[0.9rem] whitespace-pre-line">
                              <ReactMarkdown 
                                components={{ 
                                  p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />, 
                                  strong: ({node, ...props}) => <strong className="font-bold text-[#111827]" {...props} /> 
                                }}
                              >
                                {paper.answerKey?.replace(/(Q\d+:)/g, '\n$1').trim()}
                              </ReactMarkdown>
                         </div>
                     </div>
                 )}
             </div>
          </div>
      )}
    </div>
  );
}