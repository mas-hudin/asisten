$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
$wc.Headers.Add('Referer', 'http://127.0.0.1:8080/')
try {
    $bytes = $wc.DownloadData('https://api.streamelements.com/kappa/v2/speech?voice=Gadis&text=Halo+saya+Ibu+Siska+guru+SMP+Negeri+1+Mirit')
    Write-Output "StreamElements Gadis Success: $($bytes.Length) bytes of MP3 audio"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
