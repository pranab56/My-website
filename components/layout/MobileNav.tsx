"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Plus,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Trades', href: '/trades', icon: History },
  { name: 'Add', href: '/trades?action=add', icon: Plus, isAction: true },
  { name: 'Stats', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/settings', icon: UserCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden h-20">
      {/* Glossy Background with safe area padding */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-safe" />

      <div className="relative flex items-center justify-between h-full px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center relative -top-7 cursor-pointer z-[110]"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 active:scale-90 transition-transform ring-4 ring-background">
                  <Icon className="w-8 h-8" />
                </div>

                {/* Floating Glow */}
                <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl rounded-full scale-125" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full transition-all relative cursor-pointer z-[110]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-0.5 justify-center">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "scale-110" : ""
                )} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-tighter transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-1 h-1 bg-primary rounded-full mt-0.5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
