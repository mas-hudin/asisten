$shell = New-Object -ComObject Shell.Application
$folder = $shell.Namespace((Get-Item "assets").FullName)
$file = $folder.ParseName("gemini_generated_video_45dea1c5.mp4")
0..40 | ForEach-Object {
    $header = $folder.GetDetailsOf($null, $_)
    $val = $folder.GetDetailsOf($file, $_)
    if ($val) {
        Write-Output "$header : $val"
    }
}
