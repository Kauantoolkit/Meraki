# ─── Identity Service — Endpoint Smoke Test ──────────────────────────────────
# Roda todos os endpoints em sequência e exibe os resultados.

$BASE = "http://localhost:3001/api"
$ERRORS = 0

function Print-Step($msg) {
    Write-Host "`n── $msg" -ForegroundColor Cyan
}

function Print-Ok($msg) {
    Write-Host "  OK  $msg" -ForegroundColor Green
}

function Print-Fail($msg) {
    Write-Host "  FAIL  $msg" -ForegroundColor Red
    $script:ERRORS++
}

function Invoke-Api {
    param($Method, $Url, $Body, $Token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        $params = @{ Method = $Method; Uri = $Url; Headers = $headers; ErrorAction = "Stop" }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json) }
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $detail = $_.ErrorDetails.Message
        throw "HTTP $statusCode — $detail"
    }
}

# ─── 1. Register specialist ───────────────────────────────────────────────────
Print-Step "POST /auth/register (specialist)"
try {
    $specialist = Invoke-Api -Method POST -Url "$BASE/auth/register" -Body @{
        email    = "specialist@test.com"
        password = "senha123"
        name     = "João Silva"
        userType = "SPECIALIST"
    }
    Print-Ok "Specialist registrado: $($specialist.id)"
} catch { Print-Fail $_ }

# ─── 2. Register company ──────────────────────────────────────────────────────
Print-Step "POST /auth/register (company)"
try {
    $company = Invoke-Api -Method POST -Url "$BASE/auth/register" -Body @{
        email       = "empresa@test.com"
        password    = "senha123"
        name        = "Maria Souza"
        userType    = "COMPANY"
        companyName = "Tech Corp Ltda"
    }
    Print-Ok "Company registrada: $($company.id)"
} catch { Print-Fail $_ }

# ─── 3. Login ─────────────────────────────────────────────────────────────────
Print-Step "POST /auth/login"
$TOKEN = $null
try {
    $login = Invoke-Api -Method POST -Url "$BASE/auth/login" -Body @{
        email    = "specialist@test.com"
        password = "senha123"
    }
    $TOKEN = $login.accessToken
    Print-Ok "Login OK — token obtido"
} catch { Print-Fail $_ }

# ─── 4. GET /users/me ─────────────────────────────────────────────────────────
Print-Step "GET /users/me (autenticado)"
if ($TOKEN) {
    try {
        $me = Invoke-Api -Method GET -Url "$BASE/users/me" -Token $TOKEN
        Print-Ok "Perfil: $($me.name) ($($me.userType))"
    } catch { Print-Fail $_ }
} else {
    Print-Fail "Pulado — sem token"
}

# ─── 5. PUT /users/me/profile ─────────────────────────────────────────────────
Print-Step "PUT /users/me/profile (autenticado)"
if ($TOKEN) {
    try {
        $updated = Invoke-Api -Method PUT -Url "$BASE/users/me/profile" -Token $TOKEN -Body @{
            bio        = "Desenvolvedor Flutter com 5 anos de experiência"
            skills     = @("Flutter", "Dart", "Firebase")
            experience = 5
            hourlyRate = 150.0
        }
        Print-Ok "Perfil atualizado"
    } catch { Print-Fail $_ }
} else {
    Print-Fail "Pulado — sem token"
}

# ─── 6. GET /users/:id ────────────────────────────────────────────────────────
Print-Step "GET /users/:id (autenticado)"
if ($TOKEN -and $specialist) {
    try {
        $user = Invoke-Api -Method GET -Url "$BASE/users/$($specialist.id)" -Token $TOKEN
        Print-Ok "Usuário por ID: $($user.name)"
    } catch { Print-Fail $_ }
} else {
    Print-Fail "Pulado — sem token ou ID"
}

# ─── Resultado ────────────────────────────────────────────────────────────────
Write-Host ""
if ($ERRORS -eq 0) {
    Write-Host "Todos os endpoints passaram." -ForegroundColor Green
} else {
    Write-Host "$ERRORS endpoint(s) falharam." -ForegroundColor Red
}
