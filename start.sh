#!/bin/bash
# Quick start script — run from project root
echo "🏡 Starting Village State..."

# Check .env files exist
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "⚠️  Created backend/.env — please fill in your API keys!"
fi
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "⚠️  Created frontend/.env — please fill in your API keys!"
fi

# Start backend in background
echo "🚀 Starting backend on port 5000..."
cd backend && npm install --silent && node server.js &

# Wait a moment then start frontend
sleep 2
echo "🌐 Starting frontend on port 3000..."
cd ../frontend && npm install --silent && npm start
