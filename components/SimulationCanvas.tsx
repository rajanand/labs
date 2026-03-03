"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { updateParticles, initParticles, Particle } from "@/lib/physics/hypervortex";
import { InteractionMode } from "./ParameterPanel";

interface SimulationCanvasProps {
    rotationSpeed: number;
    particleCount: number;
    turbulenceFactor: number;
    gravityConstant: number;
    trailLength: number;
    glowIntensity: number;
    interactionMode: InteractionMode;
    resetKey: number; // Incrementing this forces a camera reset
}

export function SimulationCanvas({
    rotationSpeed,
    particleCount,
    turbulenceFactor,
    gravityConstant,
    trailLength,
    glowIntensity,
    interactionMode,
    resetKey,
}: SimulationCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // FPS Tracking UI State
    const [fps, setFps] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // We maintain mutable state in refs to avoid React re-render cycles in the 60fps loop
    const physicsRefs = useRef({
        particles: [] as Particle[],
        time: 0,
        width: 0,
        height: 0,
        dpr: 1,
        // Mouse Interaction
        mx: 0,
        my: 0,
        isMouseDown: false,

        // Camera Transform Tracking
        panX: 0,
        panY: 0,
        scale: 1,
        lastPanX: 0, // Keep track for drag deltas
        lastPanY: 0,
    });

    // Removed getDynamicColor since it's now handled by buckets

    const handleResetCamera = useCallback(() => {
        physicsRefs.current.panX = 0;
        physicsRefs.current.panY = 0;
        physicsRefs.current.scale = 1;
    }, []);

    useEffect(() => {
        handleResetCamera();
    }, [resetKey, handleResetCamera]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        // FPS tracking variables tracking inside loop to avoid re-renders
        let frameCount = 0;
        let lastFpsTime = performance.now();

        // Reusable buckets for color batching to prevent Garbage Collection pauses
        const colorBuckets = Array.from({ length: 20 }, () => [] as Particle[]);

        // 1. Resize Handler
        const resize = () => {
            const container = containerRef.current;
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Store physical dimensions
            physicsRefs.current.width = width;
            physicsRefs.current.height = height;
            physicsRefs.current.dpr = dpr;

            // Re-initialize particles if size changed remarkably or on boot
            physicsRefs.current.particles = initParticles(particleCount, width, height);
        };

        // We use ResizeObserver for more robust containment than window resize
        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        // 2. Render Loop
        const render = (now: number) => {
            const refs = physicsRefs.current;
            refs.time += 0.016;

            // FPS Calculation
            frameCount++;
            if (now - lastFpsTime >= 500) { // Update FPS every 500ms
                setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
                frameCount = 0;
                lastFpsTime = now;
            }

            // Important: The physics engine expects mouse coordinates in standard Screen space
            // BUT we need to offset it by the Camera pan/zoom so that interactions match visual locations
            // Translate Screen Mouse -> World Mouse
            const worldMx = (refs.mx - (refs.width / 2) - refs.panX) / refs.scale + (refs.width / 2);
            const worldMy = (refs.my - (refs.height / 2) - refs.panY) / refs.scale + (refs.height / 2);

            updateParticles(refs.particles, {
                width: refs.width,
                height: refs.height,
                time: refs.time,
                rotationSpeed,
                turbulenceFactor,
                gravityConstant,
                interactionMode,
                isMouseDown: refs.isMouseDown,
                mx: worldMx,
                my: worldMy
            });

            // Clear canvas with configurable trail effect
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before clearing
            ctx.fillStyle = `rgba(9, 9, 11, ${trailLength})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Apply Camera Transform
            ctx.setTransform(
                refs.dpr * refs.scale, 0,
                0, refs.dpr * refs.scale,
                (refs.panX + (refs.width / 2) * (1 - refs.scale)) * refs.dpr,
                (refs.panY + (refs.height / 2) * (1 - refs.scale)) * refs.dpr
            );

            // Setup global Glow effect
            if (glowIntensity > 0) {
                ctx.globalCompositeOperation = "lighter";
                ctx.shadowBlur = glowIntensity;
                ctx.shadowColor = "#60a5fa"; // blue-400 equivalent for generic glow
            } else {
                ctx.globalCompositeOperation = "source-over";
                ctx.shadowBlur = 0;
            }

            // Group particles by color index (0-19) for fast batch rendering
            for (let i = 0; i < 20; i++) colorBuckets[i].length = 0;

            for (let i = 0; i < refs.particles.length; i++) {
                colorBuckets[refs.particles[i].colorIndex].push(refs.particles[i]);
            }

            for (let i = 0; i < 20; i++) {
                if (colorBuckets[i].length === 0) continue;

                // Calculate hue once per bucket
                const hue = Math.max(180, 260 - (i * 4));
                const lightness = Math.min(80, 40 + i * 2);
                ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;

                ctx.beginPath();
                for (let j = 0; j < colorBuckets[i].length; j++) {
                    const p = colorBuckets[i][j];
                    ctx.rect(p.x, p.y, p.size, p.size);
                }
                ctx.fill();
            }

            // Reset composite for next frame clearing
            ctx.globalCompositeOperation = "source-over";

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [rotationSpeed, particleCount, turbulenceFactor, gravityConstant, trailLength, glowIntensity, interactionMode, resetKey]);

    // 3. Re-init Particles if count changes significantly
    useEffect(() => {
        if (physicsRefs.current.width > 0 && Math.abs(physicsRefs.current.particles.length - particleCount) > 10) {
            physicsRefs.current.particles = initParticles(particleCount, physicsRefs.current.width, physicsRefs.current.height);
        }
    }, [particleCount]);

    // 4. Mouse & Interaction Handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const refs = physicsRefs.current;

        if (interactionMode === 'pan' && refs.isMouseDown) {
            // Panning the canvas
            const dx = mx - refs.lastPanX;
            const dy = my - refs.lastPanY;
            refs.panX += dx;
            refs.panY += dy;
        }

        refs.lastPanX = mx;
        refs.lastPanY = my;
        refs.mx = mx;
        refs.my = my;
    };

    const handleMouseDown = () => {
        physicsRefs.current.isMouseDown = true;
    };

    const handleMouseUp = () => {
        physicsRefs.current.isMouseDown = false;
    };

    const handleMouseLeave = () => {
        physicsRefs.current.isMouseDown = false;
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        // Zoom Canvas IN/OUT
        const refs = physicsRefs.current;
        const zoomFactor = -e.deltaY * 0.001;
        const newScale = Math.max(0.1, Math.min(refs.scale + zoomFactor, 10)); // Clamp between 0.1x and 10x
        refs.scale = newScale;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);


    return (
        <div
            ref={containerRef}
            className={`w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg
        ${interactionMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}
        ${isFullscreen ? 'rounded-none border-none' : ''}
      `}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu interference
        >
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

            {/* HUD Elements */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg px-3 py-1.5 flex flex-col gap-1">
                    <span className="text-xs font-mono text-zinc-400">
                        FPS: <span className={fps >= 55 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"}>{fps}</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                        Particles: <span className="text-white">{particleCount}</span>
                    </span>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={toggleFullscreen}
                    className="bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-800 rounded-lg p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20V14H3m12 6v-6h6m-12-6v-6H3m12 0v6h6" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Interaction Mode Indicator for Fullscreen */}
            {isFullscreen && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full px-4 py-2">
                        <span className="text-sm font-medium text-zinc-300">
                            {interactionMode === 'attract' && 'Mouse: Attract Gravity'}
                            {interactionMode === 'repel' && 'Mouse: Repel Gravity'}
                            {interactionMode === 'pan' && 'Mouse: Pan/Drag & Zoom'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
