"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ParameterPanel, InteractionMode } from "@/components/ParameterPanel";
import { SimulationCanvas } from "@/components/SimulationCanvas";

export default function HyperVortexPage() {
    const [rotationSpeed, setRotationSpeed] = useState(1);
    const [particleCount, setParticleCount] = useState(1500);
    const [turbulenceFactor, setTurbulenceFactor] = useState(1);
    const [gravityConstant, setGravityConstant] = useState(5);

    // Enhancement states
    const [trailLength, setTrailLength] = useState(0.2); // 0.01 is long, 1 is instantaneous
    const [glowIntensity, setGlowIntensity] = useState(5);
    const [interactionMode, setInteractionMode] = useState<InteractionMode>("attract");

    // To coordinate camera resets between panel and canvas
    const [resetKey, setResetKey] = useState(0);

    const handleResetCamera = useCallback(() => {
        setResetKey(prev => prev + 1);
    }, []);

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
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">HyperVortex</h1>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-16 md:mt-8 h-full max-h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 min-h-[400px] h-full">
                    <ParameterPanel
                        rotationSpeed={rotationSpeed}
                        setRotationSpeed={setRotationSpeed}
                        particleCount={particleCount}
                        setParticleCount={setParticleCount}
                        turbulenceFactor={turbulenceFactor}
                        setTurbulenceFactor={setTurbulenceFactor}
                        gravityConstant={gravityConstant}
                        setGravityConstant={setGravityConstant}
                        trailLength={trailLength}
                        setTrailLength={setTrailLength}
                        glowIntensity={glowIntensity}
                        setGlowIntensity={setGlowIntensity}
                        interactionMode={interactionMode}
                        setInteractionMode={setInteractionMode}
                        onResetCamera={handleResetCamera}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full">
                    <SimulationCanvas
                        rotationSpeed={rotationSpeed}
                        particleCount={particleCount}
                        turbulenceFactor={turbulenceFactor}
                        gravityConstant={gravityConstant}
                        trailLength={trailLength}
                        glowIntensity={glowIntensity}
                        interactionMode={interactionMode}
                        resetKey={resetKey}
                    />
                </div>
            </div>
        </main>
    );
}
