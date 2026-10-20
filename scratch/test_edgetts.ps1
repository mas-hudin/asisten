$wsUrl = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EA65408084483868579A0F42"

$client = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource
$uri = New-Object System.Uri($wsUrl)

try {
    $task = $client.ConnectAsync($uri, $cts.Token)
    $task.Wait(5000)
    Write-Host "Connected to Edge TTS WebSocket:" $client.State
    $client.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $cts.Token).Wait(2000)
} catch {
    Write-Host "Error connecting to Edge TTS:" $_.Exception.Message
}
