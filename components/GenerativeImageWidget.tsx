
import React, { useState } from 'react';

interface GenerativeImageWidgetProps {
    onGenerate: (prompt: string) => Promise<string>;
    isOwner?: boolean;
}

export const GenerativeImageWidget: React.FC<GenerativeImageWidgetProps> = ({ onGenerate, isOwner = false }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setImageUrl(null);
        setError(null);
        try {
            const resultUrl = await onGenerate(prompt);
            setImageUrl(resultUrl);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col ${isOwner ? 'border border-red-500/20 rounded-lg p-1' : ''}`}>
             {isOwner && <div className="text-[10px] text-red-500 font-bold text-center mb-1 tracking-widest">VIP RENDER ENGINE: ACTIVE</div>}
            <div className="flex-grow flex items-center justify-center bg-black/20 rounded-md overflow-hidden relative">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className={`w-16 h-16 border-4 border-dashed rounded-full animate-spin ${isOwner ? 'border-red-500' : 'border-[var(--theme-primary)]'}`}></div>
                        <p className="mt-4 text-sm">Generating...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {imageUrl && <img src={imageUrl} alt="Generated art" className="w-full h-full object-contain" />}
                {!isLoading && !imageUrl && !error && (
                    <div className="text-center text-white/50 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="mt-2 text-sm">Image will appear here</p>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 mt-3 flex flex-col gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt... e.g., 'A holographic cat in a neon city'"
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/90 p-2 outline-none transition-colors resize-none text-sm"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={`w-full py-2 text-white rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors ${isOwner ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-[var(--theme-secondary)]/80 hover:bg-[var(--theme-secondary)]'}`}
                >
                    {isLoading ? '...' : isOwner ? 'Generate (VIP)' : 'Generate'}
                </button>
            </div>
        </div>
    );
};
