param([Parameter(Mandatory)][string]$Directory,
      [Parameter(Mandatory)][string[]]$Name)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $Directory).Path
$word = New-Object -ComObject Word.Application
$word.DisplayAlerts = 0
$word.AutomationSecurity = 3
$word.Options.UpdateFieldsAtPrint = $false
$word.Options.UpdateLinksAtPrint = $false
try {
    Write-Output "Word build $($word.Build)"
    foreach ($stem in $Name) {
        $doc = $word.Documents.Open((Join-Path $root ($stem + '.docx')), $false, $true)
        try {
            $doc.Repaginate()
            $charts = @($doc.InlineShapes | Where-Object { $_.HasChart }).Count
            Write-Output "$stem pages=$($doc.ComputeStatistics(2)) charts=$charts"
            if ($stem -like 'owned*' -and $charts -ne 1) { throw 'Expected one native chart' }
            $doc.ExportAsFixedFormat((Join-Path $root ($stem + '-word.pdf')), 17)
        } finally { $doc.Close(0) }
    }
} finally { $word.Quit(0) }
