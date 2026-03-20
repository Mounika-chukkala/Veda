'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Search, Filter, Plus, FileQuestion, MoreVertical, Trash2, ExternalLink, X, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    try {
      // Use user.id if available, otherwise default to demo_user for seamless experience
      const userId = user?.id || 'demo_user';
      const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/api/assignments?userId=${userId}`);
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoaded) {
      fetchAssignments();
    }
  }, [isUserLoaded, user?.id]);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    // Soft delete: Remove from UI only, don't delete from database as requested
    setAssignments(assignments.filter(a => a._id !== id));
    setOpenMenuId(null);
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // EMPTY STATE
  if (assignments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-lg mx-auto px-6 pb-32">
        
        {/* Mock Illustration from Mockup */}
        <div className="relative mb-12">
          {/* Background circle */}
          <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center opacity-50 overflow-hidden">
             <div className="w-40 h-56 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col p-4 space-y-3">
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="mt-4 border-t border-gray-100 pt-3">
                   <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                </div>
             </div>
          </div>
          {/* Magnifying Glass with Red X */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border-[10px] border-gray-300 bg-white/40 backdrop-blur-sm flex items-center justify-center">
                   <X className="w-12 h-12 text-red-500" strokeWidth={3} />
                </div>
                <div className="absolute -bottom-10 -right-4 w-16 h-4 bg-gray-300 rounded-full rotate-45 transform origin-left"></div>
             </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">No assignments yet</h2>
        <p className="text-gray-500 mb-10 leading-relaxed text-[15px] font-medium">
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
        
        <Link href="/assignment/create" className="w-full">
          <button className="bg-[#1A1A1A] hover:bg-black text-white rounded-full py-3 px-6 font-medium shadow-xl flex items-center gap-2 border-[1.5px] border-[#FF7A59]">
            <Sparkles className="w-4 h-4 text-white" />
            Create Assignment
          </button>
        </Link>
      </div>
    );
  }

  // FILLED STATE
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 pb-32 pt-2">
      <div className="flex items-start gap-3 mb-8">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push('/home')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 shadow-sm border border-gray-200 hover:bg-white transition-colors mt-0.5"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-3 h-3 rounded-full bg-green-500 mt-2 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Assignments</h1>
            <p className="text-gray-400 text-sm font-medium mt-0.5">Manage and create assignments for your classes.</p>
          </div>
        </div>
      </div>

      {/* Filters & Search - Unified Pill Style */}
      <div className="bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-between mb-8 overflow-hidden pr-2">
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 px-6 py-4 text-sm font-bold border-r border-gray-100 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter By
        </button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Assignment" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-transparent text-sm focus:outline-none placeholder:text-gray-400 font-bold"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments
          .filter(a => 
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.subject?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((assignment) => (
          <div key={assignment._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-gray-300 transition-colors">
            
            <div className="flex justify-between items-start mb-16">
              <h3 className="font-bold text-2xl text-gray-900 tracking-tight leading-tight max-w-[85%]">{assignment.title}</h3>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === assignment._id ? null : assignment._id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 z-10 relative"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openMenuId === assignment._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => router.push(`/assignment/${assignment._id}`)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Assignment
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(assignment._id);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span>
                Assigned on : <span className="text-gray-900 ml-1">{new Date(assignment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              </span>
              <span>
                Due : <span className="text-gray-900 ml-1">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '21-03-2026'}</span>
              </span>
            </div>

            {/* Click overlay */}
            <Link href={`/assignment/${assignment._id}`} className="absolute inset-0 z-0 rounded-2xl"></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
