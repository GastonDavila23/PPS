@echo off
SET "BASE_DIR=%~dp0"

echo ==========================================
echo   INICIANDO SISTEMA PPS
echo ==========================================

:: 1. Inicia el Backend
start "Backend API" /D "%BASE_DIR%backend" cmd /k "call venv\Scripts\activate && py asignador.py"

:: Espera un poco
timeout /t 5

:: 2. Inicia el Frontend
start "Frontend App" /D "%BASE_DIR%frontend" cmd /k "npm run dev"

echo.
echo Sistema iniciado. Ve a: http://localhost:5173
echo (Si cierras esta ventana, los servidores seguiran corriendo)
pause