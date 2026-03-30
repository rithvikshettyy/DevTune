# 🎵 Tune CLI

Control Spotify from your terminal like a native developer tool. Built with Node.js, TypeScript, and Commander.

## 🚀 Features

- **Full Control:** Play, pause, skip, and volume control.
- **Search:** Find and play any track instantly.
- **Modes:** Focus (🧘) and Hype (🔥) modes for deep work or energetic coding.
- **Secure:** OAuth2 with PKCE (no client secret needed).
- **Fast:** Clean and minimal output for terminal gurus.

## 🛠 Setup

### 1. Register Spotify App
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new App (e.g., "Tune CLI").
3. Set the **Redirect URI** to: `http://localhost:8888/callback`.
4. Copy your **Client ID**.

### 2. Configure CLI
```bash
# Set your Client ID
tune config set clientId YOUR_CLIENT_ID

# Login to Spotify (opens browser)
tune login
```

## 📖 Commands

| Command | Description |
| --- | --- |
| `tune play <song>` | Start playback or search and play a track |
| `tune pause` | Pause music |
| `tune next` / `tune prev` | Skip forward or backward |
| `tune vol <0-100>` | Adjust volume |
| `tune search <query>` | Search for tracks |
| `tune status` | Show what's currently playing |
| `tune focus` | Play your Focus playlist |
| `tune hype` | Play your Hype playlist |
| `tune logout` | Clear your authentication tokens |

## ⚙️ Configuration

Store your own favorite playlist URIs (right-click playlist in Spotify -> Share -> Copy URI):
```bash
tune config set focus spotify:playlist:YOUR_PLAYLIST_URI
tune config set hype spotify:playlist:YOUR_PLAYLIST_URI
```

## 🏗 Installation

To use it globally, run:
```bash
npm install -g .
```

To run in dev mode:
```bash
npm run dev -- <command>
```
