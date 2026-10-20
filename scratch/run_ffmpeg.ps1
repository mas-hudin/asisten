$ffmpeg = "C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
$src = "assets\gemini_generated_video_45dea1c5.mp4"
$mp3 = "assets\siska_suara_asli.mp3"
$wav = "assets\siska_suara_asli.wav"

& $ffmpeg -y -i $src -vn -acodec libmp3lame -q:a 2 $mp3
& $ffmpeg -y -i $src -vn -acodec pcm_s16le -ar 44100 $wav

Get-ChildItem assets\siska_suara_asli.* | Select-Object Name, Length
