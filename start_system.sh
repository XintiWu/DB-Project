#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Initializing Disaster Relief Platform..."

# Backend Setup & Start
echo "📦 Checking Backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing Backend dependencies..."
    npm install
fi
echo "🔥 Starting Backend..."
npm start &
BACKEND_PID=$!
cd ..

# Frontend Setup & Start
echo "📦 Checking Frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
fi
echo "✨ Starting Frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ System is running!"
echo "📡 Backend API: http://localhost:3000"
echo "💻 Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop all services."

wait
