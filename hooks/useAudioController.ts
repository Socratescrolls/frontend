import { useState, useEffect, useCallback, useRef } from 'react';

export const useAudioController = (audioEnabled: boolean) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);

  const stopCurrentAudio = useCallback(() => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [currentAudio]);

  const processAudioQueue = useCallback(async () => {
    if (isProcessing.current || audioQueue.current.length === 0 || !audioEnabled) return;

    isProcessing.current = true;
    try {
      const text = audioQueue.current[0];
      stopCurrentAudio();

      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: 'alloy',
          model: 'tts-1'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const audioUrl = `http://localhost:8000${data.audio_url}`;

      const audio = new Audio(audioUrl);

      // Wait for audio to be loaded before playing
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      if (!audioEnabled) return; // Check if still enabled

      setCurrentAudio(audio);
      await audio.play();
      
      // Wait for audio to finish
      await new Promise(resolve => {
        audio.addEventListener('ended', resolve, { once: true });
      });

    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      audioQueue.current.shift(); // Remove processed item
      isProcessing.current = false;
      setCurrentAudio(null);
      // Process next item if available
      if (audioQueue.current.length > 0) {
        processAudioQueue();
      }
    }
  }, [audioEnabled, stopCurrentAudio]);

  const playAudio = useCallback(async (text: string) => {
    if (!audioEnabled) return;
    
    audioQueue.current.push(text);
    if (!isProcessing.current) {
      processAudioQueue();
    }
  }, [audioEnabled, processAudioQueue]);

  useEffect(() => {
    if (!audioEnabled) {
      stopCurrentAudio();
      audioQueue.current = []; // Clear queue when disabled
      isProcessing.current = false;
    }
  }, [audioEnabled, stopCurrentAudio]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      audioQueue.current = [];
      isProcessing.current = false;
    };
  }, [stopCurrentAudio]);

  return {
    playAudio,
    stopCurrentAudio,
    isPlaying: !!currentAudio
  };
};