import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '../types';

interface WeatherWidgetProps {
    onFetchWeather: (location: string) => Promise<WeatherData>;
}

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
    const normalizedCondition = condition.toLowerCase();
  
    let iconName = 'cloud'; // Default icon
    if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
      iconName = 'sun';
    } else if (normalizedCondition.includes('cloud')) {
      iconName = 'cloud';
    } else if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
      iconName = 'rain';
    } else if (normalizedCondition.includes('storm') || normalizedCondition.includes('thunder')) {
      iconName = 'storm';
    } else if (normalizedCondition.includes('snow') || normalizedCondition.includes('flurries')) {
      iconName = 'snow';
    } else if (normalizedCondition.includes('wind')) {
      iconName = 'wind';
    } else if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist') || normalizedCondition.includes('haze')) {
      iconName = 'fog';
    }
  
    switch (iconName) {
      case 'sun':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--theme-primary)] glow animate-[spin_10s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'cloud':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--theme-primary)] glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'rain':
        return (
          <div className="relative h-12 w-12 text-[var(--theme-primary)] glow">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full flex justify-around">
              <span className="text-xs animate-[fall_1s_linear_infinite] opacity-80">|</span>
              <span className="text-xs animate-[fall_1.2s_linear_infinite_0.5s] opacity-80">|</span>
              <span className="text-xs animate-[fall_0.8s_linear_infinite_0.2s] opacity-80">|</span>
            </div>
          </div>
        );
       case 'storm':
        return (
          <div className="relative h-12 w-12 text-[var(--theme-primary)] glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-9 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-300 animate-[pulse_0.5s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
          </div>
        );
    case 'snow':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--theme-primary)] glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2m-4 4L6.343 6.343M6.343 17.657 8 16m8-9.657L17.657 8M16 16l1.657 1.657M2 12h2m16 0h-2m-8 4v2m0-16v2m-4 4h2m12 0h-2" />
            </svg>
        );
    case 'wind':
        return (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--theme-primary)] glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 12h14M5 16h14" />
             </svg>
        );
    case 'fog':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--theme-primary)] glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M3 18h18" />
            </svg>
        );
      default:
        return null;
    }
  };

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onFetchWeather }) => {
    const [locationInput, setLocationInput] = useState('New Delhi, India');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeatherForLocation = useCallback(async (loc: string) => {
        if (!loc.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await onFetchWeather(loc);
            setWeather(data);
        } catch (e) {
            setError('Could not fetch weather data.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [onFetchWeather]);

    useEffect(() => {
        // Using a function and not passing it as dependency to avoid re-running on every render
        const initialFetch = () => {
            fetchWeatherForLocation('New Delhi, India');
        };
        initialFetch();
    }, [fetchWeatherForLocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWeatherForLocation(locationInput);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-10 h-10 border-2 border-dashed border-[var(--theme-primary)] rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm">Fetching weather...</p>
                </div>
            );
        }
        if (error) {
            return <p className="text-red-500 text-center">{error}</p>;
        }
        if (weather) {
            return (
                <div className="flex flex-col items-center justify-center text-white/90 text-center">
                    <WeatherIcon condition={weather.condition} />
                    <p className="mt-2 text-2xl font-bold text-glow">{Math.round(weather.temperatureCelsius)}°C</p>
                    <p className="text-sm">{weather.condition}</p>
                    <p className="text-xs opacity-70 mt-1 truncate max-w-full px-2">{weather.location}</p>
                </div>
            );
        }
        return <p className="text-sm text-white/50">Enter a location to begin.</p>;
    };

    return (
        <div className="w-full h-full flex flex-col justify-between">
            <div className="flex-grow flex items-center justify-center overflow-hidden">
                {renderContent()}
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0 flex gap-2 mt-2">
                <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter a city..."
                    className="flex-grow bg-slate-800/50 border-b-2 border-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] text-white/90 px-2 py-1 outline-none transition-colors text-sm"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-1 bg-[var(--theme-secondary)]/80 text-white rounded-md hover:bg-[var(--theme-secondary)] text-sm disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    Get
                </button>
            </form>
        </div>
    );
};
