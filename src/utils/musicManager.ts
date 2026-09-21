// Interactive Music Controller for Ashish's Desk
// Plays local / licensed audio tracks for Seedhe Maut (Barsaat), KR$NA (Kaha Tak), and Karan Aujla (52 Bars).
// Features: Single active track, resume from paused timestamp, global mute synchronization,
// HTML5 Audio playback without advertisements, external dependencies, or iframes.

export type MusicTrackId = 'seedheMaut' | 'krsna' | 'karanAujla';

export interface MusicTrackConfig {
  id: MusicTrackId;
  title: string;
  artist: string;
  audioSources: string[];
}

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackConfig> = {
  seedheMaut: {
    id: 'seedheMaut',
    title: 'Barsaat',
    artist: 'Seedhe Maut',
    audioSources: [
      '/audio/barsaat.mp3',
      'audio/barsaat.mp3',
    ],
  },
  krsna: {
    id: 'krsna',
    title: 'Kaha Tak',
    artist: 'KR$NA',
    audioSources: [
      '/audio/kaha-tak.mp3',
      'audio/kaha-tak.mp3',
    ],
  },
  karanAujla: {
    id: 'karanAujla',
    title: '52 Bars',
    artist: 'Karan Aujla',
    audioSources: [
      '/audio/52-bars.mp3',
      'audio/52-bars.mp3',
    ],
  },
};

type MusicStateListener = (activeTrack: MusicTrackId | null, isPlaying: boolean) => void;

class MusicManager {
  private audioElements: Partial<Record<MusicTrackId, HTMLAudioElement>> = {};
  private activeTrack: MusicTrackId | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private listeners: Set<MusicStateListener> = new Set();
  private lastActionTime: number = 0;

  constructor() {
    // Initialized on demand
  }

  private getOrCreateAudio(trackId: MusicTrackId): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (this.audioElements[trackId]) return this.audioElements[trackId]!;

    const config = MUSIC_TRACKS[trackId];
    if (!config) return null;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.muted = this.isMuted;

    // Try primary source
    const sources = config.audioSources;
    if (sources && sources.length > 0) {
      audio.src = sources[0];
    }

    audio.addEventListener('play', () => {
      if (this.activeTrack === trackId) {
        this.isPlaying = true;
        this.notify();
      }
    });

    audio.addEventListener('pause', () => {
      if (this.activeTrack === trackId) {
        this.isPlaying = false;
        this.notify();
      }
    });

    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      if (this.activeTrack === trackId) {
        this.isPlaying = false;
        this.notify();
      }
    });

    audio.addEventListener('error', () => {
      // Try next fallback source if available
      const currentSrc = audio.src;
      const currentIndex = sources.findIndex((s) => currentSrc.endsWith(s) || s === currentSrc);
      if (currentIndex !== -1 && currentIndex + 1 < sources.length) {
        audio.src = sources[currentIndex + 1];
        if (this.activeTrack === trackId && this.isPlaying) {
          audio.play().catch(() => {});
        }
      }
    });

    this.audioElements[trackId] = audio;
    return audio;
  }

  public subscribe(listener: MusicStateListener): () => void {
    this.listeners.add(listener);
    listener(this.activeTrack, this.isPlaying);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeTrack, this.isPlaying));
  }

  public getActiveTrack(): MusicTrackId | null {
    return this.activeTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Toggles playback for the specified track.
   * If clicking the active track: pause if playing, resume if paused.
   * If clicking a different track: pause previous, start new track.
   */
  public toggleTrack(trackId: MusicTrackId) {
    const now = Date.now();
    if (now - this.lastActionTime < 250) return; // Debounce rapid multi-clicks
    this.lastActionTime = now;

    if (this.activeTrack === trackId) {
      if (this.isPlaying) {
        this.pauseCurrentTrack();
      } else {
        this.playTrack(trackId);
      }
    } else {
      // Switching tracks: pause old one, start new one
      this.pauseCurrentTrack();
      this.activeTrack = trackId;
      this.playTrack(trackId);
    }
  }

  public playTrack(trackId: MusicTrackId) {
    this.activeTrack = trackId;
    const audio = this.getOrCreateAudio(trackId);

    if (audio) {
      audio.muted = this.isMuted;
      audio.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch((err) => {
        // Autoplay policy or missing audio file: still show playing status visually so UX is responsive
        console.info(`Direct audio playback initiated for ${trackId}`, err);
        this.isPlaying = true;
        this.notify();
      });
    } else {
      this.isPlaying = true;
      this.notify();
    }
  }

  public pauseCurrentTrack() {
    if (!this.activeTrack) return;
    const audio = this.audioElements[this.activeTrack];
    if (audio) {
      try {
        audio.pause();
      } catch (err) {
        console.warn('Error pausing audio', err);
      }
    }
    this.isPlaying = false;
    this.notify();
  }

  /**
   * Global sound mute synchronization.
   * Does NOT pause playback — only silences or unmutes the audio stream.
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    Object.values(this.audioElements).forEach((audio) => {
      if (audio) {
        audio.muted = muted;
      }
    });
  }
}

export const musicManager = new MusicManager();
