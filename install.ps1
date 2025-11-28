# VerboCare Installation Script for Windows PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VerboCare - Installation Script" -ForegroundColor Cyan
Write-Host "  100% Complete - No Demo Data" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check MySQL
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
$mysqlVersion = mysql --version 2>$null
if ($mysqlVersion) {
    Write-Host "✓ MySQL found" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL not found. Please install MySQL 8.0+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Installing Dependencies" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Frontend
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}

# Backend
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}
Set-Location ..

# AI Service
Write-Host ""
Write-Host "Installing AI service dependencies..." -ForegroundColor Yellow
Set-Location ai-service
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ AI service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ AI service installation failed" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Database Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Database credentials configured:" -ForegroundColor Yellow
Write-Host "  User: root" -ForegroundColor White
Write-Host "  Password: ninad2006" -ForegroundColor White
Write-Host "  Database: verbocare" -ForegroundColor White
Write-Host ""

$setupDB = Read-Host "Do you want to set up the database now? (y/n)"
if ($setupDB -eq 'y' -or $setupDB -eq 'Y') {
    Write-Host ""
    Write-Host "Setting up database..." -ForegroundColor Yellow
    
    # Create database
    mysql -u root -pninad2006 -e "CREATE DATABASE IF NOT EXISTS verbocare;"
    
    # Import schema
    Get-Content server\src\db\schema.sql | mysql -u root -pninad2006 verbocare
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created and schema imported" -ForegroundColor Green
    } else {
        Write-Host "✗ Database setup failed. Please run manually:" -ForegroundColor Red
        Write-Host "  mysql -u root -pninad2006 verbocare < server\src\db\schema.sql" -ForegroundColor White
    }
} else {
    Write-Host "⚠ Skipping database setup. Run manually later:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -pninad2006 verbocare < server\src\db\schema.sql" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 3: OpenAI API Key" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠ IMPORTANT: Add your OpenAI API key to:" -ForegroundColor Yellow
Write-Host "  ai-service\.env" -ForegroundColor White
Write-Host ""
Write-Host "  OPENAI_API_KEY=sk-your-actual-key-here" -ForegroundColor White
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To start the application, run in 3 separate terminals:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Frontend):" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 2 (Backend):" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 3 (AI Service):" -ForegroundColor Cyan
Write-Host "  cd ai-service" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  http://localhost:5001" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ VerboCare is ready to use!" -ForegroundColor Green
Write-Host "📚 See SETUP.md for detailed documentation" -ForegroundColor Cyan
Write-Host ""
