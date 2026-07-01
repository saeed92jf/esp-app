# ============================================================
#  esp-app PowerShell helpers
# ============================================================

# ── Global config: single source of truth for all functions below ──
$global:EspRoot      = 'D:\esp-app'
$global:EspJobName   = 'esp-dev'
$global:EspDevScript = 'dev:network'      # npm script that runall executes
$global:EspPort      = 3000               # port the dev server listens on
$global:EspLanIp     = '192.168.0.71'     # LAN IP to open for other devices

function gp {
    # Go to the project root
    Set-Location $global:EspRoot
}

function op {
    # Open the project in VS Code
    gp
    code .
}

function run {
    # Run the dev server in the FOREGROUND so logs stream live in this terminal
    gp
    npm run dev
}

function Get-DevServerUrl {
    # Build the dev server URL with the correct protocol by inspecting package.json.
    # If the npm script contains --experimental-https, we serve over TLS (https),
    # otherwise we fall back to plain http. This keeps the URL in sync with the
    # script so we never hard-code the wrong scheme.
    param(
        # Hostname or IP to open (localhost, LAN IP, etc.)
        [string]$DevHost    = 'localhost',
        [int]   $Port       = $global:EspPort,
        # The npm script that actually starts the server (defaults to the global one)
        [string]$ScriptName = $global:EspDevScript
    )

    # Default to http unless we find evidence of HTTPS
    $scheme  = 'http'
    $pkgPath = Join-Path $global:EspRoot 'package.json'

    if (Test-Path $pkgPath) {
        $pkg         = Get-Content $pkgPath -Raw | ConvertFrom-Json
        $scriptValue = $pkg.scripts.$ScriptName
        if ($scriptValue -match '--experimental-https') {
            $scheme = 'https'
        }
    }

    return "${scheme}://${DevHost}:$Port"
}

function Test-EspPort {
    # Fast TCP check: returns $true if something is already listening on the port
    param([int]$Port = $global:EspPort)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect('127.0.0.1', $Port)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

function stopall {
    # Stop the background dev-server job AND free the port to avoid "address in use"
    Write-Host 'Stopping background dev server...' -ForegroundColor Yellow

    # 1) Remove our named background job if it exists
    $job = Get-Job -Name $global:EspJobName -ErrorAction SilentlyContinue
    if ($job) {
        Stop-Job  -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }

    # 2) Kill any process still holding the port (orphaned node.exe etc.)
    $conns = Get-NetTCPConnection -LocalPort $global:EspPort -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Stopped. Port $($global:EspPort) is free." -ForegroundColor Green
}

function runall {
    Set-Location $global:EspRoot

    # --- Clean slate: never start a second server on top of an old one ---
    stopall

    Write-Host "Starting dev server ($global:EspDevScript)..." -ForegroundColor Green

    # Start the server in a NAMED background job (no log file, output stays in job stream)
    Start-Job -Name $global:EspJobName -ScriptBlock {
        param($root, $script)
        Set-Location $root
        npm run $script *>&1
    } -ArgumentList $global:EspRoot, $global:EspDevScript | Out-Null

    # --- Wait until the port is actually accepting connections (max 60s) ---
    Write-Host 'Waiting for server to become ready...' -ForegroundColor Yellow
    $timeout = 60
    $elapsed = 0
    while (-not (Test-EspPort -Port $global:EspPort) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 1
        $elapsed++

        # If the job died early, surface the error and stop waiting
        $job = Get-Job -Name $global:EspJobName -ErrorAction SilentlyContinue
        if ($job -and $job.State -eq 'Failed') {
            Write-Host 'Server job failed. Receive job output:' -ForegroundColor Red
            Receive-Job -Job $job
            return
        }
    }

    if (-not (Test-EspPort -Port $global:EspPort)) {
        Write-Host "Server did not start within $timeout s. Check job output with: Receive-Job -Name $global:EspJobName" -ForegroundColor Red
        return
    }

    Write-Host "Server ready after ${elapsed}s." -ForegroundColor Green

    # --- Open both URLs with the protocol auto-detected from package.json ---
    $localUrl = Get-DevServerUrl -DevHost 'localhost'        -Port $global:EspPort
    $lanUrl   = Get-DevServerUrl -DevHost $global:EspLanIp    -Port $global:EspPort

    Start-Process $localUrl
    Start-Sleep -Seconds 1
    Start-Process $lanUrl
    Write-Host "Opened: $localUrl  and  $lanUrl" -ForegroundColor Green

    # --- Minimize the PowerShell window (guard Add-Type against duplicate type) ---
    if (-not ([System.Management.Automation.PSTypeName]'Console.Window').Type) {
        Add-Type -Name Window -Namespace Console -MemberDefinition '
            [DllImport("user32.dll")]
            public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        '
    }
    $psWindow = (Get-Process -Id $PID).MainWindowHandle
    [Console.Window]::ShowWindow($psWindow, 2) | Out-Null  # 2 = Minimize

    Write-Host 'PowerShell minimized. View job output with: Receive-Job -Name esp-dev' -ForegroundColor Cyan
    Write-Host 'Stop the server with: stopall' -ForegroundColor Cyan
}
