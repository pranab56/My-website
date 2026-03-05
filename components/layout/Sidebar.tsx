"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLogoutMutation } from '@/features/auth/authApi';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Image,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Trades', href: '/trades', icon: History },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Todos', href: '/todos', icon: CheckSquare },
  { name: 'Gallery', href: '/gallery', icon: Image },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 bg-card/70 backdrop-blur-2xl border-r border-border h-screen z-40 flex flex-col transition-all duration-300 md:translate-x-0 md:static
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'w-20' : 'w-72 md:w-64'}
    `}>
      <div className={`p-4 md:p-6 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <TrendingUp className="text-primary-foreground w-6 h-6" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold tracking-tight">TradeLog</h1>}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav className={`flex-1 px-3 space-y-1.5 mt-2 md:mt-4 overflow-y-auto custom-scrollbar ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const content = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={`
                flex items-center p-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }
                ${isCollapsed ? 'justify-center w-12 h-12 p-0' : 'space-x-3 w-full'}
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0`} />
              {!isCollapsed && <span className="font-bold text-xs uppercase tracking-tight flex-1">{item.name}</span>}
              {isActive && !isCollapsed && (
                <div className="absolute right-2 w-1 h-5 bg-primary-foreground rounded-full" />
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold uppercase tracking-widest text-[10px]">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return content;
        })}
      </nav>

      <div className={`px-3 py-6 mt-auto space-y-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center justify-center w-12 h-12 rounded-xl text-loss hover:bg-loss/10 transition-all duration-200 group cursor-pointer border border-transparent hover:border-loss/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold uppercase tracking-widest text-[10px] text-loss">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center space-x-3 p-4 rounded-xl text-loss hover:bg-loss/10 transition-all duration-200 group font-bold text-xs uppercase tracking-wider cursor-pointer border border-transparent hover:border-loss/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            )}
            <span>{isLoading ? 'Exiting...' : 'Sign Out'}</span>
          </button>
        )}

        {!isCollapsed && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hidden md:block">
            <p className="text-[10px] text-muted-foreground font-black mb-2 uppercase tracking-widest">Psychology Tip</p>
            <p className="text-xs leading-relaxed font-medium italic opacity-80">
              &quot;Consistency and discipline are the pillars of every profitable trader.&quot;
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
