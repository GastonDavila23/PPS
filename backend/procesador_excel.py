"""
================================================================================
ARCHIVO: procesador_excel.py
================================================================================
PROPÓSITO:
Este módulo es el "motor de limpieza" del sistema. Su única responsabilidad
es tomar la lista de archivos "crudos" (Excel o CSV) subidos por el usuario,
y realizar un proceso de ETL (Extract, Transform, Load) en memoria:

1.  **Extraer:** Lee los archivos (CSV o todas las hojas de un Excel).
2.  **Transformar:**
    a.  **Normalizar Columnas:** Mapea nombres de columna desordenados (ej: "Numero
        Escuela", "latitud") a un nombre estándar (ej: "Numero_Escuela", "Latitud")
        usando el diccionario `COLUMNAS_CONOCIDAS`.
    b.  **Clasificar:** Separa los archivos en dos grupos:
        - "data_files": Los que tienen info de divisiones/turnos.
        - "coord_files": Los que tienen info de coordenadas (Lat/Lon).
    c.  **Limpiar:** Limpia datos clave como 'CUE' (quitando ".0") y 'Turno'
        (estandarizando a "Mañana"/"Tarde").
    d.  **Unificar:** Crea una "tabla de búsqueda" de coordenadas única por CUE.
    e.  **Fusionar (Merge):** Cruza los "data_files" con los "coord_files" usando
        el CUE como llave. Solo las escuelas presentes en AMBOS grupos sobreviven.
3.  **Cargar (Preparar):** Formatea el DataFrame final para que coincida
    exactamente con la estructura de la tabla 'escuelas_data' de la BD.

Es invocado por 'asignador.py' (en la ruta /api/cargar-planillas).
================================================================================
"""

import pandas as pd
import numpy as np

# --- Diccionario de Mapeo de Columnas ---
# Esta es la "Piedra Rosetta" del sistema.
# Define todos los posibles nombres "sucios" (como clave) que el usuario
# podría usar en sus archivos, y los mapea al nombre de columna "limpio" y
# estándar (como valor) que el sistema usa internamente.
COLUMNAS_CONOCIDAS = {
    # Nombre Estándar : [Lista de posibles nombres "sucios"]
    'CUE': ['CUE', 'cue', 'CUEAnexo'],
    'Numero_Escuela': ['Número_escuela', 'Numero_escuela', 'Numero Escuela'],
    'Numero_Anexo': ['Número_Anexo', 'Numero_Anexo', 'Numero Anexo'],
    'Nombre_Escuela': ['Nombre_Escuela', 'Nombre Escuela', 'Escuela'],
    'Departamento': ['Departamento'],
    'Division': ['División', 'Division'],
    'Turno': ['Turno'],
    'Matricula': ['Matrícula', 'Matricula'],
    'Latitud': ['latitud', 'Latitud', 'lat'],
    'Longitud': ['longitud', 'Longitud', 'lon', 'lng'],
    'ID_Escuela': ['ID_Escuela', 'ID Escuela', 'id_escuela'],
    'Curso': ['Curso', 'curso'],
    'Subcue': ['Subcue'],
    'Nivel': ['Nivel'],
    'Gestion': ['Gestion']
}

def normalizar_columnas(df):
    """
    Toma un DataFrame (df) y renombra sus columnas basándose en el
    diccionario `COLUMNAS_CONOCIDAS`.
    """
    df_renombrado = df.copy()
    # Asegura que los nombres de columna sean strings
    df_renombrado.columns = df_renombrado.columns.astype(str)
    
    mapeo_final = {} # Aquí se guardará el mapeo: {'Nombre Viejo': 'Nombre Estándar'}
    
    # Crea un diccionario de búsqueda "limpio" de las columnas del DF
    # ej: {'numeroescuela': 'Numero Escuela'}
    columnas_df = {col.lower().replace(" ", "").replace("_", ""): col for col in df_renombrado.columns}
    
    # Itera sobre el diccionario estándar
    for nombre_estandar, posibles_nombres in COLUMNAS_CONOCIDAS.items():
        # Itera sobre las variantes sucias (ej: 'lat', 'Latitud', 'latitud')
        for nombre_posible in posibles_nombres:
            # "Limpia" el nombre sucio para compararlo
            # ej: 'Numero Escuela' -> 'numeroescuela'
            nombre_posible_norm = nombre_posible.lower().replace(" ", "").replace("_", "")
            
            # Si la versión limpia (ej: 'numeroescuela') existe en las columnas del DF...
            if nombre_posible_norm in columnas_df:
                # ...obtiene el nombre original del DF (ej: 'Numero Escuela')
                nombre_original = columnas_df[nombre_posible_norm]
                # ...y crea la regla de renombrado
                # ej: {'Numero Escuela': 'Numero_Escuela'}
                mapeo_final[nombre_original] = nombre_estandar
                # Rompe el bucle para no mapear dos veces la misma columna estándar
                break 
                
    # Aplica el renombrado al DataFrame
    df_renombrado.rename(columns=mapeo_final, inplace=True)
    return df_renombrado

