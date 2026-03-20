
import React, { useState, useEffect } from 'react';
import CalendarPicker from './CalendarPicker';
import { formatDateShort } from '../utils/dateUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  targetDate: Date;
  onSave: (start: Date, target: Date) => void;
  isFirstRun?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  startDate, 
  targetDate, 
  onSave,
  isFirstRun
}) => {
  const [sDate, setSDate] = useState(startDate);
  const [tDate, setTDate] = useState(targetDate);
  const [activePicker, setActivePicker] = useState<'start' | 'target' | null>(null);

  // No primeiro acesso, foca automaticamente na Data Alvo
  useEffect(() => {
    if (isOpen && isFirstRun) {
      setActivePicker('target');
    }
  }, [isOpen, isFirstRun]);

  // Sincroniza sDate quando startDate prop mudar (importante para primeiro acesso)
  useEffect(() => {
    setSDate(startDate);
  }, [startDate]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Só permite fechar clicando fora se não for o primeiro acesso
    if (!isFirstRun && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg)] w-full max-w-2xl rounded-2xl p-5 md:p-6 border border-[var(--borders)] shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 duration-300 overflow-hidden relative cursor-default"
      >
        
        {/* Botão X no Canto Superior Direito */}
        {!isFirstRun && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-[var(--frame)]/50 hover:bg-slate-700 text-slate-400 hover:text-[var(--text)] rounded-xl transition-all border border-[var(--borders)]/50 z-20 group active:scale-90"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex justify-between items-center pr-10">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-tighter">
              {isFirstRun ? 'Bem-vindo ao Pixel Line' : 'Configurar Período'}
            </h3>
            {isFirstRun && <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Vamos definir seu primeiro objetivo</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                  {isFirstRun ? 'Início (Hoje)' : 'Início da Linha'}
                </label>
                <button 
                  onClick={() => !isFirstRun && setActivePicker('start')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all text-sm
                    ${activePicker === 'start' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[var(--borders)] bg-slate-950/50 hover:border-[var(--borders)]'}
                    ${isFirstRun ? 'opacity-60 cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-slate-100 font-bold">{formatDateShort(sDate)}</span>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Data Alvo Final</label>
                <button 
                  onClick={() => setActivePicker('target')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all text-sm
                    ${activePicker === 'target' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[var(--borders)] bg-slate-950/50 hover:border-[var(--borders)]'}
                  `}
                >
                  <span className="text-slate-100 font-bold">{formatDateShort(tDate)}</span>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            {isFirstRun && (
               <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 animate-pulse">
                 <p className="text-[9px] text-emerald-400 font-medium italic leading-relaxed">
                   "O primeiro passo é o mais importante. Defina quando você quer colher seus resultados."
                 </p>
               </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className={`transition-all duration-500`}>
              {activePicker ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <CalendarPicker 
                    value={activePicker === 'start' ? sDate : tDate}
                    onChange={(date) => {
                      if (activePicker === 'start') setSDate(date);
                      else setTDate(date);
                    }}
                    minDate={activePicker === 'target' ? sDate : undefined}
                  />
                </div>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/30 rounded-2xl border border-dashed border-[var(--borders)]">
                  <svg className="w-10 h-10 text-slate-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 leading-relaxed opacity-60">Selecione uma data para ajustar o período.</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {!isFirstRun && (
                <button 
                  onClick={onClose}
                  className="flex-1 p-3.5 rounded-xl bg-[var(--frame)] text-slate-400 font-black hover:bg-slate-700 transition-all uppercase tracking-[0.2em] text-[10px] active:scale-95 border border-[var(--borders)]"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={() => onSave(sDate, tDate)} 
                className={`${isFirstRun ? 'w-full' : 'flex-[2]'} p-3.5 rounded-xl bg-emerald-600 text-slate-950 font-black hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95`}
              >
                {isFirstRun ? 'Começar Jornada' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
