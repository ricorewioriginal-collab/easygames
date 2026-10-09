# easygames

Minispiele für Browser und Handy – jedes Spiel in einem eigenen Verzeichnis.
Spieleliste (GitHub Pages): https://ricorewioriginal-collab.github.io/easygames/

| Spiel | Verzeichnis |
|---|---|
| AnMaCha Radio Surfer – 3D-Endless-Runner (Three.js) | [`anmacha-radio-surfer/`](anmacha-radio-surfer/) |
| ZOTIK – Die Splitter der Welten (eigenes Repo, eingebettet) | https://ricorewioriginal-collab.github.io/zotik/ |

## Einbetten

Pro Spiel: In der Spieleliste auf **</> Einbetten** klicken und den Code kopieren. Beispiel:

```html
<iframe src="https://ricorewioriginal-collab.github.io/easygames/anmacha-radio-surfer/" title="AnMaCha Radio Surfer"
  allow="fullscreen" loading="lazy"
  style="width:100%;max-width:960px;aspect-ratio:16/10;border:0;border-radius:12px"></iframe>
```

Komplette Bibliothek (Spieleliste zum Einbetten):

```html
<iframe src="https://ricorewioriginal-collab.github.io/easygames/?embed=1" title="easygames"
  allow="fullscreen" loading="lazy"
  style="width:100%;max-width:960px;aspect-ratio:16/10;border:0;border-radius:12px"></iframe>
```

## Neues Spiel hinzufügen

1. Eigenes Verzeichnis anlegen (`mein-spiel/index.html`).
2. In `index.html` im Array `GAMES` einen Eintrag ergänzen (Titel, Icon, `path`, Beschreibung).

## AnMaCha Radio Surfer: eigene Hindernisse

Bilder (PNG, quadratisch oder quer, mind. 256 px, transparenter Hintergrund möglich) als
`anmacha-radio-surfer/hindernisse/01.png` bis `20.png` ablegen. Es werden nur vorhandene Dateien
verwendet; ohne Bilder läuft das Spiel mit Platzhaltern. Jedes Bild erscheint mal niedrig (springen),
mal hoch (ausweichen), mal hängend (rutschen).
