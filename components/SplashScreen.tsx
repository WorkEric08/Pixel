
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(0);
  const [systemText, setSystemText] = useState('Kernel Initializing...');

  useEffect(() => {
    // Ciclo de carregamento progressivo
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 20);

    // Textos de carregamento para imersão
    const texts = [
      'Kernel Initializing...',
      'Mapping Pixel Coords...',
      'Loading Local DB...',
      'Syncing Time Flux...',
      'Optimizing Grid...',
      'Ready to Track.'
    ];
    let textIdx = 0;
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % texts.length;
      setSystemText(texts[textIdx]);
    }, 450);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2600);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      onComplete();
    }, 3200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#020617] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isVisible ? 'opacity-100' : 'opacity-0 scale-110 blur-2xl'
      }`}
    >
      {/* Background Decorativo - Centro Radiante */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
      
      {/* Grade de fundo estática para textura */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Pixel Central */}
        <div className="relative mb-16">
          <div className="w-24 h-24 bg-[#012b2a] border border-emerald-500/20 rounded-[2rem] flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 100 100" className="w-12 h-12">
              <rect x="15" y="40" width="18" height="18" rx="4" fill="#12b886"/>
              <rect x="42" y="40" width="18" height="18" rx="4" fill="#12b886"/>
              <path d="M70 40 L88 49 L70 58 Z" fill="#12b886"/>
            </svg>
          </div>
          {/* Anéis orbitais */}
          <div className="absolute -inset-6 border border-emerald-500/10 rounded-full animate-ping opacity-20"></div>
          <div className="absolute -inset-10 border border-emerald-500/5 rounded-full animate-spin-slow opacity-10"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-black tracking-[-0.1em] text-white flex items-center gap-1 uppercase">
             PIXEL<span className="text-emerald-500">LINE</span>
          </h1>
          <div className="flex flex-col items-center gap-4">
             <div className="h-0.5 w-12 bg-emerald-500/40 rounded-full"></div>
             <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-[0.5em] animate-pulse">
               {systemText}
             </p>
          </div>
        </div>

        {/* Loader Segmentado Moderno */}
        <div className="mt-12 flex items-center gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-[2px] transition-all duration-300 ${
                progress > (i * 8.3) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
