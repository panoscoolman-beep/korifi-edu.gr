# Installs a Windows Task Scheduler entry that runs the testimonials sync
# every Monday at 09:00 (after the Sunday post is up).
#
# Run as administrator from the project root, or pass -ProjectRoot.
#
# Usage:
#     powershell -ExecutionPolicy Bypass -File scripts\install_testimonials_sync_task.ps1

param(
    [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path,
    [string]$TaskName    = "Korifi Weekly Testimonials Sync",
    [string]$RunTime     = "09:00",
    [string]$DayOfWeek   = "Monday"
)

$python = (Get-Command python).Source
if (-not $python) {
    Write-Error "Python not found in PATH"
    exit 1
}

$scriptPath = Join-Path $ProjectRoot "scripts\sync_testimonials_from_drive.py"
if (-not (Test-Path $scriptPath)) {
    Write-Error "sync_testimonials_from_drive.py not found at $scriptPath"
    exit 1
}

$action = New-ScheduledTaskAction `
    -Execute $python `
    -Argument "`"$scriptPath`"" `
    -WorkingDirectory $ProjectRoot

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $DayOfWeek -At $RunTime

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal -UserId ([Environment]::UserName) -LogonType Interactive

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
    -Description "Weekly sync of student testimonials from Google Drive to Supabase (Mondays)"

Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host ""
Write-Host "[OK] Scheduled task '$TaskName' installed."
Write-Host "  Runs:    every $DayOfWeek at $RunTime"
Write-Host "  Script:  $scriptPath"
Write-Host ""
Write-Host ('Verify:        Get-ScheduledTask -TaskName ''' + $TaskName + '''')
Write-Host ('Trigger now:   Start-ScheduledTask -TaskName ''' + $TaskName + '''')
Write-Host ('Remove:        Unregister-ScheduledTask -TaskName ''' + $TaskName + ''' -Confirm:$false')
