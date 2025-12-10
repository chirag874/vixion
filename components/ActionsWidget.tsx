import React from 'react';

interface ActionsWidgetProps {
  onSaveChat: () => void;
}

export const ActionsWidget: React.FC<ActionsWidgetProps> = ({ onSaveChat }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <button 
        onClick={onSaveChat}
        className="w-full px-4 py-2 bg-[var(--theme-secondary)]/60 hover:bg-[var(--theme-secondary)] border border-[var(--theme-primary)]/50 rounded-lg text-white transition-colors"
      >
        Save Chat Log
      </button>
    </div>
  );
};