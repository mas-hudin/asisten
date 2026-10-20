try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8080/api/tts?q=Halo+saya+Ibu+Siska" -TimeoutSec 5
    Write-Output "Status: $($r.StatusCode), Length: $($r.Content.Length), ContentType: $($r.Headers['Content-Type'])"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
