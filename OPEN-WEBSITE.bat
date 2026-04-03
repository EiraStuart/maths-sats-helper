@echo off
REM Maths SATs Helper - Opens website directly
REM This is the simplest way to use the website

setlocal enabledelayedexpansion

REM Get the folder where this script is located
set "FOLDER=%~dp0"

REM Open index.html with default browser
echo Opening Maths SATs Helper...
start "" "%FOLDER%index.html"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Website opened! Check your browser.
    echo.
) else (
    echo.
    echo ❌ Could not open website automatically
    echo.
    echo Manual method:
    echo 1. Open File Explorer
    echo 2. Go to: C:\Users\Home\maths-sats-helper
    echo 3. Right-click index.html
    echo 4. Select: Open with ^> Your browser
    echo.
)

timeout /t 3
