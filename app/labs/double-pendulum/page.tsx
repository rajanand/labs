"use client";

import { useState } from "react";
import Link from "next/link";
import { PendulumParameterPanel } from "@/components/PendulumParameterPanel";
import { PendulumCanvas } from "@/components/PendulumCanvas";

export default function DoublePendulumPage() {
    const [mass1, setMass1] = useState(15);
    const [mass2, setMass2] = useState(15);
    const [length1, setLength1] = useState(150);
    const [length2, setLength2] = useState(150);
    const [gravity, setGravity] = useState(1);
    const [trailLength, setTrailLength] = useState(200);
    const [showMultiple, setShowMultiple] = useState(false);

    // Trigger physics resets
    const [resetKey, setResetKey] = useState(0);
    const [resetVariant, setResetVariant] = useState<"top" | "horizontal">("horizontal");

    const handleReset = (variant: "top" | "horizontal") => {
        setResetVariant(variant);
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
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">Double Pendulum</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Chaos Theory & Lagrangian Mechanics</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[400px] h-full">
                    <PendulumParameterPanel
                        mass1={mass1} setMass1={setMass1}
                        mass2={mass2} setMass2={setMass2}
                        length1={length1} setLength1={setLength1}
                        length2={length2} setLength2={setLength2}
                        gravity={gravity} setGravity={setGravity}
                        trailLength={trailLength} setTrailLength={setTrailLength}
                        showMultiple={showMultiple} setShowMultiple={setShowMultiple}
                        onReset={handleReset}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full">
                    <PendulumCanvas
                        mass1={mass1}
                        mass2={mass2}
                        length1={length1}
                        length2={length2}
                        gravity={gravity}
                        trailLength={trailLength}
                        showMultiple={showMultiple}
                        resetKey={resetKey}
                        resetVariant={resetVariant}
                    />
                </div>
            </div>
        </main>
    );
}
