import pandas as pd
import numpy as np
import logging
import unicodedata
import re
from extensions import socketio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COLUMNAS_REQUERIDAS = [
    'Departamento', 'CUE', 'Numero_Escuela', 'Numero_Anexo', 
    'Nombre_Escuela', 'Division', 'Turno', 'Latitud', 'Longitud'
]

COLUMNAS_CONOCIDAS = {
    'CUE': ['CUE', 'C.U.E.', 'cue', 'Cue'],
    'Numero_Escuela': ['Número_escuela', 'Numero_escuela', 'Numero Escuela', 'Escuela N°', 'nro_escuela', 'Escuela', 'N°', 'Número escuela'],
    'Numero_Anexo': ['Número_Anexo', 'Numero_Anexo', 'Numero Anexo', 'anexo', 'Anexo', 'Número Anexo'],
    'Nombre_Escuela': ['Nombre_Escuela', 'Nombre Escuela', 'Establecimiento', 'nombre', 'Nombre', 'NOMBRE'],
    'Departamento': ['Departamento', 'depto', 'DEPARTAMENTO', 'Jurisdiccion', 'Distrito', 'DEPTO'],
    'Division': ['División', 'Division', 'Div', 'division', 'Año/División', 'Grado', 'DIV', 'Sección'],
    'Turno': ['Turno', 'TURNO', 'turno', 'Turnos', 'TURNO_DESCRIPCION', 'Turno Escolar'],
    'Latitud': ['latitud', 'Latitud', 'lat', 'LAT', 'LATITUD'],
    'Longitud': ['longitud', 'Longitud', 'lon', 'lng', 'LONG', 'LONGITUD']
}

def normalizar_texto_base(texto):
    """Limpia tildes, caracteres especiales y deja todo en minúsculas."""
    if pd.isna(texto) or str(texto).strip() == "": return ""
    texto = str(texto).lower().strip()
    # Quitar tildes y diéresis
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    # Quitar todo lo que no sea letras, números o espacios
    texto = re.sub(r'[^a-z0-9\s]', '', texto)
    return ' '.join(texto.split())

def normalizar_division(div):
    """
    Convierte números a letras (1=A, 2=B) y limpia cualquier texto raro.
    Si no se identifica una letra o número claro, devuelve 'A'.
    """
    if pd.isna(div): return "A"
    d = str(div).strip().upper()
    
    # 1. Quitar palabras de error comunes
    if any(k in d for k in ['UNICA', 'NICA', 'TARDE', 'COMPLETO', 'NAN']): return "A"
    
    # 2. Si es un número (ej: "1" o "1ra"), lo mapeamos a letra
    nums = re.findall(r'\d+', d)
    if nums:
        n = int(nums[0])
        # Mapeo: 1=A, 2=B, 3=C... (usando código ASCII)
        if 1 <= n <= 26:
            return chr(64 + n)
    
    # 3. Si tiene una letra sola en cualquier lugar del string
    letras = re.findall(r'[A-Z]', d)
    if letras:
        # Evitamos la 'R' de 1ra si es la única encontrada
        candidata = letras[0]
        if candidata == 'R' and len(letras) > 1: candidata = letras[1]
        elif candidata == 'R' and len(letras) == 1: return "A"
        return candidata
    
    return "A"

def normalizar_turno(turno):
    """Estandariza a MAÑANA o TARDE. Todo lo demás va a MAÑANA."""
    if pd.isna(turno): return "MAÑANA"
    t = str(turno).lower()
    if any(k in t for k in ['tar', 'vesp', 'noc']): return "TARDE"
    return "MAÑANA"

def normalizar_nombres_columnas(df):
    df_renombrado = df.copy()
    df_renombrado = df_renombrado.loc[:, ~df_renombrado.columns.duplicated()].copy()
    mapeo_final = {}
    for nombre_estandar, posibles in COLUMNAS_CONOCIDAS.items():
        for col_real in df_renombrado.columns:
            c_clean = str(col_real).lower().replace(" ", "").replace("_", "").replace(".", "")
            if "anexo" in c_clean and nombre_estandar == 'CUE': continue
            if any(p.lower().replace(" ", "").replace("_", "").replace(".", "") == c_clean for p in posibles):
                if nombre_estandar not in mapeo_final.values():
                    mapeo_final[col_real] = nombre_estandar
                break
    return df_renombrado.rename(columns=mapeo_final)

