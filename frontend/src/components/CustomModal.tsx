import React from 'react';
import { X } from 'react-bootstrap-icons';
import './../index.css';

interface CustomModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  width?: string; 
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ show, onHide, title, width = 'max-w-2xl', children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
      <div 
        className={`relative w-full ${width} bg-white shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl sm:rounded-[2rem] max-h-[95vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR */}
        <button 
          onClick={onHide} 
          className="absolute top-3 right-3 sm:top-5 sm:right-6 p-2 text-slate-400 hover:text-blue-600 transition-colors z-[160]"
        >
          <X size={28} />
        </button>

        <div className="bg-slate-50 h-full w-full flex flex-col p-5 sm:p-8 overflow-hidden">
          
          {/* HEADER */}
          <div className="flex flex-col border-b border-slate-200 pb-4 mb-5 shrink-0 pr-10">
            <span className="bg-blue-600 text-white text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest w-fit">
              DGE · Gestión Territorial
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter uppercase mt-1 leading-tight">
              {title}
            </h2>
          </div>

          {/* CONTENIDO */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;