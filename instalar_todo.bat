@echo off
title Instalador Automatico PPS
echo ==========================================
echo   INSTALADOR DE DEPENDENCIAS - PPS
echo ==========================================
echo.
echo 1. Configurando el BACKEND...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo * Nota: Se utilizara la base de datos existente con datos de prueba.
echo.
echo [OK] Backend listo.
echo.

echo 2. Configurando el FRONTEND...
cd ..\frontend
call npm install
echo.
echo [OK] Frontend listo.
echo.

echo ==========================================
echo   INSTALACION COMPLETADA
echo ==========================================
pause