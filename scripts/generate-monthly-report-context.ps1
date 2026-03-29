param(
    [Parameter(Mandatory = $true)]
    [datetime]$StartDate,

    [Parameter(Mandatory = $true)]
    [datetime]$EndDate,

    [string]$RepoRoot = (Get-Location).Path,

    [string]$OutputPath = '',

    [string[]]$DeliverablePaths = @('docs/')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [Console]::InputEncoding = $utf8NoBom
    [Console]::OutputEncoding = $utf8NoBom
    $OutputEncoding = $utf8NoBom
}
catch {
}

function Convert-ToDateTime {
    param([AllowNull()][string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    try {
        return [datetime]::Parse($Value)
    }
    catch {
        return $null
    }
}

function Filter-ItemsByDateRange {
    param(
        [Parameter(Mandatory = $true)]$Items,
        [Parameter(Mandatory = $true)][string]$PropertyName,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To
    )

    return @($Items | Where-Object {
        $value = Convert-ToDateTime $_.$PropertyName
        $null -ne $value -and $value -ge $From -and $value -le $To
    })
}

function Invoke-Git {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    return & git -C $RepoRoot @Arguments 2>$null
}

function Invoke-GhJson {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $raw = & gh @Arguments 2>$null | Out-String -Width 4000
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return @()
    }

    try {
        return $raw | ConvertFrom-Json
    }
    catch {
        return @()
    }
}

$summaryScript = Join-Path $RepoRoot 'scripts/generate-individual-activity-summary.ps1'
$activitySummary = $null
if (Test-Path $summaryScript) {
    try {
        $summaryRaw = & $summaryScript `
            -StartDate $StartDate `
            -EndDate $EndDate `
            -RepoRoot $RepoRoot `
            -DeliverablePaths $DeliverablePaths `
            -AutoDetectLinkedPRs $true `
            -IncludeAllRefs $true `
            -IntentAwareLineCount $true `
            -OutputFormat 'json' 2>$null | Out-String -Width 4000

        if (-not [string]::IsNullOrWhiteSpace($summaryRaw)) {
            $activitySummary = $summaryRaw | ConvertFrom-Json
        }
    }
    catch {
        $activitySummary = [pscustomobject]@{
            error = 'No se pudo leer el resumen individual existente.'
            details = $_.Exception.Message
        }
    }
}

$issues = @()
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $issues = Invoke-GhJson -Arguments @('issue', 'list', '--state', 'closed', '--limit', '200', '--json', 'number,title,assignees,closedAt,labels,url')
    $issues = Filter-ItemsByDateRange -Items $issues -PropertyName 'closedAt' -From $StartDate -To $EndDate
}

$prs = @()
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $prs = Invoke-GhJson -Arguments @('pr', 'list', '--state', 'merged', '--limit', '200', '--json', 'number,title,author,mergedAt,reviewDecision,reviews,url')
    $prs = Filter-ItemsByDateRange -Items $prs -PropertyName 'mergedAt' -From $StartDate -To $EndDate
}

$docsDiff = @()
$docsDiffRaw = Invoke-Git -Arguments @('diff', '--name-status', 'main...develop', '--', 'docs/')
foreach ($line in $docsDiffRaw) {
    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    $parts = $line -split "`t", 2
    if ($parts.Count -eq 2) {
        $docsDiff += [pscustomobject]@{
            Status = $parts[0].Trim()
            Path = $parts[1].Trim()
        }
    }
}

$branchComparison = @(Invoke-Git -Arguments @('rev-list', '--left-right', '--count', 'main...develop'))
$branchLeft = 0
$branchRight = 0
if ($branchComparison.Count -gt 0) {
    $counts = ($branchComparison[0] -split '\s+') | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    if ($counts.Count -ge 2) {
        $branchLeft = [int]$counts[0]
        $branchRight = [int]$counts[1]
    }
}

$meetingFiles = @()
$meetingRoot = Join-Path $RepoRoot 'docs/meetings'
if (Test-Path $meetingRoot) {
    $meetingFiles = Get-ChildItem -Path $meetingRoot -Recurse -File -Filter '*.md' |
        Sort-Object FullName |
        ForEach-Object {
            [pscustomobject]@{
                Name = $_.Name
                RelativePath = $_.FullName.Substring($RepoRoot.Length + 1).Replace('\', '/')
                Length = $_.Length
                LastWriteTime = $_.LastWriteTime
            }
        }
}

$payload = [pscustomobject]@{
    RepoRoot = $RepoRoot
    StartDate = $StartDate
    EndDate = $EndDate
    ActivitySummary = $activitySummary
    ClosedIssues = $issues
    MergedPullRequests = $prs
    DocumentationDiff = $docsDiff
    BranchComparison = [pscustomobject]@{
        MainAhead = $branchLeft
        DevelopAhead = $branchRight
    }
    MeetingFiles = $meetingFiles
}

$json = $payload | ConvertTo-Json -Depth 20
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $json
}
else {
    Set-Content -Path $OutputPath -Value $json -Encoding utf8
}
