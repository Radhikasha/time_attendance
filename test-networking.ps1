# Test basic networking functionality
Write-Host "=== Network Connectivity Test ==="

# Test localhost connectivity
Write-Host "`n[1/3] Testing localhost connectivity..."
try {
    $ping = New-Object System.Net.NetworkInformation.Ping
    $result = $ping.Send("localhost")
    if ($result.Status -eq 'Success') {
        Write-Host "✅ Successfully pinged localhost" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to ping localhost. Status: $($result.Status)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error pinging localhost: $_" -ForegroundColor Red
}

# Test TCP listener
Write-Host "`n[2/3] Testing TCP listener..."
try {
    $port = 3002
    $endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Loopback, $port)
    $listener = New-Object System.Net.Sockets.TcpListener $endpoint
    
    try {
        $listener.Start()
        Write-Host "✅ Successfully started TCP listener on port $port" -ForegroundColor Green
        
        # Start a background job to accept a connection
        $job = Start-Job -ScriptBlock {
            param($listener)
            $client = $listener.AcceptTcpClient()
            $stream = $client.GetStream()
            $writer = [System.IO.StreamWriter]::new($stream)
            $writer.WriteLine("HTTP/1.1 200 OK`r`nContent-Type: text/plain`r`n`r`nTest successful!")
            $writer.Flush()
            $client.Close()
        } -ArgumentList $listener
        
        # Test the connection
        try {
            $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', $port)
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $response = $reader.ReadToEnd()
            
            if ($response -match "Test successful") {
                Write-Host "✅ Successfully connected to test server" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Connected to test server but received unexpected response" -ForegroundColor Yellow
            }
            $client.Close()
        } catch {
            Write-Host "❌ Failed to connect to test server: $_" -ForegroundColor Red
        }
        
        # Clean up
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        
    } finally {
        $listener.Stop()
    }
} catch {
    Write-Host "❌ Failed to create TCP listener: $_" -ForegroundColor Red
}

# Test HTTP request
Write-Host "`n[3/3] Testing HTTP request..."
try {
    $webClient = New-Object System.Net.WebClient
    $response = $webClient.DownloadString("http://example.com")
    if ($response) {
        Write-Host "✅ Successfully made HTTP request to example.com" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Made HTTP request but received empty response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to make HTTP request: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===`n"
