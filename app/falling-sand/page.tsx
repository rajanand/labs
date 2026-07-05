"use client";

import { useState } from "react";
import Link from "next/link";
import { SandParameterPanel } from "@/components/SandParameterPanel";
import { SandCanvas } from "@/components/SandCanvas";

export default function FallingSandPage() {
    const [brushSize, setBrushSize] = useState(5);
    // Materials: 0=Empty, 1=Sand, 2=Water, 3=Wall, 4=Wood, 5=Acid, 6=Fire, 7=Lava
    const [material, setMaterial] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(2); // Defaults to 2x speed for smoother flow dynamics

    // Trigger physics resets
    const [resetKey, setResetKey] = useState(0);

    const handleClear = () => {
        setResetKey(prev => prev + 1);
    };

    return (
        <main className="min-h-screen bg-zinc-950 p-4 md:p-8 flex flex-col pt-20 relative">
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
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">Falling Sand</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Cellular Automata Physics Sandbox</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[350px] h-full">
                    <SandParameterPanel
                        brushSize={brushSize} setBrushSize={setBrushSize}
                        material={material} setMaterial={setMaterial}
                        isPlaying={isPlaying} setIsPlaying={setIsPlaying}
                        speed={speed} setSpeed={setSpeed}
                        onClear={handleClear}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full">
                    <SandCanvas
                        brushSize={brushSize}
                        material={material}
                        isPlaying={isPlaying}
                        resetKey={resetKey}
                        speed={speed}
                    />
                </div>
            </div>
        </main>
    );
}
