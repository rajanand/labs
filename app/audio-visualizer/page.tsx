"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioParameterPanel } from "@/components/AudioParameterPanel";
import { AudioCanvas } from "@/components/AudioCanvas";

export default function AudioVisualizerPage() {
    const [isListening, setIsListening] = useState(false);
    const [smoothing, setSmoothing] = useState(0.8);     // Time constant (0 to 1)
    const [sensitivity, setSensitivity] = useState(1.5); // Multiplier
    const [visualStyle, setVisualStyle] = useState<"bars" | "rings" | "particles">("bars");

    const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

    // Audio file states
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isFilePlaying, setIsFilePlaying] = useState(false);

    // Microphone toggle (pauses file playback)
    const toggleMicrophone = async () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        // Pause file playback first
        setIsFilePlaying(false);

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasMicrophonePermission(true);
            setIsListening(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            setHasMicrophonePermission(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        setAudioFile(file);
        setIsFilePlaying(!!file); // Auto-play if a file is loaded
        if (file) {
            setIsListening(false); // Stop microphone
        }
    };

    const handleToggleFilePlay = () => {
        if (audioFile) {
            setIsFilePlaying(prev => !prev);
            setIsListening(false); // Stop microphone
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 p-4 md:p-8 flex flex-col pt-20 relative overflow-hidden">
            <header className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                <Link
                    href="/"
                    className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Labs
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white mt-4 ml-2">Audio Visualizer</h1>
                <p className="text-zinc-400 mt-1 ml-2 text-sm">Real-time Audio FFT Analysis</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20 md:mt-16 h-full max-h-[calc(100vh-8rem)] z-10">
                <div className="lg:col-span-1 min-h-[400px] h-full">
                    <AudioParameterPanel
                        isListening={isListening}
                        toggleMicrophone={toggleMicrophone}
                        hasPermission={hasMicrophonePermission}
                        smoothing={smoothing} setSmoothing={setSmoothing}
                        sensitivity={sensitivity} setSensitivity={setSensitivity}
                        visualStyle={visualStyle} setVisualStyle={setVisualStyle}
                        audioFile={audioFile}
                        onFileChange={handleFileChange}
                        isFilePlaying={isFilePlaying}
                        toggleFilePlay={handleToggleFilePlay}
                    />
                </div>

                <div className="lg:col-span-3 min-h-[500px] lg:min-h-0 h-full relative">
                    <AudioCanvas
                        isListening={isListening}
                        smoothing={smoothing}
                        sensitivity={sensitivity}
                        visualStyle={visualStyle}
                        audioFile={audioFile}
                        isFilePlaying={isFilePlaying}
                    />
                </div>
            </div>
        </main>
    );
}
