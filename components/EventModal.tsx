
import React, { useState } from 'react';
import CalendarPicker from './CalendarPicker';
import { formatDateShort } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, date: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, date.toISOString());
    setName('');
    setDate(new Date());
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-md rounded-xl p-6 md:p-8 border border-slate-700 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter">Novo Marco</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome do Evento</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem, Entrega..."
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-bold text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quando?</label>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full p-3.5 rounded-lg border flex items-center justify-between transition-all text-sm
                ${showCalendar ? 'border-violet-500 bg-violet-500/5' : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'}
              `}
            >
              <span className="text-slate-100 font-bold">{formatDateShort(date)}</span>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCalendar ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <CalendarPicker 
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
              }}
              minDate={new Date()}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 p-3 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px]">Cancelar</button>
          <button 
            onClick={handleSave} 
            className="flex-1 p-3 rounded-lg bg-violet-600 text-white font-black hover:bg-violet-500 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-violet-600/20"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
