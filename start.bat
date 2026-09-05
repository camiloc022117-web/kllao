@echo off
title K'lliao - Sistema de Ventas

echo Iniciando K'lliao...
echo.

:: Backend
echo [1/3] Iniciando servidor backend...
start "K'lliao Backend" cmd /k "cd /d %~dp0backend && node index.js"

:: Esperar 2 segundos para que el backend arranque primero
timeout /t 2 /nobreak > nul

:: Frontend
echo [2/3] Iniciando servidor frontend...
start "K'lliao Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Esperar 2 segundos
timeout /t 2 /nobreak > nul

:: Reports
echo [3/3] Iniciando servidor de reportes...
start "K'lliao Reports" cmd /k "cd /d %~dp0reports && python server.py"

:: Esperar 3 segundos para que todo arranque
timeout /t 3 /nobreak > nul

:: Abrir el navegador
echo.
echo Abriendo K'lliao en el navegador...
start "" "http://localhost:5173"

echo.
echo K'lliao iniciado correctamente.
echo Para cerrar el sistema, cierra las 3 ventanas de terminal.
pause