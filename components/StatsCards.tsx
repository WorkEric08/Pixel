
import React from 'react';

interface StatsProps {
  totalDays: number;
  workingDays: number;
  weeks: number;
}

const StatsCards: React.FC<StatsProps> = ({ totalDays, workingDays, weeks }) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <div className="bg-[var(--bg)] bg-opacity-50 p-3 md:p-4 rounded-lg flex flex-col items-center text-center transition-all hover:scale-[1.02] border border-[var(--secondary)] border-opacity-10">
        <span className="text-xl md:text-2xl font-black mb-1 leading-none">{totalDays}</span>
        <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-wider">Dias restantes</span>
      </div>
      <div className="bg-[var(--bg)] bg-opacity-50 p-3 md:p-4 rounded-lg flex flex-col items-center text-center transition-all hover:scale-[1.02] border border-[var(--secondary)] border-opacity-10">
        <span className="text-xl md:text-2xl font-black mb-1 leading-none">{workingDays}</span>
        <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-wider">Dias úteis</span>
      </div>
      <div className="bg-[var(--bg)] bg-opacity-50 p-3 md:p-4 rounded-lg flex flex-col items-center text-center transition-all hover:scale-[1.02] border border-[var(--secondary)] border-opacity-10">
        <span className="text-xl md:text-2xl font-black mb-1 leading-none">{weeks}</span>
        <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-wider">Semanas</span>
      </div>
    </div>
  );
};

export default StatsCards;
