# Sistema Asignador Geográfico de Profesores (PPS)

Este proyecto es un sistema web full-stack diseñado para resolver la compleja logística de asignación de profesores a escuelas, basado en criterios de cercanía geográfica y disponibilidad. El sistema está orientado a la gestión de la Dirección General de Escuelas (DGE) y sirve como Proyecto Final de Prácticas Profesionales Supervisadas.

---

## Problema y Solución

La reubicación y asignación de profesores (especialmente en niveles primarios) es un desafío logístico que involucra cientos de variables: escuelas de origen, escuelas de destino, turnos, divisiones y, sobre todo, distancias.

Este sistema automatiza el proceso completo:

1.  **Ingesta de Datos:** Permite a los administradores cargar múltiples planillas Excel/CSV con datos "sucios" (nombres de columna inconsistentes, formatos variados, hojas múltiples).
2.  **Limpieza y Unificación:** Un motor de ETL (Extract, Transform, Load) en el backend normaliza, limpia y fusiona los datos, cruzando la información de los profesores (turnos/divisiones) con los datos geográficos (latitud/longitud) usando el CUE como llave única.
3.  **Cálculo Geográfico:** El backend calcula la distancia geodésica entre la escuela de origen de un profesor y todas las posibles escuelas de destino que coincidan en el turno, asignando al profesor a la escuela más cercana disponible (dentro de un radio de 30 km).
4.  **Visualización y Análisis:** Una interfaz de usuario moderna permite a los gestores filtrar y analizar los resultados, con un panel de control interactivo, paginación y búsqueda en tiempo real.
5.  **Reportes y Seguridad:** El sistema permite descargar reportes en Excel con formato profesional (cabeceras, colores, auto-ajuste) y cuenta con un sistema de roles (Admin, Profesor, Pendiente) gestionado por Auth0.

---

## Características Principales

* **Carga de Múltiples Archivos:** Ingesta de archivos `.xlsx` y `.csv`, con lectura de múltiples hojas.
* **Motor de Limpieza de Datos:** Normalización automática de nombres de columnas (ej: "Numero Escuela" y "N° Escuela" se mapean a `Numero_Escuela`).
* **Asignación Geográfica:** Cálculo de distancia (geopy) para encontrar la asignación óptima.
* **Frontend Reactivo:** Interfaz de usuario rápida y moderna construida con React y Vite.
* **Filtros Avanzados:** Filtra asignaciones por Departamento, Turno, Estado (rango de KM) y búsqueda por nombre de escuela con *debounce*.
* **Paginación:** Manejo eficiente de grandes volúmenes de datos.
* **Autenticación y Roles:** Sistema seguro con Auth0 que maneja 3 niveles de usuario:
    * **Admin:** Control total (carga, descarga, asigna roles).
    * **Profesor:** Solo puede ver la tabla de datos.
    * **Profesor-Pendiente:** No puede ver datos hasta que un Admin lo apruebe.
* **Panel de Administración:** Interfaz para que los Admins promuevan o revoquen roles.
* **Reportes Excel Profesionales:** Generación de archivos `.xlsx` con filtros aplicados, cabeceras verdes, filas intercaladas y ancho de columna automático.

---

## Tech Stack (Tecnologías Usadas)

Este proyecto está dividido en dos partes principales: un backend API REST y un frontend SPA (Single Page Application).

### Backend (Carpeta `/backend`)
* **Python 3.10+**
* **Flask:** Para crear la API REST.
* **Pandas:** Para la ingesta, limpieza y manipulación de datos de los Excel.
* **Geopy:** Para los cálculos de distancia geodésica.
* **Openpyxl:** Para aplicar estilos avanzados (colores, fuentes, bordes) a los reportes de Excel.
* **SQLite3:** Como base de datos ligera y robusta para almacenar usuarios, datos de escuelas y resultados.

### Frontend (Carpeta `/frontend`)
* **React 18**
* **TypeScript:** Para un código más robusto y mantenible.
* **Vite:** Como herramienta de build y servidor de desarrollo (ultrarrápido).
* **React-Bootstrap:** Para los componentes de UI (Tabla, Modales, Filtros, Navbar).
* **React-Bootstrap-Icons:** Para la iconografía.
* **Axios:** Para realizar las peticiones a la API del backend.

### Autenticación
* **Auth0:** Para el manejo completo de inicio de sesión, registro y seguridad de la API.

---

## Instalación y Puesta en Marcha

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

### 1. Prerrequisitos
* Tener instalado [Python 3.10+](https://www.python.org/downloads/)
* Tener instalado [Node.js 18+](https://nodejs.org/)

### 2. Configurar el Backend

1.  Ve a la carpeta del backend
    ```bash
    cd backend
    ```

2.  Crea un entorno virtual
    ```bash
    python -m venv venv
    ```

3.  Ingresa al entorno virtual
    ```bash
    .\venv\Scripts\activate
    ```
    
4.  Instala las dependencias de Python
    ```bash
    pip install -r requirements.txt
    ```
5.  Crea el admin 
    ```bash
    py crear_db.py
    ```

6.  Crea el admin 
    ```bash
    py crear_admin.py
    ```
    > **Nota:** Agregar el correo a utilizar como admin

7.  Inicia el servidor del backend
    ```bash
    py app.py
    ```

### 3. Configurar el frontend

1.  Abre una **NUEVA** terminal y ve a la carpeta del frontend
    ```bash
    cd frontend
    ```

2.  Instala las dependencias de Node.js
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo de Vite (Se ejecutará en `http://localhost:5173`)
    ```bash
    npm run dev
    ```

### 4. Configurar Auth0
Este proyecto requiere una cuenta de Auth0 para funcionar.

1.  Crea una cuenta en Auth0.
2.  Crea una **Aplicación (Application)** de tipo "Single Page Application".
3.  Crea una **API** (en el menú "Applications" > "APIs").
    * Dale un "Identifier" (ej: `https://api-asignador-escuelas/`). Este es tu `Audience`.
4.  En la configuración de tu **Aplicación (SPA)**:
    * Añade `http://localhost:5173` a las "Allowed Callback URLs", "Allowed Logout URLs" y "Allowed Web Origins".
5.  Crea el archivo `.env.local` en `frontend/`:
    ```bash
    VITE_AUTH0_DOMAIN=el-dominio-que-te-de-auth0
    VITE_AUTH0_CLIENT_ID=el-client-id-que-te-de-auth0
    ```
    > **Nota:** Reemplaza las variables Domain y Client que te brinda la app de Auth0.

### 5. Automatización para el Usuario (Archivo .bat)
Para facilitar la ejecución diaria sin abrir terminales manualmente, el proyecto incluye un script de automatización:

1. Al archivo `iniciar-proyecto.bat` ubicado en la raíz de la carpeta `PPS`.
2. Hazle clic derecho y selecciona **"Enviar a > Escritorio (crear acceso directo)"**.
3. (Opcional) Cambiar el icono del acceso directo.

> **Nota:** Al ejecutar este archivo, se levantarán automáticamente el backend (Flask), el frontend (Vite) y se abrirá el navegador en la dirección del proyecto.


---

## Autor y Contexto del Proyecto

Este sistema fue diseñado, desarrollado e implementado en su totalidad por:

* **Autor:** Gastón Dávila
* **DNI:** 40.560.098
* **Legajo:** 51520

Este repositorio sirve como entrega final y demostración de las competencias adquiridas durante las **Prácticas Profesionales Supervisadas** de la carrera **Tecnicatura Universitaria en Programación** realizada en **UTN**.
