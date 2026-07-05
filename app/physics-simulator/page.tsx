"use client";

import { useState } from "react";
import Link from "next/link";
import { GlobalSettings, physicsPresets } from "@/lib/physics/ai-simulator-presets";
import { PhysicsParameterPanel } from "@/components/PhysicsParameterPanel";
import { PhysicsCanvas } from "@/components/PhysicsCanvas";

export default function PhysicsSimulatorPage() {
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
        timeScale: 1.0,
        gravityMultiplier: 1.0,
        rotationMultiplier: 1.0,
        bouncinessMultiplier: 1.0,
    });

    const [isPlaying, setIsPlaying] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    // Track selected preset
    const [selectedConfigId, setSelectedConfigId] = useState<number>(physicsPresets[0].id);

    const selectedConfig = physicsPresets.find(p => p.id === selectedConfigId) || physicsPresets[0];

    const handleTogglePlay = () => {
        if (isPlaying) {
            setGlobalSettings(prev => ({ ...prev, timeScale: 0 }));
        } else {
            setGlobalSettings(prev => ({ ...prev, timeScale: 1 }));
        }
        setIsPlaying(!isPlaying);
    };

    const handleResetFilters = () => {
        setGlobalSettings({
            timeScale: 1.0,
            gravityMultiplier: 1.0,
            rotationMultiplier: 1.0,
            bouncinessMultiplier: 1.0,
        });
        setIsPlaying(true);
        setIsAudioEnabled(false);
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
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">Physics Simulator</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Particle Constraint Engine</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)] z-10">
                <div className="lg:col-span-1 min-h-[400px] h-full flex flex-col gap-4">
                    <PhysicsParameterPanel
                        globalSettings={globalSettings}
                        setGlobalSettings={setGlobalSettings}
                        isPlaying={isPlaying}
                        togglePlay={handleTogglePlay}
                        selectedConfigId={selectedConfigId}
                        setSelectedConfigId={setSelectedConfigId}
                        isAudioEnabled={isAudioEnabled}
                        setIsAudioEnabled={setIsAudioEnabled}
                        onReset={handleResetFilters}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full relative group">
                    <PhysicsCanvas
                        config={selectedConfig}
                        globalSettings={globalSettings}
                        isAudioEnabled={isAudioEnabled}
                    />
                </div>
            </div>
        </main>
    );
}
