'use client';

import { Wrench } from 'lucide-react';

export default function GenericFeaturePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-md mx-auto animate-fade-in">
      <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
        <Wrench className="w-12 h-12 text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Feature Under Development</h2>
      <p className="text-gray-500 mb-8 leading-relaxed text-sm">
        We're actively building out this section to bring you more powerful tools. Check back soon!
      </p>
    </div>
  );
}
