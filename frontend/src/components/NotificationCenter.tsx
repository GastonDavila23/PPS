import { useState, useEffect } from 'react';
import { BellFill, CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons';
import { io } from 'socket.io-client';
import './../index.css';

export default function NotificationCenter({ onFinish }: { onFinish?: () => void }) {
  const [notifs, setNotifs] = useState<{id: number, msg: string, tipo: string}[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("progreso_matching", (data) => {
      if (data.porcentaje === 100) {
        setNotifs(prev => [{
          id: Date.now(),
          msg: "Asignación completada: Los datos ya están disponibles en la tabla.",
          tipo: 'success'
        }, ...prev]);
        if (onFinish) onFinish();
      }
      if (data.mensaje.includes("Error")) {
        setNotifs(prev => [{
          id: Date.now(),
          msg: data.mensaje,
          tipo: 'error'
        }, ...prev]);
      }
    });

    return () => { socket.disconnect(); };
  }, [onFinish]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 bg-slate-100 rounded-xl hover:bg-blue-50 text-slate-600 transition-all">
        <BellFill size={20} />
        {notifs.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-[100] overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">Notificaciones</div>
          <div className="max-h-60 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-xs italic">Sin mensajes nuevos</p>
            ) : (
              notifs.map(n => (
                <div key={n.id} className="p-4 border-b border-slate-50 flex gap-3 items-start hover:bg-slate-50 transition-colors">
                  {n.tipo === 'success' ? <CheckCircleFill className="text-emerald-500 mt-0.5" /> : <ExclamationCircleFill className="text-red-500 mt-0.5" />}
                  <p className="text-[11px] font-medium text-slate-600 leading-tight">{n.msg}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}