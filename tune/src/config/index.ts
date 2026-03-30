import Conf from 'conf';
import path from 'path';
import os from 'os';

interface TuneConfig {
  clientId?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  playlists?: {
    focus: string;
    hype: string;
    chill: string;
  };
  preferredDevice?: string;
}

const schema: any = {
  clientId: {
    type: 'string',
  },
  tokens: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      expiresAt: { type: 'number' },
    },
  },
  playlists: {
    type: 'object',
    properties: {
      focus: { type: 'string' },
      hype: { type: 'string' },
      chill: { type: 'string' },
    },
    default: {
      focus: 'spotify:playlist:37i9dQZF1DWZeKHA6VfsxM', // Focus playlist link as default
      hype: 'spotify:playlist:37i9dQZF1DX8f6Sls79CIo',  // Hype playlist link as default
      chill: 'spotify:playlist:37i9dQZF1DX4sWSpwq3UAF' // Chill playlist link as default
    },
  },
  preferredDevice: {
    type: 'string',
  },
};

const configDir = path.join(os.homedir(), '.tune');

export const config = new Conf<TuneConfig>({
  projectName: 'tune',
  configName: 'config',
  cwd: configDir,
  schema,
});

export default config;
