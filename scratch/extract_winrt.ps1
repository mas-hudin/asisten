$srcPath = (Resolve-Path "assets/gemini_generated_video_45dea1c5.mp4").Path
$dstPath = [System.IO.Path]::Combine((Get-Item "assets").FullName, "siska_suara_asli.m4a")

if (Test-Path $dstPath) { Remove-Item $dstPath -Force }

$asyncSrc = [Windows.Storage.StorageFile]::GetFileFromPathAsync($srcPath)
$srcFile = $asyncSrc.GetResults()
if (-not $srcFile) {
    while ($asyncSrc.Status -eq 'Started') { Start-Sleep -Milliseconds 50 }
    $srcFile = $asyncSrc.GetResults()
}

$asyncDst = [Windows.Storage.StorageFolder]::GetFolderFromPathAsync((Get-Item "assets").FullName)
while ($asyncDst.Status -eq 'Started') { Start-Sleep -Milliseconds 50 }
$dstFolder = $asyncDst.GetResults()

$asyncCreate = $dstFolder.CreateFileAsync("siska_suara_asli.m4a", [Windows.Storage.CreationCollisionOption]::ReplaceExisting)
while ($asyncCreate.Status -eq 'Started') { Start-Sleep -Milliseconds 50 }
$dstFile = $asyncCreate.GetResults()

$transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateM4a([Windows.Media.MediaProperties.AudioEncodingQuality]::High)

$prepareOp = $transcoder.PrepareFileTranscodeAsync($srcFile, $dstFile, $profile)
while ($prepareOp.Status -eq 'Started') { Start-Sleep -Milliseconds 50 }
$prepResult = $prepareOp.GetResults()

if ($prepResult.CanTranscode) {
    Write-Host "Transcoding audio..."
    $transcodeOp = $prepResult.TranscodeAsync()
    while ($transcodeOp.Status -eq 'Started') { Start-Sleep -Milliseconds 100 }
    Write-Host "Audio extracted successfully to: $dstPath"
    Write-Host "File size:" (Get-Item $dstPath).Length "bytes"
} else {
    Write-Host "Cannot transcode:" $prepResult.FailureReason
}
