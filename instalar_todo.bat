@echo off
title Instalador Automatico PPS
cd /d "%~dp0"

echo ==========================================
echo   INSTALADOR DE DEPENDENCIAS - PPS
echo ==========================================
echo.
echo 1. Configurando el BACKEND...

if not exist "backend" (
    echo [ERROR] No encuentro la carpeta 'backend'.
    echo Asegurate de que este archivo este junto a las carpetas 'backend' y 'frontend'.
    pause
    exit
)

cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo * Nota: Se conservara la base de datos existente.
echo.
echo [OK] Backend listo.
echo.
cd /d "%~dp0"

echo 2. Configurando el FRONTEND...
if not exist "frontend" (
    echo [ERROR] No encuentro la carpeta 'frontend'.
    pause
    exit
)

cd frontend
call npm install
echo.
echo [OK] Frontend listo.
echo.

echo ==========================================
echo   INSTALACION COMPLETADA
echo ==========================================
pause