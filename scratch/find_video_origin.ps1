Get-ChildItem -Recurse -Filter transcript*.jsonl C:\Users\user\.gemini\antigravity-ide\brain | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern '45dea1c5'
    if ($matches) {
        Write-Host "File:" $_.FullName
        $matches | Select-Object -First 3 | ForEach-Object {
            Write-Host "Line" $_.LineNumber ":" $_.Line.Substring(0, [Math]::Min(150, $_.Line.Length))
        }
    }
}
