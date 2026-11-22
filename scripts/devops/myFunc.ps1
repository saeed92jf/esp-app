# ==============================================================================
#  ESP CORE + NPC CORE - Professional DevOps & Development PowerShell Toolkit
# ==============================================================================

# ── Global Configuration ──
$global:EspDevRoot        = 'C:\Users\s.jalili\Repositories'
$global:PlatformRoot      = 'C:\Users\s.jalili\Repositories\core-platform'
$global:EspRoot           = 'C:\Users\s.jalili\Repositories\core-platform\apps\esp-core'
$global:NpcRoot           = 'C:\Users\s.jalili\Repositories\core-platform\apps\npc-core'
$global:EspBackendRoot    = 'C:\Users\s.jalili\Repositories\esp-core-api'
$global:NpcBackendRoot    = 'C:\Users\s.jalili\Repositories\npc-core-api'
$global:EspLegacyRoot     = 'C:\Users\s.jalili\Repositories\esp-app'
$global:EspLegacyBackend  = 'C:\Users\s.jalili\Repositories\ESP-Web-Backend'
$global:EspProdRoot       = 'C:\ESP_PRODUCTION'
$global:EspDataRoot       = 'C:\ESP_DATA'
$global:EspLanIp          = '192.168.0.242'
$global:EspPort           = 4000
$global:EspBackendPort    = 8080
$global:EspDevPort        = 3000
$global:NpcDevPort        = 4100
$global:EspDevBackendPort = 8000
$global:NpcDevBackendPort = 8100

# ── Navigation & Editor Helpers ──
function gp {
    Set-Location $global:PlatformRoot
}

function gp-esp {
    Set-Location $global:EspRoot
}

function gp-npc {
    Set-Location $global:NpcRoot
}

function op {
    gp
    code .
}

function op-esp {
    gp-esp
    code .
}

function op-npc {
    gp-npc
    code .
}

function gb {
    Set-Location $global:EspBackendRoot
}

function gb-npc {
    Set-Location $global:NpcBackendRoot
}

function ob {
    gb
    code .
}

function ob-npc {
    gb-npc
    code .
}

# ── Application Runners ──

function run {
    <#
    .SYNOPSIS
        Starts development servers.
        By default, runs BOTH ESP CORE (Port 3000) and NPC CORE (Port 4100) concurrently in parallel!
        Usage:
          run          -> Runs BOTH ESP and NPC frontends simultaneously
          run all      -> Runs BOTH ESP and NPC frontends
          run esp      -> Runs only ESP CORE (Port 3000)
          run npc      -> Runs only NPC CORE (Port 4100)
    #>
    [CmdletBinding()]
    param(
        [Parameter(Position = 0)]
        [ValidateSet("all", "both", "esp", "npc")]
        [string]$Target = "all"
    )

    Set-Location $global:PlatformRoot
    Write-Host "============================================================" -ForegroundColor Cyan

    if ($Target -eq "esp") {
        Write-Host "  Starting ESP CORE Frontend Dev (Port 3000)..." -ForegroundColor Blue
        Write-Host "  URL: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Cyan
        pnpm --filter @apps/esp-core dev
    } elseif ($Target -eq "npc") {
        Write-Host "  Starting NPC CORE Frontend Dev (Port 4100)..." -ForegroundColor Magenta
        Write-Host "  URL: http://localhost:4100" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Cyan
        pnpm --filter @apps/npc-core dev
    } else {
        Write-Host "  Starting BOTH ESP CORE & NPC CORE Concurrently in Parallel..." -ForegroundColor Green
        Write-Host "  • ESP CORE (Euroslot Pars)      : http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  • NPC CORE (Nano Palayesh Ceram): http://localhost:4100" -ForegroundColor Magenta
        Write-Host "============================================================" -ForegroundColor Cyan
        pnpm --parallel --filter "@apps/*" dev
    }
}

