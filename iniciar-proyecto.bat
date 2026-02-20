@echo off
title Sistema DGE - Asignador de Profesores

:: 1. Iniciar el Backend (Flask) minimizado
echo Iniciando Backend...
start /min cmd /k "cd backend && python app.py"

:: 2. Iniciar el Frontend (Vite) minimizado
echo Iniciando Frontend...
start /min cmd /k "cd frontend && npm run dev"

:: 3. Esperar a que los servicios levanten y abrir el navegador
echo Cargando sistema...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo ¡Sistema en marcha! Puedes minimizar esta ventana.
exit