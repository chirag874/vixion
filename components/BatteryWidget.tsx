import React, { useState, useEffect } from 'react';

// Using `any` for battery manager as the type might not be available in all TS environments
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export const BatteryWidget: React.FC = () => {
  const [level, setLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.getBattery) {
      setIsSupported(false);
      return;
    }

    let batteryManager: BatteryManager | null = null;

    const updateBatteryStatus = (battery: BatteryManager) => {
      setLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    const batteryEventHandler = () => {
      if(batteryManager) updateBatteryStatus(batteryManager);
    };

    navigator.getBattery().then((battery) => {
      batteryManager = battery;
      updateBatteryStatus(battery);

      battery.addEventListener('levelchange', batteryEventHandler);
      battery.addEventListener('chargingchange', batteryEventHandler);
    });

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', batteryEventHandler);
        batteryManager.removeEventListener('chargingchange', batteryEventHandler);
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-sm">
        Battery Status API not supported by your browser.
      </div>
    );
  }

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (level / 100) * circumference;

  const getColor = () => {
    if (isCharging) return 'var(--theme-primary)';
    if (level <= 20) return '#ef4444'; // red-500
    if (level <= 50) return '#facc15'; // yellow-400
    return '#4ade80'; // green-400
  };
  
  const strokeColor = getColor();
  const shadowColor = isCharging ? 'var(--theme-primary)' : strokeColor;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Shadow/Glow */}
        <defs>
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="var(--theme-secondary)"
          strokeWidth="10"
          strokeOpacity="0.3"
          fill="transparent"
        />
        
        {/* Ticks */}
        {Array.from({ length: 50 }).map((_, index) => {
            const angle = (index * 360) / 50;
            const isMajorTick = index % 5 === 0;
            const length = isMajorTick ? 8 : 4;
            const x1 = 100 + (radius + 2) * Math.cos(angle * Math.PI / 180);
            const y1 = 100 + (radius + 2) * Math.sin(angle * Math.PI / 180);
            const x2 = 100 + (radius + 2 + length) * Math.cos(angle * Math.PI / 180);
            const y2 = 100 + (radius + 2 + length) * Math.sin(angle * Math.PI / 180);
            return (
                 <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--theme-primary)" strokeWidth={isMajorTick ? "2" : "1"} strokeOpacity={isMajorTick ? 0.7 : 0.4} />
            )
        })}

        {/* Progress Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out', filter: `drop-shadow(0 0 5px ${shadowColor})` }}
          className={isCharging ? "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" : ""}
        />

        <text
          x="100"
          y="100"
          textAnchor="middle"
          dy=".3em"
          fontSize="40"
          fontWeight="bold"
          fill={strokeColor}
          className="text-glow"
          style={{ transition: 'fill 0.5s ease-in-out', textShadow: `0 0 10px ${shadowColor}` }}
        >
          {level}%
        </text>

        {isCharging && (
            <g transform="translate(88, 115)">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={strokeColor} style={{ filter: `drop-shadow(0 0 5px ${shadowColor})`}}>
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
            </g>
        )}
      </svg>
    </div>
  );
};