function runb {
    <#
    .SYNOPSIS
        Starts development backend APIs.
        Usage:
          runb         -> Runs BOTH ESP (Port 8000) and NPC (Port 8100) backends in separate windows
          runb esp     -> Runs only ESP Backend (Port 8000) in current terminal
          runb npc     -> Runs only NPC Backend (Port 8100) in current terminal
    #>
    [CmdletBinding()]
    param(
        [Parameter(Position = 0)]
        [ValidateSet("all", "both", "esp", "npc")]
        [string]$Target = "all"
    )

    $pythonExe = Join-Path $global:EspLegacyBackend ".venv\Scripts\python.exe"
    if (-not (Test-Path $pythonExe)) {
        $pythonExe = "python.exe"
    }

    if ($Target -eq "esp") {
        Set-Location $global:EspBackendRoot
        Write-Host "Starting ESP Backend Dev (Port 8000)..." -ForegroundColor Blue
        Write-Host "URL: http://localhost:8000/docs" -ForegroundColor Yellow
        & $pythonExe -m uvicorn app.main:app --host 0.0.0.0 --port $global:EspDevBackendPort --reload
    } elseif ($Target -eq "npc") {
        Set-Location $global:NpcBackendRoot
        Write-Host "Starting NPC Backend Dev (Port 8100)..." -ForegroundColor Magenta
        Write-Host "URL: http://localhost:8100/docs" -ForegroundColor Yellow
        & $pythonExe run_dev.py
    } else {
        Write-Host "============================================================" -ForegroundColor Cyan
        Write-Host "  Starting BOTH ESP & NPC Backend APIs in Dedicated Windows..." -ForegroundColor Green
        Write-Host "  • ESP Backend API (Dev) : http://localhost:8000/docs" -ForegroundColor Cyan
        Write-Host "  • NPC Backend API (Dev) : http://localhost:8100/docs" -ForegroundColor Magenta
        Write-Host "============================================================" -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$global:EspBackendRoot'; Write-Host '=== ESP Backend (Port 8000) ===' -ForegroundColor Cyan; & '$pythonExe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$global:NpcBackendRoot'; Write-Host '=== NPC Backend (Port 8100) ===' -ForegroundColor Magenta; & '$pythonExe' run_dev.py"
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
        Starts the complete isolated Developer Environment (ESP on 3000/8000 and NPC on 4100/8100).
    #>
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Starting Unified Developer Environment (ESP + NPC)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    powershell.exe -ExecutionPolicy Bypass -File "$global:EspDevRoot\dev-start.ps1"

    Write-Host "`n[Developer Endpoints]" -ForegroundColor Green
    Write-Host "  ESP CORE Frontend : http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  NPC CORE Frontend : http://localhost:4100" -ForegroundColor Magenta
    Write-Host "  ESP Backend API   : http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "  NPC Backend API   : http://localhost:8100/docs" -ForegroundColor Magenta
    Write-Host "  (Live users on Production 4000/8080 are completely unaffected)" -ForegroundColor Gray
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
        Displays the health and port status of Production (4000/8080) and Development (3000/8000, 4100/8100).
    #>
    powershell.exe -ExecutionPolicy Bypass -File "$global:EspProdRoot\status-production.ps1"

    $devPorts = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000, 8000, 4100, 8100 }
    if ($devPorts) {
        Write-Host "`nDeveloper Environment Ports (Active):" -ForegroundColor Magenta
        $devPorts | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table -AutoSize
    } else {
        Write-Host "`nDeveloper Environment (3000, 8000, 4100, 8100): Inactive" -ForegroundColor Gray
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
        Write-Host "Stopping Developer Services (3000, 8000, 4100, 8100)..." -ForegroundColor Yellow
        try {
            $devConns = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000, 8000, 4100, 8100 }
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
    Write-Host "  ESP CORE + NPC CORE - CLI Commands Quick Reference" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  run              : Start BOTH ESP CORE (3000) & NPC CORE (4100) frontends" -ForegroundColor Green
    Write-Host "  run esp          : Start only ESP CORE Frontend (3000)" -ForegroundColor Green
    Write-Host "  run npc          : Start only NPC CORE Frontend (4100)" -ForegroundColor Magenta
    Write-Host "  runb             : Start BOTH ESP (8000) & NPC (8100) backend APIs" -ForegroundColor Green
    Write-Host "  runb esp         : Start only ESP Backend (8000)" -ForegroundColor Green
    Write-Host "  runb npc         : Start only NPC Backend (8100)" -ForegroundColor Magenta
    Write-Host "  runall develop   : Start complete Dev stack (ESP 3000/8000 + NPC 4100/8100)" -ForegroundColor Cyan
    Write-Host "  runall client    : Start/Restart Always-On Production (4000/8080)" -ForegroundColor Yellow
    Write-Host "  deploy           : Test & Deploy latest changes to Production" -ForegroundColor Yellow
    Write-Host "  rollback         : Emergency Rollback to previous version" -ForegroundColor Red
    Write-Host "  backup           : Create instant live data snapshot" -ForegroundColor Cyan
    Write-Host "  status           : Health check for all services and ports" -ForegroundColor Magenta
    Write-Host "  stopall          : Stop all services (or 'stopall client' / 'stopall develop')" -ForegroundColor DarkYellow
    Write-Host "  gp               : Navigate to shared platform root (core-platform)" -ForegroundColor Gray
    Write-Host "  gp-esp / gp-npc  : Navigate to esp-core or npc-core app directory" -ForegroundColor Gray
    Write-Host "  gb / gb-npc      : Navigate to ESP or NPC backend repository" -ForegroundColor Gray
    Write-Host "  op / ob          : Open platform or backend in VS Code" -ForegroundColor Gray
    Write-Host "============================================================" -ForegroundColor Cyan
}
