import { useState, useEffect, useRef } from "react";

export const useAudio = (srcUrl: string) => {
    const audio = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playPromise = useRef<Promise<void> | null>(null);
    const resolveRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const audioInstance = new Audio(srcUrl);
        audio.current = audioInstance;
        
        // Create a new promise when audio is set up
        playPromise.current = new Promise((resolve) => {
            resolveRef.current = resolve;
        });
        
        // Set up ended event listener
        const handleEnded = () => {
            setIsPlaying(false);
            if (resolveRef.current) {
                resolveRef.current();
                // Create a new promise for the next play
                playPromise.current = new Promise((resolve) => {
                    resolveRef.current = resolve;
                });
            }
        };
        
        audioInstance.addEventListener('ended', handleEnded);
        
        return () => {
            audioInstance.pause();
            audioInstance.src = '';
            audioInstance.removeEventListener('ended', handleEnded);
            if (resolveRef.current) {
                resolveRef.current(); // Resolve any pending promises on cleanup
            }
        };
    }, [srcUrl]);
    
    const play = async (): Promise<void> => {
        if (!audio.current) return Promise.reject('Audio not initialized');

        try {
            await audio.current.play();
            setIsPlaying(true);
            return playPromise.current || Promise.resolve();
        } catch (error) {
            console.error('Error playing audio:', error);
            return Promise.reject(error);
        }
    };
    
    return { play, isPlaying };
};