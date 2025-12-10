
import React, { useState, useRef } from 'react';
import { VOICE_OPTIONS } from '../constants';
import type { VoiceOption } from '../types';

interface ConversationCircleProps {
    isSessionActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    onToggleSession: () => void;
    onVoiceChange: (voice: VoiceOption) => void;
}

const CircleDesign: React.FC<{ design: number, isListening: boolean, isSpeaking: boolean, isSessionActive: boolean }> = ({ design, isListening, isSpeaking, isSessionActive }) => {
    const baseClasses = "absolute w-full h-full transition-all duration-500 rounded-full";

    const stateContainerClasses = `w-full h-full relative flex items-center justify-center transition-transform duration-300 ${isSpeaking ? 'scale-105' : 'scale-100'}`;
    const listeningPulseClass = isListening && !isSpeaking ? 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]' : '';

    const commonElements = (
        <>
            <div className={`absolute w-full h-full rounded-full border-2 border-[var(--theme-primary)]/20 ${isListening ? 'animate-[spin_12s_linear_infinite]' : ''}`}></div>
            <div className={`absolute w-[90%] h-[90%] rounded-full border border-[var(--theme-primary)]/30 ${isListening ? 'animate-[spin_8s_reverse_linear_infinite]' : ''}`}></div>
            <div className={`absolute w-[60%] h-[60%] rounded-full bg-black/50 border border-[var(--theme-primary)]/10`}></div>
            <span className="absolute text-2xl font-bold text-glow tracking-widest text-white/90 transition-opacity duration-500">{isSessionActive ? "VIXION" : ""}</span>
            <div className={`absolute w-full h-full rounded-full bg-[var(--theme-primary)]/20 ${listeningPulseClass} opacity-0`}></div>
        </>
    );

    let designElement;
    switch (design) {
        case 1:
            designElement = <div className={`${baseClasses} border-4 border-[var(--theme-primary)] border-dashed ${isListening ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>;
            break;
        case 2:
            designElement = <div className={`${baseClasses} bg-gradient-to-br from-[var(--theme-primary)]/20 to-transparent border-2 border-[var(--theme-primary)]/50`}></div>;
            break;
        case 3:
            designElement = <div className={`${baseClasses} p-4`}><div className="w-full h-full border border-dashed border-[var(--theme-primary)] rounded-full"></div></div>;
            break;
        default:
            designElement = <div className={`${baseClasses} bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)]`}></div>;
            break;
    }

    return (
        <div className={stateContainerClasses}>
            {designElement}
            {commonElements}
            {isSpeaking && <div className="absolute w-full h-full rounded-full border-4 border-[var(--theme-primary)] animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>}
        </div>
    );
};

export const ConversationCircle: React.FC<ConversationCircleProps> = ({ isSessionActive, isListening, isSpeaking, onToggleSession, onVoiceChange }) => {
    const [circleDesign, setCircleDesign] = useState(0);
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragStartRef = useRef<number | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        dragStartRef.current = e.clientX;
        longPressTimeout.current = setTimeout(() => {
            setShowVoiceMenu(true);
            dragStartRef.current = null; // Prevent drag after long press
        }, 800);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragStartRef.current !== null) {
            const dragDistance = e.clientX - dragStartRef.current;
            if (Math.abs(dragDistance) > 30) {
                setCircleDesign(prev => (prev + (dragDistance > 0 ? 1 : -1) + 4) % 4);
                dragStartRef.current = e.clientX;
                if (longPressTimeout.current) {
                    clearTimeout(longPressTimeout.current);
                    longPressTimeout.current = null;
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
            if (!showVoiceMenu) {
                onToggleSession();
            }
        }
        dragStartRef.current = null;
    };
    
    const handleMouseLeave = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
        }
        dragStartRef.current = null;
    };
    
    const selectVoice = (voice: VoiceOption) => {
        onVoiceChange(voice);
        setShowVoiceMenu(false);
    };

    const getStatusText = () => {
        if (isSpeaking) return "SPEAKING";
        if (isListening) return "LISTENING";
        if (isSessionActive) return "IDLE";
        return "TAP TO TALK";
    }

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center">
            {showVoiceMenu && (
                <div className="absolute bottom-full mb-4 p-2 bg-slate-800/80 border border-[var(--theme-primary)]/50 rounded-lg backdrop-blur-sm flex gap-2 animate-[fadeIn_0.3s_ease-out]">
                    {VOICE_OPTIONS.map(voice => (
                        <button key={voice.id} onClick={() => selectVoice(voice)} className="px-3 py-1 rounded bg-[var(--theme-secondary)]/50 hover:bg-[var(--theme-primary)] text-white transition-colors">
                            {voice.name}
                        </button>
                    ))}
                </div>
            )}
            <div
                className="w-40 h-40 rounded-full cursor-pointer p-2 group glow"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <CircleDesign design={circleDesign} isListening={isListening} isSpeaking={isSpeaking} isSessionActive={isSessionActive} />
            </div>
            <p className="mt-4 text-[var(--theme-primary)] text-glow tracking-widest text-sm">{getStatusText()}</p>
        </div>
    );
};
