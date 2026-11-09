@echo off
rem easygames TikTok-Steuerung: startet die Bruecke TikTok LIVE -> Stream-Overlay (stream.html?game=...&tiktok=1).
rem Doppelklick genuegt. Beim ersten Start: Node.js (falls noetig, ueber winget), Bruecke und tiktok-live-connector werden geholt,
rem dann wird nach dem TikTok-Namen gefragt (gespeichert in tiktok-name.txt; Datei loeschen = Name neu eingeben).
rem Anleitung: https://ricorewioriginal-collab.github.io/easygames/einbinden.html#tiktok
title easygames TikTok-Bruecke
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist tiktok-bridge.mjs goto haveBridge
echo Lade die Bruecke ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing https://ricorewioriginal-collab.github.io/easygames/tools/tiktok-bridge.mjs -OutFile tiktok-bridge.mjs"
if not exist tiktok-bridge.mjs goto fail
:haveBridge

if exist node_modules\tiktok-live-connector goto haveLib
echo Installiere tiktok-live-connector (einmalig) ...
call npm i tiktok-live-connector --no-audit --no-fund
if not exist node_modules\tiktok-live-connector goto fail
:haveLib

set "NAME="
if exist tiktok-name.txt set /p NAME=<tiktok-name.txt
if not "%NAME%"=="" goto run
set /p NAME=Dein TikTok-Name (ohne @): 
if "%NAME%"=="" goto fail
>tiktok-name.txt echo %NAME%

:run
echo.
echo Bruecke laeuft fuer @%NAME% - Fenster offen lassen. Beenden: Fenster schliessen.
echo Overlay in OBS / TikTok LIVE Studio: https://ricorewioriginal-collab.github.io/easygames/stream.html?game=SPIEL^&tiktok=1
echo Belegung einstellen: dieselbe Adresse mit ^&setup=1 im Browser oeffnen
echo.
node tiktok-bridge.mjs %NAME%
pause
exit /b

:nonode
echo Node.js fehlt. Es wird jetzt ueber winget installiert ...
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
echo.
echo Fertig? Dann dieses Fenster schliessen und TikTok-Start.bat erneut starten.
pause
exit /b

:fail
echo Das hat nicht geklappt. Internetverbindung pruefen und erneut starten.
pause
