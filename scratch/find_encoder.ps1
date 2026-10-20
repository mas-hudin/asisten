$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path "assets/gemini_generated_video_45dea1c5.mp4"))
$text = [System.Text.Encoding]::ASCII.GetString($bytes)

$keywords = @('Lavf', 'HandBrake', 'Adobe', 'Google', 'Gemini', 'D-ID', 'HeyGen', 'ElevenLabs', 'Synthesia', 'ffmpeg', 'encoder', 'major_brand', 'isom', 'mp42', 'handler_name')

foreach ($k in $keywords) {
    $idx = 0
    while (($idx = $text.IndexOf($k, $idx)) -ge 0) {
        $start = [Math]::Max(0, $idx - 20)
        $len = [Math]::Min(80, $text.Length - $start)
        $snippet = $text.Substring($start, $len) -replace '[^\x20-\x7E]', '.'
        Write-Host ("Found " + $k + " at " + $idx + ": " + $snippet)
        $idx += $k.Length
        if ($idx -gt 500000) { break }
    }
}
