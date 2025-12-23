@echo off
title Instalador Automatico PPS
SET "BASE_DIR=%~dp0"

echo ==========================================
echo   INSTALADOR DE DEPENDENCIAS - PPS
echo ==========================================
echo.

echo 1. Entrando al BACKEND...

pushd "%BASE_DIR%backend"

if errorlevel 1 (
    echo [ERROR] No encuentro la carpeta 'backend'.
    pause
    exit
)

echo Configurando Python...
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo [OK] Backend listo.

popd
echo.

echo 2. Entrando al FRONTEND...
pushd "%BASE_DIR%frontend"

if errorlevel 1 (
    echo [ERROR] No encuentro la carpeta 'frontend'.
    pause
    exit
)

echo Instalando librerias de Node...
call npm install
echo.
echo [OK] Frontend listo.

popd
echo.

echo ==========================================
echo   INSTALACION COMPLETADA
echo ==========================================
pause