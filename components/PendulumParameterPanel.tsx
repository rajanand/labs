import React from "react";

interface PendulumParameterPanelProps {
    mass1: number;
    setMass1: (value: number) => void;
    mass2: number;
    setMass2: (value: number) => void;
    length1: number;
    setLength1: (value: number) => void;
    length2: number;
    setLength2: (value: number) => void;
    gravity: number;
    setGravity: (value: number) => void;
    trailLength: number;
    setTrailLength: (value: number) => void;
    showMultiple: boolean;
    setShowMultiple: (value: boolean) => void;
    onReset: (variant: "top" | "horizontal") => void;
}

export function PendulumParameterPanel(props: PendulumParameterPanelProps) {
    const {
        mass1, setMass1,
        mass2, setMass2,
        length1, setLength1,
        length2, setLength2,
        gravity, setGravity,
        trailLength, setTrailLength,
        showMultiple, setShowMultiple,
        onReset,
    } = props;

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-lg overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Parameters</h2>
                    <p className="text-zinc-400 text-sm mt-1">Adjust chaotic mechanical constants</p>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Drop Pendulum</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onReset("top")} className="px-2 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors">
                        Top Drop
                    </button>
                    <button onClick={() => onReset("horizontal")} className="px-2 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors">
                        Side Drop
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-zinc-300">Chaos Demonstration</label>
                <button
                    onClick={() => { setShowMultiple(!showMultiple); onReset("horizontal"); }}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors border 
            ${showMultiple ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
                >
                    {showMultiple ? "Disable Multiple Arms" : "Drop Multiple Arms (0.05° variance)"}
                </button>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    When multiple arms are dropped, they start exactly 0.001 radians apart. For a few seconds, they look like one pendulum. But pure chaos slowly forces them to diverge completely.
                </p>
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Physics Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Gravity" value={gravity} min={0.1} max={5} step={0.1} onChange={setGravity} />
                <SliderControl label="Mass 1 (Center)" value={mass1} min={1} max={50} step={1} onChange={setMass1} />
                <SliderControl label="Mass 2 (Tail)" value={mass2} min={1} max={50} step={1} onChange={setMass2} />
                <SliderControl label="Length 1" value={length1} min={50} max={300} step={5} onChange={setLength1} />
                <SliderControl label="Length 2" value={length2} min={50} max={300} step={5} onChange={setLength2} />
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Visuals Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Path Trail Memory" value={trailLength} min={10} max={1000} step={10} onChange={setTrailLength} />
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
                    {value.toFixed(step < 1 ? 1 : 0)}
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
