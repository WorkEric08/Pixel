
import React, { useMemo } from 'react';
import { EventItem } from '../types';
import { startOfDay, formatDateShort, getDateKey } from '../utils/dateUtils';

interface TimelineGridProps {
  startDate: Date;
  targetDate: Date;
  events: EventItem[];
  notes: Record<string, string>;
  images: Record<string, string[]>;
  onOpenDetail: (date: Date) => void;
  onDeleteEvent: (id: string) => void;
  globalTargetDate: Date;
  pixelSize: number;
  showDates: boolean;
  isCalendarView: boolean;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ 
  startDate, 
  targetDate, 
  events, 
  notes, 
  images,
  onOpenDetail, 
  globalTargetDate,
  pixelSize,
  showDates,
  isCalendarView
}) => {
  const today = startOfDay(new Date());
  
  const minDate = startOfDay(startDate);
  const maxDate = startOfDay(targetDate);

  const monthsMap = useMemo(() => {
    const map = new Map<string, Date[]>();
    let current = new Date(minDate);
    let iterations = 0;
    
    while (current <= maxDate && iterations < 3650) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(new Date(current));
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    return map;
  }, [minDate, maxDate]);

  const eventDates = useMemo(() => {
    return events.map(e => startOfDay(new Date(e.date)).getTime());
  }, [events]);

  const weekLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const renderPixel = (day: Date) => {
    const d = startOfDay(day);
    const time = d.getTime();
    const dateKey = getDateKey(d);
    const dayNumber = d.getDate();
    
    const isPast = d < today;
    const isToday = time === today.getTime();
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isGlobalTarget = time === startOfDay(globalTargetDate).getTime();
    const isEvent = eventDates.includes(time);
    
    const hasNote = !!notes[dateKey] && notes[dateKey].trim() !== "";
    const hasImages = (images[dateKey] || []).length > 0;
    
    // O triângulo aparece apenas para NOTAS ou IMAGENS
    const showTriangle = hasNote || hasImages;
    
    let pixelClass = 'pixel-future';
    if (isEvent) pixelClass = 'pixel-event';
    else if (isToday) pixelClass = 'pixel-today';
    else if (isGlobalTarget) pixelClass = 'pixel-target';
    else if (isPast) pixelClass = 'pixel-past';
    
    if (isWeekend && !isEvent && !isToday && !isGlobalTarget) {
      pixelClass = 'pixel-weekend';
    }

    return (
      <button 
        key={time}
        onClick={() => onOpenDetail(d)}
        title={formatDateShort(d)}
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          borderRadius: '1px',
        }}
        className={`
          group relative flex items-center justify-center
          border-[0.5px] border-black border-opacity-[0.1] 
          transition-all hover:scale-[1.3] hover:z-20 
          cursor-pointer pixel-border-style 
          overflow-hidden flex-shrink-0
          ${pixelClass}
        `}
      >
        {showDates && pixelSize >= 14 && (
          <span className="text-[7px] font-black opacity-30 group-hover:opacity-100 transition-opacity z-10">
            {dayNumber}
          </span>
        )}

        {showTriangle && (
          <div 
            className="absolute top-0 right-0 w-0 h-0 z-10 pointer-events-none"
            style={{ 
              borderTop: `${Math.max(3, pixelSize/4)}px solid var(--pixel-special)`,
              borderLeft: `${Math.max(3, pixelSize/4)}px solid transparent`,
              filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))'
            }}
          ></div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-10 w-full">
      {Array.from(monthsMap.entries()).map(([key, days]) => {
        const monthName = days[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
        const offset = days[0].getDay();

        return (
          <div key={key} className="flex flex-col gap-4 w-full animate-in fade-in duration-500">
            <div className="sticky top-0 z-20 py-2 flex items-center justify-between bg-[var(--bg)] bg-opacity-95 backdrop-blur-sm px-1 border-b border-[var(--secondary)] border-opacity-10">
              <h3 className="text-[10px] font-black text-[var(--secondary)] tracking-[0.2em]">
                {monthName}
              </h3>
            </div>

            {isCalendarView ? (
              <div className="grid grid-cols-7 gap-y-3 w-full justify-items-center">
                {weekLabels.map(l => (
                  <div key={l} className="text-[7px] font-black text-slate-500 text-center mb-1">
                    {l}
                  </div>
                ))}
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ width: pixelSize, height: pixelSize }}></div>
                ))}
                {days.map(renderPixel)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-[5px] md:gap-[8px] px-1 w-full justify-start items-center">
                {days.map(renderPixel)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineGrid;
