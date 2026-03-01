import React from 'react';
import { X } from 'react-bootstrap-icons';

interface CustomModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  width?: string; 
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ show, onHide, title, width = 'w-[50vw]', children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className={`relative ${width} bg-white shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 rounded-[2.5rem]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR */}
        <button onClick={onHide} className="absolute top-6 right-8 p-2 text-slate-400 hover:text-blue-600 transition-colors z-[160]">
          <X size={32} />
        </button>

        <div className="bg-slate-50 h-full w-full flex flex-col p-10 justify-between overflow-hidden">
          {/* HEADER */}
          <div className="flex flex-col border-b border-slate-200 pb-6 mb-8 shrink-0">
            <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit">DGE · Gestión Territorial</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mt-1 leading-none">{title}</h2>
          </div>

          {/* CONTENIDO DEL COMPONENTE INTERNO */}
          <div className="flex-1 overflow-auto custom-scrollbar px-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;