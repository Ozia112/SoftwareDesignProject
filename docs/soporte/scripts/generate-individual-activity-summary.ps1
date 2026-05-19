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

    [string]$IdentityMapPath
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

function Normalize-Identity {
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

function Get-GitDocumentStats {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To,
        [Parameter(Mandatory = $true)][hashtable]$IdentityMap
    )

    $since = $From.ToString('yyyy-MM-dd HH:mm:ss')
    $until = $To.ToString('yyyy-MM-dd HH:mm:ss')
    $gitOutput = git -C $Root log --all "--since=$since" "--until=$until" --pretty=format:"@@@%an|%ae|%H|%s" --numstat

    $stats = @{}
    $currentName = ''
    $currentEmail = ''

    foreach ($line in $gitOutput) {
        if ($line -like '@@@*') {
            $parts = $line.Substring(3).Split('|')
            $currentName = $parts[0]
            $currentEmail = $parts[1]
            $normalized = Normalize-Identity -Value $currentName -IdentityMap $IdentityMap
            if ($normalized -eq $currentName) {
                $normalized = Normalize-Identity -Value $currentEmail -IdentityMap $IdentityMap
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

        $added = [int]$cols[0]
        $deleted = [int]$cols[1]
        $stats[$normalized].Added += $added
        $stats[$normalized].Deleted += $deleted
        $stats[$normalized].Total += ($added + $deleted)
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

        $author = Normalize-Identity -Value $issue.author.login -IdentityMap $IdentityMap
        $lineCount = ($issue.body -split "`n").Count

        if (-not $stats.ContainsKey($author)) {
            $stats[$author] = [ordered]@{ Lines = 0; Created = 0; Assigned = 0; Items = @() }
        }

        $stats[$author].Lines += $lineCount
        $stats[$author].Created += 1
        $stats[$author].Items += $issue.number

        foreach ($assignee in $issue.assignees) {
            $assigneeName = Normalize-Identity -Value $assignee.login -IdentityMap $IdentityMap
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
                        return @($CurrentPr.assignees | ForEach-Object { Normalize-Identity -Value $_.login -IdentityMap $Map })
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
                                return @($active | ForEach-Object { Normalize-Identity -Value $_ -IdentityMap $Map })
                        }
                }
                catch {
                        # Fallback silencioso al estado actual si la API no entrega timeline.
                }

                return @($CurrentPr.assignees | ForEach-Object { Normalize-Identity -Value $_.login -IdentityMap $Map })
        }

    foreach ($prRef in $prs) {
        $pr = gh pr view $prRef.number --repo $Slug --json number,title,author,assignees,reviews,reviewRequests,mergedBy,state,body,createdAt,mergedAt | ConvertFrom-Json
        $createdAt = [datetime]$pr.createdAt
        if ($createdAt -lt $From -or $createdAt -gt $To) {
            continue
        }

        $details += $pr

        $author = Normalize-Identity -Value $pr.author.login -IdentityMap $IdentityMap
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
            $requestName = Normalize-Identity -Value $request.login -IdentityMap $IdentityMap
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

            $reviewer = Normalize-Identity -Value $review.author.login -IdentityMap $IdentityMap
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
            $mergedBy = Normalize-Identity -Value $pr.mergedBy.login -IdentityMap $IdentityMap
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

        $matches = $issueRefRegex.Matches($line)
        foreach ($match in $matches) {
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
        [string[]]$ParticipantList = @()
    )

    $allNames = New-Object System.Collections.Generic.HashSet[string]
    foreach ($key in $DocStats.Keys) { [void]$allNames.Add($key) }
    foreach ($key in $IssueStats.Keys) { [void]$allNames.Add($key) }
    foreach ($key in $PrStats.Keys) { [void]$allNames.Add($key) }
    foreach ($name in $ParticipantList) { [void]$allNames.Add($name) }

    $participants = @($allNames)
    if ($null -ne $ParticipantList -and $ParticipantList.Count -gt 0) {
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
        [Parameter(Mandatory = $true)][datetime]$From,
        [Parameter(Mandatory = $true)][datetime]$To
    )

    $topDocument = $Summary | Sort-Object DocumentLines -Descending | Select-Object -First 1
    $topParticipation = $Summary | Sort-Object ParticipationPct -Descending | Select-Object -First 1
    $lowestParticipation = $Summary | Sort-Object ParticipationPct | Select-Object -First 1

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add('### Metodologia de participacion')
    $lines.Add('')
    $lines.Add("- Ponderacion usada para el porcentaje de participacion semanal para el rango $($From.ToString('yyyy-MM-dd')) a $($To.ToString('yyyy-MM-dd')):")
    $lines.Add("`t- 70% ejecucion documental: lineas modificadas en commits/diffs del periodo.")
    $lines.Add("`t- 20% administracion del backlog: lineas reales de texto en bodies de issues creados en el periodo.")
    $lines.Add("`t- 10% revision/integracion: puntos reales de revision e integracion en PRs creados en el periodo (`APPROVED = 1.0`, `CHANGES_REQUESTED = 0.75`, `COMMENTED = 0.25`, `merge = 0.5`, `asignacion del PR = 0.25`).")
    $lines.Add('')
    $lines.Add('- Resultado de trabajo documental puro por lineas cambiadas:')
    foreach ($item in ($Summary | Sort-Object DocumentLines -Descending)) {
        $lines.Add("`t- $($item.Participant): $($item.DocumentLines) lineas ($($item.AddedLines) agregadas, $($item.DeletedLines) eliminadas).")
    }
    $lines.Add('')
    $lines.Add('- Resultado de backlog/planeacion por lineas reales de issues:')
    foreach ($item in ($Summary | Sort-Object IssueLines -Descending)) {
        $lines.Add("`t- $($item.Participant): $($item.IssueLines) lineas, $($item.IssuesCreated) issues creados.")
    }
    $lines.Add('')
    $lines.Add('- Resultado de revision/integracion por evidencia real en PRs:')
    foreach ($item in ($Summary | Sort-Object ReviewPoints -Descending)) {
        $lines.Add("`t- $($item.Participant): $($item.ReviewPoints) puntos, $($item.PRsApproved) aprobaciones, $($item.PRsChangesRequested) solicitudes de cambio, $($item.PRsCommented) comentarios, $($item.PRsMergedBy) merges.")
    }
    $lines.Add('')
    $lines.Add('- Resultado ponderado total de participacion semanal:')
    foreach ($item in $Summary) {
        $lines.Add("`t- $($item.Participant): $($item.ParticipationPct)%")
    }
    $lines.Add('')
    $lines.Add('- Lectura del resultado:')
    $lines.Add("`t- Quien mas trabajo en escritura documental y cambios totales del periodo: $($topDocument.Participant).")
    $lines.Add("`t- Quien mas participacion total tuvo en el periodo: $($topParticipation.Participant).")
    $lines.Add("`t- Quien menos participacion tuvo en el periodo: $($lowestParticipation.Participant).")
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
        $lines.Add("- Se├▒ales complementarias: $($item.PRsApproved) aprobaciones, $($item.PRsChangesRequested) solicitudes de cambio, $($item.PRsCommented) comentarios, $($item.PRsMergedBy) merges, $($item.PRsAssigned) PRs asignados, $($item.IssuesAssigned) issues asignados.")
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

    $docStats = Get-GitDocumentStats -Root $RepoRoot -From $StartDate -To $EndDate -IdentityMap $identityMap
    $issueResult = Get-IssueStats -Slug $RepoSlug -From $StartDate -To $EndDate -IdentityMap $identityMap -Numbers $IssueNumbers

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

    $output = switch ($OutputFormat) {
        'json' { $summary | ConvertTo-Json -Depth 5 }
        'object' { $summary }
        default { Convert-SummaryToMarkdown -Summary $summary -From $StartDate -To $EndDate }
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
