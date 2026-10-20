Add-Type -AssemblyName System.Drawing
$imgPath = Resolve-Path "assets/robot_modern.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Sample around Y: 570-650, X: 470-555
$minDarkness = 999999
$mouthY = 0
for ($y = 560; $y -lt 660; $y += 2) {
    $sumBright = 0
    for ($x = 480; $x -lt 545; $x += 2) {
        $pixel = $bmp.GetPixel($x, $y)
        $sumBright += ($pixel.R + $pixel.G + $pixel.B)
    }
    # Lips / mouth line is typically a darker crease between the lighter skin/plate
    if ($sumBright -lt $minDarkness) {
        $minDarkness = $sumBright
        $mouthY = $y
    }
}
Write-Host "Mouth crease estimated at Y: $mouthY"
$bmp.Dispose()
