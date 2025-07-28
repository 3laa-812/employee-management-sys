@echo off
echo 🚀 Starting Employee Management System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    pnpm install
)

echo 🔧 Starting backend server on port 3001...
start "Backend Server" cmd /k "node server.js"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

echo 🎨 Starting frontend development server on port 5173...
echo.
echo ✅ Both servers are starting...
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:3001
echo.
echo 🔐 Login with:
echo    Email: admin@example.com
echo    Password: 123456
echo.
echo Press any key to stop both servers...

REM Start frontend server
pnpm dev

pause 