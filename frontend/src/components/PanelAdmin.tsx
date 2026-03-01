import { useState, useEffect } from 'react';
import axios from 'axios';
import { PersonBadge, ShieldLock, HourglassSplit, Person } from 'react-bootstrap-icons';

interface User {
  id: number;
  email: string;
  rol: 'admin' | 'profesor' | 'profesor-pendiente';
}

interface Historial {
  id: number;
  fecha: string;
  usuario_email: string;
  registros_procesados: number;
  observaciones: string;
}

interface PanelAdminProps {
  usuarioEmail?: string; // Prop necesaria para validar permisos en el backend
}

function PanelAdmin({ usuarioEmail }: PanelAdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Carga la lista de usuarios del sistema
  const fetchUsers = () => {
    axios.get('http://127.0.0.1:5000/api/usuarios')
      .then(response => setUsers(response.data))
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  };

  // Carga el historial de auditoría de archivos
  const fetchHistorial = () => {
    // Si el email aún no llega de Auth0, no disparamos la petición para evitar el 403
    if (!usuarioEmail) return;

    setLoadingHistorial(true);
    axios.get(`http://127.0.0.1:5000/api/historial-cargas?email=${usuarioEmail}`)
      .then(response => {
        setHistorial(response.data.historial || []);
      })
      .catch((err) => {
        console.error('Error de auditoría:', err.response?.status);
        setLoadingHistorial(false);
      })
      .finally(() => setLoadingHistorial(false));
  };

  useEffect(() => {
    fetchUsers();
    // Solo intentamos traer el historial si el email del usuario está disponible
    if (usuarioEmail) {
      fetchHistorial();
    }
  }, [usuarioEmail]); // Se dispara de nuevo automáticamente cuando Auth0 entrega el email

  const handleRoleChange = (userId: number, newRole: User['rol']) => {
    // Enviamos el email del administrador en los headers para que el backend valide la acción
    axios.post('http://127.0.0.1:5000/api/usuarios/cambiar-rol', 
      { id: userId, rol: newRole },
      { headers: { 'X-Admin-Email': usuarioEmail } }
    )
    .then(() => {
      setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
    })
    .catch(() => alert('Error: No tienes permisos suficientes para cambiar roles.'));
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sincronizando sistema...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100">
      <p className="text-red-500 font-black text-xs uppercase tracking-widest">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECCIÓN 1: GESTIÓN DE USUARIOS */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
          Gestione los niveles de acceso para el personal docente y administrativo.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-800 text-white">
                  <th className="w-3/5 py-3 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-left border-r border-slate-700">Identificador</th>
                  <th className="w-2/5 py-3 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-center">Rol Asignado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-slate-200 h-[50px] transition-colors
                      ${i % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-[#E5E7EB]'}`}
                  >
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                          <Person size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="relative group max-w-[160px] mx-auto">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-500">
                          {user.rol === 'admin' && <ShieldLock size={12} />}
                          {user.rol === 'profesor' && <PersonBadge size={12} />}
                          {user.rol === 'profesor-pendiente' && <HourglassSplit size={12} />}
                        </div>
                        <select
                          value={user.rol}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as User['rol'])}
                          className="w-full pl-9 pr-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                        >
                          <option value="profesor-pendiente">Pendiente</option>
                          <option value="profesor">Profesor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: AUDITORÍA DE CARGAS */}
      <div className="border-t border-slate-200 pt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Auditoría de Cargas
          </h4>
          <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Últimos movimientos
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loadingHistorial ? (
            <div className="p-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Cargando registros...
            </div>
          ) : historial.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              No tienes permisos o no hay cargas registradas.
            </div>
          ) : (
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
              <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="w-[30%] py-2 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-left border-r border-slate-200">Fecha</th>
                    <th className="w-[50%] py-2 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-left border-r border-slate-200">Usuario</th>
                    <th className="w-[20%] py-2 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center">Escuelas</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item, i) => (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-100 h-[40px]
                        ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="px-4 py-2 font-mono text-[10px] text-slate-500 truncate">
                        {item.fecha}
                      </td>
                      <td className="px-4 py-2 font-bold text-[11px] text-slate-700 truncate">
                        {item.usuario_email}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-sm">
                          {item.registros_procesados}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelAdmin;