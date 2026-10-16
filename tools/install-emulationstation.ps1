# easygames für EmulationStation – Startprogramm für Windows (PowerShell).
# Prüft, ob Python 3.8+ vorhanden ist (bietet sonst mit Rückfrage die Installation über winget an) und startet dann
# emulationstation.py install mit allen übergebenen Optionen, z. B.:
#   powershell -ExecutionPolicy Bypass -File .\install-emulationstation.ps1 --mode offline
# Anleitung: https://ricorewioriginal-collab.github.io/easygames/einbinden.html#retro
# Umgebungsvariablen: EASYGAMES_YES=1 (Rückfragen mit "ja" beantworten), EASYGAMES_BASE (andere Homepage-Adresse),
#                     EASYGAMES_SCRIPT=Pfad (lokales emulationstation.py statt Download)
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Rest)
$ErrorActionPreference = 'Stop'
$Base = if ($env:EASYGAMES_BASE) { $env:EASYGAMES_BASE.TrimEnd('/') } else { 'https://ricorewioriginal-collab.github.io/easygames' }

function Find-Python {
    foreach ($cand in @(@('py', '-3'), @('python3'), @('python'))) {
        $cmd = Get-Command $cand[0] -ErrorAction SilentlyContinue
        if (-not $cmd) { continue }
        $pre = @()
        if ($cand.Count -gt 1) { $pre = $cand[1..($cand.Count - 1)] }
        try {
            # Der Store-Platzhalter "python.exe" meldet einen Fehlercode und wird dadurch übersprungen.
            $v = & $cmd.Source @pre -c "import sys; print(sys.version_info[0]*100+sys.version_info[1])" 2>$null
            if ($LASTEXITCODE -eq 0 -and [int]$v -ge 308) { return , (@($cmd.Source) + $pre) }
        } catch { }
    }
    return $null
}

function Ask($question) {
    if ($env:EASYGAMES_YES -eq '1') { return $true }
    $a = Read-Host "$question [j/N]"
    return $a -match '^(j|ja|y|yes)$'
}

$py = Find-Python
if (-not $py) {
    Write-Host 'Python 3.8 oder neuer wurde nicht gefunden (wird nur zum Einrichten und für den Offline-Modus gebraucht).'
    if (-not (Ask 'Python jetzt mit winget installieren?')) {
        Write-Error 'Ohne Python geht es nicht weiter. Installieren (https://www.python.org/downloads/) und das Skript erneut starten.'
    }
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Error 'winget ist nicht verfügbar. Bitte Python von Hand installieren: https://www.python.org/downloads/'
    }
    winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
    # PATH der laufenden Sitzung auffrischen
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
    $py = Find-Python
    if (-not $py) { Write-Error 'Python ist nach der Installation noch nicht auffindbar. PowerShell neu öffnen und das Skript erneut starten.' }
}

$script = $env:EASYGAMES_SCRIPT
$tmp = $null
if (-not $script) {
    $tmp = Join-Path ([IO.Path]::GetTempPath()) ('easygames-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tmp | Out-Null
    $script = Join-Path $tmp 'emulationstation.py'
    Invoke-WebRequest -UseBasicParsing "$Base/tools/emulationstation.py" -OutFile $script
}
if (-not (Test-Path $script)) { Write-Error "emulationstation.py nicht gefunden: $script" }

$exe = $py[0]
$pre = @()
if ($py.Count -gt 1) { $pre = $py[1..($py.Count - 1)] }
& $exe @pre $script install @Rest
$code = $LASTEXITCODE
if ($tmp) { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
exit $code
