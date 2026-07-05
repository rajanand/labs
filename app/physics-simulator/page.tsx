"use client";

import { useState } from "react";
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
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">Physics Simulator</h1>
                <p className="text-zinc-400 mt-1 text-xs">Particle Constraint Engine</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)] z-10">
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
        </div>
    );
}
