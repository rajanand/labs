"use client";

import { useState } from "react";
import Link from "next/link";
import { AIGridParameterPanel } from "@/components/AIGridParameterPanel";
import { AIGridCanvas } from "@/components/AIGridCanvas";

export default function AIKineticShapesPage() {
    const [stiffness, setStiffness] = useState(0.02);
    const [damping, setDamping] = useState(0.90);
    const [repulsionRadius, setRepulsionRadius] = useState(150);
    const [nodeSize, setNodeSize] = useState(2);
    const [resolution, setResolution] = useState(30); // E.g., 30x30 grid

    // A simple way to force the canvas to re-initialize its grid completely
    const [resetKey, setResetKey] = useState(0);

    const handleReset = () => {
        setStiffness(0.02);
        setDamping(0.90);
        setRepulsionRadius(150);
        setNodeSize(2);
        setResolution(30);
        setResetKey(prev => prev + 1);
    };

    return (
        <main className="min-h-screen bg-zinc-950 p-4 md:p-8 flex flex-col pt-20 relative overflow-hidden">
            <header className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                <Link
                    href="/"
                    className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Labs
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">AI Studio Mesh</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Interactive Spring Topology</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)] z-10">
                <div className="lg:col-span-1 min-h-[400px] h-full flex flex-col gap-4">
                    <AIGridParameterPanel
                        stiffness={stiffness} setStiffness={setStiffness}
                        damping={damping} setDamping={setDamping}
                        repulsionRadius={repulsionRadius} setRepulsionRadius={setRepulsionRadius}
                        nodeSize={nodeSize} setNodeSize={setNodeSize}
                        resolution={resolution} setResolution={setResolution}
                        onReset={handleReset}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full relative group">
                    <AIGridCanvas
                        stiffness={stiffness}
                        damping={damping}
                        repulsionRadius={repulsionRadius}
                        nodeSize={nodeSize}
                        resolution={resolution}
                        resetKey={resetKey}
                    />
                </div>
            </div>
        </main>
    );
}
