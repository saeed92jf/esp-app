# ==============================================================================
# Euroslot Pars - Automated Data Backup Utility
# Backs up live JSON databases and documents with zero impact on active users.
# ==============================================================================

param(
    [string]$Label = "manual"
)

$ErrorActionPreference = "Stop"

$dataLiveDir = "C:\ESP_DATA\live\data"
$backupDir   = "C:\ESP_DATA\backups"

if (-not (Test-Path $dataLiveDir)) {
    Write-Error "Data directory not found at $dataLiveDir"
    exit 1
}

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "esp_backup_${timestamp}_${Label}.zip"
$archivePath = Join-Path $backupDir $archiveName

Write-Host "Creating backup snapshot of live data..." -ForegroundColor Cyan

try {
    Compress-Archive -Path "$dataLiveDir\*" -DestinationPath $archivePath -CompressionLevel Optimal -Force
    $sizeKb = [math]::Round(((Get-Item $archivePath).Length / 1KB), 1)
    Write-Host "[OK] Backup created successfully: $archiveName ($sizeKb KB)" -ForegroundColor Green

    # Rotate old backups - keep last 60 backups
    $oldBackups = Get-ChildItem -Path $backupDir -Filter "esp_backup_*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip 60
    foreach ($old in $oldBackups) {
        Remove-Item $old.FullName -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Error "Failed to create backup: $_"
    exit 1
}

