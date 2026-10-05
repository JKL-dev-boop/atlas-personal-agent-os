param(
    [string]$TargetRoot = ""
)

$ErrorActionPreference = "Stop"
$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$skillName = "pr-selftest-orchestrator"

if ([string]::IsNullOrWhiteSpace($TargetRoot)) {
    if (-not [string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
        $TargetRoot = Join-Path $env:CODEX_HOME "skills"
    }
    else {
        $userProfilePath = [Environment]::GetFolderPath("UserProfile")
        $TargetRoot = Join-Path $userProfilePath ".codex\skills"
    }
}

$targetRootPath = [System.IO.Path]::GetFullPath($TargetRoot)
$destination = Join-Path $targetRootPath $skillName
if (Test-Path -LiteralPath $destination) {
    throw "Destination already exists; refusing to overwrite: $destination"
}

New-Item -ItemType Directory -Path $targetRootPath -Force | Out-Null
Copy-Item -LiteralPath $sourceRoot -Destination $targetRootPath -Recurse
Write-Host "Installed $skillName to $destination"
Write-Host "Next: run scripts/init_project.py in the target repository."

