#!/bin/bash
# Setup script for Kiosk Control Dashboard

set -e

echo "🚀 Kiosk Control Dashboard - Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "❌ .env file not found!"
    echo "Please create .env file from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env with your database connection string"
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed the database (optional)
if [ -f prisma/seed.ts ]; then
    echo ""
    echo "🌱 Seeding database..."
    npm run prisma:seed 2>/dev/null || echo "⚠️  Seed script not available"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. View database: npx prisma studio"
echo "3. Test API: curl -H 'X-API-Key: dev-key-change-in-production' http://localhost:3000/api/servers"
echo ""
