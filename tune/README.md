# Tune CLI

Control Spotify from your terminal like a native developer tool. Built with Node.js, TypeScript, and Commander.

## Features

- **Full Control:** Play, pause, skip, and volume control.
- **Search:** Find and play any track instantly.
- **Modes:** Professional environments for Focus and Hype modes.
- **Security:** OAuth2 integration with PKCE.
- **Efficiency:** Minimalist output optimized for terminal environments.

## Setup

### 1. Login to Spotify
Simply run the login command to authenticate instantly:
```bash
tune login
```
This will open your browser to authorize DevTune.

---

## Commands

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

---

## Configuration

### Custom Playlists
Store your own favorite playlist URIs (right-click playlist in Spotify -> Share -> Copy URI):
```bash
tune config set focus spotify:playlist:YOUR_PLAYLIST_URI
tune config set hype spotify:playlist:YOUR_PLAYLIST_URI
```

### Advanced: Custom Client ID
If you want to use your own Spotify Developer App credentials:
```bash
tune config set clientId YOUR_CLIENT_ID
```
Then run `tune login` again to re-authenticate.

## Installation

To use it globally, run:
```bash
npm install -g .
```

To run in dev mode:
```bash
npm run dev -- <command>
```
