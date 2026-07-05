"use client";

import { useState, useCallback } from "react";
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
    const [showVectorField, setShowVectorField] = useState(false);

    // To coordinate camera resets between panel and canvas
    const [resetKey, setResetKey] = useState(0);

    const handleResetCamera = useCallback(() => {
        setResetKey(prev => prev + 1);
    }, []);

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">HyperVortex</h1>
                <p className="text-zinc-400 mt-1 text-xs">Interactive particle simulation with tunable physics parameters</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)]">
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
                        showVectorField={showVectorField}
                        setShowVectorField={setShowVectorField}
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
                        showVectorField={showVectorField}
                        resetKey={resetKey}
                    />
                </div>
            </div>
        </div>
    );
}
