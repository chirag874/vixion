
import React, { useState, useRef } from 'react';
import type { Profile } from '../types';

interface ProfileWidgetProps {
  profile: Profile;
  onUpdate: (newProfile: Profile) => void;
  isOwner?: boolean;
}

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ profile, onUpdate, isOwner = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ ...profile, avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    onUpdate({ ...profile, name });
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleNameBlur();
      }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/90 gap-2">
      <div 
        className={`w-20 h-20 rounded-full border-2 p-1 cursor-pointer group relative ${isOwner ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'border-[var(--theme-primary)] glow'}`}
        onClick={handleAvatarClick}
      >
        <img src={profile.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center">
            Change
        </div>
        {isOwner && (
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">OMEGA</div>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      {isEditing ? (
        <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="bg-transparent border-b border-[var(--theme-primary)] text-center outline-none text-glow font-bold"
            autoFocus
        />
      ) : (
        <p className={`font-bold text-glow cursor-pointer ${isOwner ? 'text-red-400' : ''}`} onDoubleClick={handleNameDoubleClick}>
            {profile.name}
        </p>
      )}
      <p className="text-xs">Status: {profile.status}</p>
    </div>
  );
};
