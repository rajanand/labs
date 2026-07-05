"use client";

import { useState } from "react";
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
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">AI Studio Mesh</h1>
                <p className="text-zinc-400 mt-1 text-xs">Interactive Spring Topology</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)] z-10">
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
        </div>
    );
}
