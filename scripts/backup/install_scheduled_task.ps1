# Installs a Windows Task Scheduler entry that runs the Supabase backup daily at 03:00.
# Run as administrator from the project root, or pass -ProjectRoot.
#
# Usage:
#     powershell -ExecutionPolicy Bypass -File scripts\backup\install_scheduled_task.ps1

param(
    [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..").Path,
    [string]$TaskName    = "Korifi Daily Backup",
    [string]$RunTime     = "03:00"
)

$python = (Get-Command python).Source
if (-not $python) {
    Write-Error "Python not found in PATH"
    exit 1
}

$scriptPath = Join-Path $ProjectRoot "scripts\backup\backup.py"
if (-not (Test-Path $scriptPath)) {
    Write-Error "backup.py not found at $scriptPath"
    exit 1
}

$logsDir = Join-Path $ProjectRoot "_backups\logs"
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

$action = New-ScheduledTaskAction `
    -Execute $python `
    -Argument "`"$scriptPath`"" `
    -WorkingDirectory $ProjectRoot

$trigger = New-ScheduledTaskTrigger -Daily -At $RunTime

# Settings: wake the computer, restart on failure
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

# Run as the current user, only when logged in
$principal = New-ScheduledTaskPrincipal -UserId ([Environment]::UserName) -LogonType Interactive

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
    -Description "Daily backup of Supabase Postgres + Storage to Google Drive (project: korifi-edu.gr)"

Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host ""
Write-Host "[OK] Scheduled task '$TaskName' installed."
Write-Host "  Runs:    daily at $RunTime"
Write-Host "  Script:  $scriptPath"
Write-Host "  Logs:    $logsDir"
Write-Host ""
Write-Host ('Verify:        Get-ScheduledTask -TaskName ''' + $TaskName + '''')
Write-Host ('Trigger now:   Start-ScheduledTask -TaskName ''' + $TaskName + '''')
Write-Host ('Remove:        Unregister-ScheduledTask -TaskName ''' + $TaskName + ''' -Confirm:$false')
