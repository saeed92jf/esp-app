# ==============================================================================
# Euroslot Pars - Configure Automated Backup Scheduled Task
# Registers a Windows Scheduled Task to run backup-data.ps1 daily at 13:00 and 19:00
# ==============================================================================

$taskName = "EuroslotPars_DataBackup"
$scriptPath = "c:\Users\s.jalili\Repositories\backup-data.ps1"

Write-Host "Registering automated backup scheduled task: $taskName..." -ForegroundColor Cyan

try {
    # Check if task already exists
    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`" -Label `"scheduled`""
    $trigger1 = New-ScheduledTaskTrigger -Daily -At "13:00"
    $trigger2 = New-ScheduledTaskTrigger -Daily -At "19:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($trigger1, $trigger2) -Settings $settings -Description "Automated snapshot backup of Euroslot Pars live JSON databases" | Out-Null
    Write-Host "[OK] Scheduled task '$taskName' registered successfully (runs daily at 13:00 and 19:00)." -ForegroundColor Green
} catch {
    Write-Warning "Could not register Windows Scheduled Task (may require elevated permissions): $_"
    Write-Host "Manual backup script is always available at: $scriptPath" -ForegroundColor Cyan
}
