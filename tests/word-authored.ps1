param([Parameter(Mandatory)][string]$Directory, [switch]$SecondPass)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $Directory).Path
$word = New-Object -ComObject Word.Application
$word.DisplayAlerts = 0
$word.AutomationSecurity = 3
$word.Options.UpdateFieldsAtPrint = $false
$word.Options.UpdateLinksAtPrint = $false
try {
    Write-Output "Word build $($word.Build)"
    $inputName = if ($SecondPass) { 'word-first' } else { 'owned' }
    $outputName = if ($SecondPass) { 'word-resaved' } else { 'word-authored' }
    $doc = $word.Documents.Open((Join-Path $root ($inputName + '.docx')), $false, $true)
    try {
        if (!$SecondPass) {
            $text = $doc.Paragraphs.Item(1).Range.Duplicate
            $text.End = $text.End - 1
            $text.NoProofing = -1
            $chart = @($doc.InlineShapes | Where-Object { $_.HasChart })[0]
            if (!$chart) { throw 'The source needs a native inline chart' }
            $range = $chart.Range.Duplicate
            $range.Collapse(1)
            $range.InsertBefore('Mixed ')
            $range.Font.Name = 'Arial'
            $range.Font.Size = 12
            $range.Font.Bold = -1
            $range = $chart.Range.Duplicate
            $range.Collapse(0)
            $range.InsertAfter(' chart ending')
            $range.Font.Name = 'Arial'
            $range.Font.Size = 16
            $range.Font.Italic = -1
        }
        $doc.SaveAs2((Join-Path $root ($outputName + '.docx')), 12)
        $doc.Repaginate()
        Write-Output "$outputName pages=$($doc.ComputeStatistics(2)) charts=$(@($doc.InlineShapes | Where-Object { $_.HasChart }).Count)"
        $doc.ExportAsFixedFormat((Join-Path $root ($outputName + '-word.pdf')), 17)
    } finally { $doc.Close(0) }
} finally { $word.Quit(0) }
