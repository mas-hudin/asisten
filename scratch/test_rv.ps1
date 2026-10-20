$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
try {
    $bytes = $wc.DownloadData('https://code.responsivevoice.org/getvoice.php?t=Halo+saya+Ibu+Siska&tl=id&sv=g1&vn=&pitch=0.5&rate=0.5&vol=1')
    Write-Output "ResponsiveVoice Success: $($bytes.Length) bytes of MP3"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
