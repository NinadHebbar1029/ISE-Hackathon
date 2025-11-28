@echo off
echo ========================================
echo  VerboCare - Starting All Services
echo ========================================
echo.

REM Check if node_modules exists in root
if not exist "node_modules\" (
    echo [1/3] Installing frontend dependencies...
    call npm install
) else (
    echo [1/3] Frontend dependencies already installed
)

REM Check if node_modules exists in server
if not exist "server\node_modules\" (
    echo [2/3] Installing server dependencies...
    cd server
    call npm install
    cd ..
) else (
    echo [2/3] Server dependencies already installed
)

REM Check if node_modules exists in ai-service
if not exist "ai-service\node_modules\" (
    echo [3/3] Installing AI service dependencies...
    cd ai-service
    call npm install
    cd ..
) else (
    echo [3/3] AI service dependencies already installed
)

echo.
echo ========================================
echo  All dependencies installed!
echo ========================================
echo.
echo Starting services in separate windows...
echo.

REM Start AI Service
start "VerboCare - AI Service (Port 5001)" cmd /k "cd ai-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Backend Server
start "VerboCare - Backend Server (Port 5000)" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Frontend
start "VerboCare - Frontend (Port 3000)" cmd /k "npm run dev"

echo.
echo ========================================
echo  Services Started!
echo ========================================
echo.
echo  Frontend:    http://localhost:3000
echo  Backend:     http://localhost:5000
echo  AI Service:  http://localhost:5001
echo.
echo  Press any key to close this window...
echo  (Services will continue running in other windows)
echo.
pause >nul
