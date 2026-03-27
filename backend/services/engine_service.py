from geopy.distance import geodesic
import pandas as pd
import numpy as np
import logging
from sklearn.neighbors import BallTree
from extensions import socketio

logger = logging.getLogger(__name__)

ESTADOS = {
    "FALTA_GEO": "No Asignada (Faltan Datos Geo)",
    "SIN_CANDIDATOS": "No Asignada (Sin Pareja en Turno)",
    "MUY_LEJOS": "No Asignada (> 30km)",
    "RANGO_0": "Asignado (< 1 km)",
    "RANGO_1": "Asignado (1-5 km)",
    "RANGO_2": "Asignado (5-10 km)",
    "RANGO_3": "Asignado (10-30 km)"
}

def safe_float(val):
    try:
        if pd.isna(val) or str(val).strip() == '-':
            return None
        return float(str(val).strip())
    except (ValueError, TypeError):
        return None

def ejecutar_algoritmo_matching(df_escuelas):
    if df_escuelas.empty:
        return []

    # 1. Preparación y Limpieza
    df_escuelas = df_escuelas.reset_index().rename(columns={'index': 'slot_id'})
    
    df_escuelas['Latitud'] = pd.to_numeric(df_escuelas['Latitud'], errors='coerce')
    df_escuelas['Longitud'] = pd.to_numeric(df_escuelas['Longitud'], errors='coerce')
    
    df_geo = df_escuelas[df_escuelas['Latitud'].notna() & df_escuelas['Longitud'].notna()].copy()
    df_sin_geo = df_escuelas[df_escuelas['Latitud'].isna() | df_escuelas['Longitud'].isna()].copy()

    if df_geo.empty:
        return [formatear_registro(row, None, 0, "No Asignada (Sin Geometría)") for _, row in df_sin_geo.iterrows()]

    # 2. Indexación Espacial
    coords_rad = np.deg2rad(df_geo[['Latitud', 'Longitud']].values)
    tree = BallTree(coords_rad, metric='haversine')
    radio_busqueda = 30 / 6371.0
    
    # 3. Búsqueda de Vecinos
    socketio.emit('progreso_matching', {'porcentaje': 10, 'mensaje': 'Buscando escuelas cercanas...'})
    indices_vecinos, distancias_rad = tree.query_radius(coords_rad, r=radio_busqueda, return_distance=True)

    # 4. Construcción de la Matriz de Costos
    combinaciones = []
    total_slots = len(df_geo)
    
    for i, (vecinos, dists) in enumerate(zip(indices_vecinos, distancias_rad)):
        if i % 500 == 0:
            p = int(10 + (i / total_slots) * 40)
            socketio.emit('progreso_matching', {'porcentaje': p, 'mensaje': f'Analizando distancias: {i}/{total_slots}'})

        profe_idx = i
        profe_cue = df_geo.iloc[profe_idx]['CUE']
        profe_turno = df_geo.iloc[profe_idx]['Turno']
        profe_slot = df_geo.iloc[profe_idx]['slot_id']

        for vecino_idx, d_rad in zip(vecinos, dists):
            # No compararse con uno mismo
            if profe_idx == vecino_idx: continue
            
            # Filtro rápido antes de guardar en la lista pesada
            destino = df_geo.iloc[vecino_idx]
            if profe_turno == destino['Turno'] and profe_cue != destino['CUE']:
                combinaciones.append((profe_slot, destino['slot_id'], d_rad * 6371.0))

    # 5. Ordenamiento Global
    socketio.emit('progreso_matching', {'porcentaje': 60, 'mensaje': 'Ordenando por cercanía...'})
    # Ordenamos por la distancia
    combinaciones.sort(key=lambda x: x[2])

    # 6. Asignación Serial
    asignaciones_finales = []
    ocupados_origen = set()
    ocupados_destino = set()
    
    dict_escuelas = df_escuelas.set_index('slot_id').to_dict('index')

    for i, (p_id, d_id, dist_km) in enumerate(combinaciones):
        if i % 1000 == 0:
            p = int(60 + (i / len(combinaciones)) * 30) if combinaciones else 90
            socketio.emit('progreso_matching', {'porcentaje': p, 'mensaje': 'Confirmando mejores parejas...'})

        if p_id not in ocupados_origen and d_id not in ocupados_destino:
            # Determinamos rango
            obs = "Asignado (< 1 km)" if dist_km < 1 else \
                  "Asignado (1-5 km)" if dist_km < 5 else \
                  "Asignado (5-10 km)" if dist_km < 10 else "Asignado (10-30 km)"

            asignaciones_finales.append(formatear_registro(
                dict_escuelas[p_id], dict_escuelas[d_id], dist_km, obs
            ))
            ocupados_origen.add(p_id)
            ocupados_destino.add(d_id)

    # 7. Completar los no asignados
    for s_id, data in dict_escuelas.items():
        if s_id not in ocupados_origen:
            # Si no tiene geo
            if pd.isna(data['Latitud']):
                asignaciones_finales.append(formatear_registro(data, None, 0.0, "No Asignada (Sin Geometría)"))
            else:
                asignaciones_finales.append(formatear_registro(data, None, 0.0, "No Asignada (Sin candidatos)"))

    socketio.emit('progreso_matching', {'porcentaje': 100, 'mensaje': '¡Asignación finalizada!'})
    return asignaciones_finales

def formatear_registro(origen, destino, dist, obs):
    # Campos base del origen
    res = {
        'id_carga': origen.get('id_carga'),
        'origen_Departamento': origen.get('Departamento'),
        'origen_CUE': origen.get('CUE'),
        'origen_Nombre_Escuela': origen.get('Nombre_Escuela'),
        'origen_Division': origen.get('Division'),
        'origen_Turno': origen.get('Turno'),
        'origen_Numero_Escuela': origen.get('Numero_Escuela'),
        'origen_Numero_Anexo': origen.get('Numero_Anexo'),
        'Distancia_KM': round(dist, 2),
        'Observaciones': obs
    }
    
    # Campos de destino
    campos_destino = [
        'destino_Departamento', 'destino_CUE', 'destino_Nombre_Escuela',
        'destino_Division', 'destino_Turno', 'destino_Numero_Escuela', 
        'destino_Numero_Anexo'
    ]

    if destino:
        res.update({
            'destino_Departamento': destino.get('Departamento'),
            'destino_CUE': destino.get('CUE'),
            'destino_Nombre_Escuela': destino.get('Nombre_Escuela'),
            'destino_Division': destino.get('Division'),
            'destino_Turno': destino.get('Turno'),
            'destino_Numero_Escuela': destino.get('Numero_Escuela'),
            'destino_Numero_Anexo': destino.get('Numero_Anexo'),
        })
    else:
        # Aseguramos que las columnas existan en el dict aunque no haya destino
        for campo in campos_destino:
            res[campo] = None
        res['destino_Nombre_Escuela'] = "NO ASIGNADA"

    return res