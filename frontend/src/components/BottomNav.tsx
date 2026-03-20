'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Clock, Wrench, Plus, Sparkles, FileQuestion } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: LayoutGrid, href: '/home' },
    { name: 'Assessments', icon: FileQuestion, href: '/' },
    { name: 'My Groups', icon: Users, href: '/groups' },
    { name: 'Library', icon: Clock, href: '/library' },
    { name: 'AI Toolkit', icon: Sparkles, href: '/toolkit' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-6">
      
      {/* Floating Action Button (FAB) */}
      <div className="w-full flex justify-end mb-4 pointer-events-auto">
         <Link href="/assignment/create" className="w-14 h-14 bg-[#1A1A1A] rounded-full shadow-2xl border-[1.5px] border-[#FF7A59] flex items-center justify-center active:scale-95 transition-transform group">
           <Sparkles className="w-6 h-6 text-white" />
         </Link>
      </div>

      {/* Main Bottom Nav Pill */}
      <div className="bg-[#1A1A1A] rounded-full px-8 py-4 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-sm w-full pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
