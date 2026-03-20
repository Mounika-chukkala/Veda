'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FileText, Wrench } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: LayoutGrid, href: '/home' },
    { name: 'My Groups', icon: Users, href: '/groups' },
    { name: 'Library', icon: FileText, href: '/' },
    { name: 'AI Toolkit', icon: Wrench, href: '/toolkit' },
  ];

  // Hide mobile nav inside the creation form if desired, or keep it.
  // We'll keep it on dashboard but hide it if we are on /assignment/create 
  if (pathname.includes('/assignment/create')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50">
      <div className="bg-[#1A1A1A] rounded-[32px] px-6 py-4 flex justify-between items-center shadow-2xl safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname.startsWith('/assignment'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="text-[10px] sm:text-xs text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
