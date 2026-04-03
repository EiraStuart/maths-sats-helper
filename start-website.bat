@echo off
REM Maths SATs Helper - Quick Server Setup
REM This script will host your website locally

cd /d "%~dp0"
echo Starting Maths SATs Helper...
echo.
echo Opening http://localhost:8080 in your browser...
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python first
python -m http.server 8080 >nul 2>&1
if %errorlevel% equ 0 exit /b 0

REM If Python fails, provide instructions
echo.
echo Python not found. Please install Python from python.org
echo During installation, check "Add Python to PATH"
echo.
pause
