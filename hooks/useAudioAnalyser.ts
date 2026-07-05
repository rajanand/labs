import { useEffect, useRef, useState } from 'react';

// Expose the raw data arrays directly instead of returning them in React State
// Returning 1024-length arrays in React State 60 times a second will destroy performance.
// React components will just read from the ref directly inside their own requestAnimationFrame
export interface AudioDataBox {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
}

export function useAudioAnalyser(isListening: boolean, smoothingTimeConstant: number) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // This is the mutable box we will read from inside Canvas loops
    const dataBoxRef = useRef<AudioDataBox>({
        frequencyData: new Uint8Array(0),
        timeDomainData: new Uint8Array(0),
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const startAudio = async () => {
            try {
                // Initialize Web Audio API
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const audioCtx = new AudioContext();
                audioContextRef.current = audioCtx;

                // Request microphone access
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: false,
                        autoGainControl: false,
                        noiseSuppression: false,
                    }
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                // Create Analyser
                const analyser = audioCtx.createAnalyser();
                // fftSize dictates the resolution of our frequency data.
                // 1024 means we get 512 frequency bins back.
                analyser.fftSize = 1024;
                analyser.smoothingTimeConstant = smoothingTimeConstant;
                analyserRef.current = analyser;

                // Connect Microphone to Analyser (We DO NOT connect analyser to destination or it will feedback loop)
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                sourceRef.current = source;

                // Setup the data arrays for the ref box
                dataBoxRef.current.frequencyData = new Uint8Array(analyser.frequencyBinCount);
                dataBoxRef.current.timeDomainData = new Uint8Array(analyser.frequencyBinCount);

                setError(null);
            } catch (err) {
                console.error("Failed to initialize audio:", err);
                setError(err instanceof Error ? err.message : "Failed to access microphone");
            }
        };

        const stopAudio = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
                audioContextRef.current = null;
            }
            analyserRef.current = null;

            // Zero out data
            if (dataBoxRef.current.frequencyData.length > 0) {
                dataBoxRef.current.frequencyData.fill(0);
                dataBoxRef.current.timeDomainData.fill(128); // Time domain centers at 128
            }
        };

        if (isListening) {
            startAudio();
        } else {
            stopAudio();
        }

        return () => {
            mounted = false;
            stopAudio();
        };
    }, [isListening]);

    // Update smoothing dynamically without restarting stream
    useEffect(() => {
        if (analyserRef.current) {
            analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
        }
    }, [smoothingTimeConstant]);

    // This function will be called by requestAnimationFrame inside our Canvas
    const getAudioData = () => {
        const analyser = analyserRef.current;
        const box = dataBoxRef.current;

        if (analyser && box.frequencyData.length > 0) {
            // @ts-expect-error: Next.js strict lib.dom types clash
            analyser.getByteFrequencyData(box.frequencyData);
            // @ts-expect-error: Next.js strict lib.dom types clash
            analyser.getByteTimeDomainData(box.timeDomainData);
        }

        return box;
    };

    return { getAudioData, error };
}
