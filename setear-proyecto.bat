@echo off
title SETUP - Sistema DGE
color 0e

echo ==================================================
echo INSTALACION INICIAL DEL SISTEMA ASIGNADOR
echo ==================================================

:: 1. Permisos de PowerShell
echo [1/6] Configurando permisos de ejecucion...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

:: 2. Creacion del Entorno Virtual
echo [2/6] Preparando entorno de Python...
cd backend
if exist venv (
    echo    - Entorno virtual detectado, actualizando...
) else (
    py -m venv venv
)
call .\venv\Scripts\activate

:: 3. Instalacion de dependencias
echo [3/6] Instalando librerias necesarias...
py -m pip install --upgrade pip
pip install -r requirements.txt

:: 4. Limpieza y Creación de Base de Datos
echo [4/6] Configurando base de datos...
:: Entramos a la carpeta si no estamos ya ahí (por seguridad)
if exist asignador.db (
    echo    - Eliminando base de datos previa para instalacion limpia...
    del /f /q asignador.db
)
py crear_db.py

:: 5. Creación Interactiva de Admin
py crear_admin.py

:: 6. Instalación de Frontend
echo [5/6] Instalando modulos de la interfaz (React)...
cd ..
cd frontend
call npm install

echo.
echo ==================================================
echo INSTALACION FINALIZADA
echo ==================================================
echo Ya podes cerrar esta ventana y usar 'iniciar-proyecto.bat'
echo.
pause
exit