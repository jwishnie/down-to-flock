import { useEffect, useRef } from "react";

export const useAudio = (srcUrl: string) => {
    const audio = useRef<HTMLAudioElement | null>(null);

    // Created in an effect because Audio doesn't exist during SSR
    useEffect(() => {
        const audioInstance = new Audio(srcUrl);
        audio.current = audioInstance;

        return () => {
            audioInstance.pause();
            audioInstance.src = '';
        };
    }, [srcUrl]);

    // Resolves when playback starts, not when it ends
    const play = async (): Promise<void> => {
        if (!audio.current) throw new Error('Audio not initialized');
        audio.current.currentTime = 0;
        await audio.current.play();
    };

    return { play };
};
