param(
    [Parameter(Mandatory = $true)]
    [string]$RenderApiKey,
    [Parameter(Mandatory = $true)]
    [string]$GroqApiKey,
    [string]$ServiceName = "deim-backend"
)

$headers = @{
    Authorization = "Bearer $RenderApiKey"
    Accept        = "application/json"
    "Content-Type" = "application/json"
}

$services = Invoke-RestMethod -Uri "https://api.render.com/v1/services?limit=50" -Headers $headers
$service = $services | ForEach-Object { $_.service } | Where-Object { $_.name -eq $ServiceName } | Select-Object -First 1

if (-not $service) {
    throw "Render service '$ServiceName' not found."
}

$serviceId = $service.id
Write-Host "Updating Groq__ApiKey on service $ServiceName ($serviceId)..."

$body = @(
    @{ key = "Groq__ApiKey"; value = $GroqApiKey }
    @{ key = "Groq__Model"; value = "llama-3.1-8b-instant" }
) | ConvertTo-Json

Invoke-RestMethod -Method Put -Uri "https://api.render.com/v1/services/$serviceId/env-vars" -Headers $headers -Body $body | Out-Null

Write-Host "Triggering deploy..."
Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Headers $headers -Body "{}" | Out-Null
Write-Host "Done. Backend redeploy started."
