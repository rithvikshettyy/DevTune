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
  .version('1.0.0');

// Login Command
program
  .command('login')
  .description('Authenticate with Spotify')
  .action(async () => {
    const spinner = ora('Logging in...').start();
    try {
      await authenticate();
      spinner.succeed(chalk.green('Successfully authenticated with Spotify!'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Authentication failed: ${error.message}`));
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
    const spinner = ora(songName ? `Searching and playing ${songName}...` : 'Starting playback...').start();
    try {
      const track = await spotifyService.play(songName || undefined);
      if (track) {
        spinner.succeed(chalk.green(`Playing: ${track.name} by ${track.artists.map(a => a.name).join(', ')}`));
      } else {
        spinner.succeed(chalk.green('Playback started.'));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Pause Command
program
  .command('pause')
  .description('Pause playback')
  .action(async () => {
    const spinner = ora('Pausing playback...').start();
    try {
      await spotifyService.pause();
      spinner.succeed(chalk.yellow('Playback paused.'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Next Command
program
  .command('next')
  .description('Skip to the next track')
  .action(async () => {
    const spinner = ora('Skipping...').start();
    try {
      await spotifyService.next();
      spinner.succeed(chalk.green('Skipped to next.'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Previous Command
program
  .command('prev')
  .description('Skip to the previous track')
  .action(async () => {
    const spinner = ora('Going back...').start();
    try {
      await spotifyService.prev();
      spinner.succeed(chalk.green('Playback restarted or skipped back.'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Volume Command
program
  .command('volume <percent>')
  .description('Set volume (0-100)')
  .action(async (percent: string) => {
    const vol = parseInt(percent, 10);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      console.log(chalk.red('Please provide a volume between 0 and 100.'));
      return;
    }
    const spinner = ora(`Setting volume to ${vol}%...`).start();
    try {
      await spotifyService.setVolume(vol);
      spinner.succeed(chalk.green(`Volume set to ${vol}%`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Status Command
program
  .command('status')
  .description('Show currently playing track status')
  .action(async () => {
    const spinner = ora('Fetching status...').start();
    try {
      const data = await spotifyService.status();
      if (!data || !data.item) {
        spinner.info(chalk.yellow('No track is currently playing.'));
        return;
      }
      const track = data.item as SpotifyApi.TrackObjectFull;
      const progressMs = data.progress_ms || 0;
      const durationMs = track.duration_ms;
      const artist = track.artists.map(a => a.name).join(', ');
      
      spinner.stop();
      console.log(chalk.bold.green('\nCurrent Track:'));
      console.log(`${chalk.cyan('Title:')}  ${track.name}`);
      console.log(`${chalk.cyan('Artist:')} ${artist}`);
      console.log(`${chalk.cyan('Album:')}  ${track.album.name}`);
      console.log(`${chalk.cyan('Status:')} ${data.is_playing ? 'Playing 🎵' : 'Paused ⏸'}\n`);
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Search Command
program
  .command('search <query...>')
  .description('Search for tracks')
  .action(async (queryParts: string[]) => {
    const query = queryParts.join(' ');
    const spinner = ora(`Searching for "${query}"...`).start();
    try {
        const tracks = await spotifyService.search(query);
        spinner.stop();
        if (tracks.length === 0) {
            console.log(chalk.yellow('No tracks found for this search.'));
            return;
        }
        console.log(chalk.bold.green(`Results for "${query}":`));
        tracks.forEach((t, i) => {
            console.log(`${chalk.gray(i + 1 + '.')} ${chalk.cyan(t.name)} ${chalk.white('by')} ${chalk.yellow(t.artists.map(a => a.name).join(', '))}`);
        });
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Focus Command
program
  .command('focus')
  .description('Play your predefined focus playlist')
  .action(async () => {
    const spinner = ora('Playing focus playlist...').start();
    try {
      await spotifyService.playPlaylist('focus');
      spinner.succeed(chalk.magenta('Focus mode activated! 🧘'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Hype Command
program
  .command('hype')
  .description('Play your predefined energetic playlist')
  .action(async () => {
    const spinner = ora('Playing hype playlist...').start();
    try {
      await spotifyService.playPlaylist('hype');
      spinner.succeed(chalk.red('Hype mode activated! 🔥'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
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
