
import React from 'react';
import type { WidgetType } from '../types';

interface AddWidgetMenuProps {
  onAdd: (type: WidgetType) => void;
  onClose: () => void;
}

const WIDGET_TYPES: WidgetType[] = ['Profile', 'Weather', 'Chat', 'Investment', 'Time', 'TodoList', 'Actions', 'GenerativeImage', 'Coding', 'Battery', 'Game'];

export const AddWidgetMenu: React.FC<AddWidgetMenuProps> = ({ onAdd, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-slate-900/80 border border-[var(--theme-primary)]/50 rounded-lg p-6 shadow-2xl shadow-[var(--theme-primary)]/30 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-[var(--theme-primary)] text-xl font-bold text-center text-glow">Add Widget</h2>
        <div className="grid grid-cols-2 gap-4">
          {WIDGET_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="px-6 py-3 bg-[var(--theme-secondary)]/40 border border-[var(--theme-secondary)] rounded-md text-white/90 hover:bg-[var(--theme-secondary)]/60 hover:border-[var(--theme-primary)] transition-all duration-200"
            >
              {type}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-[var(--theme-primary)] hover:text-white">Close</button>
      </div>
    </div>
  );
};
