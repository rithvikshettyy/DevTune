#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spotifyService } from './services/spotify';
import { authenticate } from './auth';
import config from './config';

const program = new Command();

program
  .name('tune')
  .description('Control Spotify from the terminal')
  .version('1.6.2');

// Login Command
program
  .command('login')
  .description('Authenticate with Spotify')
  .action(async () => {
    const spinner = ora({ text: 'Authenticating...', color: 'white' }).start();
    try {
      await authenticate();
      spinner.succeed(chalk.bold.white('Successfully authenticated.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Authentication failed: ${error.message}`));
    }
  });

// Logout Command
program
  .command('logout')
  .description('Clear authentication tokens')
  .action(() => {
    config.delete('tokens');
    console.log(chalk.yellow('Successfully logged out.'));
  });

// Play Command
program
  .command('play [song...]')
  .description('Resume playback or search and play a specific track')
  .action(async (songParts: string[]) => {
    const songName = songParts.join(' ');
    const spinner = ora({
      text: songName ? `Searching for ${songName}...` : 'Starting playback...',
      color: 'white'
    }).start();
    try {
      const track = await spotifyService.play(songName || undefined);
      if (track) {
        spinner.succeed(chalk.bold.white(`Playing: ${track.name} — ${track.artists.map(a => a.name).join(', ')}`));
      } else {
        spinner.succeed(chalk.bold.white('Playback started.'));
      }
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Toggle Command
program
  .command('toggle')
  .description('Resume playback if paused, or pause if playing')
  .action(async () => {
    const spinner = ora({ text: 'Toggling...', color: 'white' }).start();
    try {
      await spotifyService.toggle();
      spinner.succeed(chalk.bold.white('Playback toggled.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Pause Command
program
  .command('pause')
  .description('Pause playback')
  .action(async () => {
    const spinner = ora({ text: 'Pausing...', color: 'white' }).start();
    try {
      await spotifyService.pause();
      spinner.succeed(chalk.bold.white('Playback paused.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });


// Queue Command
program
  .command('queue <song...>')
  .description('Add a song to the queue')
  .action(async (songParts: string[]) => {
    const songName = songParts.join(' ');
    const spinner = ora({ text: `Queuing "${songName}"...`, color: 'white' }).start();
    try {
      const track = await spotifyService.queueTrack(songName);
      spinner.succeed(chalk.bold.white(`Queued: ${track.name} — ${track.artists.map(a => a.name).join(', ')}`));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Queue List Command
program
  .command('queue-list')
  .description('Show upcoming songs in the queue')
  .action(async () => {
    const spinner = ora({ text: 'Fetching queue...', color: 'white' }).start();
    try {
      const data = await spotifyService.getQueue();
      spinner.stop();

      if (data.currently_playing) {
        const current = data.currently_playing;
        console.log(chalk.bold.white('\nNOW PLAYING'));
        console.log(`  ${chalk.white(current.name)} ${chalk.gray('—')} ${chalk.white(current.artists.map((a: any) => a.name).join(', '))}`);
      }

      const queue = data.queue || [];
      if (queue.length === 0) {
        console.log(chalk.gray('\nQueue is empty.'));
        return;
      }

      console.log(chalk.bold.white(`\nUP NEXT (${queue.length})`));
      queue.slice(0, 10).forEach((t: any, i: number) => {
        console.log(`  ${chalk.gray(i + 1 + '.')} ${chalk.white(t.name)} ${chalk.gray('—')} ${chalk.white(t.artists.map((a: any) => a.name).join(', '))}`);
      });

      if (queue.length > 10) {
        console.log(chalk.gray(`  ...and ${queue.length - 10} more\n`));
      }
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Next Command
program
  .command('next')
  .description('Skip to the next track')
  .action(async () => {
    const spinner = ora({ text: 'Skipping...', color: 'white' }).start();
    try {
      await spotifyService.next();
      spinner.succeed(chalk.bold.white('Skipped to next.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Previous Command
program
  .command('prev')
  .description('Skip to the previous track')
  .action(async () => {
    const spinner = ora({ text: 'Previous...', color: 'white' }).start();
    try {
      await spotifyService.prev();
      spinner.succeed(chalk.bold.white('Skipped to previous.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Volume Command
program
  .command('volume <percent>')
  .description('Set volume (0-100)')
  .action(async (percent: string) => {
    const vol = parseInt(percent, 10);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      console.log(chalk.white('Please provide a volume between 0 and 100.'));
      return;
    }
    const spinner = ora({ text: `Setting volume to ${vol}%...`, color: 'white' }).start();
    try {
      await spotifyService.setVolume(vol);
      spinner.succeed(chalk.bold.white(`Volume set to ${vol}%`));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Status Command
program
  .command('status')
  .description('Show currently playing track status')
  .action(async () => {
    const spinner = ora({ text: 'Fetching status...', color: 'white' }).start();
    try {
      const data = await spotifyService.status();
      if (!data || !data.item) {
        spinner.info(chalk.gray('No track is currently playing.'));
        return;
      }
      const track = data.item as SpotifyApi.TrackObjectFull;
      const artist = track.artists.map(a => a.name).join(', ');
      
      spinner.stop();
      console.log(chalk.bold.white('\nCURRENT TRACK'));
      console.log(`  ${chalk.white('Title:')}  ${track.name}`);
      console.log(`  ${chalk.white('Artist:')} ${artist}`);
      console.log(`  ${chalk.white('Album:')}  ${track.album.name}`);
      console.log(`  ${chalk.white('Status:')} ${data.is_playing ? 'Playing' : 'Paused'}\n`);
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Search Command
program
  .command('search <query...>')
  .description('Search for tracks')
  .action(async (queryParts: string[]) => {
    const query = queryParts.join(' ');
    const spinner = ora({ text: `Searching for "${query}"...`, color: 'white' }).start();
    try {
        const tracks = await spotifyService.search(query);
        spinner.stop();
        if (tracks.length === 0) {
            console.log(chalk.gray('No tracks found for this search.'));
            return;
        }
        console.log(chalk.bold.white(`RESULTS: "${query}"`));
        tracks.forEach((t, i) => {
            console.log(`  ${chalk.gray(i + 1 + '.')} ${chalk.white(t.name)} ${chalk.gray('—')} ${chalk.white(t.artists.map(a => a.name).join(', '))}`);
        });
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Devices Command
program
  .command('devices')
  .description('List available Spotify devices')
  .action(async () => {
    const spinner = ora({ text: 'Fetching devices...', color: 'white' }).start();
    try {
      const devices = await spotifyService.getDevices();
      spinner.stop();
      if (devices.length === 0) {
        console.log(chalk.gray('\nNo active devices found.'));
        console.log(chalk.gray('Tip: Open Spotify on your phone or computer first.'));
        return;
      }
      console.log(chalk.bold.white('\nAVAILABLE DEVICES'));
      devices.forEach((d, i) => {
        const status = d.is_active ? chalk.bold.white(' (Active)') : '';
        console.log(`  ${chalk.gray(i + 1 + '.')} ${chalk.white(d.name)} ${chalk.gray(`[${d.type.toLowerCase()}]`)}${status}`);
      });
      console.log(chalk.gray('\nUse "tune play" to start playback.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Focus Command
program
  .command('focus')
  .description('Play your predefined focus playlist')
  .action(async () => {
    const spinner = ora({ text: 'Activating Focus mode...', color: 'white' }).start();
    try {
      await spotifyService.playPlaylist('focus');
      spinner.succeed(chalk.bold.white('Focus mode active.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Hype Command
program
  .command('hype')
  .description('Play your predefined energetic playlist')
  .action(async () => {
    const spinner = ora({ text: 'Activating Hype mode...', color: 'white' }).start();
    try {
      await spotifyService.playPlaylist('hype');
      spinner.succeed(chalk.bold.white('Hype mode active.'));
    } catch (error: any) {
      spinner.fail(chalk.white(`Error: ${error.message}`));
    }
  });

// Config Command
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('set <key> <value>')
  .description('Set a config value (e.g., clientId, focus, hype, chill)')
  .action((key: string, value: string) => {
      if (['focus', 'hype', 'chill'].includes(key)) {
          const playlists = config.get('playlists') || {};
          config.set('playlists', { ...playlists, [key]: value });
      } else {
          config.set(key as any, value);
      }
      console.log(chalk.green(`Successfully set ${key} to ${value}`));
  });

configCmd
  .command('list')
  .description('List current config (hiding tokens)')
  .action(() => {
      const all = config.store;
      const { tokens, ...rest } = all;
      console.log(chalk.bold.cyan('\nCurrent Configuration:'));
      console.log(JSON.stringify(rest, null, 2));
  });

program.parse(process.argv);
