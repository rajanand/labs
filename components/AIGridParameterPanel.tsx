import React from "react";

interface AIGridParameterPanelProps {
    stiffness: number;
    setStiffness: (value: number) => void;
    damping: number;
    setDamping: (value: number) => void;
    repulsionRadius: number;
    setRepulsionRadius: (value: number) => void;
    nodeSize: number;
    setNodeSize: (value: number) => void;
    resolution: number;
    setResolution: (value: number) => void;
    onReset: () => void;
}

export function AIGridParameterPanel(props: AIGridParameterPanelProps) {
    const {
        stiffness, setStiffness,
        damping, setDamping,
        repulsionRadius, setRepulsionRadius,
        nodeSize, setNodeSize,
        resolution, setResolution,
        onReset
    } = props;

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Mesh Grid</h2>
                    <p className="text-zinc-400 text-sm mt-1">Interconnected topology</p>
                </div>
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

            <div className="h-px w-full bg-zinc-800/80 my-2"></div>

            <div className="flex flex-col gap-6">
                <SliderControl
                    label="Resolution (Grid Size)"
                    value={resolution}
                    min={10} max={60} step={1}
                    onChange={setResolution}
                />
                <SliderControl
                    label="Node Size"
                    value={nodeSize}
                    min={0} max={10} step={1}
                    onChange={setNodeSize}
                />

                <div className="h-px w-full bg-zinc-800/50 my-2"></div>

                <SliderControl
                    label="Spring Stiffness"
                    value={stiffness * 100}
                    min={0.1} max={10} step={0.1}
                    onChange={(val) => setStiffness(val / 100)}
                />
                <SliderControl
                    label="Energy Damping"
                    value={damping * 100}
                    min={50} max={99} step={1}
                    onChange={(val) => setDamping(val / 100)}
                />
                <SliderControl
                    label="Repulsion Radius"
                    value={repulsionRadius}
                    min={50} max={400} step={10}
                    onChange={setRepulsionRadius}
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
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                    {step < 1 ? value.toFixed(1) : Math.round(value)}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
    );
}
