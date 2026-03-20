'use client';

import { Bell, ChevronDown, User } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function DesktopHeader() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <header className="hidden md:flex items-center justify-end px-8 py-4 bg-transparent sticky top-0 z-30">
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <div className="bg-white p-2.5 rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all cursor-pointer relative group">
          <Bell className="w-5 h-5 group-hover:animate-swing" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>

        {/* Profile/Auth Trigger Area */}
        <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1 rounded-full shadow-sm border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group">
          {isSignedIn ? (
             <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
               <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {isSignedIn ? (user?.fullName || 'Teacher') : 'Teacher User'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
