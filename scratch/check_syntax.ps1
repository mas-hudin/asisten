Get-ChildItem -Path js/*.js | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $openBraces = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
    $closeBraces = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
    $openParens = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
    $closeParens = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
    $openBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '[' }).Count
    $closeBrackets = ($content.ToCharArray() | Where-Object { $_ -eq ']' }).Count
    
    Write-Host "$($_.Name):"
    Write-Host "  Braces {}: $openBraces open, $closeBraces close $(if ($openBraces -eq $closeBraces) {'[OK]'} else {'[MISMATCH]'})"
    Write-Host "  Parens (): $openParens open, $closeParens close $(if ($openParens -eq $closeParens) {'[OK]'} else {'[MISMATCH]'})"
    Write-Host "  Brackets []: $openBrackets open, $closeBrackets close $(if ($openBrackets -eq $closeBrackets) {'[OK]'} else {'[MISMATCH]'})"
}
