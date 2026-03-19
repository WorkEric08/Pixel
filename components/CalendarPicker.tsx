
import React, { useState, useRef, useMemo } from 'react';

interface CalendarPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, minDate }) => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date(value));
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs para controle de deslize (swipe)
  const touchStartPos = useRef<number | null>(null);
  const mouseStartPos = useRef<number | null>(null);
  
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Verifica se é possível navegar para o mês anterior com base no minDate
  const canGoPrev = useMemo(() => {
    if (!minDate) return true;
    const minYear = minDate.getFullYear();
    const minMonth = minDate.getMonth();
    
    // Se o ano atual é maior que o ano mínimo, pode voltar
    if (year > minYear) return true;
    // Se o ano é o mesmo, só pode voltar se o mês atual for maior que o mês mínimo
    if (year === minYear && month > minMonth) return true;
    
    return false;
  }, [year, month, minDate]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevMonth = () => {
    if (!canGoPrev) return;
    triggerAnimation();
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    triggerAnimation();
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  // Handlers para Swipe (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartPos.current === null) return;
    const touchEndPos = e.changedTouches[0].clientX;
    const diff = touchStartPos.current - touchEndPos;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextMonth();
      } else {
        if (canGoPrev) prevMonth();
      }
    }
    touchStartPos.current = null;
  };

  // Handlers para Deslize (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartPos.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartPos.current === null) return;
    const mouseEndPos = e.clientX;
    const diff = mouseStartPos.current - mouseEndPos;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextMonth();
      } else {
        if (canGoPrev) prevMonth();
      }
    }
    mouseStartPos.current = null;
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    if (minDate && selectedDate < minDate) return;
    onChange(selectedDate);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 md:h-9"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isSelected = value.getDate() === d && value.getMonth() === month && value.getFullYear() === year;
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const isDisabled = minDate && date < minDate;

    days.push(
      <button
        key={d}
        onClick={() => handleDateClick(d)}
        disabled={isDisabled}
        className={`h-8 w-full md:h-9 rounded-md flex items-center justify-center text-[11px] font-bold transition-all
          ${isSelected ? 'bg-emerald-500 text-slate-950 scale-105 z-10 shadow-md' : 'hover:bg-slate-700 text-slate-200'}
          ${isToday && !isSelected ? 'border border-emerald-500 text-emerald-500' : ''}
          ${isDisabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div 
      className={`bg-slate-900/50 p-3 rounded-xl border border-slate-700 select-none touch-pan-y transition-all duration-300 ${isAnimating ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={prevMonth} 
          disabled={!canGoPrev}
          className={`p-1.5 rounded-full transition-colors ${canGoPrev ? 'hover:bg-slate-800 text-slate-400' : 'text-slate-700 cursor-not-allowed opacity-30'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-slate-100 font-bold text-[10px] uppercase tracking-widest pointer-events-none">
          {monthNames[month]} {year}
        </div>
        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center mb-1 pointer-events-none">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day) => (
          <div key={day} className="text-[8px] font-black text-slate-600 uppercase">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days}
      </div>
      
      <div className="mt-3 flex justify-center">
        <div className="flex gap-1.5 items-center">
           <div className="w-1 h-1 rounded-full bg-slate-700"></div>
           <div className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em]">Deslize para navegar</div>
           <div className="w-1 h-1 rounded-full bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
