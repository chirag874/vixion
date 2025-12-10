
import React, { useState, useRef, useEffect } from 'react';

export const BackgroundSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  const createBrownNoise = (ctx: AudioContext) => {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Compensate for gain loss
      }
      return buffer;
  };

  const toggleSound = () => {
    if (isPlaying) {
      // Fade out and stop
      if (gainNodeRef.current && audioContextRef.current) {
          const currTime = audioContextRef.current.currentTime;
          // Smooth fade out
          gainNodeRef.current.gain.cancelScheduledValues(currTime);
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currTime);
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, currTime + 2);
          
          setTimeout(() => {
              sourceNodesRef.current.forEach(node => {
                  try { 
                      if (node instanceof OscillatorNode) node.stop();
                      if (node instanceof AudioBufferSourceNode) node.stop();
                      node.disconnect();
                  } catch(e) {}
              });
              sourceNodesRef.current = [];
              if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
              }
          }, 2000);
      }
      setIsPlaying(false);
    } else {
      // Initialize and Start
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.001; // Start silent for fade in
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 1. Brown Noise (Atmosphere - Rain/Wind like)
      const noiseBuffer = createBrownNoise(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.05; // Low volume background
      noiseSource.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();
      sourceNodesRef.current.push(noiseSource);

      // 2. Binaural & Drone Tones
      // 432Hz base (Healing) + 436Hz (Theta Binaural Beat)
      const configs = [
          { freq: 108, type: 'sine', gain: 0.2 },   // Low root drone
          { freq: 216, type: 'sine', gain: 0.1 },   // Octave
          { freq: 432, type: 'sine', gain: 0.1 },   // "Healing" freq
          { freq: 436, type: 'sine', gain: 0.1 },   // Binaural partner (4Hz beat)
          { freq: 528, type: 'sine', gain: 0.05 },  // "Miracle" tone (C5)
      ];
      
      configs.forEach(c => {
          const osc = ctx.createOscillator();
          osc.type = c.type as OscillatorType;
          osc.frequency.value = c.freq;
          
          const oscGain = ctx.createGain();
          oscGain.gain.value = c.gain;
          
          // LFO for organic movement (Amplitude Modulation)
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.05 + Math.random() * 0.1; // Very slow breathing
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = c.gain * 0.2; // Modulate gain by 20%
          lfo.connect(lfoGain);
          lfoGain.connect(oscGain.gain);
          lfo.start();
          sourceNodesRef.current.push(lfo);

          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
          sourceNodesRef.current.push(osc);
      });

      // Fade in
      masterGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 3);
      
      setIsPlaying(true);
    }
  };

  return (
    <button 
        onClick={toggleSound}
        className={`px-4 py-2 border rounded-lg text-sm backdrop-blur-sm transition-all flex items-center gap-2 group relative overflow-hidden
            ${isPlaying 
                ? 'bg-[var(--theme-primary)]/20 border-[var(--theme-primary)] text-[var(--theme-primary)] shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'bg-slate-800/80 border-[var(--theme-primary)]/50 text-slate-400 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]'
            }`}
    >
        {isPlaying ? (
             <>
                <div className="absolute inset-0 bg-[var(--theme-primary)]/10 animate-pulse"></div>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--theme-primary)]"></span>
                </span>
                <span className="relative font-bold">Meditation Active</span>
             </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                <span>Meditation Sound</span>
            </>
        )}
    </button>
  );
};
