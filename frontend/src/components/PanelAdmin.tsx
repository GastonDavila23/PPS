import { useState, useEffect } from 'react';
import { Trash, Eraser, ExclamationTriangle, PlayFill, CpuFill, PersonBadge, ClockHistory } from 'react-bootstrap-icons';
import { asignacionesService } from '../services/asignacionesService';
import type { IUser, RolUsuario } from '../types';
import { io, Socket } from 'socket.io-client';

interface Historial {
  id: number;
  fecha: string;
  usuario_email: string;
  registros_procesados: number;
  observaciones: string;
}

interface PanelAdminProps {
  usuarioEmail?: string; 
  onAsignacionFinalizada?: () => void;
}

function PanelAdmin({ usuarioEmail, onAsignacionFinalizada }: PanelAdminProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<Historial[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Esperando inicio...');

  useEffect(() => {
    if (usuarioEmail) {
      fetchUsers();
      fetchHistorial();
    }

    const socket: Socket = io("http://127.0.0.1:5000");
    socket.on("progreso_matching", (data: { porcentaje: number; mensaje: string }) => {
      setProgreso(data.porcentaje);
      setStatusMsg(data.mensaje);
    });

    return () => { socket.disconnect(); };
  }, [usuarioEmail]);

  const fetchUsers = async () => {
    try {
      const data = await asignacionesService.obtenerUsuarios(usuarioEmail!);
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchHistorial = async () => {
    try {
      const data = await asignacionesService.obtenerHistorial(usuarioEmail!);
      setHistorial(data.historial || []);
    } catch (err) { console.error(err); }
  };

  const handleIniciarProcesamiento = async () => {
    if (!usuarioEmail) return;
    if (!window.confirm("¿Deseas iniciar el recálculo global de asignaciones?")) return;
    
    setIsProcessing(true);
    setProgreso(0);
    
    try {
      await asignacionesService.iniciarProcesamiento(usuarioEmail);
      
      if (onAsignacionFinalizada) {
        onAsignacionFinalizada(); 
      } else {
        window.location.reload(); 
      }
    } catch (err) {
      alert("Error durante el procesamiento.");
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: RolUsuario) => {
    try {
      await asignacionesService.cambiarRol(userId, newRole, usuarioEmail || '');
      setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
    } catch (err) { alert('Error al actualizar rol.'); }
  };

  const handleBorrarUsuario = async (emailABorrar: string) => {
    if (emailABorrar === usuarioEmail) return;
    if (window.confirm(`¿Eliminar permanentemente a ${emailABorrar}?`)) {
      try {
        await asignacionesService.eliminarUsuario(emailABorrar, usuarioEmail || '');
        setUsers(users.filter(u => u.email !== emailABorrar));
      } catch (err) { alert("Error al eliminar."); }
    }
  };

  const handleBorrarCargaHistorial = async (idCarga: number) => {
    if (window.confirm("¿Eliminar este registro de carga?")) {
      try {
        await asignacionesService.eliminarCarga(idCarga, usuarioEmail || '');
        setHistorial(historial.filter(h => h.id !== idCarga));
      } catch (err) { alert("Error al eliminar carga."); }
    }
  };

  const handleLimpiarBase = async () => {
    if (window.confirm("¿Deseas resetear el sistema? Se borrarán TODAS las escuelas y resultados.")) {
      try {
        await asignacionesService.limpiarBaseDatos(usuarioEmail!);
        if (onAsignacionFinalizada) onAsignacionFinalizada();
        else window.location.reload();
      } catch (err) { alert("Error al limpiar base."); }
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
      Sincronizando Panel de Control...
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. MOTOR DE ASIGNACIÓN (ESTADO ACTUAL) */}
      <div className="bg-slate-900 rounded-xl p-4 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isProcessing ? 'bg-blue-600 animate-pulse' : 'bg-slate-800'}`}>
              <CpuFill size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Motor de Inteligencia</h3>
              <p className="text-[9px] text-slate-400 font-bold italic">
                {isProcessing ? statusMsg : "Listo para procesar escuelas"}
              </p>
            </div>
          </div>

          <button 
            onClick={handleIniciarProcesamiento}
            disabled={isProcessing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
              ${isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95'}`}
          >
            {isProcessing ? `${progreso}% PROCESANDO` : <><PlayFill size={16}/> Ejecutar Cálculo</>}
          </button>
        </div>
        {isProcessing && (
          <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progreso}%` }}></div>
          </div>
        )}
      </div>

      {/* 2. GRILLA DE TABLAS (RESPONSIVE) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* TABLA USUARIOS */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <PersonBadge size={14} className="text-slate-400" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuarios</h4>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-[180px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="w-2/4 px-4 py-2 text-[9px] font-black uppercase text-slate-500">Email</th>
                    <th className="w-1/4 px-4 py-2 text-[9px] font-black uppercase text-slate-500 text-center">Rol</th>
                    <th className="w-1/4 px-4 py-2 text-[9px] font-black uppercase text-slate-500 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-[10px] font-bold text-slate-700 truncate">{user.email}</td>
                      <td className="px-4 py-2 text-center text-[9px] font-black text-blue-600 uppercase">
                        {user.email === usuarioEmail ? 'Admin' : (
                          <select 
                            value={user.rol} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value as RolUsuario)}
                            className="bg-transparent text-[9px] font-black uppercase text-blue-600 outline-none cursor-pointer"
                          >
                            <option value="profesor">Profesor</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          disabled={user.email === usuarioEmail}
                          onClick={() => handleBorrarUsuario(user.email)} 
                          className="text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABLA HISTORIAL */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <ClockHistory size={14} className="text-slate-400" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auditoría</h4>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-[180px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500">Fecha</th>
                    <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500 text-center">Registros</th>
                    <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500 text-right">Borrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historial.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-[10px] text-slate-500 font-mono truncate">
                        {item.fecha.split(' ')[0]}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.registros_procesados}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => handleBorrarCargaHistorial(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {historial.length === 0 && <div className="p-8 text-center text-[9px] text-slate-400 uppercase italic">Sin registros</div>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MANTENIMIENTO (ZONA CRÍTICA) */}
      <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <ExclamationTriangle size={18} className="text-red-500 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-red-800 uppercase tracking-widest">Zona de Mantenimiento</p>
              <p className="text-[8px] text-red-600 font-bold opacity-80 leading-tight">Acción irreversible sobre la base de datos.</p>
            </div>
          </div>
          <button 
            onClick={handleLimpiarBase}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-lg text-[9px] font-black uppercase tracking-widest"
          >
            <Eraser size={14} /> Resetear Todo
          </button>
        </div>
      </div>
    </div>
  );
}

export default PanelAdmin;