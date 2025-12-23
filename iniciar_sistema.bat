@echo off
cd /d "%~dp0"

echo Iniciando Sistema PPS...
echo Directorio base: %CD%

:: 1. Inicia el Backend
start "Backend API" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && py asignador.py"

:: Espera 5 segundos
timeout /t 5

:: 2. Inicia el Frontend
start "Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Sistema iniciado. Si no se abre, ve a: http://localhost:5173
pause