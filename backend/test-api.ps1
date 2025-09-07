# Test Backend API Endpoints
$baseUrl = "http://localhost:3001"

Write-Host "🚀 Testing Backend API Endpoints..." -ForegroundColor Green
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{}
    )
    
    try {
        $fullUrl = "$baseUrl$Url"
        Write-Host "Testing: $Method $fullUrl" -ForegroundColor Yellow
        
        $params = @{
            Uri = $fullUrl
            Method = $Method
            ContentType = "application/json"
            Headers = $Headers
        }
        
        if ($Body.Count -gt 0) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ SUCCESS - Status: 200" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        return $null
    }
}

# Test server connectivity
Write-Host "=== Testing Server Connectivity ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running on port 3001" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Server is not responding on port 3001" -ForegroundColor Red
    Write-Host "Please make sure the backend server is running with 'npm run dev'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test endpoints
Write-Host "=== Testing API Endpoints ===" -ForegroundColor Cyan

# 1. Test Colleges
Write-Host "`n--- Colleges Endpoints ---" -ForegroundColor Blue
$colleges = Test-Endpoint -Method "GET" -Url "/api/colleges"

$newCollege = Test-Endpoint -Method "POST" -Url "/api/colleges" -Body @{
    name = "Test University"
    emailDomain = "@test.edu"
}

if ($colleges -and $colleges.Count -gt 0) {
    $collegeId = $colleges[0].id
    Test-Endpoint -Method "GET" -Url "/api/colleges/$collegeId"
}

# 2. Test Students
Write-Host "`n--- Students Endpoints ---" -ForegroundColor Blue
$students = Test-Endpoint -Method "GET" -Url "/api/students"

if ($students -and $students.Count -gt 0) {
    $studentId = $students[0].id
    Test-Endpoint -Method "GET" -Url "/api/students/$studentId"
}

# 3. Test Auth (without authentication for now)
Write-Host "`n--- Auth Endpoints ---" -ForegroundColor Blue
Test-Endpoint -Method "POST" -Url "/api/auth/admin/login" -Body @{
    email = "admin@admin.com"
    password = "admin123"
}

if ($collegeId) {
    Test-Endpoint -Method "POST" -Url "/api/auth/student/register" -Body @{
        name = "Test Student"
        email = "teststudent@mit.edu"
        collegeId = $collegeId
    }
}

# 4. Test Events (will likely fail due to auth requirements)
Write-Host "`n--- Events Endpoints ---" -ForegroundColor Blue
Test-Endpoint -Method "GET" -Url "/api/events"

# 5. Test Registrations
Write-Host "`n--- Registrations Endpoints ---" -ForegroundColor Blue
Test-Endpoint -Method "GET" -Url "/api/registrations"

# 6. Test Reports
Write-Host "`n--- Reports Endpoints ---" -ForegroundColor Blue
Test-Endpoint -Method "GET" -Url "/api/reports/overall-stats"
Test-Endpoint -Method "GET" -Url "/api/reports/event-popularity"
Test-Endpoint -Method "GET" -Url "/api/reports/student-participation"

Write-Host "`n🏁 API Testing Complete!" -ForegroundColor Green
