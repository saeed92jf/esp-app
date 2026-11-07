# ==============================================================================
# Euroslot Pars - Professional Production Deployment Pipeline
# Zero-Downtime Deployment with Automated Pre-Flight Quality Gate & Data Backup
# ==============================================================================

param(
    [switch]$SkipBuild = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Euroslot Pars - Production Deployment Pipeline" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$devRoot   = "c:\Users\s.jalili\Repositories"
$prodRoot  = "C:\ESP_PRODUCTION"
$dataDir   = "C:\ESP_DATA"

# ── 1. Quality Gate: TypeScript Compilation Check ──
Write-Host "`n[Step 1/5] Running Quality Gate (TypeScript Verification)..." -ForegroundColor Yellow
Set-Location "$devRoot\esp-app"
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Error "Quality Gate Failed! TypeScript compilation errors found. Deployment aborted to protect production."
    exit 1
}
Write-Host "  [OK] Zero TypeScript compile errors." -ForegroundColor Green

# ── 2. Automatic Live Data Backup ──
Write-Host "`n[Step 2/5] Creating Pre-Deploy Data Snapshot..." -ForegroundColor Yellow
& "$devRoot\backup-data.ps1" -Label "pre_deploy"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Data backup failed. Deployment aborted to prevent data risk."
    exit 1
}

# ── 3. Synchronize Code to Production Directory ──
Write-Host "`n[Step 3/5] Syncing Code to Production Environment..." -ForegroundColor Yellow
git -C "$prodRoot\esp-app" pull dev master
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Pull from dev remote failed, fetching origin..." -ForegroundColor Yellow
    git -C "$prodRoot\esp-app" pull origin master
}

git -C "$prodRoot\ESP-Web-Backend" pull dev main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Pull from dev remote failed, fetching origin..." -ForegroundColor Yellow
    git -C "$prodRoot\ESP-Web-Backend" pull origin main
}

# Sync project public documentation if any new files were added
if (Test-Path "$devRoot\esp-app\public\docs") {
    robocopy "$devRoot\esp-app\public\docs" "$prodRoot\esp-app\public\docs" /E /MT:16 /NFL /NDL /NJH /NJS | Out-Null
}
Write-Host "  [OK] Production codebase updated." -ForegroundColor Green

# ── 4. Build Optimized Production Frontend ──
if (-not $SkipBuild) {
    Write-Host "`n[Step 4/5] Building Optimized Frontend Production Bundle..." -ForegroundColor Yellow
    Set-Location "$prodRoot\esp-app"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Production build failed! Production runtime was NOT updated."
        exit 1
    }
    Write-Host "  [OK] Next.js production build succeeded." -ForegroundColor Green
} else {
    Write-Host "`n[Step 4/5] Skipping build (--SkipBuild specified)." -ForegroundColor Yellow
}

# ── 5. Restart Production Services ──
Write-Host "`n[Step 5/5] Restarting Production Services with Fresh Build..." -ForegroundColor Yellow
& "$prodRoot\restart-production.ps1"

Start-Sleep -Seconds 2

# Verify Health
Write-Host "`nVerifying Health Checks..." -ForegroundColor Cyan
& "$prodRoot\status-production.ps1"

$sw.Stop()
$elapsedSec = [math]::Round($sw.Elapsed.TotalSeconds, 1)
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] Production Deployment Completed in $elapsedSec seconds!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
