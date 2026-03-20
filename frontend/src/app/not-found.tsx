'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-md mx-auto animate-fade-in p-6">
      <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
        <Construction className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Under Development</h2>
      <p className="text-gray-500 mb-10 leading-relaxed">
        This page is currently being upgraded to bring you a better experience. We'll be back shortly!
      </p>
      <Link href="/">
        <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>
      </Link>
    </div>
  );
}
