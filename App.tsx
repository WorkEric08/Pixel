
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { EventItem, CustomColors, MoodConfig } from './types';
import { 
  getDaysBetween, 
  getWorkingDaysBetween, 
  formatDateLong, 
  startOfDay,
  formatDateShort,
  getDateKey
} from './utils/dateUtils';
import StatsCards from './components/StatsCards';
import TimelineGrid from './components/TimelineGrid';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import EventModal from './components/EventModal';
import ColorPickerModal from './components/ColorPickerModal';
import DayDetailModal from './components/DayDetailModal';

const App: React.FC = () => {
  const STORAGE_KEY = 'pixel_line_pro_state_v17';
  const THEME_KEY = 'pixel_line_pro_theme';

  const defaultColors: CustomColors = {
    past: '#0b3b26',
    future: '#063b5a',
    weekend: '#4b2a2a',
    today: '#22c55e',
    target: '#f97316', 
    event: '#8b5cf6',
    special: '#ffffff'
  };

  const [isAppReady, setIsAppReady] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'period' | 'event'>('home');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userBio, setUserBio] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [customColors, setCustomColors] = useState<CustomColors>(defaultColors);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  const [pixelSize, setPixelSize] = useState<number>(14);
  const [showDates, setShowDates] = useState<boolean>(false);
  const [isCalendarView, setIsCalendarView] = useState<boolean>(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);
  
  const visualSettingsRef = useRef<HTMLDivElement>(null);

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isEventsMinimized, setIsEventsMinimized] = useState(false);
  const [isLegendsMinimized, setIsLegendsMinimized] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<Date | null>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstallSuccess, setShowPWAInstallSuccess] = useState(false);
  const [showBrowserTip, setShowBrowserTip] = useState(false);
  
  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const [colorPickerConfig, setColorPickerConfig] = useState<{ 
    isOpen: boolean; 
    target: { type: 'global'; key: string } | null; 
    label: string;
    initialColor: string;
  }>({
    isOpen: false,
    target: null,
    label: '',
    initialColor: '#000'
  });

  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserName(parsed.userName || '');
        setUserEmail(parsed.userEmail || '');
        setUserBio(parsed.userBio || '');
        setStartDate(new Date(parsed.startDate));
        setTargetDate(parsed.targetDate ? new Date(parsed.targetDate) : null);
        setEvents(parsed.events || []);
        setNotes(parsed.notes || {});
        setImages(parsed.images || {});
        if (parsed.customColors) {
          setCustomColors({ ...defaultColors, ...parsed.customColors });
        }
        if (parsed.pixelSize) setPixelSize(parsed.pixelSize);
        if (parsed.showDates !== undefined) setShowDates(parsed.showDates);
        if (parsed.isCalendarView !== undefined) setIsCalendarView(parsed.isCalendarView);
        if (parsed.isLegendsMinimized !== undefined) setIsLegendsMinimized(parsed.isLegendsMinimized);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    } else {
      setIsFirstRun(true);
      setStartDate(startOfDay(new Date()));
      setTimeout(() => {
        setIsSettingsOpen(true);
      }, 3500);
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light');
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPWAInstallSuccess(true);
      setTimeout(() => setShowPWAInstallSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detecção de compatibilidade de navegador para PWA
    const ua = navigator.userAgent;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!standaloneMode);
    
    if (isMobileDevice && !standaloneMode) {
      const isChrome = /Chrome/.test(ua) || /CriOS/.test(ua);
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
      if (!isChrome && !isSafari) {
        setShowBrowserTip(true);
      }
    }

    // Prevenção de pull-to-refresh via JavaScript (PWA mode)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = document.getElementById('root')?.scrollTop || 0;
      // Se estiver no topo e puxando para baixo, prevenir refresh
      if (scrollTop <= 0 && touchY > touchStartY) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);



  useEffect(() => {
    const stateToSave = {
      userName,
      userEmail,
      userBio,
      startDate: startDate.toISOString(),
      targetDate: targetDate ? targetDate.toISOString() : null,
      events,
      notes,
      images,
      customColors,
      pixelSize,
      showDates,
      isCalendarView,
      isLegendsMinimized
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--pixel-${key}`, value as string);
      if (typeof value === 'string' && value.startsWith('#')) {
        const glowColor = `${value}99`; 
        document.documentElement.style.setProperty(`--pixel-${key}-glow`, glowColor);
      }
    });
  }, [userName, userEmail, userBio, startDate, targetDate, events, customColors, notes, images, pixelSize, showDates, isCalendarView, isLegendsMinimized]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visualSettingsRef.current && !visualSettingsRef.current.contains(event.target as Node)) {
        setIsVisualSettingsOpen(false);
      }
    };

    if (isVisualSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisualSettingsOpen]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  const effectiveTargetDate = useMemo(() => {
    if (activeEventId) {
      const ev = events.find(e => e.id === activeEventId);
      if (ev) return startOfDay(new Date(ev.date));
    }
    return targetDate ? startOfDay(targetDate) : null;
  }, [activeEventId, events, targetDate]);

  const totalDaysRemaining = useMemo(() => {
    if (!effectiveTargetDate) return 0;
    const diff = getDaysBetween(new Date(), effectiveTargetDate);
    return Math.max(0, diff);
  }, [effectiveTargetDate]);

  const workingDays = useMemo(() => {
    if (!effectiveTargetDate) return 0;
    const currentToday = new Date();
    if (effectiveTargetDate <= currentToday) return 0;
    return getWorkingDaysBetween(currentToday, effectiveTargetDate);
  }, [effectiveTargetDate]);

  const weeks = Math.floor(totalDaysRemaining / 7);

  const progressPercent = useMemo(() => {
    if (!targetDate) return 0;
    const total = getDaysBetween(startDate, targetDate);
    const passed = getDaysBetween(startDate, today);
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((passed / total) * 100)));
  }, [startDate, targetDate, today]);

  const handleAddEvent = (name: string, date: string) => {
    const newEvent: EventItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      date
    };
    setEvents(prev => [...prev, newEvent]);
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEventId === id) setActiveEventId(null);
  };

  const handleSaveNote = (dateKey: string, note: string) => {
    setNotes(prev => ({ ...prev, [dateKey]: note }));
  };

  const handleSaveImages = (dateKey: string, imgs: string[]) => {
    setImages(prev => ({ ...prev, [dateKey]: imgs }));
  };

  const handleClearDay = (dateKey: string) => {
    setNotes(prev => {
      const n = { ...prev };
      delete n[dateKey];
      return n;
    });
    setImages(prev => {
      const i = { ...prev };
      delete i[dateKey];
      return i;
    });
  };

  const handleOpenColorPicker = (type: keyof CustomColors, label: string) => {
    setColorPickerConfig({ 
      isOpen: true, 
      target: { type: 'global', key: type }, 
      label, 
      initialColor: customColors[type] 
    });
  };

  const handleColorPickerSave = (color: string) => {
    if (!colorPickerConfig.target) return;
    if (colorPickerConfig.target.type === 'global') {
      const key = colorPickerConfig.target.key as keyof CustomColors;
      setCustomColors(prev => ({ ...prev, [key]: color }));
    }
    setColorPickerConfig(prev => ({ ...prev, isOpen: false, target: null }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newEvents = [...events];
    const draggedItem = newEvents[draggedItemIndex];
    newEvents.splice(draggedItemIndex, 1);
    newEvents.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    setEvents(newEvents);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  // Se não está pronto, mostrar vazio (splash híbrido rodando no HTML)
  if (!isAppReady) {
    return null;
  }

  return (
    <>
      <div className={`max-w-4xl mx-auto p-4 md:p-8 ${isMobile && !isSettingsOpen && !isEventModalOpen ? 'pb-36' : 'pb-8'} flex flex-col gap-6 min-h-screen transition-all duration-1000 opacity-100`}>
        <header className="relative flex items-center justify-between bg-[var(--header-bg)] p-2 md:p-3 rounded-2xl border border-[var(--secondary)] border-opacity-20 backdrop-blur-2xl shadow-xl">
          {/* Esquerda: Logo */}
          <div className="flex items-center gap-2 pl-1 z-10">
            <div className="relative w-9 h-9 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 rounded-lg overflow-hidden border border-white/5">
               <img src="/logo.png" alt="Logo Pixel Line" className="w-full h-full object-contain drop-shadow-lg rounded-lg" />
            </div>
            <h1 className="text-base md:text-lg font-black tracking-[-0.05em] text-[var(--text)] uppercase leading-none">
               PIXEL<span className="text-emerald-500">LINE</span>
            </h1>
          </div>
          
          {/* Direita: Perfil e Tema */}
          <div className="flex items-center gap-3 z-10">
            {userName && (
              <div className="flex items-center gap-3 py-1 px-4 pr-1 rounded-full bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-md group hover:border-emerald-500/30 transition-all duration-300">
                <span className="text-[10px] md:text-xs font-black text-[var(--text)] uppercase tracking-[0.15em] opacity-90 group-hover:opacity-100 transition-opacity truncate max-w-[80px] md:max-w-[120px] inline-block">
                  {userName}
                </span>
                
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="relative flex items-center justify-center"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black relative z-10 border-2 border-[var(--frame)] group-hover:scale-110 transition-transform shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-emerald-500/40 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            )}

            <button 
              onClick={toggleTheme} 
              className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[var(--frame)] border border-[var(--secondary)] border-opacity-20 text-[var(--secondary)] hover:text-emerald-500 transition-all group overflow-hidden shadow-md active:scale-90"
            >
              <div className="w-4 h-4 flex items-center justify-center relative">
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${isDarkMode ? 'translate-y-0 opacity-100 rotate-0 scale-100' : 'translate-y-6 opacity-0 -rotate-45 scale-50'}`}>
                  <svg className="w-full h-full text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${!isDarkMode ? 'translate-y-0 opacity-100 rotate-0 scale-100' : '-translate-y-6 opacity-0 rotate-45 scale-50'}`}>
                  <svg className="w-full h-full text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Navegação Mobile / Desktop */}
        {!isMobile ? (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-slate-950 p-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
              Alterar Período
            </button>
            <button onClick={() => setIsEventModalOpen(true)} className="group relative overflow-hidden bg-violet-500 hover:bg-violet-400 text-white p-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Novo Evento
            </button>
          </div>
        ) : (
          !isSettingsOpen && !isEventModalOpen && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/98 backdrop-blur-xl border-t border-white/5 z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] after:content-[''] after:absolute after:top-full after:left-0 after:right-0 after:h-[400px] after:bg-[#0a0a0c]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 10px))', paddingTop: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
              <div className={`grid ${deferredPrompt ? 'grid-cols-4' : 'grid-cols-3'} gap-2 max-w-4xl mx-auto`}>
                {/* Home */}
                <button 
                  onClick={() => {
                    setActiveTab('home');
                    setActiveEventId(null);
                    if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 font-extrabold active:scale-95 ${
                    activeTab === 'home' 
                      ? 'bg-[#1a2332] text-[#22c55e] shadow-lg shadow-black/20' 
                      : 'bg-[#1e293b]/70 text-[#94a3b8] hover:bg-[#1e293b]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                  <span className="text-[8px] uppercase tracking-wider">Início</span>
                </button>

                {/* Alterar Período */}
                <button 
                  onClick={() => {
                    setActiveTab('period');
                    if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
                    setIsSettingsOpen(true);
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 font-extrabold active:scale-95 text-slate-950 ${
                    activeTab === 'period'
                      ? 'bg-[#0f7652] shadow-lg shadow-black/20 text-[#f8fafc]'
                      : 'bg-[#0f7652]/90 hover:bg-[#0f7652] text-[#f8fafc]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
                  <span className="text-[8px] uppercase tracking-wider">Período</span>
                </button>

                {/* Novo Evento */}
                <button 
                  onClick={() => {
                    setActiveTab('event');
                    if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
                    setIsEventModalOpen(true);
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 font-extrabold active:scale-95 text-white ${
                    activeTab === 'event'
                      ? 'bg-[#6d28d9] shadow-lg shadow-black/20'
                      : 'bg-[#6d28d9]/90 hover:bg-[#6d28d9]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  <span className="text-[8px] uppercase tracking-wider">Novo</span>
                </button>

                {/* Instalar App (PWA) */}
                {deferredPrompt && (
                  <button 
                    onClick={() => {
                      if (typeof navigator.vibrate === 'function') navigator.vibrate(15);
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choice: any) => {
                        if (choice.outcome === 'accepted') setDeferredPrompt(null);
                      });
                    }}
                    className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 font-extrabold active:scale-95 text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-lg shadow-black/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span className="text-[8px] uppercase tracking-wider">Instalar</span>
                  </button>
                )}
              </div>
            </div>
          )
        )}

        <div className="bg-[var(--header-bg)] backdrop-blur-2xl rounded-xl p-5 border border-[var(--secondary)] border-opacity-20 shadow-xl transition-all min-h-[150px] flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col">
            <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">{activeEventId ? 'Marcos do Evento' : 'Objetivo Principal'}</h3>
            <div className="flex items-center justify-between gap-4">
               <span className="text-xl md:text-3xl font-black tracking-tight leading-none text-[var(--text)]">
                 {activeEventId ? events.find(e => e.id === activeEventId)?.name : (targetDate ? formatDateLong(targetDate) : 'Sua jornada pixelada')}
               </span>
               <div className="bg-[var(--bg)] bg-opacity-80 px-4 py-2 rounded-lg border border-[var(--secondary)] border-opacity-20 text-[var(--secondary)] font-black text-[10px] uppercase tracking-[0.2em] shadow-inner whitespace-nowrap">
                 {effectiveTargetDate ? formatDateShort(effectiveTargetDate) : '--/--/----'}
               </div>
            </div>
          </div>
          
          <div className="mt-4 mb-4 min-h-[35px] flex flex-col justify-end">
            {!activeEventId ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-[var(--secondary)] uppercase tracking-[0.2em]">Fluxo de Conclusão</span>
                  <span className="text-xs font-black text-emerald-500">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-900/50 rounded-full border border-white/5 overflow-hidden p-[2.5px]">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-40 py-2">
                <div className="w-full h-[1px] bg-[var(--secondary)]"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] whitespace-nowrap text-[var(--secondary)]">Filtro Ativo</span>
                <div className="w-full h-[1px] bg-[var(--secondary)]"></div>
              </div>
            )}
          </div>
          
          <StatsCards totalDays={totalDaysRemaining} workingDays={workingDays} weeks={weeks} />
        </div>

        {/* Lista de Eventos com Suporte a Drag and Drop */}
        <div className="bg-[var(--header-bg)] backdrop-blur-2xl rounded-xl p-5 border border-[var(--secondary)] border-opacity-20 shadow-xl transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-violet-400 font-black text-[9px] uppercase tracking-[0.2em]">Meus Eventos</h3>
              <span className="bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full text-[9px] font-black">{events.length}</span>
            </div>
            {events.length > 0 && (
              <button 
                onClick={() => setIsEventsMinimized(!isEventsMinimized)}
                className="p-1.5 rounded-lg hover:bg-violet-500/10 text-[var(--secondary)] hover:text-violet-400 transition-all"
              >
                <svg className={`w-4 h-4 transition-transform duration-300 ${isEventsMinimized ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all duration-500 ease-in-out ${isEventsMinimized ? 'max-h-0 opacity-0 pt-0' : 'max-h-[500px] opacity-100 pt-3'}`}>
            {events.length === 0 && <p className="col-span-2 text-[var(--secondary)] text-[10px] italic text-center py-4 opacity-60">Nenhum evento registrado.</p>}
            {events.map((event, index) => {
              const evDate = new Date(event.date);
              const daysRemaining = Math.max(0, getDaysBetween(new Date(), evDate));
              const wks = Math.floor(daysRemaining / 7);
              const isActive = activeEventId === event.id;
              const isDragging = draggedItemIndex === index;

              return (
                <div 
                  key={event.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveEventId(isActive ? null : event.id)}
                  className={`
                    flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-300
                    ${isActive ? 'border-violet-400 bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-[var(--bg)] bg-opacity-50 border-[var(--secondary)] border-opacity-10 hover:border-violet-500/50'}
                    ${isDragging ? 'opacity-30 scale-95 border-violet-500 border-dashed' : 'opacity-100'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className={`font-black text-xs ${isActive ? 'text-white' : 'text-[var(--text)]'}`}>{event.name}</span>
                      <span className={`text-[9px] font-bold ${isActive ? 'text-white/70' : 'text-[var(--secondary)]'}`}>{formatDateShort(evDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-[9px] px-2 py-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-violet-500/10 text-violet-400'}`}>
                      {wks > 0 ? `${wks} SEM` : `${daysRemaining} DIAS`}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className={`p-1.5 rounded-lg ${isActive ? 'text-white hover:bg-white/10' : 'text-red-500 hover:bg-red-500/10'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative bg-[var(--bg)] bg-opacity-40 rounded-xl p-3 md:p-6 border border-[var(--secondary)] border-opacity-10 flex flex-col gap-4 flex-1 min-h-[450px] transition-all duration-500">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em]">Jornada Pixelada</h3>
            <div className="relative" ref={visualSettingsRef}>
              <button 
                onClick={() => setIsVisualSettingsOpen(!isVisualSettingsOpen)}
                className={`p-2 rounded-lg transition-all duration-300 border border-transparent ${isVisualSettingsOpen ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-[var(--frame)] text-[var(--secondary)] hover:border-emerald-500/30'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>

              {isVisualSettingsOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-[var(--frame)] border border-[var(--secondary)] border-opacity-30 rounded-2xl shadow-2xl p-6 z-[90] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Ajustes de Visão</span>
                      <button onClick={() => setIsVisualSettingsOpen(false)} className="text-[var(--secondary)] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--secondary)] text-center">Escala dos Pixels</label>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-[var(--secondary)] font-black opacity-40">MIN</span>
                        <input 
                          type="range" min="8" max="24" value={pixelSize} 
                          onChange={(e) => setPixelSize(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-[var(--container)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-[9px] text-[var(--secondary)] font-black opacity-40">MAX</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => setShowDates(!showDates)}
                        className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${showDates ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/10' : 'bg-[var(--bg)] text-[var(--secondary)] border-[var(--secondary)] border-opacity-10 hover:border-emerald-500'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {showDates ? 'Ocultar Números' : 'Mostrar Números'}
                      </button>

                      <button 
                        onClick={() => setIsCalendarView(!isCalendarView)}
                        className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isCalendarView ? 'bg-violet-500 text-white border-violet-400 shadow-md shadow-violet-500/10' : 'bg-[var(--bg)] text-[var(--secondary)] border-[var(--secondary)] border-opacity-10 hover:border-violet-500'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        {isCalendarView ? 'Modo Calendário' : 'Modo Fluxo'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-4">
            {targetDate ? (
              <TimelineGrid 
                startDate={startDate} 
                targetDate={effectiveTargetDate!} 
                globalTargetDate={targetDate} 
                events={events} 
                notes={notes} 
                images={images}
                onOpenDetail={(date) => setDetailDate(date)}
                onDeleteEvent={handleDeleteEvent} 
                pixelSize={pixelSize}
                showDates={showDates}
                isCalendarView={isCalendarView}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-[var(--frame)] rounded-[2.5rem] flex items-center justify-center text-[var(--secondary)] border-2 border-dashed border-[var(--secondary)] border-opacity-30 group-hover:border-emerald-500/50 transition-all duration-500 group-hover:rotate-6 shadow-sm">
                    <svg className="w-12 h-12 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="absolute -inset-4 bg-emerald-500/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sua jornada começa agora</h3>
                  <p className="text-[11px] text-[var(--secondary)] font-medium max-w-[280px] mx-auto uppercase tracking-widest leading-relaxed opacity-60">Escolha um objetivo ou uma data especial para visualizar seu progresso em pixels.</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-[0_15px_35px_rgba(16,185,129,0.25)] active:scale-95 transition-all hover:bg-emerald-500"
                >
                  Configurar meu Objetivo
                </button>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-[var(--secondary)] border-opacity-10">
              <div className="flex items-center justify-between mb-8 px-1">
                <span className="text-[9px] font-black text-[var(--secondary)] uppercase tracking-[0.2em]">Legenda Cromática</span>
                <button 
                  onClick={() => setIsLegendsMinimized(!isLegendsMinimized)}
                  className="p-1 rounded-lg hover:bg-slate-500/10 text-[var(--secondary)] transition-all"
                >
                  <svg className={`w-3 h-3 transition-transform duration-300 ${isLegendsMinimized ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLegendsMinimized ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                <div className="flex gap-4 md:gap-12 relative items-stretch px-1">
                  <div className="flex-1 flex flex-col gap-4">
                    <LegendItem label="Passado" type="past" color={customColors.past} onOpen={handleOpenColorPicker} />
                    <LegendItem label="Fim de Semana" type="weekend" color={customColors.weekend} onOpen={handleOpenColorPicker} />
                    <LegendItem label="Alvo" type="target" color={customColors.target} onOpen={handleOpenColorPicker} />
                    <LegendItem label="Observação" type="special" color={customColors.special} onOpen={handleOpenColorPicker} />
                  </div>
                  <div className="w-[1px] bg-[var(--secondary)] opacity-10 self-stretch"></div>
                  <div className="flex-1 flex flex-col gap-4">
                    <LegendItem label="Futuro" type="future" color={customColors.future} onOpen={handleOpenColorPicker} />
                    <LegendItem label="Hoje" type="today" color={customColors.today} onOpen={handleOpenColorPicker} />
                    <LegendItem label="Evento" type="event" color={customColors.event} onOpen={handleOpenColorPicker} />
                    <div className="flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-[var(--secondary)] text-[8px] font-black uppercase tracking-[0.3em] pb-8 opacity-60">Pixel line • Pixel Tracker</footer>

        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          name={userName} 
          email={userEmail}
          bio={userBio}
          onSave={(n, e, b) => { 
            setUserName(n); 
            setUserEmail(e);
            setUserBio(b);
            setIsProfileOpen(false); 
          }} 
        />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          startDate={startDate} 
          targetDate={targetDate || new Date()} 
          onSave={(s, t) => { setStartDate(s); setTargetDate(t); setIsSettingsOpen(false); }}
          isFirstRun={isFirstRun}
        />
        <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleAddEvent} />
        
        <ColorPickerModal 
          isOpen={colorPickerConfig.isOpen} 
          label={colorPickerConfig.label} 
          currentColor={colorPickerConfig.initialColor} 
          onClose={() => setColorPickerConfig(prev => ({ ...prev, isOpen: false }))} 
          onSave={handleColorPickerSave} 
        />
        
        {detailDate && (
          <DayDetailModal 
            isOpen={!!detailDate}
            date={detailDate}
            onClose={() => setDetailDate(null)}
            note={notes[getDateKey(detailDate)] || ""}
            images={images[getDateKey(detailDate)] || []}
            onSaveNote={(note) => handleSaveNote(getDateKey(detailDate), note)}
            onSaveImages={(imgs) => handleSaveImages(getDateKey(detailDate), imgs)}
            onClearDay={() => handleClearDay(getDateKey(detailDate))}
          />
        )}

        {/* Notificação de PWA Instalado com Sucesso */}
        {showPWAInstallSuccess && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-10 duration-500 uppercase tracking-widest text-[10px] flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            App Instalado com Sucesso!
          </div>
        )}

        {/* Dica de Navegador para PWA */}
        {showBrowserTip && (
          <div className="fixed bottom-32 left-4 right-4 z-[50] bg-slate-900 border border-blue-500/30 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-start gap-3">
               <div className="bg-blue-500/20 p-2 rounded-lg">
                 <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
               </div>
               <div className="flex-1">
                 <h4 className="text-[10px] font-black uppercase tracking-tight text-white mb-1">Dica de Instalação</h4>
                 <p className="text-[9px] text-[var(--secondary)] font-medium leading-relaxed">Para uma melhor experiência e para instalar o app, recomendamos abrir o site no **Google Chrome** ou **Safari**.</p>
               </div>
               <button onClick={() => setShowBrowserTip(false)} className="text-[var(--secondary)] hover:text-white">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
               </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

const LegendItem = ({ label, type, color, onOpen }: { label: string; type: keyof CustomColors; color: string; onOpen: (type: keyof CustomColors, label: string) => void }) => (
  <div className="flex items-center justify-between group py-1 border-b border-transparent hover:border-[var(--secondary)] hover:border-opacity-10 transition-all">
    <div className="flex items-center gap-3">
      <div className={`w-3.5 h-3.5 rounded-none pixel-${type} pixel-border-style pixel-no-glow opacity-100 shadow-sm`}></div>
      <span className="text-[9px] font-black uppercase tracking-tight text-[var(--secondary)] whitespace-nowrap group-hover:text-[var(--text)] transition-colors">{label}</span>
    </div>
    <button onClick={() => onOpen(type, label)} className="w-4 h-4 rounded-full border border-[var(--secondary)] border-opacity-30 hover:scale-125 hover:border-emerald-500 transition-all shadow-sm active:scale-90" style={{ backgroundColor: color }}></button>
  </div>
);

export default App;
