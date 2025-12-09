#!/bin/bash
echo "🛑 Stopping existing Node.js processes..."
lsof -t -i :3000 | xargs kill -9 2>/dev/null
lsof -t -i :5173 | xargs kill -9 2>/dev/null
lsof -t -i :5174 | xargs kill -9 2>/dev/null

echo "✅ Ports cleared."
echo "🚀 Restarting system..."
./start_system.sh
