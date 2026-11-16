; Installer der easygames-Windows-App (Inno Setup). Gebaut vom Workflow .github/workflows/windows.yml:
;   ISCC /DAppVersion=<Version> installer.iss   (erwartet die EXE in publish\easygames.exe)
; Gleicher App-Name wie bisher („easygames“): installiert über eine vorhandene Installation, Spielstände bleiben.
#ifndef AppName
#define AppName "easygames"
#endif
#ifndef OutBase
#define OutBase "easygames-Setup-x64"
#endif
#ifndef AppVersion
#define AppVersion "1.1.0"
#endif
#ifndef PublishDir
#define PublishDir "publish"
#endif
[Setup]
AppName={#AppName}
AppVersion={#AppVersion}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
OutputBaseFilename={#OutBase}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
UninstallDisplayName={#AppName}

[Files]
Source: "{#PublishDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppName}.exe"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppName}.exe"

[Run]
Filename: "{app}\{#AppName}.exe"; Description: "{#AppName} starten"; Flags: nowait postinstall
