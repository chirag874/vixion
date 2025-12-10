
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { HolographicWidget } from './components/HolographicWidget';
import { ConversationCircle } from './components/ConversationCircle';
import { AddWidgetMenu } from './components/AddWidgetMenu';
import { WeatherWidget } from './components/WeatherWidget';
import { ProfileWidget } from './components/ProfileWidget';
import { ChatWidget } from './components/ChatWidget';
import { InvestmentWidget } from './components/InvestmentWidget';
import { TimeWidget } from './components/TimeWidget';
import { TodoListWidget } from './components/TodoListWidget';
import { ActionsWidget } from './components/ActionsWidget';
import { GenerativeImageWidget } from './components/GenerativeImageWidget';
import { CodingWidget } from './components/CodingWidget';
import { BatteryWidget } from './components/BatteryWidget';
import { GameWidget } from './components/GameWidget';
import { Notification } from './components/Notification';
import { ParticleBackground } from './components/ParticleBackground';
import { ClassicChatInterface } from './components/ClassicChatInterface';
import { PremiumPage } from './components/PremiumPage';
import { BackgroundSound } from './components/BackgroundSound';
import { useGeminiLive } from './hooks/useGeminiLive';
import { INITIAL_WIDGETS, VOICE_OPTIONS, VIXION_SYSTEM_INSTRUCTION, OWNER_SYSTEM_INSTRUCTION, THEMES, VIXION_LOGO_SVG, TIER_LIMITS } from './constants';
import type { Widget, WidgetType, VoiceOption, ConversationTurn, ThemeName, Profile, TodoItem, Notification as NotificationType, WeatherData, ViewMode, UserTier, UsageStats } from './types';

