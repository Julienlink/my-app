# Setup script for Kiosk Control Dashboard (Windows)
# Run as: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "🚀 Kiosk Control Dashboard - Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path .env)) {
    Write-Host ""
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example:" -ForegroundColor Yellow
    Write-Host "  copy .env.example .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then edit .env with your database connection string" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Running first migration..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
}

# Seed the database (optional)
if (Test-Path prisma\seed.ts) {
    Write-Host ""
    Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
    npm run prisma:seed 2>$null
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Green
Write-Host "1. Start development server: npm run dev" -ForegroundColor White
Write-Host "2. View database: npx prisma studio" -ForegroundColor White
Write-Host "3. Test API: curl -H X-API-Key: dev-key-change-in-production http://localhost:3000/api/servers" -ForegroundColor White
Write-Host ""
