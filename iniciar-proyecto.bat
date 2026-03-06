@echo off
title Sistema DGE - Asignador de Profesores
color 0b

:: 1. Iniciar el Backend (Flask)
echo [1/3] Iniciando Backend con Entorno Virtual...
start /min cmd /k "cd backend && .\venv\Scripts\activate && py app.py"

:: 2. Iniciar el Frontend (React)
echo [2/3] Levantando Interfaz de Usuario (React)...
start /min cmd /k "cd frontend && npm run dev"

:: 3. Esperar y Abrir el Navegador
echo [3/3] Preparando el entorno... 
timeout /t 10 /nobreak > nul

echo.
echo ¡Todo listo! Abriendo el Asignador en tu navegador...
start http://localhost:5173

echo.
echo --------------------------------------------------
echo El sistema esta corriendo. 
echo NO CIERRES esta ventana mientras uses el programa.
echo --------------------------------------------------
pause
exit