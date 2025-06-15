npm run build

npm install -g serve
if ($LASTEXITCODE -ne 0) {
    Write-Host "Global installation of serve failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
serve -s dist