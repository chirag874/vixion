
import { THEMES } from "./constants";

export type WidgetType = 'Profile' | 'Weather' | 'Chat' | 'Investment' | 'Time' | 'TodoList' | 'Actions' | 'GenerativeImage' | 'Coding' | 'Battery' | 'Game';

export interface Widget {
  id: number;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface VoiceOption {
  id: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  name: string;
}

export interface ConversationTurn {
  user: string;
  model: string;
  file?: { data: string; mimeType: string; name: string };
}

export interface Profile {
    name: string;
    avatar: string;
    status: string;
}

export interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: string;
}

export type ThemeName = keyof typeof THEMES;
export type ViewMode = 'holographic' | 'classic' | 'premium';
export type UserTier = 'Core' | 'Prime' | 'Owner';

export interface Notification {
    id: number;
    message: string;
}

export interface WeatherData {
    location: string;
    temperatureCelsius: number;
    condition: string;
}

export interface UsageStats {
    talkTimeSeconds: number;
    imagesGenerated: number;
    lastResetTime: number;
}
