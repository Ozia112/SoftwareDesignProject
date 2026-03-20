param(
    [Parameter(Mandatory = $true)]
    [datetime]$StartDate,

    [Parameter(Mandatory = $true)]
    [datetime]$EndDate,

    [string]$RepoRoot = (Get-Location).Path,

    [string]$RepoSlug,

    [int[]]$IssueNumbers = @(),

    [int[]]$PrNumbers = @(),

    [bool]$AutoDetectLinkedPRs = $true,

    [ValidateSet('markdown', 'json', 'object')]
    [string]$OutputFormat = 'markdown',

    [string]$OutputPath,

    [string[]]$Participants = @(),

    [string]$IdentityMapPath = '',

    [bool]$IncludeAllRefs = $false,

    [string[]]$DeliverablePaths = @(),

    [bool]$IntentAwareLineCount = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-CommandAvailable {
    param([Parameter(Mandatory = $true)][string]$Name)

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-RepoSlug {
    param([Parameter(Mandatory = $true)][string]$Root)

    $repoInfo = gh repo view --json nameWithOwner | ConvertFrom-Json
    return $repoInfo.nameWithOwner
}

function Get-DefaultIdentityMap {
    return @{
        'Ozia112' = 'Isaac Alejandro Ortiz Zaldivar'
        'Isaac Alejandro Ortiz Zaldivar' = 'Isaac Alejandro Ortiz Zaldivar'
        'a24216345@alumnos.uady.mx' = 'Isaac Alejandro Ortiz Zaldivar'
        'MaximilianoCarrilloAlvarado' = 'Maximiliano Carrillo Alvarado'
        'Maximiliano Carrillo Alvarado' = 'Maximiliano Carrillo Alvarado'
        'maximilianocarrilloalvarado@gmail.com' = 'Maximiliano Carrillo Alvarado'
        'diego-islas8' = 'Diego Islas Merino'
        'diego-islas' = 'Diego Islas Merino'
        'Diegoislasmeeino' = 'Diego Islas Merino'
        'Diego Islas Merino' = 'Diego Islas Merino'
        'a16003781@alumnos.uady.mx' = 'Diego Islas Merino'
        '115768535+diego-islas8@users.noreply.github.com' = 'Diego Islas Merino'
    }
}

function Merge-IdentityMaps {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$BaseMap,

        [string]$MapPath
    )

    $merged = @{}
    foreach ($key in $BaseMap.Keys) {
        $merged[$key] = $BaseMap[$key]
    }

    if (-not [string]::IsNullOrWhiteSpace($MapPath)) {
        $customMap = Get-Content -Raw -Path $MapPath | ConvertFrom-Json -AsHashtable
        foreach ($key in $customMap.Keys) {
            $merged[$key] = $customMap[$key]
        }
    }

    return $merged
}

function Resolve-Identity {
    param(
        [AllowNull()][AllowEmptyString()][string]$Value,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }

    if ($IdentityMap.ContainsKey($Value)) {
        return $IdentityMap[$Value]
    }

    return $Value
}

function Resolve-GitPath {
    param([AllowNull()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    $normalized = $Path.Trim().Trim('"')

    if ($normalized -match '=>') {
        $renameMatch = [regex]::Match($normalized, '^(?<prefix>.*)\{(?<left>[^{}]*)=>(?<right>[^{}]*)\}(?<suffix>.*)$')
        if ($renameMatch.Success) {
            $prefix = $renameMatch.Groups['prefix'].Value
            $right = $renameMatch.Groups['right'].Value
            $suffix = $renameMatch.Groups['suffix'].Value
            $normalized = "$prefix$right$suffix"
        }
        else {
            $parts = $normalized -split '=>'
            $normalized = $parts[-1].Trim()
        }
    }

    return $normalized.Trim().Trim('"')
}

function Get-EffectivePathFilters {
    param(
        [string[]]$ManualPaths,
        [string[]]$IssuePaths
    )

    $all = New-Object System.Collections.Generic.HashSet[string]

    foreach ($p in @($ManualPaths)) {
        if (-not [string]::IsNullOrWhiteSpace($p)) {
            [void]$all.Add(($p.Trim()).Replace('\\', '/'))
        }
    }

    foreach ($p in @($IssuePaths)) {
        if (-not [string]::IsNullOrWhiteSpace($p)) {
            [void]$all.Add(($p.Trim()).Replace('\\', '/'))
        }
    }

    return @($all)
}

function Normalize-DeliverablePath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $p = $Path.Trim()
    if ([string]::IsNullOrWhiteSpace($p)) { return '' }

    $p = $p.Replace('\', '/')
    $p = $p -replace '\s+', ' '
    
    if (-not $p.StartsWith('docs/')) {
        if ($p.StartsWith('diseño/') -or $p.StartsWith('entregas/') -or $p.StartsWith('meetings/')) {
            $p = "docs/$p"
        }
    }
    
    return $p.Trim()
}

function Find-SimilarPath {
    param(
        [Parameter(Mandatory = $true)][string]$InputPath,
        [Parameter(Mandatory = $true)][string]$RepoRoot
    )

    $candidates = @()
    
    try {
        $allDocFiles = git -C $RepoRoot ls-files -- 'docs/**/*.md' | ForEach-Object { $_.Replace('\', '/') }
    } catch {
        return @()
    }

    if ($allDocFiles.Count -eq 0) {
        return @()
    }

    $input_normalized = $InputPath.ToLowerInvariant()
    
    foreach ($f in $allDocFiles) {
        if ($f.ToLowerInvariant() -eq $input_normalized) {
            return @($f)
        }
    }

    foreach ($f in $allDocFiles) {
        $f_lower = $f.ToLowerInvariant()
        
        if ($input_normalized.EndsWith('/')) {
            if ($f_lower.StartsWith($input_normalized)) {
                $candidates += $f
            }
        }
        else {
            $inputParts = $input_normalized -split '[/\-_ ]' | Where-Object { $_.Length -gt 0 }
            $fileParts = ($f -split '[/\-_ ]' | Where-Object { $_.Length -gt 0 }) | ForEach-Object { $_.ToLowerInvariant() }
            
            $matchCount = 0
            foreach ($part in $inputParts) {
                if ($fileParts -contains $part) {
                    $matchCount += 1
                }
            }
            
            if ($matchCount -ge [Math]::Ceiling($inputParts.Count / 2)) {
                $candidates += $f
            }
        }
    }

    return @($candidates | Sort-Object { $_.Length } -Descending | Select-Object -First 5)
}

function Validate-And-CorrectPaths {
    param(
        [string[]]$InputPaths,
        [Parameter(Mandatory = $true)][string]$RepoRoot
    )

    $validated = @()
    $corrected = @()
    $warnings = @()
    
    # Handle null or empty input gracefully
    if ($null -eq $InputPaths -or $InputPaths.Count -eq 0) {
        return [pscustomobject]@{
            ValidatedPaths = @()
            CorrectedPaths = @()
            Warnings = @("No manual DeliverablePaths provided. Using paths extracted from issues.")
        }
    }
    
    foreach ($path in $InputPaths) {
        if ([string]::IsNullOrWhiteSpace($path)) {
            continue
        }

        $normalized = Normalize-DeliverablePath -Path $path
        if ([string]::IsNullOrWhiteSpace($normalized)) {
            continue
        }

        try {
            $exists = git -C $RepoRoot ls-files -o --cached -- $normalized | Measure-Object | Select-Object -ExpandProperty Count
            if ($exists -gt 0) {
                $validated += $normalized
                continue
            }
        } catch {}

        $similar = Find-SimilarPath -InputPath $normalized -RepoRoot $RepoRoot
        if ($similar.Count -gt 0) {
            $warnings += "Path '$path' no encontrado exactamente. Posibles matches: $($similar -join ', ')"
            if ($similar.Count -eq 1) {
                $validated += $similar[0]
                $corrected += @{ Original = $path; Corrected = $similar[0] }
            } else {
                $validated += $similar[0]
                $corrected += @{ Original = $path; Corrected = $similar[0]; AlternativesAvailable = $similar[1..($similar.Count-1)] }
            }
        } else {
            $warnings += "Path '$path' no se puede validar ni corregir automáticamente."
        }
    }

    return [pscustomobject]@{
        ValidatedPaths = @($validated | Select-Object -Unique)
        CorrectedPaths = $corrected
        Warnings = $warnings
    }
}

function Test-PathInFilters {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [string[]]$PathFilters
    )

    if ($null -eq $PathFilters -or $PathFilters.Count -eq 0) {
        return $Path.StartsWith('docs/')
    }

    $normalized = $Path.Replace('\', '/')
    foreach ($filter in $PathFilters) {
        $f = $filter.Replace('\', '/')
        if ($normalized -eq $f) { return $true }
        if ($f.EndsWith('/')) {
            if ($normalized.StartsWith($f)) { return $true }
        }
    }

    return $false
}

function Test-MeaningfulDocLine {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Line)

    $t = $Line.Trim()
    if ([string]::IsNullOrWhiteSpace($t)) { return $false }

    if ($t -match '^(#{1,6}\\s*)$') { return $false }
    if ($t -match '^(```|---|\\*\\*\\*)$') { return $false }
    if ($t -match '^(?:[-*+]\\s*)$') { return $false }
    if ($t -match '^\\d+\\.\\s*$') { return $false }
    if ($t -match '(?i)\\b(?:placeholder|todo|tbd|pendiente|por definir)\\b') { return $false }
    if ($t -match '(?i)\\b(?:PSD-XX|RN-XX|#XX)\\b') { return $false }

    return $true
}

function Get-IntentAdjustedChangeForCommitFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CommitHash,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $diffLines = git -C $Root -c core.quotepath=false show --format= --unified=0 $CommitHash -- $Path
    $count = 0

    foreach ($dl in $diffLines) {
        if ($dl.StartsWith('+++') -or $dl.StartsWith('---') -or $dl.StartsWith('@@')) {
            continue
        }

        if ($dl.StartsWith('+')) {
            if (Test-MeaningfulDocLine -Line $dl.Substring(1)) {
                $count += 1
            }
            continue
        }

        if ($dl.StartsWith('-')) {
            if (Test-MeaningfulDocLine -Line $dl.Substring(1)) {
                $count += 1
            }
            continue
        }
    }

    return $count
}

function Get-DeliverablePathsFromIssueBodies {
    param([Parameter(Mandatory = $true)]$Issues)

    $paths = New-Object System.Collections.Generic.HashSet[string]
    foreach ($issue in @($Issues)) {
        $body = [string]$issue.body
        if ([string]::IsNullOrWhiteSpace($body)) { continue }

        $codeMatches = [regex]::Matches($body, '`([^`]+)`')
        foreach ($m in $codeMatches) {
            $candidate = $m.Groups[1].Value.Trim().Replace('\\', '/')
            if ($candidate.StartsWith('docs/')) {
                [void]$paths.Add($candidate)
            }
        }

        $textMatches = [regex]::Matches($body, '(?im)\\bdocs/[\\w\\-\\./ ]+\\.md\\b')
        foreach ($m in $textMatches) {
            [void]$paths.Add($m.Value.Trim().Replace('\\', '/'))
        }
    }

    return @($paths)
}

function Get-DocumentationArea {
    param([Parameter(Mandatory = $true)][string]$Path)

    $p = $Path.Replace('\\', '/')

    if ($p -eq 'docs/pipeline-operativo.md') { return 'Pipeline operativo' }
    if ($p -like 'docs/*/casos de uso/RF-COM/*') { return 'Casos de uso COM' }
    if ($p -like 'docs/*/casos de uso/RF-EVT/*') { return 'Casos de uso EVT' }
    if ($p -like 'docs/*/requerimientos*/*RF-COM/*') { return 'Requerimientos funcionales COM' }
    if ($p -like 'docs/*/requerimientos*/*RF-EVT/*') { return 'Requerimientos funcionales EVT' }
    if ($p -like 'docs/*/decisiones/*') { return 'Decisiones de diseño' }
    if ($p -like 'docs/*/glosario/*') { return 'Glosario' }
    if ($p -like 'docs/*/modelos de diseño/*') { return 'Modelos de diseño (BPMN)' }
    if ($p -like 'docs/entregas/semanales/*') { return 'Entregas semanales' }
    if ($p -like 'docs/entregas/mensuales/*') { return 'Entregas mensuales' }
    if ($p -like 'docs/meetings/*') { return 'Meetings y minutas' }
    return 'Otros docs'
}

function Test-PathIgnored {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$RepoRoot
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $false
    }

    try {
        $null = git -C $RepoRoot check-ignore -q $Path 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {}

    return $false
}

function Get-DocumentTraceabilityStats {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap,
        [Parameter(Mandatory = $true)][bool]$UseAllRefs,
        [string[]]$PathFilters,
        [Parameter(Mandatory = $true)][bool]$IntentAware
    )

    $since = $From.ToString('yyyy-MM-dd HH:mm:ss')
    $until = $To.ToString('yyyy-MM-dd HH:mm:ss')

    $baseArgs = @('log')
    if ($UseAllRefs) {
        $baseArgs += '--all'
    }

    $pathSpec = if ($null -ne $PathFilters -and $PathFilters.Count -gt 0) { @($PathFilters) } else { @('docs') }

    $numstatArgs = @($baseArgs + @("--since=$since", "--until=$until", '--pretty=format:@@@%an|%ae|%H|%s', '--numstat', '--') + $pathSpec)
    $nameStatusArgs = @($baseArgs + @("--since=$since", "--until=$until", '--pretty=format:@@@%an|%ae|%H|%s', '--name-status', '--diff-filter=A', '--') + $pathSpec)

    $numstatOutput = git -C $Root -c core.quotepath=false @numstatArgs
    $nameStatusOutput = git -C $Root -c core.quotepath=false @nameStatusArgs

    $byArea = @{}
    $byFile = @{}
    $createdByParticipant = @{}

    $currentName = ''
    $currentEmail = ''
    $currentHash = ''
    $normalized = ''

    foreach ($line in $numstatOutput) {
        if ($line -like '@@@*') {
            $parts = $line.Substring(3).Split('|')
            $currentName = $parts[0]
            $currentEmail = $parts[1]
            $currentHash = if ($parts.Length -ge 3) { $parts[2] } else { '' }
            $normalized = Resolve-Identity -Value $currentName -IdentityMap $IdentityMap
            if ($normalized -eq $currentName) {
                $normalized = Resolve-Identity -Value $currentEmail -IdentityMap $IdentityMap
            }
            continue
        }

        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $cols = $line -split "`t"
        if ($cols.Length -lt 3) {
            continue
        }

        if ($cols[0] -notmatch '^\d+$' -or $cols[1] -notmatch '^\d+$') {
            continue
        }

        $path = Resolve-GitPath -Path $cols[2]
        if (-not (Test-PathInFilters -Path $path -PathFilters $PathFilters)) {
            continue
        }

        if (Test-PathIgnored -Path $path -RepoRoot $Root) {
            continue
        }

        $changed = [int]$cols[0] + [int]$cols[1]
        if ($IntentAware -and -not [string]::IsNullOrWhiteSpace($currentHash)) {
            $changed = Get-IntentAdjustedChangeForCommitFile -Root $Root -CommitHash $currentHash -Path $path
        }

        if ($changed -le 0) {
            continue
        }
        $area = Get-DocumentationArea -Path $path

        $areaKey = "$normalized|||$area"
        if (-not $byArea.ContainsKey($areaKey)) {
            $byArea[$areaKey] = [ordered]@{ Participant = $normalized; Area = $area; Changed = 0 }
        }
        $byArea[$areaKey].Changed += $changed

        $fileKey = "$normalized|||$area|||$path"
        if (-not $byFile.ContainsKey($fileKey)) {
            $byFile[$fileKey] = [ordered]@{ Participant = $normalized; Area = $area; Path = $path; Changed = 0 }
        }
        $byFile[$fileKey].Changed += $changed
    }

    $normalized = ''
    foreach ($line in $nameStatusOutput) {
        if ($line -like '@@@*') {
            $parts = $line.Substring(3).Split('|')
            $currentName = $parts[0]
            $currentEmail = $parts[1]
            $normalized = Resolve-Identity -Value $currentName -IdentityMap $IdentityMap
            if ($normalized -eq $currentName) {
                $normalized = Resolve-Identity -Value $currentEmail -IdentityMap $IdentityMap
            }
            if (-not $createdByParticipant.ContainsKey($normalized)) {
                $createdByParticipant[$normalized] = New-Object System.Collections.Generic.HashSet[string]
            }
            continue
        }

        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $cols = $line -split "`t"
        if ($cols.Length -lt 2) {
            continue
        }

        if ($cols[0] -ne 'A') {
            continue
        }

        $path = Resolve-GitPath -Path $cols[1]
        if (-not (Test-PathInFilters -Path $path -PathFilters $PathFilters)) {
            continue
        }

        [void]$createdByParticipant[$normalized].Add($path)
    }

    $changedByParticipantPath = @{}
    foreach ($fileRow in $byFile.Values) {
        $k = "$($fileRow.Participant)|||$($fileRow.Path)"
        if (-not $changedByParticipantPath.ContainsKey($k)) {
            $changedByParticipantPath[$k] = 0
        }
        $changedByParticipantPath[$k] += [int]$fileRow.Changed
    }

    $createdRows = @()
    $createdRowsWithContent = @()
    foreach ($participant in $createdByParticipant.Keys) {
        foreach ($path in $createdByParticipant[$participant]) {
            $row = [pscustomobject]@{
                Participant = $participant
                Area = Get-DocumentationArea -Path $path
                Path = $path
                Changed = 0
            }
            $k = "$participant|||$path"
            if ($changedByParticipantPath.ContainsKey($k)) {
                $row.Changed = [int]$changedByParticipantPath[$k]
            }

            $createdRows += $row
            if ($row.Changed -gt 0) {
                $createdRowsWithContent += $row
            }
        }
    }

    return [pscustomobject]@{
        ByParticipantArea = @($byArea.Values | Sort-Object Participant, @{ Expression = 'Changed'; Descending = $true })
        ByParticipantFile = @($byFile.Values | Sort-Object Participant, @{ Expression = 'Changed'; Descending = $true })
        CreatedFiles = @($createdRows | Sort-Object Participant, Area, Path)
        CreatedFilesWithContent = @($createdRowsWithContent | Sort-Object Participant, Area, Path)
    }
}

function Get-GitDocumentStats {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap,
        [Parameter(Mandatory = $true)][bool]$UseAllRefs,
        [string[]]$PathFilters,
        [Parameter(Mandatory = $true)][bool]$IntentAware
    )

    $since = $From.ToString('yyyy-MM-dd HH:mm:ss')
    $until = $To.ToString('yyyy-MM-dd HH:mm:ss')
    $gitArgs = @('log')
    if ($UseAllRefs) {
        $gitArgs += '--all'
    }
    $pathSpec = if ($null -ne $PathFilters -and $PathFilters.Count -gt 0) { @($PathFilters) } else { @('docs') }
    $gitArgs += @("--since=$since", "--until=$until", '--pretty=format:@@@%an|%ae|%H|%s', '--numstat', '--') + $pathSpec
    $gitOutput = git -C $Root -c core.quotepath=false @gitArgs

    $stats = @{}
    $currentName = ''
    $currentEmail = ''
    $currentHash = ''

    foreach ($line in $gitOutput) {
        if ($line -like '@@@*') {
            $parts = $line.Substring(3).Split('|')
            $currentName = $parts[0]
            $currentEmail = $parts[1]
            $currentHash = if ($parts.Length -ge 3) { $parts[2] } else { '' }
            $normalized = Resolve-Identity -Value $currentName -IdentityMap $IdentityMap
            if ($normalized -eq $currentName) {
                $normalized = Resolve-Identity -Value $currentEmail -IdentityMap $IdentityMap
            }
            if (-not $stats.ContainsKey($normalized)) {
                $stats[$normalized] = [ordered]@{ Added = 0; Deleted = 0; Total = 0 }
            }
            continue
        }

        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $cols = $line -split "`t"
        if ($cols.Length -lt 3) {
            continue
        }

        if ($cols[0] -notmatch '^\d+$' -or $cols[1] -notmatch '^\d+$') {
            continue
        }

        $path = Resolve-GitPath -Path $cols[2]
        if (-not (Test-PathInFilters -Path $path -PathFilters $PathFilters)) {
            continue
        }

        if (Test-PathIgnored -Path $path -RepoRoot $Root) {
            continue
        }

        $added = [int]$cols[0]
        $deleted = [int]$cols[1]
        $changed = $added + $deleted

        if ($IntentAware -and -not [string]::IsNullOrWhiteSpace($currentHash)) {
            $changed = Get-IntentAdjustedChangeForCommitFile -Root $Root -CommitHash $currentHash -Path $path
        }

        if ($changed -le 0) {
            continue
        }

        $stats[$normalized].Added += $added
        $stats[$normalized].Deleted += $deleted
        $stats[$normalized].Total += $changed
    }

    return $stats
}

function Get-IssueStats {
    param(
        [Parameter(Mandatory = $true)][string]$Slug,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap,
        [int[]]$Numbers
    )

    if ($Numbers.Count -gt 0) {
        $issues = foreach ($number in $Numbers) {
            gh issue view $number --repo $Slug --json number,title,author,assignees,body,createdAt,state | ConvertFrom-Json
        }
    }
    else {
        $search = "created:$($From.ToString('yyyy-MM-dd'))..$($To.ToString('yyyy-MM-dd')) sort:created-asc"
        $issues = gh issue list --repo $Slug --state all --limit 200 --search $search --json number,title,author,assignees,body,createdAt,state | ConvertFrom-Json
    }

    $stats = @{}
    foreach ($issue in $issues) {
        $createdAt = [datetime]$issue.createdAt
        if ($createdAt -lt $From -or $createdAt -gt $To) {
            continue
        }

        $author = Resolve-Identity -Value $issue.author.login -IdentityMap $IdentityMap
        $lineCount = if ([string]::IsNullOrWhiteSpace([string]$issue.body)) { 0 } else { ($issue.body -split "`n").Count }

        if (-not $stats.ContainsKey($author)) {
            $stats[$author] = [ordered]@{ Lines = 0; Created = 0; Assigned = 0; Items = @() }
        }

        $stats[$author].Lines += $lineCount
        $stats[$author].Created += 1
        $stats[$author].Items += $issue.number

        foreach ($assignee in $issue.assignees) {
            $assigneeName = Resolve-Identity -Value $assignee.login -IdentityMap $IdentityMap
            if (-not $stats.ContainsKey($assigneeName)) {
                $stats[$assigneeName] = [ordered]@{ Lines = 0; Created = 0; Assigned = 0; Items = @() }
            }
            $stats[$assigneeName].Assigned += 1
        }
    }

    return [pscustomobject]@{
        RawIssues = $issues
        Totals = $stats
    }
}

function Get-PullRequestStats {
    param(
        [Parameter(Mandatory = $true)][string]$Slug,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap,
        [int[]]$Numbers
    )

    if ($Numbers.Count -gt 0) {
        $prs = foreach ($number in $Numbers) {
            [pscustomobject]@{ number = $number }
        }
    }
    else {
        $search = "created:$($From.ToString('yyyy-MM-dd'))..$($To.ToString('yyyy-MM-dd')) sort:created-asc"
        $prs = gh pr list --repo $Slug --state all --limit 200 --search $search --json number | ConvertFrom-Json
    }

        $stats = @{}
    $details = @()

        function Get-PrAssigneesAsOfCutoff {
                param(
                        [Parameter(Mandatory = $true)][string]$Repo,
                        [Parameter(Mandatory = $true)][int]$Number,
                        [Parameter(Mandatory = $true)][datetime]$Cutoff,
                        [Parameter(Mandatory = $true)][object]$CurrentPr,
                        [Parameter(Mandatory = $true)][hashtable]$Map
                )

                $parts = $Repo.Split('/')
                if ($parts.Length -ne 2) {
                        return @($CurrentPr.assignees | ForEach-Object { Resolve-Identity -Value $_.login -IdentityMap $Map })
                }

                $owner = $parts[0]
                $name = $parts[1]

                $query = @'
query($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
        pullRequest(number:$number) {
            timelineItems(first:100, itemTypes:[ASSIGNED_EVENT, UNASSIGNED_EVENT]) {
                nodes {
                    __typename
                    ... on AssignedEvent {
                        createdAt
                        assignee {
                            __typename
                            ... on User { login }
                        }
                    }
                    ... on UnassignedEvent {
                        createdAt
                        assignee {
                            __typename
                            ... on User { login }
                        }
                    }
                }
            }
        }
    }
}
'@

                try {
                        $json = gh api graphql -f query=$query -f owner=$owner -f name=$name -F number=$Number
                        $data = $json | ConvertFrom-Json
                        $nodes = $data.data.repository.pullRequest.timelineItems.nodes
                        $active = New-Object System.Collections.Generic.HashSet[string]

                        $orderedNodes = $nodes | Sort-Object { [datetime]$_.createdAt }
                        foreach ($node in $orderedNodes) {
                                $eventDate = [datetime]$node.createdAt
                                if ($eventDate -gt $Cutoff) {
                                        continue
                                }

                                if ($null -eq $node.assignee -or $node.assignee.__typename -ne 'User') {
                                        continue
                                }

                                $login = $node.assignee.login
                                if ($node.__typename -eq 'AssignedEvent') {
                                        [void]$active.Add($login)
                                }
                                elseif ($node.__typename -eq 'UnassignedEvent') {
                                        [void]$active.Remove($login)
                                }
                        }

                        if ($active.Count -gt 0) {
                                return @($active | ForEach-Object { Resolve-Identity -Value $_ -IdentityMap $Map })
                        }
                }
                catch {
                        # Fallback silencioso al estado actual si la API no entrega timeline.
                }

                return @($CurrentPr.assignees | ForEach-Object { Resolve-Identity -Value $_.login -IdentityMap $Map })
        }

    foreach ($prRef in $prs) {
        $pr = gh pr view $prRef.number --repo $Slug --json number,title,author,assignees,reviews,reviewRequests,mergedBy,state,body,createdAt,mergedAt | ConvertFrom-Json
        $createdAt = [datetime]$pr.createdAt
        if ($createdAt -lt $From -or $createdAt -gt $To) {
            continue
        }

        $details += $pr

        $author = Resolve-Identity -Value $pr.author.login -IdentityMap $IdentityMap
        if (-not $stats.ContainsKey($author)) {
            $stats[$author] = [ordered]@{
                Authored = 0
                Assigned = 0
                ReviewPoints = 0.0
                Approved = 0
                ChangesRequested = 0
                Commented = 0
                MergedBy = 0
                ReviewRequested = 0
                Items = @()
            }
        }
        $stats[$author].Authored += 1
        $stats[$author].Items += $pr.number

        $assigneesAtCutoff = Get-PrAssigneesAsOfCutoff -Repo $Slug -Number $prRef.number -Cutoff $To -CurrentPr $pr -Map $IdentityMap
        foreach ($assigneeName in $assigneesAtCutoff) {
            if (-not $stats.ContainsKey($assigneeName)) {
                $stats[$assigneeName] = [ordered]@{
                    Authored = 0
                    Assigned = 0
                    ReviewPoints = 0.0
                    Approved = 0
                    ChangesRequested = 0
                    Commented = 0
                    MergedBy = 0
                    ReviewRequested = 0
                    Items = @()
                }
            }
            $stats[$assigneeName].Assigned += 1
            $stats[$assigneeName].ReviewPoints += 0.25
        }

        foreach ($request in $pr.reviewRequests) {
            $requestName = Resolve-Identity -Value $request.login -IdentityMap $IdentityMap
            if (-not $stats.ContainsKey($requestName)) {
                $stats[$requestName] = [ordered]@{
                    Authored = 0
                    Assigned = 0
                    ReviewPoints = 0.0
                    Approved = 0
                    ChangesRequested = 0
                    Commented = 0
                    MergedBy = 0
                    ReviewRequested = 0
                    Items = @()
                }
            }
            $stats[$requestName].ReviewRequested += 1
        }

        foreach ($review in $pr.reviews) {
            if ($null -eq $review.author) {
                continue
            }

            $reviewer = Resolve-Identity -Value $review.author.login -IdentityMap $IdentityMap
            if (-not $stats.ContainsKey($reviewer)) {
                $stats[$reviewer] = [ordered]@{
                    Authored = 0
                    Assigned = 0
                    ReviewPoints = 0.0
                    Approved = 0
                    ChangesRequested = 0
                    Commented = 0
                    MergedBy = 0
                    ReviewRequested = 0
                    Items = @()
                }
            }

            switch ($review.state) {
                'APPROVED' {
                    $stats[$reviewer].Approved += 1
                    $stats[$reviewer].ReviewPoints += 1.0
                }
                'CHANGES_REQUESTED' {
                    $stats[$reviewer].ChangesRequested += 1
                    $stats[$reviewer].ReviewPoints += 0.75
                }
                'COMMENTED' {
                    $stats[$reviewer].Commented += 1
                    $stats[$reviewer].ReviewPoints += 0.25
                }
                default {
                    $stats[$reviewer].ReviewPoints += 0.10
                }
            }
        }

        if ($null -ne $pr.mergedBy) {
            $mergedBy = Resolve-Identity -Value $pr.mergedBy.login -IdentityMap $IdentityMap
            if (-not $stats.ContainsKey($mergedBy)) {
                $stats[$mergedBy] = [ordered]@{
                    Authored = 0
                    Assigned = 0
                    ReviewPoints = 0.0
                    Approved = 0
                    ChangesRequested = 0
                    Commented = 0
                    MergedBy = 0
                    ReviewRequested = 0
                    Items = @()
                }
            }
            $stats[$mergedBy].MergedBy += 1
            $stats[$mergedBy].ReviewPoints += 0.50
        }
    }

    return [pscustomobject]@{
        RawPullRequests = $details
        Totals = $stats
    }
}

function Get-ClosedIssueNumbersFromText {
    param(
        [AllowNull()][string]$Text,
        [Parameter(Mandatory = $true)][string]$RepoSlug
    )

    $found = New-Object System.Collections.Generic.HashSet[int]
    if ([string]::IsNullOrWhiteSpace($Text)) {
        return @()
    }

    # Variantes comunes admitidas por GitHub para autocierre.
    $closingKeywordRegex = [regex]'(?i)\b(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\b'
    $issueRefRegex = [regex]'(?i)(?:([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)\s*)?#(\d+)'

    $lines = $Text -split "`r?`n"
    foreach ($line in $lines) {
        if (-not $closingKeywordRegex.IsMatch($line)) {
            continue
        }

        $issueMatches = $issueRefRegex.Matches($line)
        foreach ($match in $issueMatches) {
            $repoPart = $match.Groups[1].Value
            $numberPart = $match.Groups[2].Value

            if (-not [string]::IsNullOrWhiteSpace($repoPart) -and ($repoPart.ToLowerInvariant() -ne $RepoSlug.ToLowerInvariant())) {
                continue
            }

            [void]$found.Add([int]$numberPart)
        }
    }

    return @($found)
}

function Get-LinkedPullRequestNumbers {
    param(
        [Parameter(Mandatory = $true)][string]$Slug,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [int[]]$IssueNumbers
    )

    if ($IssueNumbers.Count -eq 0) {
        return @()
    }

    $issueSet = New-Object System.Collections.Generic.HashSet[int]
    foreach ($n in $IssueNumbers) {
        [void]$issueSet.Add([int]$n)
    }

    $search = "created:$($From.ToString('yyyy-MM-dd'))..$($To.ToString('yyyy-MM-dd')) sort:created-asc"
    $prs = gh pr list --repo $Slug --state all --limit 200 --search $search --json number | ConvertFrom-Json

    $linked = New-Object System.Collections.Generic.HashSet[int]
    foreach ($prRef in $prs) {
        $pr = gh pr view $prRef.number --repo $Slug --json number,body,createdAt | ConvertFrom-Json
        $createdAt = [datetime]$pr.createdAt
        if ($createdAt -lt $From -or $createdAt -gt $To) {
            continue
        }

        $closedInBody = Get-ClosedIssueNumbersFromText -Text $pr.body -RepoSlug $Slug
        foreach ($closedIssue in $closedInBody) {
            if ($issueSet.Contains([int]$closedIssue)) {
                [void]$linked.Add([int]$pr.number)
                break
            }
        }
    }

    return @($linked)
}

function Get-ParticipantSummary {
    param(
        [Parameter(Mandatory = $true)][hashtable]$DocStats,
        [Parameter(Mandatory = $true)][hashtable]$IssueStats,
        [Parameter(Mandatory = $true)][hashtable]$PrStats,
        [string[]]$ParticipantList
    )

    $allNames = New-Object System.Collections.Generic.HashSet[string]
    foreach ($key in $DocStats.Keys) { [void]$allNames.Add($key) }
    foreach ($key in $IssueStats.Keys) { [void]$allNames.Add($key) }
    foreach ($key in $PrStats.Keys) { [void]$allNames.Add($key) }
    foreach ($name in $ParticipantList) { [void]$allNames.Add($name) }

    $participants = @($allNames)
    if ($null -ne $ParticipantList -and @($ParticipantList).Count -gt 0) {
        $participants = $ParticipantList
    }

    $docSum = (
        $participants | ForEach-Object {
            if ($DocStats.ContainsKey($_)) {
                [double]$DocStats[$_].Total
            }
            else {
                0.0
            }
        } | Measure-Object -Sum
    ).Sum
    $issueSum = (
        $participants | ForEach-Object {
            if ($IssueStats.ContainsKey($_)) {
                [double]$IssueStats[$_].Lines
            }
            else {
                0.0
            }
        } | Measure-Object -Sum
    ).Sum
    $reviewSum = (
        $participants | ForEach-Object {
            if ($PrStats.ContainsKey($_)) {
                [double]$PrStats[$_].ReviewPoints
            }
            else {
                0.0
            }
        } | Measure-Object -Sum
    ).Sum

    $summary = foreach ($participant in $participants) {
        $doc = if ($DocStats.ContainsKey($participant)) { $DocStats[$participant] } else { [ordered]@{ Added = 0; Deleted = 0; Total = 0 } }
        $issue = if ($IssueStats.ContainsKey($participant)) { $IssueStats[$participant] } else { [ordered]@{ Lines = 0; Created = 0; Assigned = 0; Items = @() } }
        $pr = if ($PrStats.ContainsKey($participant)) {
            $PrStats[$participant]
        }
        else {
            [ordered]@{
                Authored = 0
                Assigned = 0
                ReviewPoints = 0.0
                Approved = 0
                ChangesRequested = 0
                Commented = 0
                MergedBy = 0
                ReviewRequested = 0
                Items = @()
            }
        }

        $docShare = if ($docSum -gt 0) { $doc.Total / $docSum } else { 0 }
        $issueShare = if ($issueSum -gt 0) { $issue.Lines / $issueSum } else { 0 }
        $reviewShare = if ($reviewSum -gt 0) { $pr.ReviewPoints / $reviewSum } else { 0 }

        [pscustomobject]@{
            Participant = $participant
            AddedLines = $doc.Added
            DeletedLines = $doc.Deleted
            DocumentLines = $doc.Total
            IssueLines = $issue.Lines
            IssuesCreated = $issue.Created
            IssuesAssigned = $issue.Assigned
            PRsAuthored = $pr.Authored
            PRsAssigned = $pr.Assigned
            PRsApproved = $pr.Approved
            PRsChangesRequested = $pr.ChangesRequested
            PRsCommented = $pr.Commented
            PRsMergedBy = $pr.MergedBy
            ReviewRequested = $pr.ReviewRequested
            ReviewPoints = [math]::Round($pr.ReviewPoints, 2)
            DocumentSharePct = [math]::Round(100 * $docShare, 2)
            BacklogSharePct = [math]::Round(100 * $issueShare, 2)
            ReviewSharePct = [math]::Round(100 * $reviewShare, 2)
            ParticipationPct = [math]::Round(100 * ((0.70 * $docShare) + (0.20 * $issueShare) + (0.10 * $reviewShare)), 2)
        }
    }

    return $summary | Sort-Object ParticipationPct -Descending
}

function Convert-SummaryToMarkdown {
    param(
        [Parameter(Mandatory = $true)]$Summary,
        [Parameter(Mandatory = $true)]$Traceability,
        [Parameter(Mandatory = $true)]$IssueResult,
        [Parameter(Mandatory = $true)]$PrResult,
        [Parameter(Mandatory = $true)][string]$RepoName,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To
    )

    $topDocument = $Summary | Sort-Object DocumentLines -Descending | Select-Object -First 1
    $topParticipation = $Summary | Sort-Object ParticipationPct -Descending | Select-Object -First 1
    $lowestParticipation = $Summary | Sort-Object ParticipationPct | Select-Object -First 1

    $areaTotals = @{}
    $areaLeaders = @{}
    foreach ($row in $Traceability.ByParticipantArea) {
        if (-not $areaTotals.ContainsKey($row.Area)) {
            $areaTotals[$row.Area] = 0
            $areaLeaders[$row.Area] = [ordered]@{ Participant = $row.Participant; Changed = $row.Changed }
        }
        $areaTotals[$row.Area] += [int]$row.Changed

        if ([int]$row.Changed -gt [int]$areaLeaders[$row.Area].Changed) {
            $areaLeaders[$row.Area] = [ordered]@{ Participant = $row.Participant; Changed = $row.Changed }
        }
    }

    $issueNumbers = @($IssueResult.RawIssues | ForEach-Object { $_.number } | Sort-Object -Unique)
    $prNumbers = @($PrResult.RawPullRequests | ForEach-Object { $_.number } | Sort-Object -Unique)

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add('## A) Resumen operativo')
    $lines.Add('')
    $lines.Add("- Repositorio: $RepoName")
    $lines.Add("- Rango evaluado: $($From.ToString('yyyy-MM-dd HH:mm:ss')) a $($To.ToString('yyyy-MM-dd HH:mm:ss'))")
    $lines.Add('')
    $lines.Add('### 1) Archivos creados con contenido por integrante')
    $lines.Add('')
    $lines.Add('| Integrante | Archivos creados con contenido | Areas documentales relacionadas |')
    $lines.Add('| --- | ---: | --- |')
    foreach ($participant in ($Summary | Select-Object -ExpandProperty Participant)) {
        $createdWithContent = @($Traceability.CreatedFilesWithContent | Where-Object { $_.Participant -eq $participant })
        $areas = @($createdWithContent | Select-Object -ExpandProperty Area -Unique | Sort-Object)
        $areaText = if ($areas.Count -gt 0) { $areas -join ', ' } else { 'Sin creacion con contenido en el rango' }
        $lines.Add("| $participant | $($createdWithContent.Count) | $areaText |")
    }
    $lines.Add('')

    $lines.Add('### 2) Participacion por integrante')
    $lines.Add('')
    $lines.Add('| Integrante | Participacion total | Lineas docs | Lineas backlog | Puntos revision |')
    $lines.Add('| --- | ---: | ---: | ---: | ---: |')
    foreach ($item in $Summary) {
        $lines.Add("| $($item.Participant) | $($item.ParticipationPct)% | $($item.DocumentLines) | $($item.IssueLines) | $($item.ReviewPoints) |")
    }
    $lines.Add('')
    $lines.Add('')
    $lines.Add('### 3) Participacion por area documental')
    $lines.Add('')
    $lines.Add('| Area documental | Lineas cambiadas | Lider del area |')
    $lines.Add('| --- | ---: | --- |')
    foreach ($area in ($areaTotals.Keys | Sort-Object { $areaTotals[$_] } -Descending)) {
        $lines.Add("| $area | $($areaTotals[$area]) | $($areaLeaders[$area].Participant) |")
    }
    $lines.Add('')
    $lines.Add('')
    $lines.Add('### 4) Hallazgos operativos')
    $lines.Add('')
    $lines.Add("- Mayor volumen de escritura documental: $($topDocument.Participant).")
    $lines.Add("- Mayor participacion total del periodo: $($topParticipation.Participant).")
    $lines.Add("- Menor participacion total del periodo: $($lowestParticipation.Participant).")
    if (@($areaTotals.Keys).Count -gt 0) {
        $principalArea = ($areaTotals.Keys | Sort-Object { $areaTotals[$_] } -Descending | Select-Object -First 1)
        $lines.Add("- Frente documental de mayor carga: $principalArea ($($areaTotals[$principalArea]) lineas).")
    }
    $lines.Add('')

    $lines.Add('## B) Trazabilidad extendida')
    $lines.Add('')
    $lines.Add('### Metodologia de participacion')
    $lines.Add('')
    $lines.Add("- Ponderacion usada para el porcentaje de participacion semanal para el rango $($From.ToString('yyyy-MM-dd')) a $($To.ToString('yyyy-MM-dd')):")
    $lines.Add("`t- 70% ejecucion documental: lineas modificadas en commits/diffs del periodo.")
    $lines.Add("`t- 20% administracion del backlog: lineas reales de texto en bodies de issues creados en el periodo.")
    $lines.Add("`t- 10% revision/integracion: puntos reales de revision e integracion en PRs creados en el periodo (APPROVED = 1.0, CHANGES_REQUESTED = 0.75, COMMENTED = 0.25, merge = 0.5, asignacion del PR = 0.25).")
    $lines.Add("- Regla de respaldo: toda cifra del resumen operativo proviene de evidencia listada en esta seccion.")
    $lines.Add('')

    $lines.Add('### Fuentes consideradas (issues y PRs)')
    $lines.Add('')
    if (@($issueNumbers).Count -gt 0) {
        $lines.Add("- Issues incluidos en el corte: $($issueNumbers -join ', ').")
    }
    else {
        $lines.Add('- Issues incluidos en el corte: no se detectaron para el rango/filtrado actual.')
    }

    if (@($prNumbers).Count -gt 0) {
        $lines.Add("- PRs incluidos en el corte: $($prNumbers -join ', ').")
    }
    else {
        $lines.Add('- PRs incluidos en el corte: no se detectaron para el rango/filtrado actual.')
    }
    $lines.Add('')

    $lines.Add('### Archivos creados por integrante')
    $lines.Add('')
    if (@($Traceability.CreatedFiles).Count -eq 0) {
        $lines.Add('- No se detectaron archivos nuevos en docs para el rango/filtrado actual.')
    }
    else {
        foreach ($participant in ($Traceability.CreatedFiles | Select-Object -ExpandProperty Participant -Unique | Sort-Object)) {
            $lines.Add('- {0}:' -f $participant)
            $created = $Traceability.CreatedFiles | Where-Object { $_.Participant -eq $participant } | Sort-Object Area, Path
            foreach ($item in $created) {
                $lines.Add("`t- [$($item.Area)] $($item.Path)")
            }
        }
    }
    $lines.Add('')

    $lines.Add('### Evidencia documental por area y archivo')
    $lines.Add('')
    foreach ($participant in ($Summary | Select-Object -ExpandProperty Participant)) {
        $lines.Add('- {0}:' -f $participant)
        $areas = $Traceability.ByParticipantArea | Where-Object { $_.Participant -eq $participant } | Sort-Object Changed -Descending
        if (@($areas).Count -eq 0) {
            $lines.Add("`t- Sin cambios documentales detectados en docs/ para el rango.")
            continue
        }

        foreach ($areaRow in $areas) {
            $lines.Add("`t- Area: $($areaRow.Area) -> $($areaRow.Changed) lineas")
            $files = $Traceability.ByParticipantFile |
                Where-Object { $_.Participant -eq $participant -and $_.Area -eq $areaRow.Area } |
                Sort-Object Changed -Descending |
                Select-Object -First 5
            foreach ($fileRow in $files) {
                $lines.Add("`t`t- $($fileRow.Path): $($fileRow.Changed)")
            }
        }
    }
    $lines.Add('')

    $lines.Add('### Desglose por integrante')
    $lines.Add('')

    foreach ($item in $Summary) {
        $lines.Add("### $($item.Participant)")
        $lines.Add('')
        $lines.Add("Participacion ponderada exacta: $($item.ParticipationPct)%")
        $lines.Add('')
        $lines.Add('Desglose relevante:')
        $lines.Add('')
        $lines.Add("- Ejecucion documental: $($item.DocumentLines) lineas modificadas en commits/diffs del periodo.")
        $lines.Add("- Backlog/planeacion: $($item.IssueLines) lineas reales en issues creados en el periodo y $($item.IssuesCreated) issues creados.")
        $lines.Add("- Revision/integracion: $($item.ReviewPoints) puntos reales en PRs del periodo.")
        $lines.Add("- Señales complementarias: $($item.PRsApproved) aprobaciones, $($item.PRsChangesRequested) solicitudes de cambio, $($item.PRsCommented) comentarios, $($item.PRsMergedBy) merges, $($item.PRsAssigned) PRs asignados, $($item.IssuesAssigned) issues asignados.")
        $lines.Add('')
    }

    return ($lines -join "`r`n")
}

if (-not (Test-CommandAvailable -Name 'git')) {
    throw 'No se encontro git en el PATH.'
}

if (-not (Test-CommandAvailable -Name 'gh')) {
    throw 'No se encontro GitHub CLI (gh) en el PATH.'
}

Push-Location $RepoRoot
try {
    if ([string]::IsNullOrWhiteSpace($RepoSlug)) {
        $RepoSlug = Get-RepoSlug -Root $RepoRoot
    }

    $identityMap = Merge-IdentityMaps -BaseMap (Get-DefaultIdentityMap) -MapPath $IdentityMapPath
    $participantList = if ($Participants.Count -gt 0) { $Participants } else { @() }

    # Validate and correct DeliverablePaths to handle typos and incomplete paths
    $pathValidationResult = Validate-And-CorrectPaths -InputPaths $DeliverablePaths -RepoRoot $RepoRoot
    if ($pathValidationResult.Warnings.Count -gt 0) {
        Write-Warning "Avisos de validacion de paths:"
        foreach ($warn in $pathValidationResult.Warnings) {
            Write-Warning "  - $warn"
        }
    }
    $correctedDeliverablePaths = $pathValidationResult.ValidatedPaths

    $issueResult = Get-IssueStats -Slug $RepoSlug -From $StartDate -To $EndDate -IdentityMap $identityMap -Numbers $IssueNumbers

    $issueDerivedPaths = Get-DeliverablePathsFromIssueBodies -Issues $issueResult.RawIssues
    $effectivePathFilters = Get-EffectivePathFilters -ManualPaths $correctedDeliverablePaths -IssuePaths $issueDerivedPaths

    $docStats = Get-GitDocumentStats -Root $RepoRoot -From $StartDate -To $EndDate -IdentityMap $identityMap -UseAllRefs $IncludeAllRefs -PathFilters $effectivePathFilters -IntentAware $IntentAwareLineCount
    $traceability = Get-DocumentTraceabilityStats -Root $RepoRoot -From $StartDate -To $EndDate -IdentityMap $identityMap -UseAllRefs $IncludeAllRefs -PathFilters $effectivePathFilters -IntentAware $IntentAwareLineCount

    $effectivePrNumbers = New-Object System.Collections.Generic.List[int]
    foreach ($n in $PrNumbers) {
        if (-not $effectivePrNumbers.Contains([int]$n)) {
            [void]$effectivePrNumbers.Add([int]$n)
        }
    }

    if ($AutoDetectLinkedPRs -and $IssueNumbers.Count -gt 0) {
        $linkedPrs = Get-LinkedPullRequestNumbers -Slug $RepoSlug -From $StartDate -To $EndDate -IssueNumbers $IssueNumbers
        foreach ($n in $linkedPrs) {
            if (-not $effectivePrNumbers.Contains([int]$n)) {
                [void]$effectivePrNumbers.Add([int]$n)
            }
        }
    }

    $prResult = Get-PullRequestStats -Slug $RepoSlug -From $StartDate -To $EndDate -IdentityMap $identityMap -Numbers @($effectivePrNumbers)

    $summary = Get-ParticipantSummary -DocStats $docStats -IssueStats $issueResult.Totals -PrStats $prResult.Totals -ParticipantList $participantList

    $resultObject = [pscustomobject]@{
        Metadata = [ordered]@{
            Repo = $RepoSlug
            GeneratedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
            StartDate = $StartDate.ToString('yyyy-MM-dd HH:mm:ss')
            EndDate = $EndDate.ToString('yyyy-MM-dd HH:mm:ss')
            IncludeAllRefs = $IncludeAllRefs
            IntentAwareLineCount = $IntentAwareLineCount
            EffectivePathFilters = @($effectivePathFilters)
            IssueNumbers = @($IssueNumbers)
            PullRequestNumbers = @($effectivePrNumbers)
        }
        ParticipantSummary = $summary
        Traceability = $traceability
        Issues = @($issueResult.RawIssues)
        PullRequests = @($prResult.RawPullRequests)
    }

    $output = switch ($OutputFormat) {
        'json' { $resultObject | ConvertTo-Json -Depth 8 }
        'object' { $resultObject }
        default {
            Convert-SummaryToMarkdown -Summary $summary -Traceability $traceability -IssueResult $issueResult -PrResult $prResult -RepoName $RepoSlug -From $StartDate -To $EndDate
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
        if ($OutputFormat -eq 'object') {
            $output | ConvertTo-Json -Depth 5 | Set-Content -Path $OutputPath -Encoding UTF8
        }
        else {
            $output | Set-Content -Path $OutputPath -Encoding UTF8
        }
    }

    $output
}
finally {
    Pop-Location
}
