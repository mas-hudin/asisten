$dirs = @('8b871e64-4087-4dd2-b329-bb6b2adf5202', '8e0b4540-320c-4076-8b8f-b7711858f7ba', '031ae72d-9e84-438d-85db-43609b11eeb0')
foreach ($d in $dirs) {
    $p = "C:\Users\user\.gemini\antigravity-ide\brain\$d\.system_generated\logs\transcript.jsonl"
    if (Test-Path $p) {
        Write-Host "=== FOLDER $d ==="
        Get-Content $p | Select-String '"type":"USER_INPUT"' | ForEach-Object {
            Write-Host $_.Line
        }
    }
}
