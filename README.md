# DevTune

DevTune is a high-performance music controller designed for professional developers. It enables seamless management of Spotify playback, including track discovery, volume modulation, and queue management, directly from the command line or integrated development environment.

DevTune is engineered for developers who prioritize efficiency and wish to integrate their auditory workspace into their primary technical environment.

---

## Technical Capabilities

### CLI (tune)
- **Search & Play** — Discover and execute playback for any track instantly.
- **Playback Control** — Comprehensive controls for pausing, resuming, and skipping tracks.
- **Volume Regulation** — Precise volume adjustment within a 0–100 range.
- **Status Monitoring** — Real-time metadata acquisition including track titles, artists, and albums.
- **Queue Management** — Direct interface for adding tracks to the queue and viewing upcoming selections.
- **Focus Mode** — Programmatic activation of deep-work environments.
- **Hype Mode** — Execution of high-tempo auditory environments for rapid deployment cycles.
- **Secure Authentication** — Enterprise-grade OAuth2 integration with PKCE.

### VS Code Extension (tune-vscode)
- **Status Bar Integration** — Persistent track telemetry integrated into the editor workspace.
- **Unified Controls** — Native Command Palette integration for playback operations.
- **Automated Synchronization** — Real-time track information updates.
- **Automated Configuration** — Zero-configuration deployment upon CLI initialization.

---

## Installation

Get started in less than 30 seconds:

### Step 1: Install the Extension & CLI

1. Search for **"Tune CLI"** in the VS Code Extensions view and install it.
2. Once installed, the extension will check if the `tune` CLI is available.
3. If not found, a notification will appear. Click **"Install Now"** or press `Ctrl+Shift+P` and search for **`Tune: Run Setup Wizard`**.

---

### Step 2: Login & Play!

The Setup Wizard will guide you through:
- **Installing the CLI** (`npm install -g @rithvik7/devtune`)
- **Logging in to Spotify** (`tune login`)

That's it! No manually creating Spotify apps or copying Client IDs required.

---

## Advanced Setup

If you prefer to use your own Spotify Developer App for dedicated rate limits or privacy:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and Create an App.
2. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`.
3. Copy your **Client ID** and set it in the CLI:
   ```bash
   tune config set clientId YOUR_CLIENT_ID
   ```
4. Run `tune login` to re-authenticate with your own credentials.

---

### Step 3: Start Playing!

After setup, you're ready to go!
- Use the **Player** in the Activity Bar.
- Use the **Status Bar** at the bottom for quick track info.
- Search for songs using **`Tune: Search & Play`**.

---

## CLI Commands

| Command | What It Does |
| :--- | :--- |
| `tune play <song name>` | Search and play a specific track |
| `tune play` | Resume paused playback |
| `tune pause` | Pause the current track |
| `tune next` | Skip to the next track |
| `tune prev` | Go back to the previous track |
| `tune queue <song name>` | Add a song to the queue |
| `tune queue-list` | Show upcoming songs in the queue |
| `tune volume <0-100>` | Set the playback volume |
| `tune status` | Show the currently playing track |
| `tune search <query>` | Search for tracks and list results |
| `tune focus` | Start Focus playlist |
| `tune hype` | Start Hype playlist |
| `tune login` | Authenticate with Spotify |
| `tune logout` | Clear saved tokens |
| `tune config set <key> <value>` | Update a config setting |
| `tune config list` | View current configuration |

### Examples

```bash
# Execute playback
tune play "Track Name"

# Artist-specific search
tune play "Artist Name - Track Name"

# Adjust volume
tune volume 50

# Retrieve current status
tune status

# Manage queue
tune queue "Track Name"

# View upcoming tracks
tune queue-list

# Initialize focus environment
tune focus
```

---

## Custom Playlists

Users may configure designated playlists for Focus and Hype environments.

1. Obtain the Spotify URI for the desired playlist.
2. Update the local configuration:

```bash
tune config set focus spotify:playlist:PLAYLIST_ID
tune config set hype spotify:playlist:PLAYLIST_ID
```

---

## VS Code Extension

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

## Project Structure

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

## Security

- **OAuth2 + PKCE:** No client secret is stored or transmitted. The PKCE flow ensures secure authentication even for public clients like CLI tools.
- **Local Token Storage:** Access and refresh tokens are stored locally at `~/.tune/config.json` on your machine. They are never committed to Git.
- **Minimal Permissions:** Only requests the scopes needed for playback control:
  - `user-read-playback-state`
  - `user-modify-playback-state`
  - `user-read-currently-playing`

---

## Configuration

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

## Tech Stack

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

## License

This project is licensed under the [MIT License](./tune/LICENSE.md).

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Developed by [Rithvik Shetty](https://github.com/rithvikshettyy)**
