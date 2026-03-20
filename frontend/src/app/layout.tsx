import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "VedaAI Assessment Creator",
  description: "AI-powered assessment and question paper generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#F8F9FA] text-[#111827] min-h-screen antialiased selection:bg-gray-200`}>
          <Providers>
            <div className="flex min-h-screen">
              <div className="print:hidden">
                <Sidebar />
              </div>
              
              <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
                 {/* Mobile Header component renders on small screens */}
                 <div className="print:hidden">
                   <MobileHeader />
                 </div>
                 
                 {/* Desktop Top Header */}
                 <div className="print:hidden">
                   <DesktopHeader />
                 </div>
                 
                 <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 pt-16 md:pt-4 relative z-0 print:p-0 print:pt-0 print:pb-0">
                   {children}
                 </main>

                 {/* Mobile Bottom Navigation Bar (Floating Pill) */}
                 <div className="print:hidden">
                   <BottomNav />
                 </div>
              </div>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
