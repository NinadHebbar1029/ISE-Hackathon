@echo off
echo Stopping all VerboCare services...
echo.

REM Kill processes on specific ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do taskkill /F /PID %%a 2>nul

echo.
echo All services stopped.
pause
