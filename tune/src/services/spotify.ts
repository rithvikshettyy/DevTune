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

  async play(songName?: string) {
    await this.initialize();
    
    if (songName) {
      const searchResult = await this.api.searchTracks(songName, { limit: 1 });
      const tracks = searchResult.body.tracks?.items;
      if (!tracks || tracks.length === 0) {
        throw new Error(`Song "${songName}" not found.`);
      }
      const trackUri = tracks[0].uri;
      await this.api.play({ uris: [trackUri] });
      return tracks[0];
    } else {
      await this.api.play();
    }
  }

  async pause() {
    await this.initialize();
    await this.api.pause();
  }

  async next() {
    await this.initialize();
    await this.api.skipToNext();
  }

  async prev() {
    await this.initialize();
    await this.api.skipToPrevious();
  }

  async setVolume(volume: number) {
    await this.initialize();
    await this.api.setVolume(volume);
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
    // Start playback for context (playlist)
    await this.api.play({ context_uri: playlistUri });
  }

  async getDevices() {
    await this.initialize();
    const result = await this.api.getMyDevices();
    return result.body.devices;
  }
}

export const spotifyService = new SpotifyService();
