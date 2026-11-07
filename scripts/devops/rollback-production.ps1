# ==============================================================================
# Euroslot Pars - Emergency Production Rollback Utility
# Instantly rolls back production to the previous stable release commit
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Red
Write-Host "  Euroslot Pars - Emergency Production Rollback" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Red

$prodRoot = "C:\ESP_PRODUCTION"

Write-Host "Reverting production git commits to HEAD~1..." -ForegroundColor Yellow
git -C "$prodRoot\esp-app" reset --hard HEAD~1
git -C "$prodRoot\ESP-Web-Backend" reset --hard HEAD~1

Write-Host "Rebuilding frontend..." -ForegroundColor Yellow
Set-Location "$prodRoot\esp-app"
npm run build

Write-Host "Restarting Production Services..." -ForegroundColor Yellow
& "$prodRoot\restart-production.ps1"

Write-Host "`n[OK] Rollback complete. Current production status:" -ForegroundColor Green
& "$prodRoot\status-production.ps1"
