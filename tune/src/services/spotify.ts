import SpotifyWebApi from 'spotify-web-api-node';
import config from '../config';
import { refreshTokenIfExpired } from '../auth';

class SpotifyService {
  private api: SpotifyWebApi;

  constructor() {
    this.api = new SpotifyWebApi();
  }

  private async initialize() {
    const accessToken = await refreshTokenIfExpired();
    this.api.setAccessToken(accessToken);
  }

  private async getActiveDeviceIdMaybe(): Promise<string | undefined> {
    const response = await this.api.getMyDevices();
    const devices = response.body.devices;
    if (devices.length === 0) return undefined;
    const active = devices.find(d => d.is_active);
    if (active) return active.id || undefined;
    return devices[0].id || undefined;
  }

  async play(songName?: string) {
    await this.initialize();
    
    const playOptions: any = {};
    
    // First, let's try to find an active (or any) device if Spotify doesn't see one active
    const deviceId = await this.getActiveDeviceIdMaybe();
    if (deviceId) {
      playOptions.device_id = deviceId;
    }

    if (songName) {
      const searchResult = await this.api.searchTracks(songName, { limit: 1 });
      const tracks = searchResult.body.tracks?.items;
      if (!tracks || tracks.length === 0) {
        throw new Error(`Song "${songName}" not found.`);
      }
      const trackUri = tracks[0].uri;
      try {
        await this.api.play({ uris: [trackUri], ...playOptions });
        return tracks[0];
      } catch (error: any) {
         // If it failed even with a device_id, it might be something else
         throw error;
      }
    } else {
      await this.api.play(playOptions);
    }
  }

  async pause() {
    await this.initialize();
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.pause(deviceId ? { device_id: deviceId } : {});
  }

  async toggle() {
    await this.initialize();
    const data = await this.status();
    if (data && data.is_playing) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async next() {
    await this.initialize();
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.skipToNext(deviceId ? { device_id: deviceId } : {});
  }

  async prev() {
    await this.initialize();
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.skipToPrevious(deviceId ? { device_id: deviceId } : {});
  }

  async setVolume(volume: number) {
    await this.initialize();
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.setVolume(volume, deviceId ? { device_id: deviceId } : {});
  }

  async search(query: string) {
    await this.initialize();
    const result = await this.api.searchTracks(query, { limit: 5 });
    return result.body.tracks?.items || [];
  }

  async status() {
    await this.initialize();
    const result = await this.api.getMyCurrentPlayingTrack();
    return result.body;
  }

  async playPlaylist(type: 'focus' | 'hype' | 'chill') {
    await this.initialize();
    const playlists = config.get('playlists');
    if (!playlists || !playlists[type]) {
       throw new Error(`Playlist type "${type}" not configured.`);
    }

    const playlistUri = playlists[type];
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.play({ 
        context_uri: playlistUri,
        ...(deviceId ? { device_id: deviceId } : {})
    });
  }

  async queueTrack(songName: string) {
    await this.initialize();
    const searchResult = await this.api.searchTracks(songName, { limit: 1 });
    const tracks = searchResult.body.tracks?.items;
    if (!tracks || tracks.length === 0) {
      throw new Error(`Song "${songName}" not found.`);
    }
    const track = tracks[0];
    const deviceId = await this.getActiveDeviceIdMaybe();
    await this.api.addToQueue(track.uri, deviceId ? { device_id: deviceId } : {});
    return track;
  }

  async getQueue() {
    await this.initialize();
    const accessToken = this.api.getAccessToken();
    const res = await fetch('https://api.spotify.com/v1/me/player/queue', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch queue.');
    }
    const data = await res.json();
    return data;
  }

  async getDevices() {
    await this.initialize();
    const result = await this.api.getMyDevices();
    return result.body.devices;
  }
}

export const spotifyService = new SpotifyService();
