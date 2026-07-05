"use client";

import { useState } from "react";
import Link from "next/link";
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

    // Trigger physics resets (forces particles to scatter instantly instead of morphing)
    const [resetKey, setResetKey] = useState(0);

    const handleReset = () => {
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
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">Kinetic Typography</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Spring Physics & Shape Morphing</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[500px] h-full">
                    <KineticParameterPanel
                        inputText={inputText} setInputText={setInputText}
                        particleCount={particleCount} setParticleCount={setParticleCount}
                        springStiffness={springStiffness} setSpringStiffness={setSpringStiffness}
                        damping={damping} setDamping={setDamping}
                        repulsionRadius={repulsionRadius} setRepulsionRadius={setRepulsionRadius}
                        repulsionStrength={repulsionStrength} setRepulsionStrength={setRepulsionStrength}
                        fontSize={fontSize} setFontSize={setFontSize}
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
                    />
                </div>
            </div>
        </main>
    );
}
