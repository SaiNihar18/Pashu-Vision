# Downloads breed_classifier.onnx from a GitHub Release asset (optional alternative to Git LFS).
# Usage:
#   $env:MODEL_RELEASE_URL = "https://github.com/YOUR_USER/pashu-vision/releases/download/v1.0.0/breed_classifier.onnx"
#   .\scripts\download-model.ps1

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\public\models\breed_classifier"
$outFile = Join-Path $outDir "breed_classifier.onnx"

if (-not $env:MODEL_RELEASE_URL) {
  Write-Host "Set MODEL_RELEASE_URL to the raw/release URL of breed_classifier.onnx"
  Write-Host "Example: https://github.com/USER/REPO/releases/download/v1.0.0/breed_classifier.onnx"
  exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Write-Host "Downloading model to $outFile ..."
Invoke-WebRequest -Uri $env:MODEL_RELEASE_URL -OutFile $outFile -UseBasicParsing
$sizeMb = [math]::Round((Get-Item $outFile).Length / 1MB, 1)
Write-Host "Done. Size: ${sizeMb} MB"
