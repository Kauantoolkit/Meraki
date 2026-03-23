$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot

$DockerProcesses = @("com.docker.backend", "com.docker.proxy", "dockerd", "docker", "wslrelay", "wsl", "vmwp")

function Check-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Docker nao encontrado. Instale o Docker Desktop." -ForegroundColor Red
        exit 1
    }
    $info = & docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker Desktop nao esta rodando. Inicie-o e tente novamente." -ForegroundColor Red
        exit 1
    }
}

function Get-HostIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169' } |
           Select-Object -First 1).IPAddress
    return $ip
}

function Free-Port {
    param([int]$Port)
    $services = @("RabbitMQ", "rabbitmq")
    foreach ($svc in $services) {
        $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
        if ($s -and $s.Status -eq 'Running') {
            Write-Host "  Parando servico Windows: $svc" -ForegroundColor Yellow
            Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
        }
    }
    $lines = netstat -ano | Select-String ":$Port "
    foreach ($line in $lines) {
        if ($line -notmatch 'LISTENING') { continue }
        $parts = ($line.ToString().Trim()) -split '\s+'
        $pidStr = $parts[-1]
        $pidNum = 0
        if (-not ([int]::TryParse($pidStr, [ref]$pidNum))) { continue }
        if ($pidNum -le 0) { continue }
        $proc = Get-Process -Id $pidNum -ErrorAction SilentlyContinue
        if (-not $proc) { continue }
        if ($DockerProcesses -contains $proc.Name) {
            Write-Host "  Porta $Port em uso pelo Docker ($($proc.Name)) - ignorando." -ForegroundColor DarkGray
            continue
        }
        Write-Host "  Porta $Port ocupada por '$($proc.Name)' (PID $pidNum) - encerrando..." -ForegroundColor Yellow
        Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "[1/3] Verificando Docker..." -ForegroundColor Cyan
Check-Docker
Write-Host "  Docker OK." -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Fazendo build de todos os servicos..." -ForegroundColor Cyan
Write-Host "  (isso pode demorar alguns minutos na primeira vez)"
Write-Host ""

Set-Location $Root
docker compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build falhou. Verifique os erros acima." -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "  Build concluido." -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Subindo todos os containers..." -ForegroundColor Cyan

$requiredPorts = @(5432, 5433, 5434, 5435, 5436, 5437, 5672, 15672, 3000, 3001, 3002, 3003, 3004, 3005, 3006)
foreach ($port in $requiredPorts) {
    $listening = netstat -ano | Select-String ":$port " | Where-Object { $_ -match 'LISTENING' }
    if ($listening) { Free-Port -Port $port }
}

$staleContainers = @(
    "meraki-rabbitmq", "meraki-postgres",
    "meraki-identity-db", "meraki-project-db", "meraki-bidding-db",
    "meraki-delivery-db", "meraki-payment-db", "meraki-portfolio-db"
)
foreach ($name in $staleContainers) {
    $exists = & docker ps -a --filter "name=^${name}$" --format "{{.Names}}" 2>$null
    if ($exists -eq $name) {
        Write-Host "  Removendo container avulso: $name"
        & docker rm -f $name | Out-Null
    }
}

docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Falha ao subir containers." -ForegroundColor Red
    exit 1
}

$HOST_IP = Get-HostIP

Write-Host ""
Write-Host "-------------------------------------------------" -ForegroundColor Cyan
Write-Host " Meraki stack rodando!" -ForegroundColor Green
Write-Host "-------------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host " Acesso local:"
Write-Host "   API Gateway   -> http://localhost:3000/api/docs"
Write-Host "   Identity      -> http://localhost:3001/api/docs"
Write-Host "   Project       -> http://localhost:3002/api/docs"
Write-Host "   Bidding       -> http://localhost:3003/api/docs"
Write-Host "   Delivery      -> http://localhost:3004/api/docs"
Write-Host "   Payment       -> http://localhost:3005/api/docs"
Write-Host "   Portfolio     -> http://localhost:3006/api/docs"
Write-Host "   RabbitMQ UI   -> http://localhost:15672  (meraki/meraki)"
Write-Host ""
if ($HOST_IP) {
    Write-Host " Acesso na rede (IP: $HOST_IP):"
    Write-Host "   API Gateway   -> http://${HOST_IP}:3000/api/docs"
    Write-Host "   Identity      -> http://${HOST_IP}:3001/api/docs"
    Write-Host "   Project       -> http://${HOST_IP}:3002/api/docs"
    Write-Host "   Bidding       -> http://${HOST_IP}:3003/api/docs"
    Write-Host "   Delivery      -> http://${HOST_IP}:3004/api/docs"
    Write-Host "   Payment       -> http://${HOST_IP}:3005/api/docs"
    Write-Host "   Portfolio     -> http://${HOST_IP}:3006/api/docs"
    Write-Host ""
}
Write-Host " Comandos uteis:"
Write-Host "   docker compose logs -f SERVICO   # logs em tempo real"
Write-Host "   docker compose ps                # status dos containers"
Write-Host "   docker compose down              # parar tudo"
Write-Host "   docker compose down -v           # parar e apagar volumes (reset DB)"
Write-Host "-------------------------------------------------" -ForegroundColor Cyan
Write-Host ""
