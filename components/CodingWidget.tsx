import React, { useState } from 'react';

interface CodingWidgetProps {
    onGenerate: (prompt: string, language: string) => Promise<string>;
}

const LANGUAGES = ['JavaScript', 'Python', 'HTML', 'CSS', 'TypeScript', 'Java', 'SQL', 'C++'];

export const CodingWidget: React.FC<CodingWidgetProps> = ({ onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setGeneratedCode(null);
        setError(null);
        setCopySuccess('');
        try {
            const result = await onGenerate(prompt, language);
            setGeneratedCode(result);
        } catch (err) {
            setError('Failed to generate code. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Failed to copy');
            console.error('Copy failed', err);
        });
    };

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div className="flex-shrink-0 flex flex-col gap-2">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the code you want... e.g., 'A button that alerts Hello World'"
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/90 p-2 outline-none transition-colors resize-none text-sm"
                />
                <div className="flex gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isLoading}
                        className="flex-grow bg-slate-800/50 border border-[var(--theme-primary)]/50 rounded px-2 py-1 text-sm outline-none"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="px-4 py-2 bg-[var(--theme-secondary)]/80 text-white rounded-md hover:bg-[var(--theme-secondary)] disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
            
            <div className="flex-grow bg-black/30 rounded-md overflow-hidden relative p-1">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm animate-pulse">
                        <svg className="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {error && <p className="text-red-500 text-center p-4">{error}</p>}
                {generatedCode && (
                    <>
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 px-2 py-1 bg-slate-700/80 text-xs rounded hover:bg-slate-600 transition-colors z-10"
                        >
                            {copySuccess || 'Copy'}
                        </button>
                        <pre className="w-full h-full overflow-auto text-sm scrollbar-thin p-2">
                            <code className={`language-${language.toLowerCase()}`}>
                                {generatedCode}
                            </code>
                        </pre>
                    </>
                )}
                 {!isLoading && !generatedCode && !error && (
                    <div className="text-center text-white/50 p-4 h-full flex flex-col justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        <p className="mt-2 text-sm">Generated code will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};
