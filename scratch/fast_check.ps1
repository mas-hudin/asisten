Get-ChildItem -Path js/*.js | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $ob = ([regex]::Matches($c, '\{')).Count
    $cb = ([regex]::Matches($c, '\}')).Count
    $op = ([regex]::Matches($c, '\(')).Count
    $cp = ([regex]::Matches($c, '\)')).Count
    Write-Host "$($_.Name): Braces: $ob / $cb ($($ob -eq $cb)), Parens: $op / $cp ($($op -eq $cp))"
}
