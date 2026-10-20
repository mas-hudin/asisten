$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
$wc.Headers.Add('Referer', 'http://127.0.0.1:8080/')
try {
    $bytes = $wc.DownloadData('https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=Halo')
    Write-Output "Success: $($bytes.Length) bytes"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
