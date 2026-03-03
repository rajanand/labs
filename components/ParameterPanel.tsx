import React from "react";

export type InteractionMode = "attract" | "repel" | "pan";

interface ParameterPanelProps {
    rotationSpeed: number;
    setRotationSpeed: (value: number) => void;
    particleCount: number;
    setParticleCount: (value: number) => void;
    turbulenceFactor: number;
    setTurbulenceFactor: (value: number) => void;
    gravityConstant: number;
    setGravityConstant: (value: number) => void;

    // Visual Enhancements
    trailLength: number;
    setTrailLength: (value: number) => void;
    glowIntensity: number;
    setGlowIntensity: (value: number) => void;

    // Interaction State
    interactionMode: InteractionMode;
    setInteractionMode: (value: InteractionMode) => void;

    onResetCamera: () => void;
}

export function ParameterPanel(props: ParameterPanelProps) {
    const {
        rotationSpeed, setRotationSpeed,
        particleCount, setParticleCount,
        turbulenceFactor, setTurbulenceFactor,
        gravityConstant, setGravityConstant,
        trailLength, setTrailLength,
        glowIntensity, setGlowIntensity,
        interactionMode, setInteractionMode,
        onResetCamera,
    } = props;

    const handleReset = () => {
        setRotationSpeed(1);
        setParticleCount(1500);
        setTurbulenceFactor(1);
        setGravityConstant(5);
        setTrailLength(0.2);
        setGlowIntensity(5);
        setInteractionMode("attract");
        onResetCamera();
    };

    const setPreset = (preset: "calm" | "storm" | "blackhole") => {
        if (preset === "calm") {
            setRotationSpeed(0.2); setParticleCount(1000); setTurbulenceFactor(0.2); setGravityConstant(2); setTrailLength(0.05); setGlowIntensity(2);
        } else if (preset === "storm") {
            setRotationSpeed(8); setParticleCount(3000); setTurbulenceFactor(4); setGravityConstant(8); setTrailLength(0.5); setGlowIntensity(10);
        } else if (preset === "blackhole") {
            setRotationSpeed(6); setParticleCount(5000); setTurbulenceFactor(0); setGravityConstant(20); setTrailLength(0.1); setGlowIntensity(8);
        }
        onResetCamera();
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-lg overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Parameters</h2>
                    <p className="text-zinc-400 text-sm mt-1">Adjust timeline simulation</p>
                </div>
            </div>

            {/* Presets and Actions */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Presets</label>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setPreset("calm")} className="px-2 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors">Calm</button>
                    <button onClick={() => setPreset("storm")} className="px-2 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors">Storm</button>
                    <button onClick={() => setPreset("blackhole")} className="px-2 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors">Black Hole</button>
                </div>
                <button onClick={handleReset} className="mt-2 w-full px-4 py-2 text-sm font-medium bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/50">
                    Reset to Defaults / Center Camera
                </button>
            </div>

            {/* Interaction Mode */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Mouse Interaction</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setInteractionMode("attract")}
                        className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors border ${interactionMode === 'attract' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
                    >Attract</button>
                    <button
                        onClick={() => setInteractionMode("repel")}
                        className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors border ${interactionMode === 'repel' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
                    >Repel</button>
                    <button
                        onClick={() => setInteractionMode("pan")}
                        className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors border ${interactionMode === 'pan' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
                    >Pan Canvas</button>
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Physics Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Rotation Speed" value={rotationSpeed} min={0} max={10} step={0.1} onChange={setRotationSpeed} />
                <SliderControl label="Particle Count" value={particleCount} min={100} max={10000} step={100} onChange={setParticleCount} />
                <SliderControl label="Turbulence" value={turbulenceFactor} min={0} max={5} step={0.1} onChange={setTurbulenceFactor} />
                <SliderControl label="Gravity Constant" value={gravityConstant} min={0} max={20} step={0.5} onChange={setGravityConstant} />
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Visuals Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Trail Length" value={trailLength} min={0.01} max={1} step={0.01} onChange={setTrailLength} />
                <SliderControl label="Glow Intensity" value={glowIntensity} min={0} max={20} step={1} onChange={setGlowIntensity} />
            </div>

        </div>
    );
}

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
}

function SliderControl({ label, value, min, max, step, onChange }: SliderControlProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">{label}</label>
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                    {value.toFixed(step < 1 ? 2 : 0)}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
    );
}
