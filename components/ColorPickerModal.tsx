
import React, { useState, useEffect, useRef } from 'react';

interface ColorPickerModalProps {
  isOpen: boolean;
  label: string;
  currentColor: string;
  onClose: () => void;
  onSave: (color: string) => void;
}

const EXTENDED_PRESETS = [
  { name: 'Retro 8-bit', colors: ['#000000', '#FFFFFF', '#880000', '#AAFFEE', '#CC44CC', '#00CC55', '#0000AA', '#EEEE77', '#DD8855', '#664400', '#FF7777', '#333333', '#777777', '#AAFF66', '#0088FF', '#BBBBBB'] },
  { name: 'Vibrant Pop', colors: ['#FF0055', '#FFCC00', '#00FFCC', '#5500FF', '#FF00FF', '#00CCFF', '#CCFF00', '#FF9900'] },
  { name: 'Nordic Winter', colors: ['#2E3440', '#3B4252', '#434C5E', '#4C566A', '#D8DEE9', '#E5E9F0', '#ECEFF4', '#8FBCBB', '#88C0D0', '#81A1C1', '#5E81AC'] },
  { name: 'Pastel Dream', colors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F6A6FF', '#A0E7E5', '#B4F8C8'] },
  { name: 'Midnight', colors: ['#0F172A', '#1E293B', '#334155', '#020617', '#172554', '#1E1B4B', '#2E1065', '#4C1D95'] },
  { name: 'Earth & Stone', colors: ['#451A03', '#78350F', '#92400E', '#B45309', '#D97706', '#F59E0B', '#71717a', '#3f3f46'] },
];

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, label, currentColor, onClose, onSave }) => {
  const [hex, setHex] = useState(currentColor);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(100);
  const [val, setVal] = useState(100);
  const [view, setView] = useState<'picker' | 'presets'>('picker');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHex(currentColor);
      setView('picker');
      const rgb = hexToRgb(currentColor);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
    }
  }, [isOpen, currentColor]);

  useEffect(() => {
    if (view === 'picker' && isOpen) {
      setTimeout(drawSquare, 0);
    }
  }, [view, hue, isOpen]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const drawSquare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);
    const gradWhite = ctx.createLinearGradient(0, 0, width, 0);
    gradWhite.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradWhite.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, width, height);
    const gradBlack = ctx.createLinearGradient(0, 0, 0, height);
    gradBlack.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradBlack.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, width, height);
  };

  const handlePointer = (e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    setSat(s);
    setVal(v);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const canvasX = Math.min(Math.max(0, (x / rect.width) * canvas.width), canvas.width - 1);
    const canvasY = Math.min(Math.max(0, (y / rect.height) * canvas.height), canvas.height - 1);
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    setHex(rgbToHex(pixel[0], pixel[1], pixel[2]));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointer(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) handlePointer(e);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Color Picker</h4>
            <span className="text-sm font-black text-white uppercase tracking-tighter">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(view === 'picker' ? 'presets' : 'picker')}
              className={`p-2 rounded-xl border border-white/10 transition-all ${view === 'presets' ? 'bg-emerald-500 text-slate-900 border-emerald-400' : 'bg-[var(--container)] text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-lg border-2 border-white/20" style={{ backgroundColor: hex }}></div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-[340px]">
          {view === 'picker' ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <div className="relative group rounded-xl border border-white/5 bg-slate-900 touch-none">
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={180}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className="w-full h-[160px] cursor-crosshair rounded-xl"
                />
                <div 
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${sat}%`, top: `${100 - val}%`, backgroundColor: hex }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hue</label>
                <input 
                  type="range" 
                  min="0" max="360" 
                  value={hue} 
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer border border-white/10"
                  style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HEX Code</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">#</span>
                  <input 
                    type="text" 
                    value={hex.replace('#', '')} 
                    onChange={(e) => {
                      const valStr = e.target.value.toUpperCase();
                      if (/^[0-9A-F]{0,6}$/.test(valStr)) {
                        setHex('#' + valStr);
                        if (valStr.length === 6) {
                          const rgb = hexToRgb('#' + valStr);
                          const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                          setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-4 py-3 text-white font-mono uppercase focus:ring-1 focus:ring-emerald-500 text-xs tracking-widest"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[340px] overflow-y-auto custom-scrollbar pr-1 animate-in fade-in duration-300">
              {EXTENDED_PRESETS.map((group) => (
                <div key={group.name} className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                  <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">{group.name}</h5>
                  <div className="grid grid-cols-6 gap-2">
                    {group.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { 
                          setHex(color); 
                          const rgb = hexToRgb(color);
                          const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                          setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
                          setView('picker'); 
                        }}
                        className={`aspect-square rounded-md border border-white/5 transition-all ${hex === color ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-400 font-black hover:bg-slate-700 text-[9px] uppercase tracking-widest transition-colors">Cancelar</button>
          <button onClick={() => onSave(hex)} className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-slate-950 font-black hover:bg-emerald-500 text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
