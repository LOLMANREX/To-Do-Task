@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ========================================================
echo   Compilation de l'installeur Windows (.exe) - To-Do Task Win
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Preparation et compilation du Frontend PWA (Vite)...
cd frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo [ERREUR] La compilation du frontend a echoue.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Verification des dependances Electron et Backend (100%% JavaScript)...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] L'installation des dependances a echoue.
    pause
    exit /b 1
)

echo.
echo [3/3] Creation de l'installeur Windows Setup (.exe)...
call npx electron-builder --win --publish never
if %errorlevel% neq 0 (
    echo [ERREUR] La generation de l'installeur a echoue.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   [SUCCES] L'installeur .exe a ete genere avec succes !
echo   Fichier genere : dist\Installation.exe
echo ========================================================
echo.
pause
