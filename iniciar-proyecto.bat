@echo off
title Sistema DGE - Asignador de Profesores

:: 1. Iniciar el Backend (Flask) con entorno virtual minimizado
echo Iniciando Backend con VENV...
start /min cmd /k "cd backend && .\venv\Scripts\activate && python app.py"

:: 2. Iniciar el Frontend (Vite) minimizado
echo Iniciando Frontend...
start /min cmd /k "cd frontend && npm run dev"

:: 3. Esperar a que los servicios levanten y abrir el navegador
echo Cargando sistema...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo ¡Sistema en marcha! Puedes minimizar esta ventana.
exit