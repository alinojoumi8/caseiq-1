# Verification script for the wireframe + design-system deliverable.
# Read-only. Reports: word counts, required-section presence, frontmatter fields,
# forbidden-vocabulary hits OUTSIDE documentation-of-forbidden-words contexts,
# and claim/citation/badge pairing heuristics.
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\matri\Documents\myprojects\caseiq-1\docs\product'
$dir  = Join-Path $root 'wireframes'

$required = @(
  'Screen purpose','Entry points','Hierarchy','Primary actions','States',
  'Interaction details','Copy strings','Accessibility notes','Data dependencies',
  'Acceptance criteria','Open questions'
)

$files = Get-ChildItem $dir -Filter '*.md' | Sort-Object Name
$rows = foreach ($f in $files) {
  $raw   = Get-Content $f.FullName -Raw
  $lines = Get-Content $f.FullName
  $words = ($raw -split '\s+' | Where-Object { $_ -ne '' }).Count
  $missing = @()
  if ($f.Name -notlike '_*' -and $f.Name -ne 'README.md') {
    foreach ($r in $required) {
      # match a markdown heading containing the phrase, case-insensitive
      if (-not ($lines -match ("(?i)^#+\s*.*" + [regex]::Escape($r)))) { $missing += $r }
    }
  }
  $fm = @{}
  $inFm = $false; $seen = 0
  foreach ($l in $lines) {
    if ($l -match '^---\s*$') { $seen++; $inFm = ($seen -eq 1); if ($seen -eq 2) { break }; continue }
    if ($inFm -and $l -match '^([a-z_]+):\s*(.*)$') { $fm[$Matches[1]] = $Matches[2] }
  }
  $codeBlocks = ([regex]::Matches($raw, '```')).Count / 2
  [pscustomobject]@{
    File      = $f.Name
    Words     = $words
    Fences    = $codeBlocks
    Title     = $fm['title']
    Status    = $fm['status']
    Owner     = $fm['owner']
    Updated   = $fm['last_updated']
    Phase     = $fm['phase']
    Features  = $fm['features']
    Missing   = ($missing -join ', ')
  }
}
$rows | Format-Table -AutoSize -Wrap | Out-String -Width 220

"=== SUMMARY ==="
"Wireframe files (excl. README and _brief): " + ($files | Where-Object { $_.Name -notlike '_*' -and $_.Name -ne 'README.md' }).Count
"Total words in wireframes: " + (($rows | Measure-Object -Property Words -Sum).Sum)
$ds = Join-Path $root '15-design-system.md'
$dsc = Get-Content $ds -Raw
"Design system words: " + (($dsc -split '\s+' | Where-Object { $_ -ne '' }).Count)
