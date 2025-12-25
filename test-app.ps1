# Test script for Pizza Order App

Write-Host "=== Testing Pizza Order App ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Checks
Write-Host "1. Checking Health Endpoints..." -ForegroundColor Yellow
$services = @(
    @{Name="Auth Service"; Url="http://localhost:3001/health"},
    @{Name="User Service"; Url="http://localhost:3002/health"},
    @{Name="Product Service"; Url="http://localhost:3003/health"},
    @{Name="Order Service"; Url="http://localhost:3004/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  [OK] $($service.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  [FAIL] $($service.Name)" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Test Registration
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerData
    
    if ($registerResponse.success) {
        Write-Host "  [OK] Registration successful!" -ForegroundColor Green
        Write-Host "      Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
        $token = $registerResponse.data.accessToken
        Write-Host "      Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    }
} catch {
    $errorMessage = $_.ErrorDetails.Message
    if ($errorMessage -like "*already exists*") {
        Write-Host "  [INFO] User exists, testing login..." -ForegroundColor Yellow
        
        # 3. Test Login
        Write-Host ""
        Write-Host "3. Testing Login..." -ForegroundColor Yellow
        $loginData = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
                -Method POST `
                -ContentType "application/json" `
                -Body $loginData
            
            if ($loginResponse.success) {
                Write-Host "  [OK] Login successful!" -ForegroundColor Green
                $token = $loginResponse.data.accessToken
                Write-Host "      Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
            }
        } catch {
            Write-Host "  [FAIL] Login error: $($_.Exception.Message)" -ForegroundColor Red
            $token = $null
        }
    } else {
        Write-Host "  [FAIL] Registration error: $errorMessage" -ForegroundColor Red
        $token = $null
    }
}

Write-Host ""

# 4. Test Products
Write-Host "4. Testing Products API..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/products" -UseBasicParsing
    if ($productsResponse.success) {
        $productsCount = $productsResponse.data.Count
        Write-Host "  [OK] Products retrieved: $productsCount" -ForegroundColor Green
        if ($productsCount -gt 0) {
            Write-Host "      First product: $($productsResponse.data[0].name) - $($productsResponse.data[0].price) RUB" -ForegroundColor Gray
        } else {
            Write-Host "      [INFO] Database is empty (seed data not loaded)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  [FAIL] Products error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test User Profile (if token exists)
if ($token) {
    Write-Host "5. Testing User Profile..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/users/profile" `
            -Headers $headers `
            -UseBasicParsing
        
        if ($profileResponse.success) {
            Write-Host "  [OK] Profile retrieved!" -ForegroundColor Green
            Write-Host "      User ID: $($profileResponse.data.userId)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [FAIL] Profile error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 6. Check Frontend
Write-Host "6. Checking Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  [OK] Frontend is accessible!" -ForegroundColor Green
        Write-Host "      Open in browser: http://localhost:3000" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  [FAIL] Frontend error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Register or login" -ForegroundColor White
Write-Host "3. Browse pizza menu" -ForegroundColor White
Write-Host "4. Add pizzas to cart" -ForegroundColor White
Write-Host "5. Create an order" -ForegroundColor White
