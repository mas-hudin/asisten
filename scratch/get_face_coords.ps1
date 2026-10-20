Add-Type -AssemblyName System.Drawing
$imgPath = Resolve-Path "assets/robot_modern.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"

# Find the brightest blue visor pixels (Y between 300 and 500)
$minY = 9999; $maxY = 0; $minX = 9999; $maxX = 0
for ($y = 300; $y -lt 550; $y += 5) {
    for ($x = 300; $x -lt 724; $x += 5) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check cyan/blue visor: high Blue, high Green, lower Red
        if ($pixel.B -gt 180 -and $pixel.G -gt 140 -and $pixel.R -lt 120) {
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
}
Write-Host "Visor bounding box: X: $minX to $maxX, Y: $minY to $maxY"
$bmp.Dispose()
