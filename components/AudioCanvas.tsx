"use client";

import React, { useEffect, useRef } from "react";

interface AudioCanvasProps {
    isListening: boolean;
    smoothing: number;
    sensitivity: number;
    visualStyle: "bars" | "rings" | "particles";
    audioFile: File | null;
    isFilePlaying: boolean;
}

interface AudioDataBox {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
}

export function AudioCanvas(props: AudioCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Audio graph nodes
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // HTML5 Audio element for file playback
    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const fileSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const currentObjectUrlRef = useRef<string | null>(null);

    const audioBoxRef = useRef<AudioDataBox>({
        frequencyData: new Uint8Array(0),
        timeDomainData: new Uint8Array(0),
    });

    // Particle physics state
    const particlesRef = useRef(Array.from({ length: 150 }, () => ({
        x: 0, y: 0,
        vx: 0, vy: 0,
        size: Math.random() * 4 + 2,
        baseSpeed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        color: `hsl(${Math.random() * 60 + 200}, 80%, 60%)` // Blue to Purple
    })));

    // Handle stream & file lifecycle
    useEffect(() => {
        let isMounted = true;

        const cleanupSources = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (audioElRef.current) {
                audioElRef.current.pause();
            }
        };

        const setupAudio = async () => {
            cleanupSources();

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const AudioContextObj = window.AudioContext || (window as any).webkitAudioContext;
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioContextObj();
                }
                const ctx = audioCtxRef.current;

                if (!analyserRef.current) {
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 512;
                    analyser.smoothingTimeConstant = props.smoothing;
                    analyserRef.current = analyser;
                    audioBoxRef.current.frequencyData = new Uint8Array(analyser.frequencyBinCount);
                    audioBoxRef.current.timeDomainData = new Uint8Array(analyser.frequencyBinCount);
                }

                if (ctx.state === "suspended") {
                    await ctx.resume();
                }

                if (props.isListening) {
                    // --- MICROPHONE MODE ---
                    try {
                        analyserRef.current.disconnect(ctx.destination); // Mute feedback loop
                    } catch {}

                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false }
                    });

                    if (!isMounted) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    streamRef.current = stream;
                    const source = ctx.createMediaStreamSource(stream);
                    source.connect(analyserRef.current);

                } else if (props.audioFile) {
                    // --- FILE MODE ---
                    analyserRef.current.connect(ctx.destination); // Send to output speakers

                    if (!audioElRef.current) {
                        audioElRef.current = new Audio();
                        audioElRef.current.crossOrigin = "anonymous";
                    }

                    if (!fileSourceNodeRef.current) {
                        fileSourceNodeRef.current = ctx.createMediaElementSource(audioElRef.current);
                        fileSourceNodeRef.current.connect(analyserRef.current);
                    }

                    if (currentObjectUrlRef.current) {
                        URL.revokeObjectURL(currentObjectUrlRef.current);
                    }
                    const url = URL.createObjectURL(props.audioFile);
                    currentObjectUrlRef.current = url;
                    audioElRef.current.src = url;

                    if (props.isFilePlaying) {
                        audioElRef.current.play().catch(console.error);
                    }
                }
            } catch (err) {
                console.error("Audio setup failed:", err);
            }
        };

        setupAudio();

        return () => {
            isMounted = false;
            cleanupSources();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isListening, props.audioFile]);

    // Handle play/pause changes for file playback
    useEffect(() => {
        if (audioElRef.current && props.audioFile && !props.isListening) {
            if (props.isFilePlaying) {
                if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                    audioCtxRef.current.resume();
                }
                audioElRef.current.play().catch(console.error);
            } else {
                audioElRef.current.pause();
            }
        }
    }, [props.isFilePlaying, props.audioFile, props.isListening]);

    // Update smoothing dynamically
    useEffect(() => {
        if (analyserRef.current) analyserRef.current.smoothingTimeConstant = props.smoothing;
    }, [props.smoothing]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentObjectUrlRef.current) {
                URL.revokeObjectURL(currentObjectUrlRef.current);
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, []);

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

                const hue = 220 + (i / data.length) * 100;
                ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

                ctx.fillRect(i * barWidth, height / 2 - h / 2, barWidth - 1, h);
            }
        };

        const drawRings = (data: Uint8Array, timeData: Uint8Array, sens: number) => {
            const cx = width / 2;
            const cy = height / 2;
            const baseRadius = Math.min(width, height) * 0.2;

            ctx.beginPath();
            for (let i = 0; i < data.length; i++) {
                const angle = (i / data.length) * Math.PI * 2;
                const freqVal = data[i] * sens;
                const waveVal = (timeData[i] - 128) * sens;

                const r = baseRadius + (freqVal * 0.5) + waveVal;

                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            const totalVol = data.reduce((a, b) => a + b, 0) / data.length;
            const hue = 200 + totalVol * sens;

            ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.1)`;
            ctx.fill();
        };

        const drawParticles = (data: Uint8Array, sens: number) => {
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
                const outwardPush = (bass / 255) * 5;
                const spin = p.baseSpeed + ((treble / 255) * 10);

                p.angle += spin * 0.01;

                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                p.vx += (dx / dist) * outwardPush;
                p.vy += (dy / dist) * outwardPush;

                p.vx -= (dx / dist) * 2;
                p.vy -= (dy / dist) * 2;

                p.vx += Math.cos(p.angle) * spin;
                p.vy += Math.sin(p.angle) * spin;

                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;

                const size = p.size + (bass / 255) * 10;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.6 + (treble / 255) * 0.4;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const render = () => {
            if (analyserRef.current) {
                // @ts-expect-error: Next.js standard type clash
                analyserRef.current.getByteFrequencyData(audioBoxRef.current.frequencyData);
                // @ts-expect-error: Next.js standard type clash
                analyserRef.current.getByteTimeDomainData(audioBoxRef.current.timeDomainData);
            }

            const freqData = audioBoxRef.current.frequencyData;
            const timeData = audioBoxRef.current.timeDomainData;

            if (props.visualStyle === 'particles') {
                ctx.fillStyle = "rgba(9, 9, 11, 0.2)";
            } else {
                ctx.fillStyle = "#09090b";
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = "lighter";

            if (freqData.length > 0 || props.visualStyle === 'particles') {
                if (props.visualStyle === 'bars') drawBars(freqData, props.sensitivity);
                else if (props.visualStyle === 'rings') drawRings(freqData, timeData, props.sensitivity);
                else if (props.visualStyle === 'particles') drawParticles(freqData, props.sensitivity);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.visualStyle, props.sensitivity]);

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
