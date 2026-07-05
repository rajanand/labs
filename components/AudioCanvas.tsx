"use client";

import React, { useEffect, useRef } from "react";

// In a real setup, we would import the hook and call it in the parent component
// to lift state up. But for performance (avoiding 60fps React re-renders), 
// we will instantiate the hook entirely inside this component.

interface AudioCanvasProps {
    isListening: boolean;
    smoothing: number;
    sensitivity: number;
    visualStyle: "bars" | "rings" | "particles";
}

// Minimal Audio Data Box definition (mirrored from the hook)
interface AudioDataBox {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
}

export function AudioCanvas(props: AudioCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- AUDIO LOGIC INLINED FOR EXTREME PERFORMANCE ---
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const audioBoxRef = useRef<AudioDataBox>({
        frequencyData: new Uint8Array(0),
        timeDomainData: new Uint8Array(0),
    });

    // Track particle physics for "particles" mode
    const particlesRef = useRef(Array.from({ length: 150 }, () => ({
        x: 0, y: 0,
        vx: 0, vy: 0,
        size: Math.random() * 4 + 2,
        baseSpeed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        color: `hsl(${Math.random() * 60 + 200}, 80%, 60%)` // Blue to Purple
    })));

    // Handle stream lifecycle
    useEffect(() => {
        let isMounted = true;

        const start = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const AudioContextObj = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContextObj();
                audioCtxRef.current = ctx;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false }
                });

                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 512; // 256 Bins (Lower resolution looks chunkier and better for these visuals)
                analyser.smoothingTimeConstant = props.smoothing;

                const source = ctx.createMediaStreamSource(stream);
                source.connect(analyser);

                analyserRef.current = analyser;
                audioBoxRef.current.frequencyData = new Uint8Array(analyser.frequencyBinCount);
                audioBoxRef.current.timeDomainData = new Uint8Array(analyser.frequencyBinCount);

            } catch (e) {
                console.error("Audio hook failed:", e);
            }
        };

        const stop = () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (audioCtxRef.current) audioCtxRef.current.close().catch(console.error);
            analyserRef.current = null;
            audioBoxRef.current.frequencyData.fill(0);
            audioBoxRef.current.timeDomainData.fill(128);
        };

        if (props.isListening) start();
        else stop();

        return () => {
            isMounted = false;
            stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isListening]);

    // Update smoothing dynamically
    useEffect(() => {
        if (analyserRef.current) analyserRef.current.smoothingTimeConstant = props.smoothing;
    }, [props.smoothing]);

    // --- RENDER LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const resize = () => {
            const el = containerRef.current;
            if (!el) return;
            width = el.clientWidth;
            height = el.clientHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            // Initialize particles to center screen
            particlesRef.current.forEach(p => {
                p.x = width / 2;
                p.y = height / 2;
            });
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        let animationFrameId: number;

        const drawBars = (data: Uint8Array, sens: number) => {
            const barWidth = width / data.length;
            for (let i = 0; i < data.length; i++) {
                const val = data[i] * sens;
                const percent = val / 255;
                const h = height * percent;

                // Hue shifts from blue (bass) to pink (treble)
                const hue = 220 + (i / data.length) * 100;
                ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

                // Draw mirrored from center vertically
                ctx.fillRect(i * barWidth, height / 2 - h / 2, barWidth - 1, h);
            }
        };

        const drawRings = (data: Uint8Array, timeData: Uint8Array, sens: number) => {
            const cx = width / 2;
            const cy = height / 2;
            const baseRadius = Math.min(width, height) * 0.2;

            ctx.beginPath();
            for (let i = 0; i < data.length; i++) {
                // How far around the circle are we? (0 to 2PI)
                const angle = (i / data.length) * Math.PI * 2;

                // Offset the radius by both frequency intensity and time domain waveform
                const freqVal = data[i] * sens;
                const waveVal = (timeData[i] - 128) * sens; // Time domain is centered on 128

                // Add a smooth easing so the circle connects seamlessly
                const r = baseRadius + (freqVal * 0.5) + waveVal;

                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Calculate total volume for color shift
            const totalVol = data.reduce((a, b) => a + b, 0) / data.length;
            const hue = 200 + totalVol * sens;

            ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.1)`;
            ctx.fill();
        };

        const drawParticles = (data: Uint8Array, sens: number) => {
            // Find rough bass and treble averages
            let bass = 0, treble = 0;
            const third = Math.floor(data.length / 3);

            for (let i = 0; i < third; i++) bass += data[i];
            for (let i = data.length - third; i < data.length; i++) treble += data[i];

            bass = (bass / third) * sens;
            treble = (treble / third) * sens;

            const cx = width / 2;
            const cy = height / 2;
            const particles = particlesRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Bass pushes particles outwards, Treble makes them jiggle and spin faster
                const outwardPush = (bass / 255) * 5;
                const spin = p.baseSpeed + ((treble / 255) * 10);

                p.angle += spin * 0.01;

                // Vector to center
                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // Apply forces
                p.vx += (dx / dist) * outwardPush;
                p.vy += (dy / dist) * outwardPush;

                // Add Gravity pulling towards center
                p.vx -= (dx / dist) * 2;
                p.vy -= (dy / dist) * 2;

                // Add orbital spin based on angle
                p.vx += Math.cos(p.angle) * spin;
                p.vy += Math.sin(p.angle) * spin;

                // Friction
                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;

                // Draw
                // Particle expands on bass
                const size = p.size + (bass / 255) * 10;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.6 + (treble / 255) * 0.4;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const render = () => {
            // 1. Fetch Audio Data
            if (analyserRef.current) {
                // @ts-expect-error: Next.js strict lib.dom types clash with standard Uint8Array
                analyserRef.current.getByteFrequencyData(audioBoxRef.current.frequencyData);
                // @ts-expect-error: Next.js strict lib.dom types clash with standard Uint8Array
                analyserRef.current.getByteTimeDomainData(audioBoxRef.current.timeDomainData);
            }

            const freqData = audioBoxRef.current.frequencyData;
            const timeData = audioBoxRef.current.timeDomainData;

            // 2. Clear Canvas
            // In Particles mode, use a fade clear for trails. Draw instant black for others.
            if (props.visualStyle === 'particles') {
                ctx.fillStyle = "rgba(9, 9, 11, 0.2)"; // zinc-950 with trail fade
            } else {
                ctx.fillStyle = "#09090b"; // zinc-950 solid
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over"; // Reset composite
            ctx.fillRect(0, 0, width, height);

            // Make visuals pop brightly with additive blending
            ctx.globalCompositeOperation = "lighter";

            // 3. Render appropriate style
            // We only render if there's actually audio data, OR if we strictly want drawing to continue (particles always move)
            if (freqData.length > 0 || props.visualStyle === 'particles') {
                if (props.visualStyle === 'bars') drawBars(freqData, props.sensitivity);
                else if (props.visualStyle === 'rings') drawRings(freqData, timeData, props.sensitivity);
                else if (props.visualStyle === 'particles') drawParticles(freqData, props.sensitivity);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        // Kickoff loop
        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.visualStyle, props.sensitivity]); // Deliberately omitting arrays or isListening to prevent stutter

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none"
            />
        </div>
    );
}
