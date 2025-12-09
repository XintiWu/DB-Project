@echo off
setlocal

echo 🚀 Initializing Disaster Relief Platform...

:: Backend Setup
echo 📦 Checking Backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing Backend dependencies...
    call npm install
)

echo 🔥 Starting Backend...
start "DRP_Backend" npm start
cd ..

:: Frontend Setup
echo 📦 Checking Frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing Frontend dependencies...
    call npm install
)

echo ✨ Starting Frontend...
start "DRP_Frontend" npm run dev
cd ..

:: Wait
echo.
echo ✅ System is running!
echo 📡 Backend API: http://localhost:3000
echo 💻 Frontend UI: http://localhost:5173
echo.
echo Press any key to stop all services.
pause >nul

:: Cleanup
echo Stopping all services...
taskkill /F /IM node.exe /T
echo Done.
exit