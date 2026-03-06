@echo off
title Sistema DGE - Asignador de Profesores
color 0b

:: 1. Verificación de integridad
if not exist "backend\venv" (
    color 0c
    echo [ERROR] No se encontro el entorno virtual en \backend\venv.
    echo Por favor, ejecuta primero 'setup-proyecto.bat'.
    pause
    exit
)

echo ==================================================
echo      INICIANDO SISTEMA ASIGNADOR DOCENTE
echo ==================================================
echo.

:: 1. Iniciar el Backend (Flask)
echo [1/3] Iniciando Backend...
start "Backend - Flask" /min cmd /k "cd backend && .\venv\Scripts\activate && py app.py"

:: 2. Iniciar el Frontend (React)
echo [2/3] Levantando Interfaz de Usuario...
start "Frontend - React" /min cmd /k "cd frontend && npm run dev"

:: 3. Esperar y Abrir el Navegador
echo [3/3] Sincronizando servicios (10s)... 
timeout /t 10 /nobreak > nul

echo.
echo ¡Todo listo! Abriendo el Asignador en tu navegador...
start http://localhost:5173

echo.
echo --------------------------------------------------
echo EL SISTEMA ESTA CORRIENDO. 
echo - Podes minimizar esta ventana, pero NO la cierres.
echo - Para apagar el sistema, cerra las ventanas negras.
echo --------------------------------------------------
pause
exit