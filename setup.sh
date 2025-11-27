#!/bin/bash

echo "🚀 WebWeaver AI - Phase 4 Setup Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists in backend
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  No .env file found in backend/${NC}"
    echo "Creating from template..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env and add your GEMINI_API_KEY${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Found backend/.env${NC}"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your GEMINI_API_KEY"
echo "2. (Optional) Add MONGODB_URI if you want to persist data"
echo "3. (Optional) Change JWT_SECRET to a random string"
echo ""
echo "🚀 To start the application:"
echo "Terminal 1: cd backend && npm start"
echo "Terminal 2: npm run dev"
echo ""
echo "🌐 Access:"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3001"
echo ""
echo "📖 For more information, see PHASE_4_FEATURES.md"
