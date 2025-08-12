# Test basic network connectivity
$port = 5006
$endpoint = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Loopback, $port)

# Create a TCP listener
$listener = [System.Net.Sockets.TcpListener]::new($endpoint.Address, $endpoint.Port)

Write-Host "=== Network Test ==="
Write-Host "Starting TCP listener on port $port..."

try {
    $listener.Start()
    Write-Host "✅ TCP listener started successfully"
    
    $url = "http://127.0.0.1:$port"
    Write-Host "`nPlease open the following URL in your browser:"
    Write-Host "  $url"
    Write-Host "`nPress any key to stop the listener..."
    
    # Start a background job to handle incoming connections
    $job = Start-Job -ScriptBlock {
        param($listener)
        while($true) {
            $client = $listener.AcceptTcpClient()
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $request = $reader.ReadLine()
            
            $response = @"
HTTP/1.1 200 OK
Content-Type: text/plain
Connection: close

Test successful! Connection received at $(Get-Date -Format 'o')
"@
            
            $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
            $stream.Write($bytes, 0, $bytes.Length)
            $client.Close()
        }
    } -ArgumentList $listener
    
    # Wait for a key press
    [void][System.Console]::ReadKey($true)
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
} finally {
    Write-Host "`nStopping TCP listener..."
    $listener.Stop()
    if ($job) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Test complete"
}