def procesar_archivos_y_actualizar(lista_de_archivos):
    all_slots = []
    
    for archivo in lista_de_archivos:
        try:
            excel_file = pd.ExcelFile(archivo, engine='openpyxl')
            for sheet_name in excel_file.sheet_names:
                df_raw = excel_file.parse(sheet_name, header=None)
                if df_raw.empty: continue

                # BUSCADOR DINÁMICO DE ENCABEZADO
                fila_idx = None
                for i, fila in df_raw.iterrows():
                    val_limpios = [str(v).strip().upper() for v in fila.values if pd.notna(v)]
                    if 'CUE' in val_limpios:
                        fila_idx = i
                        break
                
                if fila_idx is None: continue

                df = excel_file.parse(sheet_name, skiprows=fila_idx + 1)
                df.columns = [str(c).strip() for c in df_raw.iloc[fila_idx].values]
                df = normalizar_nombres_columnas(df)

                if 'CUE' in df.columns:
                    # CUE: 9 dígitos exactos
                    df['CUE'] = df['CUE'].apply(lambda x: str(int(float(str(x).replace(',','.')))) if pd.notna(x) and str(x).strip() not in ['','NaN','nan'] else None)
                    df['CUE'] = df['CUE'].str.zfill(9)
                    df = df.dropna(subset=['CUE'])
                    
                    # Numero_Anexo: Tratar como string, si falta va a "0"
                    if 'Numero_Anexo' not in df.columns: 
                        df['Numero_Anexo'] = "0"
                    else:
                        df['Numero_Anexo'] = df['Numero_Anexo'].astype(str).str.strip()

                    cols_ok = [c for c in df.columns if c in COLUMNAS_CONOCIDAS.keys()]
                    all_slots.append(df[cols_ok])
        except Exception as e:
            logger.error(f"Error procesando {archivo.filename}: {e}")

    if not all_slots: raise ValueError("No se encontraron tablas válidas.")

    df_total = pd.concat(all_slots, ignore_index=True)

    # --- CONSOLIDACIÓN EN DOS PASOS (Coordenadas por CUE, Slots por Escuela) ---
    # 1. Mapa de Geo por CUE (para que si el archivo de geo no tiene divisiones, igual les pegue la lat/lon)
    df_geo_map = df_total.groupby('CUE')[['Latitud', 'Longitud', 'Departamento']].first().reset_index()
    
    # 2. Slots Únicos (CUE + N° Escuela + Anexo + División + Turno)
    df_slots = df_total.drop(columns=['Latitud', 'Longitud', 'Departamento'], errors='ignore')
    df_slots = df_slots.groupby(['CUE', 'Numero_Escuela', 'Numero_Anexo', 'Division', 'Turno'], as_index=False).first()

    # 3. Fusión final
    df_final = pd.merge(df_slots, df_geo_map, on='CUE', how='left')

    # Rellenar faltantes
    for col in COLUMNAS_REQUERIDAS:
        if col not in df_final.columns: df_final[col] = None

    df_final['Departamento'] = df_final['Departamento'].apply(normalizar_texto_base)
    df_final['Nombre_Escuela'] = df_final['Nombre_Escuela'].apply(lambda x: str(x).upper().strip())
    df_final['Division'] = df_final['Division'].apply(normalizar_division)
    df_final['Turno'] = df_final['Turno'].apply(normalizar_turno)
    
    # Coordenadas a float puro
    for col in ['Latitud', 'Longitud']:
        df_final[col] = pd.to_numeric(df_final[col].astype(str).str.replace(',', '.'), errors='coerce')

    return df_final[COLUMNAS_REQUERIDAS].drop_duplicates()