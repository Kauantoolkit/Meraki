# ─── Identity Service — Dev Startup Script ───────────────────────────────────
# Starts PostgreSQL + RabbitMQ via Docker, then runs the NestJS service.

$ErrorActionPreference = "Continue"
$ServiceDir = $PSScriptRoot

function Check-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Docker not found. Install Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
    $status = & docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker Desktop is not running. Please start it and try again." -ForegroundColor Red
        exit 1
    }
}

function Start-Container {
    param($Name, $RunArgs)
    $exists = docker ps -a --filter "name=^${Name}$" --format "{{.Names}}"
    if ($exists -eq $Name) {
        $running = docker ps --filter "name=^${Name}$" --format "{{.Names}}"
        if ($running -ne $Name) {
            Write-Host "  Starting existing container '$Name'..."
            docker start $Name | Out-Null
        } else {
            Write-Host "  Container '$Name' already running."
        }
    } else {
        Write-Host "  Creating and starting container '$Name'..."
        Invoke-Expression "docker run -d --name $Name $RunArgs" | Out-Null
    }
}

function Wait-Port {
    param($Host, $Port, $Label, [int]$TimeoutSec = 30)
    Write-Host "  Waiting for $Label on port $Port..." -NoNewline
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        $tcp = New-Object System.Net.Sockets.TcpClient
        try {
            $tcp.Connect($Host, $Port)
            $tcp.Close()
            Write-Host " ready."
            return
        } catch { Start-Sleep -Milliseconds 500 }
    }
    Write-Error "$Label did not become ready within ${TimeoutSec}s."
    exit 1
}

# ─── Step 1: Docker ───────────────────────────────────────────────────────────
Write-Host "`n[1/3] Checking Docker..."
Check-Docker

# ─── Step 2: Infrastructure ───────────────────────────────────────────────────
Write-Host "`n[2/3] Starting infrastructure containers..."

Start-Container -Name "meraki-postgres" -RunArgs `
    "-e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=identity_db -p 5432:5432 postgres:15"

Start-Container -Name "meraki-rabbitmq" -RunArgs `
    "-e RABBITMQ_DEFAULT_USER=meraki -e RABBITMQ_DEFAULT_PASS=meraki -p 5672:5672 -p 15672:15672 rabbitmq:3-management"

Wait-Port -Host "localhost" -Port 5432 -Label "PostgreSQL"
Wait-Port -Host "localhost" -Port 5672 -Label "RabbitMQ"

# ─── Step 3: Identity Service ─────────────────────────────────────────────────
Write-Host "`n[3/3] Starting Identity Service..."
Write-Host "  API  -> http://localhost:3001/api"
Write-Host "  Docs -> http://localhost:3001/api/docs`n"

Set-Location $ServiceDir
npm run start:dev
