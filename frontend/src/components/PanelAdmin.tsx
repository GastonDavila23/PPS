/**
 * ================================================================================
 * ARCHIVO: PanelAdmin.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este componente define el "Panel de Administración de Roles".
 *
 * Es una interfaz que se muestra dentro de un modal (ver App.tsx) y que solo
 * es accesible para usuarios con rol de 'admin'.
 *
 * MANEJA:
 * - La obtención (fetch) de la lista completa de usuarios desde el backend
 * (llamando a /api/usuarios).
 * - La visualización de todos los usuarios (email y rol) en una tabla.
 * - La funcionalidad para cambiar el rol de cualquier usuario mediante un
 * menú desplegable (select).
 * - La llamada al backend (POST a /api/usuarios/cambiar-rol) para persistir
 * el cambio de rol en la base de datos.
 * ================================================================================
 */

// --- Importaciones ---
import { useState, useEffect } from 'react'; // Hooks de React para estado y efectos secundarios.
import axios from 'axios'; // Para realizar llamadas a la API del backend.
// Componentes de React-Bootstrap para la UI
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

/**
 * --- Definición de Tipos (Interface) ---
 * Define la estructura de un objeto 'User' tal como se recibe de la API.
 */
interface User {
  id: number;
  email: string;
  rol: 'admin' | 'profesor' | 'profesor-pendiente';
}

/**
 * --- Definición del Componente ---
 * Este componente no recibe props, ya que es "inteligente" y busca
 * sus propios datos.
 */
function PanelAdmin() {
  
  // --- Estados Internos ---
  // Almacena la lista de todos los usuarios traídos de la BD.
  const [users, setUsers] = useState<User[]>([]);
  // Controla el estado de carga inicial (true = muestra "Cargando...").
  const [loading, setLoading] = useState(true);
  // Almacena un mensaje de error si la carga inicial falla.
  const [error, setError] = useState('');

  // --- Funciones ---
  
  /**
   * Función reutilizable para buscar (fetch) la lista de usuarios del backend.
   */
  const fetchUsers = () => {
    axios.get('http://127.0.0.1:5000/api/usuarios')
      .then(response => {
        // Si tiene éxito, guarda los usuarios en el estado.
        setUsers(response.data);
      })
      .catch(() => {
        // Si falla, guarda un mensaje de error.
        setError('No se pudieron cargar los usuarios.');
      })
      .finally(() => {
        // Se ejecuta siempre (éxito o error), y oculta el mensaje "Cargando...".
        setLoading(false);
      });
  };

  /**
   * Hook de Efecto (useEffect).
   * Se ejecuta una sola vez (gracias al array vacío `[]`) cuando el
   * componente se "monta" (es decir, cuando aparece en pantalla).
   * Su único trabajo es llamar a `fetchUsers()` para cargar los datos iniciales.
   */
  useEffect(() => {
    fetchUsers();
  }, []); // El `[]` significa "ejecutar solo una vez".

  /**
   * Manejador de eventos que se activa cuando el admin cambia el valor
   * del menú desplegable (Form.Select) de un usuario.
   * @param {number} userId - El ID del usuario que se está modificando.
   * @param {User['rol']} newRole - El nuevo rol seleccionado (ej: 'admin').
   */
  const handleRoleChange = (userId: number, newRole: User['rol']) => {
    // 1. Llamada optimista a la API:
    // Envía la solicitud de cambio de rol al backend.
    axios.post('http://127.0.0.1:5000/api/usuarios/cambiar-rol', { id: userId, rol: newRole })
      .then(() => {
        // 2. Actualización Optimista del Estado (UI):
        // Si la llamada al backend tiene éxito, actualiza la UI local (el estado 'users')
        // inmediatamente, sin necesidad de volver a hacer un fetch de toda la lista.
        // Esto hace que la UI se sienta instantánea.
        setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
      })
      .catch(() => {
        // 3. Manejo de Error:
        // Si la API falla, muestra una alerta simple.
        // (En una app más robusta, aquí se podría revertir el cambio optimista).
        alert('Error al cambiar el rol.');
      });
  };

  // --- Renderizado Condicional (Feedback de Carga) ---
  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // --- Renderizado Principal (UI) ---
  return (
    <div className="mt-5 p-4 border rounded">
      <h2>Panel de Administración de Roles</h2>
      <Table striped bordered hover responsive>
        <thead className='text-center table-dark'>
          <tr>
            <th>Email del Usuario</th>
            <th>Rol Actual</th>
            <th>Asignar Nuevo Rol</th>
          </tr>
        </thead>
        <tbody className='text-center'>
          {/* Itera (hace un 'map') sobre la lista de usuarios en el estado */}
          {users.map(user => (
            <tr key={user.id}>
              {/* 'align-middle' centra verticalmente el texto en la celda */}
              <td className="align-middle">{user.email}</td>
              <td className="align-middle">{user.rol}</td>
              <td>
                {/* Este es el menú desplegable (Select) para cambiar el rol.
                  - 'value={user.rol}' asegura que muestre el rol actual.
                  - 'onChange' activa la función 'handleRoleChange' cuando se selecciona
                    una nueva opción.
                */}
                <Form.Select
                  value={user.rol}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as User['rol'])}
                >
                  <option value="profesor-pendiente">Pendiente</option>
                  <option value="profesor">Profesor</option>
                  <option value="admin">Administrador</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PanelAdmin;