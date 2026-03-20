'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bell, User } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function MobileHeader() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();

  return (
    <>
      {/* Floating Pill Mobile Header */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-40 bg-white rounded-full shadow-lg flex items-center justify-between px-5 py-3 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-gray-900 flex items-center justify-center text-white font-bold text-lg">V</div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">VedaAI</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Always show Bell */}
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="flex items-center gap-2">
             {isLoaded && isSignedIn ? (
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
             ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                   <User className="w-4 h-4 text-gray-400" />
                </div>
             )}
             
             <Link href="/assignment/create" className="ml-1">
                <button className="w-9 h-9 text-white bg-[#1A1A1A] rounded-full hover:bg-black transition-all border-[1.5px] border-[#FF7A59] shadow-lg flex items-center justify-center active:scale-90">
                  <Sparkles className="w-4 h-4 text-white" />
                </button>
             </Link>
          </div>
        </div>
      </div>

      {/* Spacer to push content below floating header */}
      <div className="h-20 md:hidden" />


    </>
  );
}
