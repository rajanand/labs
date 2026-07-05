import React from "react";
import {
    MAT_EMPTY,
    MAT_SAND,
    MAT_WATER,
    MAT_WALL,
    MAT_WOOD,
    MAT_ACID,
    MAT_FIRE,
    MAT_LAVA
} from "@/lib/physics/falling-sand";

interface SandParameterPanelProps {
    brushSize: number;
    setBrushSize: (value: number) => void;
    material: number;
    setMaterial: (value: number) => void;
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    onClear: () => void;
}

export function SandParameterPanel(props: SandParameterPanelProps) {
    const {
        brushSize, setBrushSize,
        material, setMaterial,
        isPlaying, setIsPlaying,
        onClear,
    } = props;

    return (
        <div className="flex flex-col gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl h-full shadow-lg overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Parameters</h2>
                    <p className="text-zinc-400 text-sm mt-1">Configure grid size and materials</p>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Controls</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-3 text-sm font-medium border rounded-md transition-colors 
               ${isPlaying ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'}`}
                    >
                        {isPlaying ? "Pause Simulation" : "Play Simulation"}
                    </button>

                    <button
                        onClick={onClear}
                        className="px-4 py-3 text-sm font-medium bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                    >
                        Clear Canvas
                    </button>
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Material Selector */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Material</label>

                <div className="grid grid-cols-1 gap-2">
                    <MaterialButton
                        active={material === MAT_SAND}
                        onClick={() => setMaterial(MAT_SAND)}
                        label="Sand"
                        desc="Falls down and stacks."
                        colorClass="bg-yellow-300"
                    />

                    <MaterialButton
                        active={material === MAT_WATER}
                        onClick={() => setMaterial(MAT_WATER)}
                        label="Water"
                        desc="Falls and flows horizontally."
                        colorClass="bg-blue-400"
                    />

                    <MaterialButton
                        active={material === MAT_WOOD}
                        onClick={() => setMaterial(MAT_WOOD)}
                        label="Wood"
                        desc="Flammable static barrier."
                        colorClass="bg-amber-900"
                    />

                    <MaterialButton
                        active={material === MAT_ACID}
                        onClick={() => setMaterial(MAT_ACID)}
                        label="Acid"
                        desc="Corrodes wood, sand, and stone."
                        colorClass="bg-green-500"
                    />

                    <MaterialButton
                        active={material === MAT_FIRE}
                        onClick={() => setMaterial(MAT_FIRE)}
                        label="Fire"
                        desc="Burns wood, floats up, dies."
                        colorClass="bg-red-500"
                    />

                    <MaterialButton
                        active={material === MAT_LAVA}
                        onClick={() => setMaterial(MAT_LAVA)}
                        label="Lava"
                        desc="Slow liquid. Ignites wood, cools in water."
                        colorClass="bg-orange-500"
                    />

                    <MaterialButton
                        active={material === MAT_WALL}
                        onClick={() => setMaterial(MAT_WALL)}
                        label="Wall / Stone"
                        desc="Indestructible and immobile."
                        colorClass="bg-zinc-500"
                    />

                    <MaterialButton
                        active={material === MAT_EMPTY}
                        onClick={() => setMaterial(MAT_EMPTY)}
                        label="Eraser"
                        desc="Deletes any material."
                        colorClass="bg-zinc-950 border border-zinc-700"
                    />
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            {/* Brush Sliders */}
            <div className="flex flex-col gap-6">
                <SliderControl label="Brush Size" value={brushSize} min={1} max={30} step={1} onChange={setBrushSize} />
            </div>

        </div>
    );
}

function MaterialButton({ active, onClick, label, desc, colorClass }: { active: boolean, onClick: () => void, label: string, desc: string, colorClass: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 text-left p-3 rounded-lg border transition-all
               ${active ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'}
            `}
        >
            <div className={`w-8 h-8 rounded-full shadow-inner flex-shrink-0 ${colorClass}`}></div>
            <div>
                <div className={`font-semibold text-sm ${active ? 'text-white' : 'text-zinc-300'}`}>{label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
            </div>
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
                    {value}
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