def procesar_archivos_y_actualizar(lista_de_archivos, df_existente):
    """
    Función principal del módulo. Es llamada por 'asignador.py'.
    Recibe la lista de archivos subidos y un df_existente (no usado actualmente).
    Procesa, limpia, fusiona y devuelve un único DataFrame listo para la BD.
    """
    data_files_dfs = []   # Lista para DFs con Turno/División
    coord_files_dfs = []  # Lista para DFs con Latitud/Longitud

    # --- 1. Leer y Clasificar todos los archivos ---
    for archivo in lista_de_archivos:
        try:
            # Lee CSV
            if archivo.filename.endswith('.csv'):
                df_nuevo = pd.read_csv(archivo, on_bad_lines='skip')
            # Lee Excel (todas las hojas)
            else:
                # sheet_name=None lee TODAS las hojas en un diccionario
                df_sheets = pd.read_excel(archivo, sheet_name=None)
                # Concatena todas las hojas en un solo DataFrame
                df_nuevo = pd.concat(df_sheets.values(), ignore_index=True)
                
            # --- Normalizar ---
            df_nuevo_normalizado = normalizar_columnas(df_nuevo)
            
            # --- Clasificar ---
            # Si tiene Lat y Lon, es un archivo de coordenadas
            if 'Latitud' in df_nuevo_normalizado.columns and 'Longitud' in df_nuevo_normalizado.columns:
                coord_files_dfs.append(df_nuevo_normalizado)
            # Si no, es un archivo de datos (divisiones/turnos)
            else:
                data_files_dfs.append(df_nuevo_normalizado)
                
        except Exception as e:
            # Si un archivo falla, lo salta y sigue con el siguiente
            print(f"ADVERTENCIA: No se pudo procesar el archivo '{archivo.filename}'. Error: {e}")
            continue

    # --- 2. Validar que tengamos ambos tipos de datos ---
    # Si falta alguno de los dos tipos, la fusión (merge) es imposible.
    if not data_files_dfs or not coord_files_dfs:
        print("ERROR: Se necesitan ambos tipos de archivos (datos de división/turno y datos de coordenadas) para procesar.")
        return pd.DataFrame() # Devuelve un DF vacío

    # --- 3. Procesar Archivos de DATOS (Turno/División) ---
    df_data = pd.concat(data_files_dfs, ignore_index=True)

    # Limpieza de CUE (crucial para el merge)
    if 'CUE' in df_data.columns:
        # Convierte a string, quita el '.0' (ej: '5024.0' -> '5024'), quita espacios
        df_data['CUE'] = df_data['CUE'].astype(str).str.split('.').str[0].str.strip()
        # Reemplaza valores nulos ('nan', 'None') por el nulo real de Pandas (np.nan)
        df_data['CUE'].replace(['nan', 'None', ''], np.nan, inplace=True)
    else:
        df_data['CUE'] = np.nan # Si no existe la columna, la crea vacía

    # Limpieza de Turno
    if 'Turno' in df_data.columns:
        # Estandariza 'mañana' -> 'Mañana', 'tarde' -> 'Tarde'
        turno_map = {'mañana': 'Mañana', 'tarde': 'Tarde'}
        df_data['Turno'] = df_data['Turno'].astype(str).str.lower().map(turno_map)

    # Elimina filas que no sirven para asignar (sin CUE o sin Turno)
    df_data.dropna(subset=['CUE', 'Turno'], inplace=True)
    
    # --- 4. Procesar Archivos de COORDENADAS ---
    df_coords = pd.concat(coord_files_dfs, ignore_index=True)

    # Limpieza de CUE (igual que antes)
    if 'CUE' in df_coords.columns:
        df_coords['CUE'] = df_coords['CUE'].astype(str).str.split('.').str[0].str.strip()
        df_coords['CUE'].replace(['nan', 'None', ''], np.nan, inplace=True)
    else:
        df_coords['CUE'] = np.nan
    
    # Limpieza de Lat/Lon (asegura que sean números)
    if 'Latitud' in df_coords.columns:
        df_coords['Latitud'] = pd.to_numeric(df_coords['Latitud'], errors='coerce')
    if 'Longitud' in df_coords.columns:
        df_coords['Longitud'] = pd.to_numeric(df_coords['Longitud'], errors='coerce')
            
    # --- 5. Crear Tabla de Búsqueda (Lookup Table) de Coordenadas ---
    # Esto es vital para asegurar que haya UNA sola coordenada por CUE.
    df_coords_lookup = df_coords[['CUE', 'Latitud', 'Longitud']].copy()
    df_coords_lookup.dropna(inplace=True) # Elimina filas sin CUE o sin Lat/Lon
    # Si un CUE aparece varias veces, se queda con el ÚLTIMO (el más reciente)
    df_coords_lookup.drop_duplicates(subset=['CUE'], keep='last', inplace=True)
    
    # --- 6. Fusión (Merge) ---
    # Cruza los datos (con Turno) con las coordenadas (con Lat/Lon) usando 'CUE'.
    # 'how='inner'' asegura que SOLO las escuelas que están en AMBOS DFs sobrevivan.
    df_merged = pd.merge(df_data, df_coords_lookup, on='CUE', how='inner')

    # --- 7. Formateo Final (Preparar para BD) ---
    # Define la estructura exacta de la tabla 'escuelas_data'
    formato_final_columnas = [
        'ID_Escuela', 'CUE', 'Subcue', 'Numero_Escuela', 'Numero_Anexo',
        'Nivel', 'Gestion', 'Nombre_Escuela', 'Departamento', 'Latitud',
        'Longitud', 'Curso', 'Division', 'Turno', 'Matricula'
    ]
    
    # Añade columnas que falten (ej: 'Nivel') como 'None'
    for col in formato_final_columnas:
        if col not in df_merged.columns:
            df_merged[col] = None

    # Rellena valores nulos con defaults para asegurar consistencia
    df_merged.fillna({
        'Nivel': 'Primario', 'Gestion': 'Pública', 'Curso': '6°', 
        'Subcue': 0, 'ID_Escuela': 0, 'Matricula': 0, 'Numero_Anexo': 0
    }, inplace=True)
    
    print(f"Proceso de fusión completo. Total de 'slots' (filas) con datos y coordenadas: {len(df_merged)}")
    
    # Devuelve el DF final, solo con las columnas en el orden correcto
    return df_merged[formato_final_columnas]