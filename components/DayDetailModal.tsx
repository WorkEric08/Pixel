
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DayDetailModalProps {
  isOpen: boolean;
  date: Date;
  note: string;
  images: string[];
  onClose: () => void;
  onSaveNote: (note: string) => void;
  onSaveImages: (images: string[]) => void;
  onClearDay: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  isOpen, 
  date, 
  note, 
  images, 
  onClose, 
  onSaveNote, 
  onSaveImages,
  onClearDay
}) => {
  const [editingNote, setEditingNote] = useState(note);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Refs para swipe
  const touchStartX = useRef<number | null>(null);
  const swipeThreshold = 50;

  useEffect(() => {
    if (isOpen) {
      setEditingNote(note);
    }
  }, [isOpen, note]);

  // Navegação do Lightbox
  const goToNext = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % images.length);
  }, [selectedImageIndex, images.length]);

  const goToPrev = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
  }, [selectedImageIndex, images.length]);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartX.current = null;
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') setSelectedImageIndex(null);
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, goToNext, goToPrev]);

  if (!isOpen) return null;

  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const filesArray = Array.from(files);
    Promise.all(
      filesArray.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file as unknown as Blob);
        });
      })
    ).then((newBase64Images) => {
      onSaveImages([...images, ...newBase64Images]);
    }).catch((error) => {
      console.error("Failed to read images:", error);
    });
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newImages = [...images];
    newImages.splice(index, 1);
    onSaveImages(newImages);
    if (selectedImageIndex === index) setSelectedImageIndex(null);
  };

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja apagar o registro da observação (notas e imagens) deste dia?")) {
      onClearDay();
      setEditingNote("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700 flex justify-between items-start flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-1">{weekday}</span>
            <h2 className="text-2xl font-black text-white tracking-tighter leading-none">{formattedDate}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Notas e Insights</label>
            <textarea 
              value={editingNote}
              onChange={(e) => {
                setEditingNote(e.target.value);
                onSaveNote(e.target.value);
              }}
              placeholder="Descreva este pixel da sua jornada..."
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors resize-none placeholder-slate-700 font-medium leading-relaxed"
              rows={6}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Galeria de Memórias</label>
              <span className="text-[8px] text-slate-600 font-bold tracking-widest">{images.length} / 12</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedImageIndex(idx)}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 cursor-zoom-in transition-all hover:border-emerald-500/50"
                >
                  <img src={img} alt="Daily memory" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  </div>
                  <button 
                    onClick={(e) => removeImage(e, idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 active:scale-75 z-10"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {images.length < 12 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-all text-slate-600 hover:text-emerald-500 active:scale-95 bg-slate-950/20">
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[8px] font-black uppercase">Add</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-700 flex items-center justify-between flex-shrink-0 gap-4">
           <button 
             onClick={handleClear}
             className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
           >
             Excluir
           </button>
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:translate-y-0.5"
           >
             Finalizar Edição
           </button>
        </div>
      </div>

      {/* Lightbox Profissional com Swipe */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 touch-none"
          onClick={() => setSelectedImageIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Lightbox */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto">
              <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">
                {selectedImageIndex + 1} <span className="mx-2">/</span> {images.length}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(null); }}
              className="p-3 bg-white/10 hover:bg-red-500/20 hover:text-red-500 rounded-full text-white transition-all pointer-events-auto border border-white/10 active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Navegação Lateral (Visível em Desktop) */}
          {images.length > 1 && (
            <>
              <div className="hidden md:flex absolute left-0 inset-y-0 items-center px-8 pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-emerald-500 text-white hover:text-slate-950 rounded-2xl transition-all duration-300 pointer-events-auto border border-white/10 hover:border-emerald-400 active:scale-90 backdrop-blur-xl group shadow-2xl hover:shadow-emerald-500/40"
                  aria-label="Anterior"
                >
                  <svg className="w-8 h-8 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="hidden md:flex absolute right-0 inset-y-0 items-center px-8 pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-emerald-500 text-white hover:text-slate-950 rounded-2xl transition-all duration-300 pointer-events-auto border border-white/10 hover:border-emerald-400 active:scale-90 backdrop-blur-xl group shadow-2xl hover:shadow-emerald-500/40"
                  aria-label="Próximo"
                >
                  <svg className="w-8 h-8 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Imagem Principal */}
          <div 
            className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center animate-in zoom-in-95 duration-500 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={images[selectedImageIndex]} 
              className="w-full h-full object-contain rounded-lg shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-transform active:scale-[1.02]" 
              alt="Preview"
            />
          </div>

          {/* Rodapé Info */}
          <div className="absolute bottom-10 flex flex-col items-center gap-3">
             <div className="px-6 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-emerald-500/20">
               {formattedDate}
             </div>
             <p className="md:hidden text-white/20 text-[8px] font-bold uppercase tracking-[0.4em]">Deslize para o lado</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayDetailModal;