const themeNames = Object.keys(THEMES) as ThemeName[];

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(INITIAL_WIDGETS);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isAiRespondingText, setIsAiRespondingText] = useState(false);
  const [theme, setTheme] = useState<ThemeName>('cyan');
  const [profile, setProfile] = useState<Profile>({ name: 'User', avatar: 'https://picsum.photos/100', status: 'Online' });
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('holographic');
  const [isOwner, setIsOwner] = useState(false);
  const [tier, setTier] = useState<UserTier>('Core');
  
  // Usage tracking state
  const [usage, setUsage] = useState<UsageStats>(() => {
      const saved = localStorage.getItem('vixion_usage');
      return saved ? JSON.parse(saved) : { talkTimeSeconds: 0, imagesGenerated: 0, lastResetTime: Date.now() };
  });

  const {
    isSessionActive,
    isSpeaking,
    isListening,
    startSession,
    stopSession,
    fullTranscript,
    liveTranscript,
  } = useGeminiLive(activeVoice.id);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const nextWidgetId = useRef(widgets.length + 1);

  // Initialize AI
  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const instruction = isOwner ? OWNER_SYSTEM_INSTRUCTION : VIXION_SYSTEM_INSTRUCTION;
    chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: instruction },
    });
  }, [isOwner]);

  // Handle Owner Mode Changes
  useEffect(() => {
    if (isOwner) {
        setTier('Owner');
        setTheme('red');
        setProfile(prev => ({ ...prev, name: 'Creator Chirag', status: 'OMEGA // VIP' }));
        setNotifications(prev => [...prev, { id: Date.now(), message: 'OMEGA ACCESS GRANTED: Welcome, Creator.' }]);
    }
  }, [isOwner]);

  // Save Usage Stats
  useEffect(() => {
    localStorage.setItem('vixion_usage', JSON.stringify(usage));
  }, [usage]);

  // Reset Logic Checker
  useEffect(() => {
      const checkReset = () => {
        if (tier === 'Owner') return; // Owner never needs reset

        const limits = TIER_LIMITS[tier];
        const now = Date.now();
        if (now - usage.lastResetTime > limits.resetIntervalMs) {
            setUsage({
                talkTimeSeconds: 0,
                imagesGenerated: 0,
                lastResetTime: now
            });
            setNotifications(prev => [...prev, { id: Date.now(), message: `Usage limits reset for ${tier} tier.` }]);
        }
      };
      
      const interval = setInterval(checkReset, 60000); // Check every minute
      checkReset(); // Check on mount
      return () => clearInterval(interval);
  }, [tier, usage.lastResetTime]);

  // Track Talk Time
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSessionActive && tier !== 'Owner') {
          interval = setInterval(() => {
              setUsage(prev => {
                  const newTime = prev.talkTimeSeconds + 1;
                  const limits = TIER_LIMITS[tier];
                  if (newTime >= limits.maxTalkTimeSeconds) {
                      stopSession();
                      setNotifications(prevNotifs => [...prevNotifs, { id: Date.now(), message: `${tier} Limit Reached: Talk time exhausted.` }]);
                  }
                  return { ...prev, talkTimeSeconds: newTime };
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isSessionActive, tier, stopSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      todoList.forEach(item => {
        if (item.dueDate && !item.completed) {
          const dueDate = new Date(item.dueDate);
          if (now >= dueDate && (now.getTime() - dueDate.getTime()) < 1000) {
            setNotifications(prev => [...prev, { id: Date.now(), message: `Reminder: ${item.text}` }]);
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [todoList]);

  useEffect(() => {
    if (fullTranscript.user && fullTranscript.model) {
      setConversationHistory(prev => [...prev, { user: fullTranscript.user, model: fullTranscript.model }]);
    }
  }, [fullTranscript]);

  const handleSendMessage = async (message: string, file?: { data: string; mimeType: string; name: string }) => {
    if (!chatRef.current || (!message.trim() && !file)) return;

    const userTurn: ConversationTurn = { user: message, model: '', file };
    setConversationHistory(prev => [...prev, userTurn]);
    setIsAiRespondingText(true);

    try {
        const content = file
            ? [{ text: message }, { inlineData: { data: file.data, mimeType: file.mimeType } }]
            : message;

        const result = await chatRef.current.sendMessage({ message: content });
        const text = result.text;
        
        setConversationHistory(prev => prev.map((turn, index) => 
            index === prev.length - 1 ? { ...turn, model: text } : turn
        ));

    } catch (error) {
        console.error("Chat error:", error);
        setConversationHistory(prev => prev.map((turn, index) => 
            index === prev.length - 1 ? { ...turn, model: "Error: Could not get response." } : turn
        ));
    } finally {
        setIsAiRespondingText(false);
    }
  };
  
  const handleGenerateImage = async (prompt: string): Promise<string> => {
    if (!aiRef.current || !prompt.trim()) throw new Error("Prompt is empty or AI not initialized.");

    // Check Limits
    const limits = TIER_LIMITS[tier];
    if (usage.imagesGenerated >= limits.maxImages && tier !== 'Owner') {
        setNotifications(prev => [...prev, { id: Date.now(), message: `${tier} Limit Reached: Maximum images generated.` }]);
        throw new Error(`Limit Reached. ${usage.imagesGenerated}/${limits.maxImages} used.`);
    }

    // Enhance prompt if owner
    const finalPrompt = isOwner 
        ? `${prompt}, masterpiece, best quality, highly detailed, 8k, cinematic lighting, photorealistic, vivid colors` 
        : prompt;

    const response = await aiRef.current.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    
    // Increment usage
    setUsage(prev => ({ ...prev, imagesGenerated: prev.imagesGenerated + 1 }));

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  };

  const handleGenerateCode = async (prompt: string, language: string): Promise<string> => {
    if (!aiRef.current || !prompt.trim()) {
        throw new Error("Prompt is empty or AI not initialized.");
    }
    const fullPrompt = `Generate a code snippet for the following prompt in the ${language} language. Only return the raw code, with no explanations, intro, or outro text. Do not use markdown backticks.`;

    const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
    });
    
    let code = response.text;
    const codeBlockRegex = /```(?:\w+\n)?([\s\S]+)```/;
    const match = code.match(codeBlockRegex);
    if (match) {
        code = match[1].trim();
    }
    return code.trim();
  };
  
  const handleFetchWeather = async (location: string): Promise<WeatherData> => {
    if (!aiRef.current) {
        throw new Error("AI not initialized.");
    }

    const weatherSchema = {
        type: Type.OBJECT,
        properties: {
            location: { type: Type.STRING, description: 'The city and country of the weather report.' },
            temperatureCelsius: { type: Type.NUMBER, description: 'The current temperature in Celsius.' },
            condition: { type: Type.STRING, description: 'A brief description of the current weather condition (e.g., "Sunny", "Cloudy", "Rainy").' },
        },
        required: ['location', 'temperatureCelsius', 'condition'],
    };

    const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `What is the current weather in ${location}?`,
        config: {
            responseMimeType: "application/json",
            responseSchema: weatherSchema,
        },
    });

    const weatherJsonString = response.text;
    if (!weatherJsonString) {
        throw new Error("Received an empty response from the AI.");
    }
    
    try {
        const weatherData: WeatherData = JSON.parse(weatherJsonString);
        return weatherData;
    } catch (e) {
        console.error("Failed to parse weather data:", weatherJsonString);
        throw new Error("AI returned malformed weather data.");
    }
  };

  const updateWidget = useCallback((id: number, newProps: Partial<Widget>) => {
    setWidgets(currentWidgets => {
      const newWidgets = currentWidgets.map(w => w.id === id ? { ...w, ...newProps } : w);
      const activeWidget = newWidgets.find(w => w.id === id);
      if (activeWidget && activeWidget.zIndex !== newWidgets.length) {
          const highestZIndex = newWidgets.length;
          return newWidgets.map(w => {
              if (w.id === id) return { ...w, zIndex: highestZIndex };
              if (w.zIndex > activeWidget.zIndex) return { ...w, zIndex: w.zIndex - 1 };
              return w;
          });
      }
      return newWidgets;
    });
  }, []);

  const bringToFront = (id: number) => {
    updateWidget(id, {});
  };

  const removeWidget = useCallback((id: number) => {
    setWidgets(currentWidgets => currentWidgets.filter(w => w.id !== id));
  }, []);
  
  const addWidget = (type: WidgetType) => {
    let size = { width: 300, height: 200 };
    if (type === 'GenerativeImage') size = { width: 400, height: 450 };
    if (type === 'Chat') size = { width: 500, height: 350 };
    if (type === 'TodoList') size = { width: 300, height: 350 };
    if (type === 'Coding') size = { width: 500, height: 400 };
    if (type === 'Battery') size = { width: 250, height: 250 };
    if (type === 'Game') size = { width: 320, height: 380 };
    
    const newWidget: Widget = {
      id: nextWidgetId.current++,
      type,
      position: { x: window.innerWidth / 2 - size.width / 2, y: window.innerHeight / 2 - size.height / 2 },
      size,
      zIndex: widgets.length + 1,
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowAddMenu(false);
  };
  
  const handleSaveChat = () => {
    let filename = `vixion-chat-${new Date().toISOString()}.txt`;
    if (conversationHistory.length > 0 && conversationHistory[0].user) {
        const q = conversationHistory[0].user.trim().substring(0, 30);
        const sanitizedQ = q.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-');
        if (sanitizedQ.length > 0) {
            filename = `${sanitizedQ}.txt`;
        }
    }
    const downloadName = `conversation/${filename}`;
    const chatText = conversationHistory
      .map(turn => `[USER]${turn.file ? ` (Attachment: ${turn.file.name})` : ''}\n${turn.user}\n\n[VIXION]\n${turn.model}`)
      .join('\n\n----------------------------------\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderWidgetContent = (type: WidgetType) => {
    switch (type) {
      case 'Weather':
        return <WeatherWidget onFetchWeather={handleFetchWeather} />;
      case 'Profile':
        return <ProfileWidget profile={profile} onUpdate={setProfile} isOwner={isOwner} />;
      case 'Chat':
        return <ChatWidget history={conversationHistory} liveTranscript={liveTranscript} onSendMessage={handleSendMessage} isAiResponding={isAiRespondingText} />;
      case 'Investment':
        return <InvestmentWidget />;
      case 'Time':
        return <TimeWidget />;
      case 'TodoList':
        return <TodoListWidget items={todoList} setItems={setTodoList} />;
      case 'Actions':
        return <ActionsWidget onSaveChat={handleSaveChat} />;
      case 'GenerativeImage':
        return <GenerativeImageWidget onGenerate={handleGenerateImage} isOwner={isOwner} />;
      case 'Coding':
        return <CodingWidget onGenerate={handleGenerateCode} />;
      case 'Battery':
        return <BatteryWidget />;
      case 'Game':
        return <GameWidget />;
      default:
        return null;
    }
  };

  const handleToggleSession = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      // Check limits before starting
      const limits = TIER_LIMITS[tier];
      if (usage.talkTimeSeconds >= limits.maxTalkTimeSeconds && tier !== 'Owner') {
          setNotifications(prev => [...prev, { id: Date.now(), message: `Limit Reached: ${Math.floor(usage.talkTimeSeconds/60)}/${Math.floor(limits.maxTalkTimeSeconds/60)} mins used.` }]);
          return;
      }
      startSession();
    }
  };
  
  const cycleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  };

  const handleSwitchToClassic = () => {
    if (isSessionActive) {
        stopSession();
    }
    setViewMode('classic');
  };

  const handleSwitchToPremium = () => {
    setViewMode('premium');
  }

  const handleSwitchToHolographic = () => {
    setViewMode('holographic');
  };
  
  const handleUpgradeToPrime = () => {
      setTier('Prime');
      setNotifications(prev => [...prev, { id: Date.now(), message: 'Prime Membership Activated.' }]);
  }

  if (viewMode === 'premium') {
      return <PremiumPage onBack={handleSwitchToHolographic} onSetOwnerMode={setIsOwner} onUpgradeToPrime={handleUpgradeToPrime} />;
  }

  if (viewMode === 'classic') {
    return (
        <ClassicChatInterface 
            history={conversationHistory}
            onSendMessage={handleSendMessage}
            isAiResponding={isAiRespondingText}
            onSaveChat={handleSaveChat}
            onSwitchToHolographic={handleSwitchToHolographic}
        />
    );
  }

  return (
    <div 
      className="relative w-screen h-screen bg-black overflow-hidden font-mono"
      style={THEMES[theme] as React.CSSProperties}
    >
      <ParticleBackground />
      <div className="animated-grid"></div>
      <div className="scanline-overlay"></div>
      
      <div className="fixed top-4 right-24 z-[2000] flex flex-col items-end gap-2">
        {notifications.map(n => (
          <Notification key={n.id} message={n.message} onClose={() => removeNotification(n.id)} />
        ))}
      </div>
      
      {widgets.map(widget => (
        <HolographicWidget
          key={widget.id}
          id={widget.id}
          title={widget.type}
          initialPosition={widget.position}
          initialSize={widget.size}
          zIndex={widget.zIndex}
          onUpdate={updateWidget}
          onRemove={removeWidget}
          onFocus={bringToFront}
        >
          {renderWidgetContent(widget.type)}
        </HolographicWidget>
      ))}
      
      <div className="fixed top-4 right-4 z-[2000] flex gap-2">
        <BackgroundSound />
        <button 
            onClick={handleSwitchToPremium}
             className={`px-4 py-2 border rounded-lg text-sm backdrop-blur-sm transition-all ${isOwner ? 'bg-red-900/50 border-red-500 text-red-200 animate-pulse' : tier === 'Prime' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-gradient-to-r from-yellow-600/80 to-yellow-800/80 border-yellow-500/50 text-yellow-200 hover:from-yellow-500/80 hover:to-yellow-700/80 shadow-[0_0_10px_rgba(234,179,8,0.2)]'}`}
        >
            {isOwner ? 'OMEGA ACCESS' : tier === 'Prime' ? 'Prime Active' : 'Premium'}
        </button>
        <button 
            onClick={cycleTheme}
            className="px-4 py-2 bg-slate-800/80 border border-[var(--theme-primary)]/50 rounded-lg text-[var(--theme-primary)] text-sm backdrop-blur-sm hover:bg-slate-700/80 transition-colors"
        >
            Cycle Theme
        </button>
        <button
            onClick={handleSwitchToClassic}
            className="px-4 py-2 bg-slate-800/80 border border-[var(--theme-primary)]/50 rounded-lg text-[var(--theme-primary)] text-sm backdrop-blur-sm hover:bg-slate-700/80 transition-colors"
        >
            Classic Mode
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button 
          onClick={() => setShowAddMenu(true)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-slate-900/50 border border-[var(--theme-primary)] text-[var(--theme-primary)] flex items-center justify-center hover:bg-[var(--theme-primary)]/20 transition-all duration-300 pointer-events-auto glow hover:animate-pulse z-0"
        >
          <div className="w-12 h-12" dangerouslySetInnerHTML={{ __html: VIXION_LOGO_SVG }} />
        </button>
      </div>
      
      {showAddMenu && <AddWidgetMenu onAdd={addWidget} onClose={() => setShowAddMenu(false)} />}
      
      <ConversationCircle 
        isSessionActive={isSessionActive}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleSession={handleToggleSession}
        onVoiceChange={setActiveVoice}
      />
    </div>
  );
};

export default App;
