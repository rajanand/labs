"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar isOpen={isSidebarOpen} />
                <main className="flex-1 overflow-y-auto bg-[#0a0e1a]">
                    {children}
                </main>
            </div>
        </div>
    );
}
