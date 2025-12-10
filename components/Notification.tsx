import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose, duration = 5000 }) => {
    const [exiting, setExiting] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onClose, 500); // allow for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`w-64 p-3 bg-slate-800/80 border border-[var(--theme-primary)] rounded-lg shadow-lg backdrop-blur-sm text-white/90 notification-enter ${exiting ? 'animate-[fadeOut_0.5s_ease-out_forwards]' : ''}`}
        >
            <div className="flex items-start gap-2">
                <div className="text-[var(--theme-primary)] mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-sm">{message}</p>
                <button onClick={onClose} className="ml-auto text-lg leading-none">&times;</button>
            </div>
        </div>
    );
};
