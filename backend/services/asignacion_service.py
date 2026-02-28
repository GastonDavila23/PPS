import pandas as pd
from geopy.distance import geodesic
from database import get_db_connection

ESTADOS = {
    "FALTA_GEO": "No Asignada (Faltan Datos Geo)",
    "SIN_CANDIDATOS": "No Asignada (Sin Candidatos)",
    "MUY_LEJOS": "No Asignada (Candidatos > 30km)",
    "RANGO_1": "Asignado (0-5 km)",
    "RANGO_2": "Asignado (5-10 km)",
    "RANGO_3": "Asignado (10-30 km)"
}

def construir_filtros_sql(filtros: dict):
    where_clause = " WHERE 1=1"
    params = []
    if filtros.get('departamento') and filtros['departamento'] != 'todos':
        where_clause += " AND origen_Departamento = ?"
        params.append(filtros['departamento'])
    if filtros.get('turno') and filtros['turno'] != 'todos':
        where_clause += " AND origen_Turno = ?"
        params.append(filtros['turno'])
    estado = filtros.get('estado')
    if estado and estado != 'todos':
        if estado == 'no-asignadas':
            where_clause += " AND Observaciones LIKE 'No Asignada%'"
        else:
            mapa_estados = {'0-5km': ESTADOS["RANGO_1"], '5-10km': ESTADOS["RANGO_2"], '10-30km': ESTADOS["RANGO_3"]}
            if estado in mapa_estados:
                where_clause += " AND Observaciones = ?"
                params.append(mapa_estados[estado])
    if filtros.get('nombre'):
        where_clause += " AND (origen_Nombre_Escuela LIKE ? OR destino_Nombre_Escuela LIKE ?)"
        params.extend([f"%{filtros['nombre']}%", f"%{filtros['nombre']}%"])
    return where_clause, params

def calcular_mejor_destino(profe_origen, pool_destinos):
    lat_o, lon_o = profe_origen.get('Latitud'), profe_origen.get('Longitud')
    # Manejo seguro de coordenadas que no pudieron convertirse
    try:
        if pd.isna(lat_o) or pd.isna(lon_o):
            return {"destino": profe_origen, "dist": 0.0, "obs": ESTADOS["FALTA_GEO"]}
        lat_o, lon_o = float(lat_o), float(lon_o)
    except:
        return {"destino": profe_origen, "dist": 0.0, "obs": ESTADOS["FALTA_GEO"]}

    candidatos = []
    for idx, posible_destino in pool_destinos.iterrows():
        if (profe_origen['Turno'] == posible_destino['Turno'] and 
            profe_origen['CUE'] != posible_destino['CUE'] and
            pd.notna(posible_destino['Latitud'])):
            try:
                dist = geodesic((lat_o, lon_o), (posible_destino['Latitud'], posible_destino['Longitud'])).kilometers
                candidatos.append({"data": posible_destino, "dist": dist, "index": idx})
            except: continue

    if not candidatos:
        return {"destino": profe_origen, "dist": 0.0, "obs": ESTADOS["SIN_CANDIDATOS"]}

    mejor = min(candidatos, key=lambda x: x['dist'])
    d = mejor['dist']
    if d < 5: obs = ESTADOS["RANGO_1"]
    elif 5 <= d < 10: obs = ESTADOS["RANGO_2"]
    elif 10 <= d <= 30: obs = ESTADOS["RANGO_3"]
    else: return {"destino": profe_origen, "dist": 0.0, "obs": ESTADOS["MUY_LEJOS"]}

    return {"destino": mejor['data'], "dist": d, "obs": obs, "index": mejor['index']}

def recalcular_y_guardar_asignaciones():
    conn = get_db_connection()
    try:
        df_escuelas = pd.read_sql_query("SELECT * FROM escuelas_data", conn)
        if df_escuelas.empty:
            conn.execute("DELETE FROM resultados_asignacion")
            conn.commit()
            return {"status": "info", "message": "No hay datos para procesar."}
    except Exception as e:
        return {"status": "error", "message": f"Error de lectura: {str(e)}"}
    finally:
        conn.close()

    pool_disponible = df_escuelas.copy()
    resultados_finales = []
    for _, fila in df_escuelas.iterrows():
        asignacion = calcular_mejor_destino(fila, pool_disponible)
        # Diccionario completo para evitar errores de columnas faltantes
        res = {
            'origen_Departamento': fila.get('Departamento'),
            'origen_CUE': fila.get('CUE'),
            'origen_Numero_Escuela': fila.get('Numero_Escuela'),
            'origen_Numero_Anexo': fila.get('Numero_Anexo'),
            'origen_Nombre_Escuela': fila.get('Nombre_Escuela'),
            'origen_Turno': fila.get('Turno'),
            'origen_Division': fila.get('Division'),
            'destino_Departamento': asignacion['destino'].get('Departamento'),
            'destino_CUE': asignacion['destino'].get('CUE'),
            'destino_Numero_Escuela': asignacion['destino'].get('Numero_Escuela'),
            'destino_Numero_Anexo': asignacion['destino'].get('Numero_Anexo'),
            'destino_Nombre_Escuela': asignacion['destino'].get('Nombre_Escuela'),
            'destino_Turno': asignacion['destino'].get('Turno'),
            'destino_Division': asignacion['destino'].get('Division'),
            'Distancia_KM': round(asignacion['dist'], 2),
            'Observaciones': asignacion['obs']
        }
        resultados_finales.append(res)
        if "index" in asignacion:
            pool_disponible.drop(asignacion['index'], inplace=True, errors='ignore')

    conn = get_db_connection()
    try:
        pd.DataFrame(resultados_finales).to_sql('resultados_asignacion', conn, if_exists='replace', index=False)
        conn.commit()
        return {"status": "success", "message": f"Se generaron {len(resultados_finales)} registros."}
    except Exception as e:
        return {"status": "error", "message": f"Error al guardar: {str(e)}"}
    finally:
        conn.close()