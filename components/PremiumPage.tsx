
import React, { useState, useEffect } from 'react';
import { VIXION_LOGO_SVG } from '../constants';

interface PremiumPageProps {
  onBack: () => void;
  onSetOwnerMode: (isOwner: boolean) => void;
  onUpgradeToPrime: () => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ onBack, onSetOwnerMode, onUpgradeToPrime }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isOwnerMode, setIsOwnerMode] = useState(false);

  // Configuration for Payment
  const PAYMENT_ACCOUNT = "chiragsu45@gmail.com"; 
  const PAYEE_NAME = "Vixion Premium";
  const AMOUNT = "50";
  
  // Construct Payment Data (Simulating a Google Play Deep Link or Identifier)
  const paymentData = `googleplay://pay?id=${PAYMENT_ACCOUNT}&amt=${AMOUNT}`;
  
  // Generate QR Code URL using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData)}`;

  useEffect(() => {
    if (accessCode === 't6yr7r7yyd') {
        setIsOwnerMode(true);
        onSetOwnerMode(true);
    } else {
        setIsOwnerMode(false);
    }
  }, [accessCode, onSetOwnerMode]);
  
  const handlePaymentSuccess = () => {
      // Simulation of payment success
      onUpgradeToPrime();
      setShowPayment(false);
      onBack();
  }

  if (isOwnerMode) {
      return (
        <div className="w-screen h-screen bg-black overflow-hidden font-mono flex items-center justify-center relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#b91c1c_0%,_transparent_70%)] opacity-20 animate-pulse"></div>
             <div className="scanline-overlay"></div>
             <div className="relative z-10 w-full max-w-5xl p-8 border-2 border-red-600 bg-black/90 backdrop-blur-md rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center">
                 <div className="absolute top-0 left-0 bg-red-600 text-black font-bold px-4 py-1 text-sm">KERNEL ACCESS: GRANTED</div>
                 <div className="absolute top-0 right-0 bg-red-600 text-black font-bold px-4 py-1 text-sm">LEVEL: OMEGA</div>
                 
                 <div className="w-32 h-32 mb-6 text-red-500 animate-[spin_10s_linear_infinite]" dangerouslySetInnerHTML={{ __html: VIXION_LOGO_SVG }} />
                 
                 <h1 className="text-6xl font-black text-red-500 mb-2 tracking-tighter uppercase glitch-text" style={{ textShadow: '0 0 20px red' }}>Owner System</h1>
                 <p className="text-xl text-red-300 mb-12 tracking-[0.5em] uppercase border-b border-red-500/50 pb-4">Protocol Override Active</p>
                 
                 <div className="grid grid-cols-3 gap-6 w-full mb-12">
                     <div className="border border-red-500/30 bg-red-900/10 p-4 rounded text-center">
                         <h3 className="text-red-400 text-xs font-bold mb-2">SUBSCRIPTION</h3>
                         <p className="text-2xl text-white font-bold">INFINITE</p>
                     </div>
                     <div className="border border-red-500/30 bg-red-900/10 p-4 rounded text-center">
                         <h3 className="text-red-400 text-xs font-bold mb-2">NEURAL LIMITS</h3>
                         <p className="text-2xl text-white font-bold">REMOVED</p>
                     </div>
                     <div className="border border-red-500/30 bg-red-900/10 p-4 rounded text-center">
                         <h3 className="text-red-400 text-xs font-bold mb-2">GOD MODE</h3>
                         <p className="text-2xl text-white font-bold">ACTIVE</p>
                     </div>
                 </div>
                 
                 <div className="w-full bg-slate-900 border border-red-500/30 p-4 rounded mb-8 h-40 overflow-y-auto font-mono text-xs text-red-400 scrollbar-thin">
                     <p>> Initializing Owner Protocol...</p>
                     <p>> Bypassing Payment Gateway... SUCCESS</p>
                     <p>> Unlocking Neural Pathways... SUCCESS</p>
                     <p>> Connecting to Core Database... SUCCESS</p>
                     <p>> Welcome back, Creator.</p>
                     <p className="animate-pulse">> Awaiting command_</p>
                 </div>

                 <button onClick={onBack} className="px-12 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                     Return to Interface
                 </button>
                 
                 <button onClick={() => { setAccessCode(''); onSetOwnerMode(false); }} className="mt-4 text-red-800 hover:text-red-500 text-xs uppercase">
                     Lock System
                 </button>
             </div>
        </div>
      )
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-mono flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--theme-secondary)_0%,_transparent_70%)] opacity-20 animate-pulse"></div>
        <div className="scanline-overlay"></div>
        
        {/* Payment Modal */}
        {showPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-sm w-full relative shadow-[0_0_50px_rgba(0,186,242,0.4)] border-t-4 border-[#34A853]">
                     <button 
                        onClick={() => setShowPayment(false)} 
                        className="absolute top-3 right-4 text-slate-400 hover:text-slate-900 font-bold text-2xl"
                    >
                        &times;
                    </button>
                     
                     <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
                                <path fill="#4285F4" d="M14.07 12.02l-6.1-6.42a1.04 1.04 0 0 0-.08-.07c-.1-.08-.23-.13-.37-.13-.39 0-.7.31-.7.7v11.8c0 .39.31.7.7.7.14 0 .27-.05.37-.13.03-.02.05-.05.08-.07l6.1-6.42z"/>
                                <path fill="#34A853" d="M18.82 9.54l-3.34 3.52-1.41-1.48 4.75-5.01c.21-.21.49-.28.74-.21-.1-.13-.24-.22-.4-.22H4.49l7.74 8.16 6.59-4.76z"/>
                                <path fill="#EA4335" d="M18.82 14.5l-6.59-4.76-7.74 8.16h14.7c.16 0 .3-.09.4-.22-.25.07-.53 0-.74-.21l-4.75-5.01 1.41-1.48 3.34 3.52z"/>
                                <path fill="#FBBC04" d="M12.23 13.06l-7.74 8.16v-18.44l7.74 8.16 1.41 1.48-1.41 0.64z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1 text-slate-800">Google Play Store</h2>
                        <div className="text-center mb-4">
                            <p className="text-slate-500 text-xs uppercase tracking-wide">Pay To</p>
                            <p className="text-base font-bold text-slate-800 bg-slate-100 px-4 py-1 rounded-full border border-slate-200 inline-block">
                                {PAYMENT_ACCOUNT}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner mb-6 relative group">
                            <img 
                                src={qrCodeUrl} 
                                alt="Payment QR Code" 
                                className="w-48 h-48 object-contain mix-blend-multiply"
                            />
                             <div className="absolute inset-0 bg-white/95 flex items-center justify-center text-center p-4 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold border-2 border-green-500 rounded-lg">
                                VERIFIED MERCHANT: Google Play
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-4xl font-extrabold text-slate-800">₹{AMOUNT}</p>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                             <a 
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="w-full py-3 bg-[#34A853] hover:bg-[#2d9147] text-white font-bold rounded-xl text-center transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Pay via Play Store</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                            <button
                                onClick={handlePaymentSuccess}
                                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-xl font-bold"
                            >
                                (Simulate Payment Success)
                            </button>
                        </div>
                        
                        <p className="mt-4 text-[10px] text-slate-400 text-center">
                            Secure payment via Google Play Services to {PAYMENT_ACCOUNT}
                        </p>
                     </div>
                </div>
            </div>
        )}
        
        <div className={`relative z-10 max-w-4xl w-full p-8 flex flex-col items-center transition-all duration-300 ${showPayment ? 'blur-sm scale-95 opacity-50 pointer-events-none' : ''}`}>
            <div className="w-24 h-24 mb-8 text-[var(--theme-primary)] animate-bounce" dangerouslySetInnerHTML={{ __html: VIXION_LOGO_SVG }} />
            
            <h1 className="text-6xl font-bold text-white mb-2 text-glow tracking-tighter">VIXION <span className="text-[var(--theme-primary)]">PRIME</span></h1>
            <p className="text-xl text-slate-400 mb-12 tracking-widest uppercase">Upgrade your intelligence</p>
            
            <div className="grid md:grid-cols-2 gap-8 w-full">
                {/* Free Tier */}
                <div className="p-8 rounded-2xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                    <h2 className="text-2xl text-slate-300 font-bold mb-4">Core</h2>
                    <p className="text-4xl text-white font-bold mb-6">Free</p>
                    <ul className="text-slate-400 space-y-3 mb-8 text-center text-sm">
                        <li>Standard Response Time</li>
                        <li>Basic Holographic Widgets</li>
                        <li>1 Image Generation / 24h</li>
                        <li>1 Hour Talk Time / 24h</li>
                    </ul>
                    <button onClick={onBack} className="mt-auto px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all w-full">
                        Current Plan
                    </button>
                </div>

                {/* Premium Tier */}
                <div className="p-8 rounded-2xl border-2 border-[var(--theme-primary)] bg-slate-900/80 backdrop-blur-md flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-[var(--theme-primary)] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                    <div className="absolute inset-0 bg-[var(--theme-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <h2 className="text-2xl text-[var(--theme-primary)] font-bold mb-4 text-glow">Prime</h2>
                    <div className="flex items-baseline mb-6">
                        <span className="text-5xl text-white font-bold text-glow">₹{AMOUNT}</span>
                        <span className="text-slate-400 ml-2">/ month</span>
                    </div>
                    
                    <ul className="text-white space-y-4 mb-8 text-center text-sm">
                        <li className="flex items-center gap-2 justify-center"><span className="text-[var(--theme-primary)]">✓</span> 5 Hours Talk Time / 3h</li>
                         <li className="flex items-center gap-2 justify-center"><span className="text-[var(--theme-primary)]">✓</span> 5 Image Generations / 3h</li>
                        <li className="flex items-center gap-2 justify-center"><span className="text-[var(--theme-primary)]">✓</span> Exclusive Cyberpunk Themes</li>
                        <li className="flex items-center gap-2 justify-center"><span className="text-[var(--theme-primary)]">✓</span> Priority Neural Processing</li>
                    </ul>
                    
                    <button 
                        onClick={() => setShowPayment(true)}
                        className="mt-auto px-8 py-3 rounded-lg bg-[var(--theme-primary)] text-black font-bold hover:bg-[var(--theme-secondary)] hover:text-white transition-all w-full shadow-[0_0_20px_var(--theme-primary)] hover:shadow-[0_0_30px_var(--theme-primary)]"
                    >
                        Initialize Upgrade
                    </button>
                </div>
            </div>

            <button onClick={onBack} className="mt-12 text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Return to Interface
            </button>
            
            {/* Hidden Owner Access Input - Made slightly more visible for user */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input 
                    type="password" 
                    placeholder="System Access"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="bg-transparent border-b border-slate-700 focus:border-white outline-none text-xs text-white w-24 focus:w-40 transition-all text-center placeholder-slate-600"
                />
            </div>
        </div>
    </div>
  );
};
