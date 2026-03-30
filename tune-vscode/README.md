# 🎵 Tune CLI (VS Code)

**Control Spotify directly from your VS Code editor** — no more switching windows just to skip a song.

Tune CLI integrates seamlessly into your IDE with a **sidebar player**, **status bar track display**, and **command palette controls**, so your music never interrupts your flow.

---

## ✨ Features

### 🎛️ Sidebar Player
A beautiful mini-player right in your Activity Bar with:
- **Album art placeholder** with animated glow
- **Track title & artist** display
- **Playback controls** — Previous, Play/Pause, Next
- **Search bar** — Find and play any song without leaving VS Code

### 📊 Status Bar
See what's currently playing at the bottom of your editor:
- Shows `🎵 Song Name - Artist` when music is playing
- Updates automatically every 10 seconds

### ⌨️ Command Palette
Press `Ctrl+Shift+P` and type **"Tune"** to access:

| Command | Action |
| :--- | :--- |
| `Tune: Play/Pause` | Toggle playback |
| `Tune: Next Track` | Skip to next song |
| `Tune: Previous Track` | Go back |
| `Tune: Show Status` | Show a notification with current track |
| `Tune: Search & Play` | Search for any song and play it |

---

## 🚀 Getting Started

### Prerequisites
1. **Spotify Premium** account (required for playback control)
2. **Tune CLI** installed globally on your system

### Install Tune CLI

```bash
git clone https://github.com/rithvikshettyy/DevTune.git
cd DevTune/tune
npm install
npm run build
npm link
```

### Authenticate

```bash
tune login
```

This opens your browser for Spotify authorization. Once done, the extension works automatically!

---

## 🎮 Usage

### From the Sidebar
1. Click the **🎵 music icon** on the left Activity Bar
2. Use the **⏮ ⏯ ⏭** buttons to control playback
3. Click **🔍 Search for a song...** to find and play tracks

### From the Terminal
You can also use the CLI alongside the extension:

```bash
tune play "Blinding Lights"
tune pause
tune next
tune volume 50
tune status
tune focus
```

---

## 🔐 Privacy & Security

- **OAuth2 + PKCE** — No client secret stored or transmitted
- **Local storage only** — Tokens are kept on your machine at `~/.tune/config.json`
- **Minimal permissions** — Only requests playback control scopes

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| CLI | Node.js, TypeScript, Commander.js |
| API | Spotify Web API |
| Auth | OAuth2 + PKCE |
| Extension | VS Code Extension API, Webview |

---

## 📝 License

[MIT License](https://github.com/rithvikshettyy/DevTune/blob/main/tune/LICENSE.md)

---

## 🤝 Contributing

Found a bug or have a feature idea? Open an issue or PR on [GitHub](https://github.com/rithvikshettyy/DevTune).

---

**Built with 💜 by [Rithvik Shetty](https://github.com/rithvikshettyy)**
