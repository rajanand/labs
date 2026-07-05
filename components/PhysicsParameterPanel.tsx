import React from "react";
import { GlobalSettings, physicsPresets } from "@/lib/physics/ai-simulator-presets";

interface PhysicsParameterPanelProps {
    globalSettings: GlobalSettings;
    setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
    isPlaying: boolean;
    togglePlay: () => void;
    selectedConfigId: number;
    setSelectedConfigId: (id: number) => void;
    isAudioEnabled: boolean;
    setIsAudioEnabled: (val: boolean) => void;
    onReset: () => void;
}

export function PhysicsParameterPanel(props: PhysicsParameterPanelProps) {
    const {
        globalSettings, setGlobalSettings,
        isPlaying, togglePlay,
        selectedConfigId, setSelectedConfigId,
        isAudioEnabled, setIsAudioEnabled,
        onReset
    } = props;

    const currentConfig = physicsPresets.find(p => p.id === selectedConfigId) || physicsPresets[0];

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl min-h-0 h-[500px] lg:h-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Kinetic Lab</h2>
                    <p className="text-zinc-400 text-sm mt-1">Constraint Physics</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={togglePlay}
                        className={`p-2 rounded-lg transition-colors border ${isPlaying ? 'bg-zinc-800 hover:bg-zinc-700 text-red-400 border-zinc-700' : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30'}`}
                        title="Play / Pause"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={onReset}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700"
                        title="Reset Parameters"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800/80"></div>

            {/* Audio Toggle */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Sound Effects</label>
                <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border flex items-center justify-center gap-2
            ${isAudioEnabled ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
                >
                    {isAudioEnabled ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Collision Sounds Active
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Muted
                        </>
                    )}
                </button>
            </div>

            <div className="h-px w-full bg-zinc-800/80"></div>

            {/* Preset Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Physics Preset</label>
                <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={selectedConfigId}
                    onChange={(e) => setSelectedConfigId(Number(e.target.value))}
                >
                    {physicsPresets.map(preset => (
                        <option key={preset.id} value={preset.id}>{preset.name}</option>
                    ))}
                </select>
                <p className="text-xs text-blue-400/80 mt-1 italic leading-relaxed">{currentConfig.nuanceDescription}</p>
            </div>

            <div className="h-px w-full bg-zinc-800/80"></div>

            {/* Global Setting Sliders */}
            <div className="flex flex-col gap-5 pb-4">
                <SliderControl
                    label="Time Scale"
                    value={globalSettings.timeScale}
                    min={0.1} max={3.0} step={0.1}
                    onChange={(val) => setGlobalSettings(p => ({ ...p, timeScale: val }))}
                />
                <SliderControl
                    label="Gravity Force"
                    value={globalSettings.gravityMultiplier}
                    min={0} max={3.0} step={0.1}
                    onChange={(val) => setGlobalSettings(p => ({ ...p, gravityMultiplier: val }))}
                />
                <SliderControl
                    label="Global Rotation"
                    value={globalSettings.rotationMultiplier}
                    min={0} max={5.0} step={0.1}
                    onChange={(val) => setGlobalSettings(p => ({ ...p, rotationMultiplier: val }))}
                />
                <SliderControl
                    label="Bounciness (Restitution)"
                    value={globalSettings.bouncinessMultiplier}
                    min={0.1} max={1.5} step={0.1}
                    onChange={(val) => setGlobalSettings(p => ({ ...p, bouncinessMultiplier: val }))}
                />
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
                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
                    {value.toFixed(1)}x
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
    );
}
