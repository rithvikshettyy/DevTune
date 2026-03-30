# 🎵 DevTune — Control Spotify From Your Terminal & IDE

DevTune is a developer-first music controller that lets you search, play, pause, skip, and manage Spotify — all without leaving your terminal or code editor.

Built for developers who want their music to feel like a native part of their workflow.

---

## ✨ Features

### CLI (`tune`)
- 🔍 **Search & Play** — Find any song and start playing instantly
- ⏯️ **Playback Controls** — Play, pause, skip, go back
- 🔊 **Volume Control** — Set volume from 0–100
- 📊 **Now Playing** — See the current track, artist, and album
- 🧘 **Focus Mode** — One command to start your deep-work playlist
- 🔥 **Hype Mode** — Energetic playlist for when you're shipping fast
- 🔐 **Secure Auth** — OAuth2 with PKCE (no client secret needed)

### VS Code Extension (`tune-vscode`)
- 🎵 **Status Bar Integration** — See what's playing at the bottom of VS Code
- ⏮️ ⏯️ ⏭️ **Quick Controls** — Play, pause, skip from the Command Palette
- 🔄 **Auto-Refresh** — Track info updates every 15 seconds
- 🚀 **Zero Config** — Works automatically if the CLI is set up

---

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A [Spotify Premium](https://www.spotify.com/premium/) account (required for playback control)
- A [Spotify Developer App](https://developer.spotify.com/dashboard) (free, takes 2 minutes)

---

### Step 1: Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in:
   - **App Name:** `DevTune` (or anything you like)
   - **App Description:** `CLI and IDE music controller for developers`
   - **Redirect URI:** `http://127.0.0.1:8888/callback`
4. Check **"Web API"** and click **Save**
5. Copy your **Client ID** from the app settings page

---

### Step 2: Install the CLI

```bash
# Clone the repository
git clone https://github.com/rithvikshettyy/DevTune.git
cd DevTune/tune

# Install dependencies
npm install

# Build the project
npm run build

# Link it globally so you can use "tune" from anywhere
npm link
```

---

### Step 3: Configure & Login

```bash
# Set your Spotify Client ID
tune config set clientId YOUR_CLIENT_ID_HERE

# Authenticate with Spotify (opens your browser)
tune login
```

A browser window will open asking you to authorize DevTune. Click **"Agree"** and you're done! The window will confirm: *"Authentication successful!"*

---

## 🎮 CLI Commands

| Command | What It Does |
| :--- | :--- |
| `tune play <song name>` | Search and play a specific track |
| `tune play` | Resume paused playback |
| `tune pause` | Pause the current track |
| `tune next` | Skip to the next track |
| `tune prev` | Go back to the previous track |
| `tune volume <0-100>` | Set the playback volume |
| `tune status` | Show the currently playing track |
| `tune search <query>` | Search for tracks and list results |
| `tune focus` | Start your Focus playlist 🧘 |
| `tune hype` | Start your Hype playlist 🔥 |
| `tune login` | Authenticate with Spotify |
| `tune logout` | Clear saved tokens |
| `tune config set <key> <value>` | Update a config setting |
| `tune config list` | View current configuration |

### Examples

```bash
# Play a song
tune play "Blinding Lights"

# Play a song by a specific artist
tune play "Heathens twenty one pilots"

# Set volume to 50%
tune volume 50

# Check what's playing
tune status

# Enter focus mode
tune focus
```

---

## 🎨 Custom Playlists

You can set your own playlists for Focus, Hype, and Chill modes.

1. Open Spotify and find a playlist you love
2. Right-click the playlist → **Share** → **Copy Spotify URI**
3. Set it in your config:

```bash
tune config set focus spotify:playlist:YOUR_PLAYLIST_ID
tune config set hype spotify:playlist:YOUR_PLAYLIST_ID
tune config set chill spotify:playlist:YOUR_PLAYLIST_ID
```

---

## 🖥️ VS Code Extension

The VS Code extension adds a **live status bar** at the bottom of your editor showing the currently playing track, and lets you control playback from the Command Palette.

### Installation (Development Mode)

1. Open the `tune-vscode` folder in VS Code:
   ```
   File → Open Folder → DevTune/tune-vscode
   ```
2. Press **`F5`** to launch the Extension Development Host
3. Look at the **bottom-right** of the new window — you'll see the track info!

### VS Code Commands

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type **"Tune"**:

| Command | What It Does |
| :--- | :--- |
| `Tune: Play/Pause` | Toggle playback |
| `Tune: Next Track` | Skip forward |
| `Tune: Previous Track` | Go back |
| `Tune: Show Status` | Show a notification with current track info |

---

## 🏗️ Project Structure

```
DevTune/
├── tune/                        # CLI Tool
│   ├── src/
│   │   ├── auth/                # OAuth2 + PKCE authentication
│   │   │   ├── index.ts         # Login flow & token refresh
│   │   │   └── pkce.ts          # Code verifier & challenge generation
│   │   ├── services/
│   │   │   └── spotify.ts       # Spotify Web API wrapper
│   │   ├── config/
│   │   │   └── index.ts         # Configuration management (~/.tune/)
│   │   └── index.ts             # CLI command definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── LICENSE.md
│
├── tune-vscode/                 # VS Code Extension
│   ├── src/
│   │   └── extension.ts         # Status bar & command integration
│   ├── .vscode/
│   │   ├── launch.json          # Debug configuration
│   │   └── tasks.json           # Build tasks
│   ├── package.json
│   ├── tsconfig.json
│   ├── icon.png                 # Extension icon
│   └── LICENSE.md
│
├── .gitignore
└── README.md                    # You are here!
```

---

## 🔐 Security

- **OAuth2 + PKCE:** No client secret is stored or transmitted. The PKCE flow ensures secure authentication even for public clients like CLI tools.
- **Local Token Storage:** Access and refresh tokens are stored locally at `~/.tune/config.json` on your machine. They are never committed to Git.
- **Minimal Permissions:** Only requests the scopes needed for playback control:
  - `user-read-playback-state`
  - `user-modify-playback-state`
  - `user-read-currently-playing`

---

## ⚙️ Configuration

All settings are stored in `~/.tune/config.json`:

```json
{
  "clientId": "your-spotify-client-id",
  "playlists": {
    "focus": "spotify:playlist:...",
    "hype": "spotify:playlist:...",
    "chill": "spotify:playlist:..."
  }
}
```

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| Language | TypeScript |
| CLI Framework | Commander.js |
| Spotify API | spotify-web-api-node |
| Auth | OAuth2 + PKCE (native fetch) |
| Config | Conf |
| Styling | Chalk + Ora |
| IDE | VS Code Extension API |

---

## 📝 License

This project is licensed under the [MIT License](./tune/LICENSE.md).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with 💜 by [@rithvikshettyy](https://github.com/rithvikshettyy)**
