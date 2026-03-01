import pandas as pd
import numpy as np
import logging
import unicodedata

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COLUMNAS_CONOCIDAS = {
    'CUE': ['CUE', 'cue', 'CUEAnexo', 'C.U.E.'],
    'Numero_Escuela': ['Número_escuela', 'Numero_escuela', 'Numero Escuela', 'Escuela N°'],
    'Numero_Anexo': ['Número_Anexo', 'Numero_Anexo', 'Numero Anexo'],
    'Nombre_Escuela': ['Nombre_Escuela', 'Nombre Escuela', 'Escuela', 'Establecimiento'],
    'Departamento': ['Departamento'],
    'Division': ['División', 'Division', 'Div'],
    'Turno': ['Turno', 'TURNO'],
    'Matricula': ['Matrícula', 'Matricula'],
    'Latitud': ['latitud', 'Latitud', 'lat', 'LAT'],
    'Longitud': ['longitud', 'Longitud', 'lon', 'lng', 'LONG'],
    'ID_Escuela': ['ID_Escuela', 'ID Escuela', 'id_escuela'],
    'Curso': ['Curso', 'curso'],
    'Subcue': ['Subcue'],
    'Nivel': ['Nivel'],
    'Gestion': ['Gestion']
}

def normalizar_departamento(depto):
    if pd.isna(depto): return "NO ESPECIFICADO"
    texto = str(depto).strip().upper()
    texto_sin_tildes = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    return texto_sin_tildes

def normalizar_turno(turno):
    if pd.isna(turno): return "Mañana" 
    
    t = str(turno).lower().strip()
    
    if 'tarde' in t or 'vespertino' in t or 'noche' in t:
        return "Tarde"
        
    return "Mañana"

def limpiar_valor_cue(val):
    if pd.isna(val): return None
    return str(val).strip().split('.')[0]

def limpiar_numerico(serie):
    """Convierte a número de forma segura, tratando '-' y vacíos como NaN."""
    s = serie.astype(str).str.replace('-', '').str.strip()
    return pd.to_numeric(s, errors='coerce')

def normalizar_nombres_columnas(df):
    df_renombrado = df.copy()
    df_renombrado.columns = df_renombrado.columns.astype(str)
    columnas_df = {col.lower().replace(" ", "").replace("_", ""): col for col in df_renombrado.columns}
    mapeo_final = {}
    for nombre_estandar, posibles_nombres in COLUMNAS_CONOCIDAS.items():
        for nombre_posible in posibles_nombres:
            norm = nombre_posible.lower().replace(" ", "").replace("_", "")
            if norm in columnas_df:
                mapeo_final[columnas_df[norm]] = nombre_estandar
                break 
    return df_renombrado.rename(columns=mapeo_final)

def extraer_datos_archivos(lista_de_archivos):
    data_dfs, coord_dfs = [], []
    for archivo in lista_de_archivos:
        try:
            if archivo.filename.endswith('.csv'):
                df = pd.read_csv(archivo)
            else:
                df = pd.concat(pd.read_excel(archivo, sheet_name=None).values(), ignore_index=True)
            
            df = normalizar_nombres_columnas(df)
            
            if 'Latitud' in df.columns and 'Longitud' in df.columns:
                coord_dfs.append(df)
            else:
                data_dfs.append(df)
        except Exception as e:
            logger.error(f"Error en {archivo.filename}: {e}")
    return data_dfs, coord_dfs

def procesar_archivos_y_actualizar(lista_de_archivos, df_existente=None):
    data_list, coord_list = extraer_datos_archivos(lista_de_archivos)

    if not data_list and coord_list:
        logger.info("Procesando archivo unificado (Datos y Coordenadas juntos).")
        df_merged = pd.concat(coord_list, ignore_index=True)
        if 'CUE' in df_merged.columns:
            df_merged['CUE'] = df_merged['CUE'].apply(limpiar_valor_cue)
        df_merged['Latitud'] = limpiar_numerico(df_merged['Latitud'])
        df_merged['Longitud'] = limpiar_numerico(df_merged['Longitud'])

    elif data_list and coord_list:
        logger.info("Procesando archivos separados. Cruzando por CUE.")
        df_data = pd.concat(data_list, ignore_index=True)
        if 'CUE' in df_data.columns:
            df_data['CUE'] = df_data['CUE'].apply(limpiar_valor_cue)
        
        df_coords = pd.concat(coord_list, ignore_index=True)
        df_coords['CUE'] = df_coords['CUE'].apply(limpiar_valor_cue)
        df_coords['Latitud'] = limpiar_numerico(df_coords['Latitud'])
        df_coords['Longitud'] = limpiar_numerico(df_coords['Longitud'])
        
        df_lookup = df_coords.dropna(subset=['Latitud', 'Longitud']).drop_duplicates('CUE', keep='last')
        df_merged = pd.merge(df_data, df_lookup[['CUE', 'Latitud', 'Longitud']], on='CUE', how='inner')
    
    else:
        logger.error("No se detectaron coordenadas (Latitud/Longitud) en ninguno de los archivos.")
        return pd.DataFrame()

    cols = ['ID_Escuela', 'CUE', 'Subcue', 'Numero_Escuela', 'Numero_Anexo', 'Nivel', 'Gestion', 
            'Nombre_Escuela', 'Departamento', 'Latitud', 'Longitud', 'Curso', 'Division', 'Turno', 'Matricula']
    
    for col in cols:
        if col not in df_merged.columns: df_merged[col] = None
    
    if 'Matricula' in df_merged.columns:
        df_merged['Matricula'] = limpiar_numerico(df_merged['Matricula']).fillna(0)

    if 'Departamento' in df_merged.columns:
        df_merged['Departamento'] = df_merged['Departamento'].apply(normalizar_departamento)
        
    if 'Turno' in df_merged.columns:
        df_merged['Turno'] = df_merged['Turno'].apply(normalizar_turno)

    return df_merged[cols].fillna({'Matricula': 0, 'Subcue': 0, 'Nivel': 'Primario', 'Gestion': 'Pública', 'Turno': 'Mañana'})