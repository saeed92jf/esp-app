# ==============================================================================
# Euroslot Pars - Local Development Environment Launcher
# Starts Frontend on Port 3000 and Backend on Port 8000 (Isolated from Production)
# ==============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting Isolated Local Development Environment" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  (Production users on 4000/8080 are completely unaffected)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

$devRoot = "c:\Users\s.jalili\Repositories"

# Start Backend Dev in separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$devRoot\ESP-Web-Backend'; `$env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Frontend Dev in separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$devRoot\esp-app'; `$env:PORT='3000'; `$env:BACKEND_API_URL='http://localhost:8000/api/v1'; npx next dev -p 3000"

Write-Host "`n[OK] Local Dev processes started in dedicated windows." -ForegroundColor Green
Write-Host "You can develop, test, and save files freely without affecting live users!" -ForegroundColor Cyan

