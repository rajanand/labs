import React from "react";

interface KineticParameterPanelProps {
    inputText: string;
    setInputText: (value: string) => void;
    particleCount: number;
    setParticleCount: (value: number) => void;
    springStiffness: number;
    setSpringStiffness: (value: number) => void;
    damping: number;
    setDamping: (value: number) => void;
    repulsionRadius: number;
    setRepulsionRadius: (value: number) => void;
    repulsionStrength: number;
    setRepulsionStrength: (value: number) => void;
    fontSize: number;
    setFontSize: (value: number) => void;
    shapeMode: "text" | "circle" | "spiral" | "heart" | "star";
    setShapeMode: (value: "text" | "circle" | "spiral" | "heart" | "star") => void;
    onReset: () => void;
}

export function KineticParameterPanel(props: KineticParameterPanelProps) {
    const {
        inputText, setInputText,
        particleCount, setParticleCount,
        springStiffness, setSpringStiffness,
        damping, setDamping,
        repulsionRadius, setRepulsionRadius,
        repulsionStrength, setRepulsionStrength,
        fontSize, setFontSize,
        shapeMode, setShapeMode,
        onReset,
    } = props;

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-lg overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Parameters</h2>
                    <p className="text-zinc-400 text-sm mt-1">Configure springs and targets</p>
                </div>
            </div>

            {/* Target Mode Selectors */}
            <div className="flex flex-col gap-3 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <label className="text-sm font-medium text-zinc-300">Target Mode</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={() => setShapeMode("text")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors border
                ${shapeMode === "text" ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-800"}`}
                    >
                        Text Input
                    </button>
                    <button
                        onClick={() => setShapeMode("circle")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors border
                ${shapeMode !== "text" ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-800"}`}
                    >
                        Math Presets
                    </button>
                </div>

                {shapeMode === "text" ? (
                    <>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[80px] text-sm"
                            placeholder="Type anything..."
                        />
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <PresetButton label="HELLO" onClick={() => setInputText("HELLO")} />
                            <PresetButton label="TECH" onClick={() => setInputText("X Y Z\n1 2 3")} />
                            <PresetButton label="MATH" onClick={() => setInputText("∑ ∫ µ\nΩ ∆ π")} />
                            <PresetButton label="ART" onClick={() => setInputText("✦ ✧\n★ ☆")} />
                            <PresetButton label="CODE" onClick={() => setInputText("{ [ ( )\n< > ] }")} />
                            <PresetButton label="RESET" onClick={() => onReset()} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30" />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <PresetButton active={shapeMode === "circle"} label="● Circle" onClick={() => setShapeMode("circle")} />
                        <PresetButton active={shapeMode === "spiral"} label="🌀 Spiral" onClick={() => setShapeMode("spiral")} />
                        <PresetButton active={shapeMode === "heart"} label="♥ Heart" onClick={() => setShapeMode("heart")} />
                        <PresetButton active={shapeMode === "star"} label="★ Star" onClick={() => setShapeMode("star")} />
                    </div>
                )}
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Physics Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Spring Stiffness (k)" value={springStiffness} min={0.01} max={0.2} step={0.01} onChange={setSpringStiffness} />
                <SliderControl label="Damping (Friction)" value={damping} min={0.5} max={0.99} step={0.01} onChange={setDamping} />
                <SliderControl label="Repulsion Force" value={repulsionStrength} min={0} max={100} step={5} onChange={setRepulsionStrength} />
                <SliderControl label="Repulsion Radius" value={repulsionRadius} min={50} max={300} step={10} onChange={setRepulsionRadius} />
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Visuals Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Particle Count" value={particleCount} min={500} max={10000} step={500} onChange={setParticleCount} />
                {shapeMode === "text" && (
                    <SliderControl label="Base Font Size" value={fontSize} min={80} max={400} step={10} onChange={setFontSize} />
                )}
            </div>

        </div>
    );
}

function PresetButton({ label, onClick, active = false, className = "" }: { label: string, onClick: () => void, active?: boolean, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-1.5 text-xs font-medium rounded transition-colors border
               ${active
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700'} 
               ${className}`}
        >
            {label}
        </button>
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
                    {step < 0.1 ? value.toFixed(2) : value.toFixed(0)}
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
