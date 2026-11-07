# ==============================================================================
#  Euroslot Pars - Professional DevOps & Development PowerShell Toolkit
# ==============================================================================

# ── Global Configuration ──
$global:EspDevRoot        = 'C:\Users\s.jalili\Repositories'
$global:EspRoot           = 'C:\Users\s.jalili\Repositories\esp-app'
$global:EspBackendRoot    = 'C:\Users\s.jalili\Repositories\ESP-Web-Backend'
$global:EspProdRoot       = 'C:\ESP_PRODUCTION'
$global:EspDataRoot       = 'C:\ESP_DATA'
$global:EspLanIp          = '192.168.0.242'
$global:EspPort           = 4000
$global:EspBackendPort    = 8080

# ── Navigation & Editor Helpers ──
function gp {
    Set-Location $global:EspRoot
}

function op {
    gp
    code .
}

function gb {
    Set-Location $global:EspBackendRoot
}

function ob {
    gb
    code .
}

function run {
    gp
    npm run dev
}

function runb {
    gb
    $pythonExe = Join-Path $global:EspBackendRoot ".venv\Scripts\python.exe"
    if (Test-Path $pythonExe) {
        & $pythonExe -m uvicorn app.main:app --host 0.0.0.0 --port $global:EspBackendPort --reload
    } else {
        & "$global:EspBackendRoot\.venv\Scripts\uvicorn.exe" app.main:app --host 0.0.0.0 --port $global:EspBackendPort --reload
    }
}

# ── Core Service Runners (Production Client vs Development) ──

function run-client {
    <#
    .SYNOPSIS
        Starts the always-on Production Client Environment (Ports 4000 & 8080).
        Runs as detached Windows background daemons (persistent even if PowerShell is closed).
    #>
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Starting Production Client Environment (Always-On)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    powershell.exe -ExecutionPolicy Bypass -File "$global:EspProdRoot\start-production.ps1"

    Write-Host "`n[Production Endpoints]" -ForegroundColor Green
    Write-Host "  Frontend (Local): http://localhost:4000" -ForegroundColor Yellow
    Write-Host "  Frontend (LAN):   http://$($global:EspLanIp):4000" -ForegroundColor Yellow
    Write-Host "  Backend API:      http://$($global:EspLanIp):8080" -ForegroundColor Yellow
    Write-Host "  Data Store:       C:\ESP_DATA\live\data (Safe & Isolated)" -ForegroundColor Gray
    Write-Host "`n[INFO] Services are detached Windows daemons; closing this window will NOT stop them." -ForegroundColor Cyan
}

function run-develop {
    <#
    .SYNOPSIS
        Starts the isolated Developer Environment (Ports 3000 & 8000).
    #>
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Starting Isolated Developer Environment" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\dev-start.ps1"

    Write-Host "`n[Developer Endpoints]" -ForegroundColor Green
    Write-Host "  Frontend Dev: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  Backend Dev:  http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host "  (Live users on 4000/8080 are completely unaffected)" -ForegroundColor Gray
}

function runall {
    <#
    .SYNOPSIS
        Universal launcher: 'runall client' or 'runall develop'.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Position = 0)]
        [ValidateSet("client", "develop", "prod", "dev", "status")]
        [string]$Target = "client"
    )

    if ($Target -in @("client", "prod")) {
        run-client
    } elseif ($Target -in @("develop", "dev")) {
        run-develop
    } elseif ($Target -eq "status") {
        status-all
    }
}

# ── Deployment & Operations Commands ──

function deploy {
    <#
    .SYNOPSIS
        Deploys latest changes to Production with automated testing, pre-deploy backup, and zero-downtime restart.
    #>
    [CmdletBinding()]
    param(
        [switch]$SkipBuild
    )

    Write-Host "Executing Zero-Downtime Production Deployment..." -ForegroundColor Cyan
    if ($SkipBuild) {
        powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\deploy-production.ps1" -SkipBuild
    } else {
        powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\deploy-production.ps1"
    }
}

function rollback {
    <#
    .SYNOPSIS
        Rolls back Production to the previous Git commit.
    #>
    Write-Host "Executing Emergency Production Rollback..." -ForegroundColor Yellow
    powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\rollback-production.ps1"
}

function backup {
    <#
    .SYNOPSIS
        Takes an instant snapshot backup of all live JSON databases and documents.
    #>
    [CmdletBinding()]
    param(
        [string]$Label = "manual"
    )
    powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\backup-data.ps1" -Label $Label
}

function status-all {
    <#
    .SYNOPSIS
        Displays the health and port status of Production (4000/8080) and Development (3000/8000).
    #>
    powershell.exe -ExecutionPolicy Bypass -File "$global:EspProdRoot\status-production.ps1"

    $devPorts = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000, 8000 }
    if ($devPorts) {
        Write-Host "`nDeveloper Environment Ports (Active):" -ForegroundColor Magenta
        $devPorts | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table -AutoSize
    } else {
        Write-Host "`nDeveloper Environment (3000/8000): Inactive" -ForegroundColor Gray
    }
}

# ── Process Stopper ──

function stopall {
    <#
    .SYNOPSIS
        Stops services: 'stopall client', 'stopall develop', or 'stopall' (both).
    #>
    [CmdletBinding()]
    param(
        [Parameter(Position = 0)]
        [ValidateSet("all", "client", "develop", "prod", "dev")]
        [string]$Target = "all"
    )

    if ($Target -in @("all", "client", "prod")) {
        Write-Host "Stopping Production Client Services (4000/8080)..." -ForegroundColor Yellow
        powershell.exe -ExecutionPolicy Bypass -File "$global:EspProdRoot\stop-production.ps1"
    }

    if ($Target -in @("all", "develop", "dev")) {
        Write-Host "Stopping Developer Services (3000/8000)..." -ForegroundColor Yellow
        try {
            $devConns = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000, 8000 }
            foreach ($c in $devConns) {
                cmd.exe /c "taskkill /F /T /PID $($c.OwningProcess) >nul 2>&1"
            }
        } catch {}
        Write-Host "[OK] Developer ports freed." -ForegroundColor Green
    }
}

# ── Quick Aliases ──
Set-Alias -Name status -Value status-all -ErrorAction SilentlyContinue
Set-Alias -Name deploy-prod -Value deploy -ErrorAction SilentlyContinue
Set-Alias -Name rollback-prod -Value rollback -ErrorAction SilentlyContinue
Set-Alias -Name backup-data -Value backup -ErrorAction SilentlyContinue

# ── Help / Cheat Sheet ──
function help-esp {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Euroslot Pars - CLI Commands Quick Reference" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  runall client    : Start/Restart Always-On Client/Production (4000/8080)" -ForegroundColor Green
    Write-Host "  runall develop   : Start Developer Environment (3000/8000)" -ForegroundColor Green
    Write-Host "  deploy           : Test & Deploy latest changes to Production" -ForegroundColor Yellow
    Write-Host "  rollback         : Emergency Rollback to previous version" -ForegroundColor Red
    Write-Host "  backup           : Create instant live data snapshot" -ForegroundColor Cyan
    Write-Host "  status           : Health check for all services and ports" -ForegroundColor Magenta
    Write-Host "  stopall          : Stop all services (or 'stopall client' / 'stopall develop')" -ForegroundColor DarkYellow
    Write-Host "  gp / gb          : Navigate to frontend/backend repository root" -ForegroundColor Gray
    Write-Host "  op / ob          : Open frontend/backend in VS Code" -ForegroundColor Gray
    Write-Host "============================================================" -ForegroundColor Cyan
}
