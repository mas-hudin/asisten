$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
$text = "Kepala sekolah kami di SMP Negeri 1 Mirit adalah Ibu Dra. Siti Masruroh, M.Pd."
$encoded = [System.Uri]::EscapeDataString($text)
$url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=$encoded"
try {
    $bytes = $wc.DownloadData($url)
    Write-Output "Success: Downloaded $($bytes.Length) bytes of MP3"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
