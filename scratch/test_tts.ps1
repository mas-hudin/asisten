$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
try {
    $bytes = $wc.DownloadData('https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=Halo+selamat+pagi')
    Write-Output "Downloaded $($bytes.Length) bytes of MP3 audio"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
