import express from 'express';
import open from 'open';
import SpotifyWebApi from 'spotify-web-api-node';
import chalk from 'chalk';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';
import config from '../config';

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

// Default DevTune Client ID for seamless authentication
const DEFAULT_CLIENT_ID = '60ded155ec4a4ba3b5c0ff6da936d4b9';

export async function authenticate(): Promise<void> {
  let clientId = config.get('clientId');

  if (!clientId) {
    clientId = DEFAULT_CLIENT_ID;
  }

  const spotifyApi = new SpotifyWebApi({
    clientId,
    redirectUri: REDIRECT_URI,
  });

  const app = express();
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const scopes = ['user-modify-playback-state', 'user-read-playback-state', 'user-read-currently-playing'];
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    state: 'state-auth',
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, async () => {
      console.log(chalk.cyan('Opening browser for Spotify authentication...'));
      await open(authUrl);
    });

    app.get('/callback', async (req, res) => {
      const code = req.query.code as string;
      if (!code) {
        res.status(400).send('Authorization code missing.');
        server.close();
        reject(new Error('Authorization code missing.'));
        return;
      }

      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
          }),
        });

        const data = await response.json();

        if (data.error) {
           let errorMsg = data.error_description || data.error;
           if (data.error === 'invalid_client') {
               errorMsg = 'Invalid Client ID. Please check your "tune config set clientId" setting.';
           }
           res.status(400).send(`Authentication error: ${errorMsg}`);
           server.close();
           reject(new Error(errorMsg));
           return;
        }

        config.set('tokens', {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
        });

        res.send('<h1>Authentication successful!</h1><p>You can close this window now and return to your terminal.</p>');
        server.close();
        resolve();
      } catch (err: any) {
        res.status(500).send('Authentication failed.');
        server.close();
        reject(err);
      }
    });

    // Timeout if not authed in 5 minutes
    setTimeout(() => {
        server.close();
        reject(new Error('Authentication timed out.'));
    }, 300000);
  });
}

export async function refreshTokenIfExpired(): Promise<string> {
    const tokens = config.get('tokens');
    const clientId = config.get('clientId') || DEFAULT_CLIENT_ID;
    if (!tokens) throw new Error('Not authenticated. Run `tune login` first.');

    // If still valid (with 1min buffer)
    if (Date.now() < tokens.expiresAt - 60000) {
        return tokens.accessToken;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'refresh_token',
                refresh_token: tokens.refreshToken,
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error_description);

        config.set('tokens', {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || tokens.refreshToken,
            expiresAt: Date.now() + data.expires_in * 1000,
        });

        return data.access_token;
    } catch (err) {
        throw new Error('Failed to refresh token. Please login again.');
    }
}
