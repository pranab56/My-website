"use client";

import { useSidebar } from '@/components/providers/SidebarProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, setIsCollapsed, hasMounted } = useSidebar();

  const toggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden relative w-full",
          !hasMounted && "transition-none" // Prevent jumpy transition on mount
        )}
        data-sidebar-collapsed={isCollapsed}
      >
        {/* Abstract Background Elements for Glass Effect */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - responsive behavior handled inside Sidebar component */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 w-full">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 overflow-y-auto custom-scrollbar w-full">
            <div className="w-full px-2 md:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
