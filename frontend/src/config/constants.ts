export const CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:5000/api', 
  ITEMS_PER_PAGE: 12,
  DEBOUNCE_DELAY: 500,
};

export const OPCIONES_ESTADO = [
  { value: '0-5km', label: 'Asignado (0-5 km)' },
  { value: '5-10km', label: 'Asignado (5-10 km)' },
  { value: '10-30km', label: 'Asignado (10-30 km)' },
  { value: 'no-asignadas', label: 'No Asignadas (Excepciones)' },
];