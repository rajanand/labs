"use client";

import { useState } from "react";
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
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">Audio Visualizer</h1>
                <p className="text-zinc-400 mt-1 text-xs">Real-time Audio FFT Analysis</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[calc(100vh-8rem)] z-10">
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
        </div>
    );
}
