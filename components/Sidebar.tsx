"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { experiments } from "@/lib/constants";

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={`bg-zinc-900 border-r border-white/5 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 transition-all duration-300 ${isOpen ? 'w-60' : 'w-0 border-none px-0'}`}>
      <div className="w-60">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 px-4 pb-2">
          Analysis
        </div>
        
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[13px] font-medium transition-all select-none ${
            pathname === "/"
              ? "bg-blue-400/15 text-blue-400"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
          }`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 shrink-0 ${pathname === '/' ? 'opacity-100' : 'opacity-70'}`}>
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
          Overview
        </Link>

        <div className="h-[1px] bg-white/5 mx-4 my-3"></div>
        
        <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 px-4 pb-2">
          Experiments ({experiments.length})
        </div>
        
        {experiments.map((exp) => {
          const isActive = pathname === exp.href;
          return (
            <Link
              key={exp.id}
              href={exp.href}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[13px] font-medium transition-all select-none ${
                isActive
                  ? "bg-blue-400/15 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
              }`}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                <circle cx="6" cy="10" r="4"/><circle cx="11" cy="5" r="3"/><circle cx="3" cy="4" r="2"/>
              </svg>
              <span className="truncate">{exp.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
