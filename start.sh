#!/bin/bash

echo "🚀 Starting Employee Management System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo "🔧 Starting backend server on port 3001..."
# Start backend server in background
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "🎨 Starting frontend development server on port 5173..."
echo ""
echo "✅ Both servers are starting..."
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:3001"
echo ""
echo "🔐 Login with:"
echo "   Email: admin@example.com"
echo "   Password: 123456"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend server
pnpm dev

# Cleanup when frontend exits
cleanup 