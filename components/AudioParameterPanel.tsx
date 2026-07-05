import React from "react";

interface AudioParameterPanelProps {
    isListening: boolean;
    toggleMicrophone: () => void;
    hasPermission: boolean | null;
    smoothing: number;
    setSmoothing: (value: number) => void;
    sensitivity: number;
    setSensitivity: (value: number) => void;
    visualStyle: "bars" | "rings" | "particles";
    setVisualStyle: (value: "bars" | "rings" | "particles") => void;
}

export function AudioParameterPanel(props: AudioParameterPanelProps) {
    const {
        isListening, toggleMicrophone, hasPermission,
        smoothing, setSmoothing,
        sensitivity, setSensitivity,
        visualStyle, setVisualStyle,
    } = props;

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-lg overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Audio Controls</h2>
                    <p className="text-zinc-400 text-sm mt-1">Real-time reactive visuals</p>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Input Source</label>

                <button
                    onClick={toggleMicrophone}
                    className={`w-full px-4 py-4 text-sm font-bold border rounded-xl transition-all flex items-center justify-center gap-3
               ${isListening
                            ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'}`}
                >
                    {isListening ? (
                        <>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            Stop Microphone
                        </>
                    ) : (
                        "Start Microphone"
                    )}
                </button>

                {hasPermission === false && (
                    <p className="text-xs text-red-400 mt-1">Permission denied. Please allow microphone access in your browser.</p>
                )}
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Visual Style Selector */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Visual Style</label>
                <div className="grid grid-cols-1 gap-2">
                    <StyleButton active={visualStyle === "bars"} onClick={() => setVisualStyle("bars")} label="Classic Bars (EQ)" />
                    <StyleButton active={visualStyle === "rings"} onClick={() => setVisualStyle("rings")} label="Radial Symmetry" />
                    <StyleButton active={visualStyle === "particles"} onClick={() => setVisualStyle("particles")} label="Reactive Particles" />
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Processing Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="FFT Smoothing" value={smoothing} min={0.1} max={0.99} step={0.01} onChange={setSmoothing} />
                <SliderControl label="Gain / Sensitivity" value={sensitivity} min={0.5} max={4.0} step={0.1} onChange={setSensitivity} />
            </div>

        </div>
    );
}

function StyleButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium
               ${active ? 'bg-zinc-800 border-zinc-600 text-white ring-1 ring-zinc-500' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400'}
            `}
        >
            {label}
        </button>
    )
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
                    {step < 0.1 ? value.toFixed(2) : value.toFixed(1)}
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
