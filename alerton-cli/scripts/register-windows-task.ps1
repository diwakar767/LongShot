# Register a Windows Scheduled Task to run the AlertOn agent at startup.
# Run elevated PowerShell from alerton-cli:
#   .\scripts\register-windows-task.ps1

param(
  [string]$TaskName = "AlertOnAgent",
  [string]$CliDir = ""
)

$ErrorActionPreference = "Stop"

if (-not $CliDir) {
  $CliDir = Resolve-Path (Join-Path $PSScriptRoot "..")
}
$CliJs = Join-Path $CliDir "cli.js"
$Node = (Get-Command node -ErrorAction Stop).Source

$action = New-ScheduledTaskAction -Execute $Node -Argument "`"$CliJs`" --agent" -WorkingDirectory $CliDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
Start-ScheduledTask -TaskName $TaskName

Write-Host "Task '$TaskName' registered and started."
Write-Host "Stop:  Stop-ScheduledTask -TaskName $TaskName"
Write-Host "Start: Start-ScheduledTask -TaskName $TaskName"
Write-Host "Remove: Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
