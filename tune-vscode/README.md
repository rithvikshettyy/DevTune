# Tune CLI — Spotify for VS Code

Control Spotify playback directly from your editor. No window switching, no distractions.

Tune CLI adds a sidebar player and status bar integration to VS Code, giving you full playback control while you code.

---

## Features

### Sidebar Player
A minimal music player built into the Activity Bar. Displays the current track, artist, and provides playback controls — all without leaving your editor.

- Vinyl disc animation synced to playback state
- Previous / Play-Pause / Next controls
- Inline search to find and play any track

### Status Bar
The currently playing track appears in the bottom status bar, updating automatically every 10 seconds.

### Command Palette
All controls are accessible via `Ctrl+Shift+P`:

| Command | Action |
| --- | --- |
| Tune: Play/Pause | Toggle playback |
| Tune: Next Track | Skip forward |
| Tune: Previous Track | Skip back |
| Tune: Show Status | Display current track info |
| Tune: Search & Play | Search and play a song |

---

## Prerequisites

1. A **Spotify Premium** account (required for playback control via the Web API)
2. **Tune CLI** installed globally

---

## Setup

Clone the repository and install the CLI:

```bash
git clone https://github.com/rithvikshettyy/DevTune.git
cd DevTune/tune
npm install
npm run build
npm link
```

Create a Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) with redirect URI `http://127.0.0.1:8888/callback`, then configure and authenticate:

```bash
tune config set clientId YOUR_CLIENT_ID
tune login
```

The extension will begin working immediately after authentication.

---

## CLI Reference

The extension is powered by the Tune CLI. These commands are also available in your terminal:

```
tune play <song>        Search and play a track
tune pause              Pause playback
tune next               Skip to next track
tune prev               Previous track
tune queue <song>       Add a track to the queue
tune queue-list         View upcoming tracks
tune volume <0-100>     Set volume
tune status             Show current track
tune search <query>     Search for tracks
tune focus              Start focus playlist
tune hype               Start hype playlist
```

---

## Privacy

- Authentication uses OAuth2 with PKCE — no client secret is stored or transmitted
- Tokens are stored locally on your machine at `~/.tune/config.json`
- Only playback-related API scopes are requested

---

## Stack

| Layer | Technology |
| --- | --- |
| CLI | Node.js, TypeScript, Commander.js |
| API | Spotify Web API |
| Auth | OAuth2 + PKCE |
| Extension | VS Code Extension API, Webview |

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/rithvikshettyy/DevTune).

---

## License

MIT — see [LICENSE](https://github.com/rithvikshettyy/DevTune/blob/main/tune/LICENSE.md)

---

Built by [Rithvik Shetty](https://github.com/rithvikshettyy)
