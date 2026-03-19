
import React, { useState } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  bio: string;
  onSave: (name: string, email: string, bio: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, name, email, bio, onSave }) => {
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempBio, setTempBio] = useState(bio);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header com Gradiente */}
        <div className="relative h-24 bg-gradient-to-r from-emerald-600/20 to-violet-600/20 flex items-end px-8 pb-4">
          <div className="absolute top-6 right-6">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4 translate-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-slate-950 text-2xl font-black shadow-xl">
              {tempName ? tempName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex flex-col mb-1">
              <h3 className="text-white font-black text-xl tracking-tight uppercase leading-none">Configurações da Conta</h3>
              <p className="text-emerald-500/60 text-[9px] font-black uppercase tracking-widest mt-1">Pixel Identity v1.0</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-10 space-y-6 flex-1 overflow-y-auto custom-scrollbar max-h-[70vh]">
          
          {/* Campos de Dados */}
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Nome de Exibição</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">E-mail (Privado)</label>
              <input 
                type="email" 
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold placeholder:opacity-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Breve Bio / Meta Principal</label>
              <textarea 
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Ex: Focar na minha jornada fitness 2025..."
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold placeholder:opacity-20 h-20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-950/50 border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-slate-800 text-slate-400 hover:text-white font-black transition-all uppercase tracking-widest text-[10px]">Descartar</button>
          <button 
            onClick={() => onSave(tempName, tempEmail, tempBio)} 
            className="flex-[2] px-6 py-4 rounded-2xl bg-emerald-600 text-slate-950 font-black hover:bg-emerald-500 transition-all uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
          >
            Sincronizar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
