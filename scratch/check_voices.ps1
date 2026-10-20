Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$installed = $synth.GetInstalledVoices()
Write-Output "Installed SAPI Voices:"
foreach ($v in $installed) {
    Write-Output " - $($v.VoiceInfo.Name) ($($v.VoiceInfo.Culture.Name), $($v.VoiceInfo.Gender), $($v.VoiceInfo.Age))"
}

# Check OneCore registry voices
Write-Output "`nInstalled OneCore Voices in Registry:"
$oneCorePath = "HKLM:\SOFTWARE\Microsoft\Speech_OneCore\Voices\Tokens"
if (Test-Path $oneCorePath) {
    Get-ChildItem $oneCorePath | ForEach-Object {
        $name = (Get-ItemProperty $_.PSPath).'(default)'
        Write-Output " - $name ($($_.PSChildName))"
    }
}
