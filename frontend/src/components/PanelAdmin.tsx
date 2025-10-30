import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

interface User {
  id: number;
  email: string;
  rol: 'admin' | 'profesor' | 'profesor-pendiente';
}

function PanelAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    axios.get('http://127.0.0.1:5000/api/usuarios')
      .then(response => {
        setUsers(response.data);
      })
      .catch(() => {
        setError('No se pudieron cargar los usuarios.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: number, newRole: User['rol']) => {
    axios.post('http://127.0.0.1:5000/api/usuarios/cambiar-rol', { id: userId, rol: newRole })
      .then(() => {
        setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
      })
      .catch(() => {
        alert('Error al cambiar el rol.');
      });
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

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
          {users.map(user => (
            <tr key={user.id}>
              <td className="align-middle">{user.email}</td>
              <td className="align-middle">{user.rol}</td>
              <td>
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