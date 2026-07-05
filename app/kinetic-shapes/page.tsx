"use client";

import { useState } from "react";
import { KineticParameterPanel } from "@/components/KineticParameterPanel";
import { KineticCanvas } from "@/components/KineticCanvas";

export default function KineticShapesPage() {
    const [inputText, setInputText] = useState("HELLO");
    const [particleCount, setParticleCount] = useState(2500);
    const [springStiffness, setSpringStiffness] = useState(0.08);
    const [damping, setDamping] = useState(0.85);
    const [repulsionRadius, setRepulsionRadius] = useState(100);
    const [repulsionStrength, setRepulsionStrength] = useState(20);
    const [fontSize, setFontSize] = useState(180);
    const [shapeMode, setShapeMode] = useState<"text" | "circle" | "spiral" | "heart" | "star">("text");

    // Trigger physics resets (forces particles to scatter instantly instead of morphing)
    const [resetKey, setResetKey] = useState(0);

    const handleReset = () => {
        setResetKey(prev => prev + 1);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">Kinetic Typography</h1>
                <p className="text-zinc-400 mt-1 text-xs">Spring Physics & Shape Morphing</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[500px] h-full">
                    <KineticParameterPanel
                        inputText={inputText} setInputText={setInputText}
                        particleCount={particleCount} setParticleCount={setParticleCount}
                        springStiffness={springStiffness} setSpringStiffness={setSpringStiffness}
                        damping={damping} setDamping={setDamping}
                        repulsionRadius={repulsionRadius} setRepulsionRadius={setRepulsionRadius}
                        repulsionStrength={repulsionStrength} setRepulsionStrength={setRepulsionStrength}
                        fontSize={fontSize} setFontSize={setFontSize}
                        shapeMode={shapeMode} setShapeMode={setShapeMode}
                        onReset={handleReset}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full">
                    <KineticCanvas
                        inputText={inputText}
                        particleCount={particleCount}
                        springStiffness={springStiffness}
                        damping={damping}
                        repulsionRadius={repulsionRadius}
                        repulsionStrength={repulsionStrength}
                        fontSize={fontSize}
                        resetKey={resetKey}
                        shapeMode={shapeMode}
                    />
                </div>
            </div>
        </div>
    );
}
