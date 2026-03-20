'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FileText, Wrench, Clock, Settings, Sparkles, User } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function Sidebar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: LayoutGrid, href: '/home' },
    { name: 'My Groups', icon: Users, href: '/groups' },
    { name: 'Assignments', icon: FileText, href: '/' },
    { name: 'AI Teacher\'s Toolkit', icon: Wrench, href: '/toolkit' },
    { name: 'My Library', icon: Clock, href: '/library' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col p-4 hidden md:flex shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-[10px] bg-gray-900 flex items-center justify-center text-white font-bold text-xl">
          V
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">VedaAI</span>
      </div>

      {/* Create Assignment Button */}
      <Link href="/assignment/create" className="w-full mb-8">
        <button className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 shadow-sm transition-all border-[1.5px] border-[#FF7A59]">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-medium text-sm">Create Assignment</span>
        </button>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname.startsWith('/assignment'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-gray-100/80 text-gray-900 font-semibold' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Profile */}
      <div className="mt-auto space-y-4">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Settings</span>
        </Link>
        
        {/* Profile Card (Always visible, Clerk logic kept for future implementation) */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:border-gray-200 transition-all cursor-default">
          <div className="relative">
            {isLoaded && isSignedIn ? (
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-white shadow-sm" } }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {isSignedIn ? (user?.fullName || user?.username || 'Teacher') : 'Teacher User'}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {isSignedIn ? (user?.publicMetadata?.institutionName as string || 'Educator') : 'Greenwood Academy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
