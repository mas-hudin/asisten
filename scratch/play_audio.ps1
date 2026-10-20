$wmp = New-Object -ComObject WMPlayer.OCX
$wmp.URL = (Resolve-Path "assets/gemini_generated_video_45dea1c5.mp4").Path
$wmp.controls.play()
Start-Sleep -Seconds 11
$wmp.controls.stop()
