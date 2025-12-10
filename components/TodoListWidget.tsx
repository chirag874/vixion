import React, { useState } from 'react';
import type { TodoItem } from '../types';

interface TodoListWidgetProps {
  items: TodoItem[];
  setItems: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export const TodoListWidget: React.FC<TodoListWidgetProps> = ({ items, setItems }) => {
  const [input, setInput] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setItems(prev => [...prev, { id: Date.now(), text: input.trim(), completed: false, dueDate: dueDate || undefined }]);
      setInput('');
      setDueDate('');
    }
  };

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  
  const deleteItem = (id: number) => {
      setItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ul className="flex-grow overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {items.map(item => (
          <li key={item.id} className="flex items-start gap-2 text-sm group">
            <input 
              type="checkbox" 
              checked={item.completed} 
              onChange={() => toggleItem(item.id)}
              className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] mt-1"
            />
            <div className="flex-grow">
                <span className={`${item.completed ? 'line-through text-gray-500' : 'text-white/90'}`}>
                    {item.text}
                </span>
                {item.dueDate && (
                    <p className={`text-xs ${item.completed ? 'text-gray-600' : 'text-[var(--theme-primary)]/70'}`}>
                        {new Date(item.dueDate).toLocaleString()}
                    </p>
                )}
            </div>
            <button onClick={() => deleteItem(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs pt-1">
              DEL
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddItem} className="mt-2 flex-shrink-0 flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
          className="w-full bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/90 px-2 py-1 outline-none transition-colors"
        />
        <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-grow bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/70 px-2 py-1 outline-none transition-colors text-xs"
            />
            <button type="submit" className="px-4 py-1 bg-[var(--theme-secondary)]/80 text-white rounded-md hover:bg-[var(--theme-secondary)]">
              Add
            </button>
        </div>
      </form>
    </div>
  );
};