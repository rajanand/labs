"use client";

import { useState } from "react";
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
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const [resetKey, setResetKey] = useState(0);
    const [resetVariant, setResetVariant] = useState<"top" | "horizontal">("horizontal");

    const handleReset = (variant: "top" | "horizontal") => {
        setResetVariant(variant);
        setResetKey(prev => prev + 1);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">Double Pendulum</h1>
                <p className="text-zinc-400 mt-1 text-xs">Chaos Theory & Lagrangian Mechanics</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[400px] h-full">
                    <PendulumParameterPanel
                        mass1={mass1} setMass1={setMass1}
                        mass2={mass2} setMass2={setMass2}
                        length1={length1} setLength1={setLength1}
                        length2={length2} setLength2={setLength2}
                        gravity={gravity} setGravity={setGravity}
                        trailLength={trailLength} setTrailLength={setTrailLength}
                        showMultiple={showMultiple} setShowMultiple={setShowMultiple}
                        isAudioEnabled={isAudioEnabled} setIsAudioEnabled={setIsAudioEnabled}
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
                        isAudioEnabled={isAudioEnabled}
                    />
                </div>
            </div>
        </div>
    );
}
