
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { VIXION_SYSTEM_INSTRUCTION } from '../constants';
import type { VoiceOption } from '../types';

// Helper functions for audio encoding/decoding
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export const useGeminiLive = (voice: VoiceOption['id']) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fullTranscript, setFullTranscript] = useState({ user: '', model: ''});
  const [liveTranscript, setLiveTranscript] = useState('');

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  

  const stopAudioProcessing = useCallback(() => {
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(console.error);
        inputAudioContextRef.current = null;
    }
    setIsListening(false);
  }, []);

  const stopSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (error) {
        console.error('Error closing session:', error);
      } finally {
        sessionPromiseRef.current = null;
        stopAudioProcessing();
        setIsSessionActive(false);
      }
    }
  }, [stopAudioProcessing]);

  const startSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsListening(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
            },
            systemInstruction: { parts: [{ text: VIXION_SYSTEM_INSTRUCTION }] },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
        callbacks: {
            onopen: () => {
                setIsSessionActive(true);
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                
                const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                mediaStreamSourceRef.current = source;
                
                const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = scriptProcessor;

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };

                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                    setIsSpeaking(true);
                    const audioContext = outputAudioContextRef.current;
                    if (!audioContext) return;

                    const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.addEventListener('ended', () => {
                        audioSourcesRef.current.delete(source);
                        if(audioSourcesRef.current.size === 0) setIsSpeaking(false);
                    });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                }

                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscriptionRef.current += text;
                    setLiveTranscript(currentInputTranscriptionRef.current);
                }
                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                }
                
                if (message.serverContent?.turnComplete) {
                    setFullTranscript({
                        user: currentInputTranscriptionRef.current,
                        model: currentOutputTranscriptionRef.current,
                    });
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                    setLiveTranscript('');
                }

                if (message.serverContent?.interrupted) {
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                        audioSourcesRef.current.delete(source);
                    }
                    nextStartTimeRef.current = 0;
                    setIsSpeaking(false);
                }
            },
            onclose: () => {
                stopAudioProcessing();
                setIsSessionActive(false);
                sessionPromiseRef.current = null;
            },
            onerror: (e: ErrorEvent) => {
                console.error('Session error:', e);
                stopAudioProcessing();
                setIsSessionActive(false);
                sessionPromiseRef.current = null;
            }
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error('Failed to get user media or start session:', error);
      setIsListening(false);
    }
  }, [voice, stopAudioProcessing]);
  
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return { isSessionActive, isSpeaking, isListening, startSession, stopSession, fullTranscript, liveTranscript };
};
