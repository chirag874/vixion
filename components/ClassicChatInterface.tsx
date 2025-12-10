
import React, { useState, useRef, useEffect } from 'react';
import type { ConversationTurn } from '../types';

interface ClassicChatInterfaceProps {
  history: ConversationTurn[];
  onSendMessage: (message: string, file?: { data: string; mimeType: string; name: string }) => Promise<void>;
  isAiResponding: boolean;
  onSaveChat: () => void;
  onSwitchToHolographic: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const ClassicChatInterface: React.FC<ClassicChatInterfaceProps> = ({
  history,
  onSendMessage,
  isAiResponding,
  onSaveChat,
  onSwitchToHolographic
}) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<{ data: string; mimeType: string; name: string, previewUrl: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiResponding]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB limit.");
            return;
        }
        const base64Data = await blobToBase64(selectedFile);
        const previewUrl = URL.createObjectURL(selectedFile);
        setFile({
            data: base64Data,
            mimeType: selectedFile.type,
            name: selectedFile.name,
            previewUrl: previewUrl
        });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isAiResponding) {
      const fileToSend = file ? { data: file.data, mimeType: file.mimeType, name: file.name } : undefined;
      onSendMessage(input.trim(), fileToSend);
      setInput('');
      if (file) {
          URL.revokeObjectURL(file.previewUrl);
          setFile(null);
      }
    }
  };

  const removeFile = () => {
      if (file) {
          URL.revokeObjectURL(file.previewUrl);
          setFile(null);
      }
  }

  return (
    <div className="w-screen h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">V</div>
          <h1 className="font-bold text-xl">Vixion Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={onSaveChat}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2"
                title="Save Conversation"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>
                Save
            </button>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <button 
                onClick={onSwitchToHolographic}
                className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm"
            >
                Holographic Mode
            </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-6">
            {history.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                    <p className="text-2xl font-light">How can I help you today?</p>
                </div>
            )}
            {history.map((turn, idx) => (
                <div key={idx} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                        <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[70%] shadow-sm">
                            {turn.file && (
                                <div className="mb-2 bg-black/20 rounded overflow-hidden">
                                     <img src={`data:${turn.file.mimeType};base64,${turn.file.data}`} alt="attachment" className="max-h-60 object-contain" />
                                </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{turn.user}</p>
                        </div>
                    </div>

                    {/* AI Message */}
                    <div className="flex justify-start items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">V</div>
                         <div className="bg-white border border-slate-200 text-slate-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[85%] sm:max-w-[70%] shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">{turn.model}</p>
                        </div>
                    </div>
                </div>
            ))}
            {isAiResponding && (
                 <div className="flex justify-start items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">V</div>
                     <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={endRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
            {file && (
                <div className="mb-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-600 border border-slate-200">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button onClick={removeFile} className="hover:text-red-500 font-bold">&times;</button>
                </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <input ref={fileInputRef} type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Attach Image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Message Vixion..."
                    className="flex-grow bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
                    disabled={isAiResponding}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() && !file || isAiResponding}
                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
            </form>
             <p className="text-center text-xs text-slate-400 mt-2">Vixion may display inaccurate info.</p>
        </div>
      </div>
    </div>
  );
};
