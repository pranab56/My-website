"use client";

import { useGetMeQuery } from '@/features/auth/authApi';
import { format } from 'date-fns';
import { Clock, Loader2, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { TradingCalendar } from './TradingCalendar';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const { data, isLoading } = useGetMeQuery(undefined);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userName = data?.user?.name || 'TRADER';
  const initial = userName.charAt(0).toUpperCase();
  const profileImage = data?.user?.profileImage;

  return (
    <header className="h-20 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl bg-accent/30 border border-border/50 text-muted-foreground hover:text-primary transition-all cursor-pointer active:scale-95"
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <TradingCalendar />

        <div className="hidden lg:flex items-center space-x-2 bg-accent/30 px-4 py-2 rounded-xl text-sm font-medium border border-border/50">
          <Clock className="w-4 h-4 text-primary/70" />
          <span className="text-muted-foreground">
            {format(time, 'HH:mm:ss')}
          </span>
          <span className="text-[10px] text-muted-foreground/50 ml-1">UTC+6</span>
        </div>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/30 border border-border/50 text-muted-foreground hover:text-primary transition-all cursor-pointer active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 transition-all rotate-0 scale-100" />
            ) : (
              <Moon className="w-5 h-5 transition-all rotate-0 scale-100" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="flex items-center space-x-2 md:space-x-3 bg-accent/50 p-1 md:p-1.5 rounded-xl pl-2 md:pl-3">
          <div className="flex flex-col items-end mr-1">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              <span className="text-[10px] md:text-xs font-bold leading-none uppercase truncate max-w-[80px] md:max-w-[120px]">{userName}</span>
            )}
            <span className="text-[9px] md:text-[10px] text-primary font-medium tracking-wider">ACTIVE</span>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black shadow-inner overflow-hidden relative border border-border/10">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileImage ? (
              <Image
                src={profileImage}
                alt={userName}
                fill
                className="object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

