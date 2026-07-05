"use client";

import { useState } from "react";
import { SandParameterPanel } from "@/components/SandParameterPanel";
import { SandCanvas } from "@/components/SandCanvas";

export default function FallingSandPage() {
    const [brushSize, setBrushSize] = useState(5);
    const [material, setMaterial] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(2);

    const [resetKey, setResetKey] = useState(0);

    const handleClear = () => {
        setResetKey(prev => prev + 1);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">Falling Sand</h1>
                <p className="text-zinc-400 mt-1 text-xs">Cellular Automata Physics Sandbox</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)]">
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
        </div>
    );
}
