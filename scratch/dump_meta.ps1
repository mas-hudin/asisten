$shell = New-Object -ComObject Shell.Application
$folder = $shell.Namespace((Get-Item "assets").FullName)
$file = $folder.ParseName("gemini_generated_video_45dea1c5.mp4")
0..320 | ForEach-Object {
    $idx = $_
    $h = $folder.GetDetailsOf($null, $idx)
    $v = $folder.GetDetailsOf($file, $idx)
    if ($v -and $v.Trim() -ne "") {
        Write-Output "[$idx] $h = $v"
    }
}
