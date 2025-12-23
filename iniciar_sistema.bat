@echo off
echo Iniciando Sistema PPS...

:: 1. Inicia el Backend 
start "Backend API" cmd /k "cd backend && call venv\Scripts\activate && py asignador.py"

:: Espera 5 segundos para darle tiempo al backend
timeout /t 5

:: 2. Inicia el Frontend
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo Sistema iniciado. Si no se abre automaticamente, ve a: http://localhost:5173
pause