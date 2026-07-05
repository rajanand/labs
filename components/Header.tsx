import React from "react";
import Link from "next/link";

interface HeaderProps {
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen = true }: HeaderProps) {
  return (
    <header className="flex items-center px-6 gap-4 z-50 h-14 bg-zinc-900 border-b border-white/5 col-span-full">
      {onToggleSidebar && (
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             )}
          </svg>
        </button>
      )}
      <Link href="/" className="flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Labs">
          <rect x="2" y="2" width="24" height="24" rx="4" stroke="#22d3bb" strokeWidth="2" fill="none"/>
          <path d="M8 20V10l6-4 6 4v10" stroke="#22d3bb" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="14" y1="6" x2="14" y2="20" stroke="#22d3bb" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="14" cy="13" r="2.5" fill="#22d3bb" fillOpacity="0.3" stroke="#22d3bb" strokeWidth="1"/>
        </svg>
        <div className="text-[15px] font-bold tracking-tight text-zinc-50">
          Labs <span className="text-blue-400">Research</span>
        </div>
      </Link>
      
      <div className="w-[1px] h-6 bg-white/5 mx-2"></div>
      
      <div className="text-xs text-zinc-400 font-normal">
        Personal experimentation platform
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="text-[11px] text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded border border-white/5">
          Data as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
