@echo off
chcp 65001 >nul
title Entregable 6 - Tienda de Software y Videojuegos
cd /d "%~dp0"

echo ====================================================
echo    Entregable 6 - Tienda de Software y Videojuegos
echo ====================================================
echo.

REM Verificar que Node.js / npm estén instalados
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] No se encontró npm en el sistema.
    echo         Instala Node.js desde https://nodejs.org/ y vuelve a intentarlo.
    echo.
    pause
    exit /b 1
)

REM Instalar dependencias solo la primera vez
if not exist "node_modules" (
    echo [1/4] Instalando dependencias por primera vez...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Falló la instalación de dependencias.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Dependencias ya instaladas.
)

REM Compilar SCSS a CSS
echo [2/4] Compilando estilos: SCSS a CSS...
call npm run build
if errorlevel 1 (
    echo [ERROR] Falló la compilación de SCSS. Revisa los errores de Sass.
    pause
    exit /b 1
)

REM Servidor local: obligatorio para que el video de YouTube se reproduzca
echo [3/4] Levantando servidor local en http://localhost:8080 ...
start "Servidor local - Entregable 6" cmd /c "npm run serve"

REM Modo desarrollo: vigilar cambios en scss/
if /i "%~1"=="no-watch" (
    echo [4/4] Listo. Cerrá la ventana del servidor para detenerlo.
) else (
    echo [4/4] Modo desarrollo activo: los cambios en scss\ se recompilan solos.
    echo        Presiona Ctrl + C para detener.
    echo.
    call npm run watch
)

pause
exit /b 0
