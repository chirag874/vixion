
import React, { useRef, useEffect, useState } from 'react';
import type { ConversationTurn } from '../types';

interface ChatWidgetProps {
  history: ConversationTurn[];
  liveTranscript: string;
  onSendMessage: (message: string, file?: { data: string; mimeType: string; name: string }) => Promise<void>;
  isAiResponding: boolean;
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


export const ChatWidget: React.FC<ChatWidgetProps> = ({ history, liveTranscript, onSendMessage, isAiResponding }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<{ data: string; mimeType: string; name: string, previewUrl: string } | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiResponding, liveTranscript]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isAiResponding) {
      const fileToSend = file ? { data: file.data, mimeType: file.mimeType, name: file.name } : undefined;
      onSendMessage(input.trim(), fileToSend);
      setInput('');
      setFile(null);
    }
  };
  
  const removeFile = () => {
      if (file) {
          URL.revokeObjectURL(file.previewUrl);
          setFile(null);
      }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-y-auto text-sm text-white/80 pr-2 scrollbar-thin">
        {history.map((turn, index) => (
          <div key={index} className="mb-4">
            {turn.user && (
              <div className="mb-2">
                <p className="font-bold text-white/90 text-glow">[USER]</p>
                {turn.file && (
                    <img src={`data:${turn.file.mimeType};base64,${turn.file.data}`} alt="user attachment" className="my-2 max-w-[50%] rounded-md border border-[var(--theme-primary)]/50" />
                )}
                <p className="whitespace-pre-wrap">{turn.user}</p>
              </div>
            )}
            {turn.model && (
              <div>
                <p className="font-bold text-[var(--theme-primary)] text-glow">[VIXION]</p>
                <p className="whitespace-pre-wrap">{turn.model}</p>
              </div>
            )}
          </div>
        ))}
        {liveTranscript && (
          <div className="text-white/70 italic">
            <p className="font-bold text-white/90 text-glow">[USER - LIVE]</p>
            <p className="whitespace-pre-wrap">{liveTranscript}</p>
          </div>
        )}
        {isAiResponding && (
          <div className="text-[var(--theme-primary)] italic animate-pulse">Vixion is typing...</div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
       {file && (
        <div className="flex-shrink-0 p-2 border-t border-[var(--theme-primary)]/20 flex items-center gap-2">
          <img src={file.previewUrl} alt="preview" className="w-10 h-10 object-cover rounded" />
          <span className="text-xs truncate flex-grow">{file.name}</span>
          <button onClick={removeFile} className="text-red-500 text-lg">&times;</button>
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="mt-2 flex-shrink-0 flex gap-2 items-center">
        <input ref={fileInputRef} type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-[var(--theme-primary)] hover:text-white transition-colors" title="Attach Image">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isAiResponding}
          className="flex-grow bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/90 px-2 py-1 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isAiResponding}
          className="px-4 py-1 bg-[var(--theme-secondary)]/80 text-white rounded-md hover:bg-[var(--theme-secondary)] disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};
