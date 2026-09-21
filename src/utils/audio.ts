// Centralized Physical Material Sound Engine for Ashish's Desk
// 100% Procedural Web Audio API — No external audio dependencies, zero latency,
// authentic physical acoustics: paper crush/crinkles, mechanical switches,
// aluminum unibody, capacitive glass, ceramic-glass clink, and miniature car engine throttle blip.

export type MaterialProfile =
  | 'keyboard'
  | 'matcha'
  | 'mouse'
  | 'macbook'
  | 'pixel9a'
  | 'controller'
  | 'earphones'
  | 'book'
  | 'pen'
  | 'packaging'
  | 'watch'
  | 'pikachu'
  | 'tiramisu'
  | 'ticket'
  | 'polaroid'
  | 'paper'
  | 'paperCrush'
  | 'projectCard'
  | 'badge'
  | 'lighter'
  | 'car'
  | 'coin'
  | 'tape'
  | 'sticker'
  | 'default';

/**
 * Maps any desk asset ID to its corresponding physical material profile.
 */
export function getMaterialProfile(id: string): MaterialProfile {
  if (!id) return 'default';
  const lower = id.toLowerCase();

  // Mechanical Keyboard
  if (lower.includes('keyboard')) return 'keyboard';

  // Matcha glass pair (ceramic-glass + iced liquid movement, NO sip)
  if (lower.includes('matcha')) return 'matcha';

  // Mouse
  if (lower.includes('mouse')) return 'mouse';

  // MacBook aluminum unibody
  if (lower.includes('macbook')) return 'macbook';

  // Pixel 9a capacitive glass + aluminum chassis
  if (lower.includes('pixel')) return 'pixel9a';

  // Game Controller (cushioned silicone rubber-dome button)
  if (lower.includes('controller')) return 'controller';

  // EarPods / AirPods (glossy plastic + magnetic case contact)
  if (lower.includes('earpod') || lower.includes('airpod')) return 'earphones';

  // Japan Book (cardboard cover + thick archival pages)
  if (lower.includes('japanbook') || lower.includes('book')) return 'book';

  // Pens & Stylus
  if (lower === 'pen' || lower.includes('trimax') || lower.includes('pen_24951') || lower.includes('pendrive')) {
    return 'pen';
  }

  // Spearmint packet (foil/waxed paper packaging)
  if (lower.includes('gum') || lower.includes('spearmint')) return 'packaging';

  // Luxury Watch (mechanical escapement + steel link bracelet)
  if (lower.includes('watch')) return 'watch';

  // Pikachu (cute Pokémon vocalization)
  if (lower.includes('pikachu')) return 'pikachu';

  // Tiramisu (ceramic dessert plate & dessert handling, NO sip sound)
  if (lower.includes('tiramisu')) return 'tiramisu';

  // Miniature Cars (throttle blip on interaction, miniature wheel roll on drag)
  if (lower.includes('car')) return 'car';

  // World Tour tickets, boarding passes, postcards
  if (
    lower.includes('worldtour') ||
    lower.includes('passport') ||
    lower.includes('rome') ||
    lower.includes('istanbul') ||
    lower.includes('seoul') ||
    lower.includes('hongkong') ||
    lower.includes('amsterdam') ||
    lower.includes('alliwanna')
  ) {
    return 'ticket';
  }

  // Mumbai Polaroid (glossy photographic paper flick)
  if (lower.includes('polaroid')) return 'polaroid';

  // Profile / Resume paper (rich paper crush/crinkle and heavy handling)
  if (lower.includes('creativedeskportfolio')) return 'paperCrush';

  // Work Log, Academic Archive, Tech Skills, Certifications, Notes
  if (
    lower.includes('worklog') ||
    lower.includes('academicarchive') ||
    lower.includes('techskills') ||
    lower.includes('certifications') ||
    lower.includes('clip2') ||
    lower.includes('clip3') ||
    lower.includes('clip4') ||
    lower.includes('goodideas') ||
    lower.includes('techdesktitle') ||
    lower.includes('japannotes') ||
    lower.includes('discoverynote')
  ) {
    return 'paper';
  }

  // Project cards with metal binder clips
  if (lower.includes('project') || lower.includes('clip1')) return 'projectCard';

  // Hard enamel & metal badges (RCB, Real Madrid, GodLike)
  if (lower.includes('rcb') || lower.includes('realmadrid') || lower.includes('godlike')) return 'badge';

  // Vintage lighter (flint wheel rasp + metal cap snap)
  if (lower.includes('lighter')) return 'lighter';

  // 100-Yen coin (crystal ring)
  if (lower.includes('coin') || lower.includes('yen')) return 'coin';

  // Washi tape roll (adhesive peel / soft roll)
  if (lower.includes('tape') || lower.includes('washitape')) return 'tape';

  // Stickers / Music album badges
  if (
    lower.includes('krsna') ||
    lower.includes('karanaujla') ||
    lower.includes('seedhemaut') ||
    lower.includes('nowplaying') ||
    lower.includes('gamingsports')
  ) {
    return 'sticker';
  }

  return 'default';
}

class PhysicalSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;

  // Anti-fatigue cooldowns
  private lastTriggerTime: Map<string, number> = new Map();
  private lastDragSoundTime: number = 0;
  private minCooldownMs: number = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('desk_sound_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        this.enabled = true;
      }

      // Unlock AudioContext on first user touch/pointerdown/key per browser standards
      const unlockAudio = () => {
        this.init();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('desk_sound_enabled', String(val));
      }
    } catch {
      // ignore
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val ? 1 : 0, this.ctx.currentTime);
    }
  }

  private init(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? 1 : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  private isCooledDown(key: string, cooldown: number = this.minCooldownMs): boolean {
    const now = Date.now();
    const last = this.lastTriggerTime.get(key) || 0;
    if (now - last < cooldown) return false;
    this.lastTriggerTime.set(key, now);
    return true;
  }

  // Micro pitch and timbre variation to make every touch feel organic
  private vary(base: number, pct: number = 0.05): number {
    return base * (1 + (Math.random() * 2 - 1) * pct);
  }

  // Helper to create pure white/pink noise buffer
  private createNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * durationSeconds));
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // =========================================================================
  // MATERIAL SOUND SYNTHESIZERS
  // =========================================================================

  /**
   * 1. KEYBOARD: Authentic mechanical switch sound with natural variations.
   * Keycap actuation leaf snap + housing bottom-out.
   */
  playKeyboardClick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('keyboard', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Tactile leaf switch snap (crisp transient)
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(this.vary(3100, 0.08), now);
    oscClick.frequency.exponentialRampToValueAtTime(1200, now + 0.012);

    gainClick.gain.setValueAtTime(0.045, now);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    oscClick.connect(gainClick);
    gainClick.connect(out);
    oscClick.start(now);
    oscClick.stop(now + 0.016);

    // Stem bottom-out into keyboard chassis (warm tactile thud)
    const oscThud = this.ctx.createOscillator();
    const gainThud = this.ctx.createGain();
    oscThud.type = 'sine';
    oscThud.frequency.setValueAtTime(this.vary(440, 0.09), now);
    oscThud.frequency.exponentialRampToValueAtTime(140, now + 0.032);

    gainThud.gain.setValueAtTime(0.055, now);
    gainThud.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    oscThud.connect(gainThud);
    gainThud.connect(out);
    oscThud.start(now);
    oscThud.stop(now + 0.036);
  }

  /**
   * 2. MOUSE: Soft realistic mouse button click.
   * Subtle microswitch snap with clean spring return.
   */
  playMouseClick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('mouse', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(2850, 0.04), now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.012);

    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * Mouse release: soft contact of PTFE mouse feet with desk mat
   */
  playMouseRelease() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * 3. MACBOOK: Soft anodized aluminum tap / chassis handling sound.
   * Solid unibody metal resonance without harshness.
   */
  playMacBookTap() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('macbook', 60)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Solid unibody metal thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(560, 0.04), now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.045);

    gain.gain.setValueAtTime(0.048, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.052);

    // Subtle brushed aluminum ring
    const oscHi = this.ctx.createOscillator();
    const gainHi = this.ctx.createGain();
    oscHi.type = 'sine';
    oscHi.frequency.setValueAtTime(1920, now);
    gainHi.gain.setValueAtTime(0.015, now);
    gainHi.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    oscHi.connect(gainHi);
    gainHi.connect(out);
    oscHi.start(now);
    oscHi.stop(now + 0.022);
  }

  /**
   * 4. PIXEL 9a: Clean glass + aluminum smartphone tap.
   */
  playPixelGlassTap() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('pixel9a', 55)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Clean Gorilla Glass surface click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(2420, 0.03), now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.014);

    gain.gain.setValueAtTime(0.042, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.018);

    // Compact chassis vibration
    const oscBody = this.ctx.createOscillator();
    const gainBody = this.ctx.createGain();
    oscBody.type = 'triangle';
    oscBody.frequency.setValueAtTime(740, now);
    gainBody.gain.setValueAtTime(0.02, now);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    oscBody.connect(gainBody);
    gainBody.connect(out);
    oscBody.start(now);
    oscBody.stop(now + 0.022);
  }

  /**
   * 5. MATCHA GLASSES: Ceramic-glass touch + soft liquid movement (NO sip sound).
   */
  playMatchaGlassSound(includeLiquidMovement: boolean = true) {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('matcha', 75)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Ceramic / heavy tumbler crystal contact clink
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(2280, 0.03), now);
    osc.frequency.exponentialRampToValueAtTime(2050, now + 0.07);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.08);

    // Subtle chilled liquid / ice sway inside glass (gentle slosh, strictly NO drinking/sip)
    if (includeLiquidMovement) {
      const noiseBuf = this.createNoiseBuffer(0.07);
      if (noiseBuf) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(360, now);
        filter.Q.setValueAtTime(2.8, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.001, now);
        nGain.gain.linearRampToValueAtTime(0.012, now + 0.02);
        nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(out);
        noise.start(now);
        noise.stop(now + 0.07);
      }
    }
  }

  /**
   * 6. MINIATURE CAR / VEHICLE OBJECT:
   * Realistic miniature throttle/engine blip when touched,
   * subtle die-cast metal rolling when dragged.
   */
  playCarEngineBlip() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('car_engine', 200)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Warm, miniature sportscar throttle blip (light rev, subtle and realistic)
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Throttle pitch sweep: idling ~95Hz -> revs to ~230Hz -> settles to ~115Hz
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(230, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(115, now + 0.22);

    // Warm exhaust tone low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(340, now + 0.22);
    filter.Q.setValueAtTime(2.2, now);

    // Subtle gain envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc.stop(now + 0.24);

    // Mechanical die-cast chassis click
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(1250, now);
    gainClick.gain.setValueAtTime(0.02, now);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    oscClick.connect(gainClick);
    gainClick.connect(out);
    oscClick.start(now);
    oscClick.stop(now + 0.022);
  }

  /**
   * Miniature car rolling sound when dragged
   */
  playCarRolling() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(130, 0.08), now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * 7. RESUME / PROFILE PAPER: Realistic paper crush / crinkle & fibrous handling.
   */
  playPaperCrushCrinkle() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('paper_crinkle', 60)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Fibrous paper micro-crinkle texture (2 fast stochastic grains)
    const noiseBuf = this.createNoiseBuffer(0.05);
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(this.vary(1650, 0.08), now);
      filter.Q.setValueAtTime(2.6, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.038, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      noise.start(now);
      noise.stop(now + 0.05);
    }

    // Warm parchment sheet resonance (natural 120gsm bond paper thud)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.035);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.042);
  }

  /**
   * 8. WORK LOG / ACADEMIC ARCHIVE / TECH-SKILLS / CERTIFICATIONS:
   * Distinct paper handling with subtle variations.
   */
  playPaperSheetTap(variant: number = 0) {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('paper_sheet', 50)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const baseFreq = 1250 + (variant % 3) * 140;
    const noiseBuf = this.createNoiseBuffer(0.045);
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(this.vary(baseFreq, 0.06), now);
      filter.Q.setValueAtTime(2.1, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.032, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      noise.start(now);
      noise.stop(now + 0.045);
    }
  }

  /**
   * 9. JAPAN BOOK: Cardboard cover touch + page rustle + heavier handling.
   */
  playBookRustle() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('book', 65)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Cardboard cover weight thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.058);

    // Textured archival paper sweep
    const noiseBuf = this.createNoiseBuffer(0.08);
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1700, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      filter.Q.setValueAtTime(2.2, now);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.034, now + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(now);
      noise.stop(now + 0.08);
    }
  }

  /**
   * 10. PENS: Plastic/metal pen tap + hollow body resonance.
   */
  playPenTap() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('pen', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(1720, 0.04), now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.02);

    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.024);
  }

  /**
   * 11. SPEARMINT PACKET: Soft foil / waxed paper packaging crinkle.
   */
  playPackagingFlick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('packaging', 55)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;
    const noiseBuf = this.createNoiseBuffer(0.04);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4200, now);
    filter.Q.setValueAtTime(4.2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(now);
    noise.stop(now + 0.042);
  }

  /**
   * 12. EARPODS / AIRPODS: Small plastic + magnetic case handling.
   */
  playEarphonesSound() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('earphones', 50)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(3350, 0.03), now);
    osc.frequency.exponentialRampToValueAtTime(1550, now + 0.012);

    gain.gain.setValueAtTime(0.032, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * 13. GAME CONTROLLER: Realistic soft plastic button press (cushioned silicone bump).
   */
  playControllerClick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('controller', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(390, 0.06), now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.034);
  }

  /**
   * 14. LUXURY WRISTWATCH: Metal bracelet movement + tiny mechanical escapement click + subtle mechanism.
   * Realistic multi-stage physical acoustic model. NOT a generic UI click.
   */
  playWatchClick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('watch', 50)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // 1. Dual mechanical escapement micro-ticks (the high-precision pallet fork / balance wheel contact)
    const tick1 = this.ctx.createOscillator();
    const tickGain1 = this.ctx.createGain();
    tick1.type = 'sine';
    tick1.frequency.setValueAtTime(this.vary(4800, 0.02), now);
    tick1.frequency.exponentialRampToValueAtTime(3100, now + 0.007);
    tickGain1.gain.setValueAtTime(0.038, now);
    tickGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
    tick1.connect(tickGain1);
    tickGain1.connect(out);
    tick1.start(now);
    tick1.stop(now + 0.01);

    // Second micro-tick (rebound 16ms later)
    const tick2 = this.ctx.createOscillator();
    const tickGain2 = this.ctx.createGain();
    tick2.type = 'triangle';
    tick2.frequency.setValueAtTime(this.vary(3950, 0.02), now + 0.016);
    tick2.frequency.exponentialRampToValueAtTime(2600, now + 0.025);
    tickGain2.gain.setValueAtTime(0.025, now + 0.016);
    tickGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    tick2.connect(tickGain2);
    tickGain2.connect(out);
    tick2.start(now + 0.016);
    tick2.stop(now + 0.03);

    // 2. Stainless steel link bracelet movement (high-frequency micro-friction + metallic chime)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const metalFilter = this.ctx.createBiquadFilter();
    metalFilter.type = 'highpass';
    metalFilter.frequency.setValueAtTime(3200, now);

    const metalBand = this.ctx.createBiquadFilter();
    metalBand.type = 'bandpass';
    metalBand.frequency.setValueAtTime(4200, now);
    metalBand.Q.setValueAtTime(3.5, now);

    const metalGain = this.ctx.createGain();
    metalGain.gain.setValueAtTime(0.016, now);
    metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    noiseSource.connect(metalFilter);
    metalFilter.connect(metalBand);
    metalBand.connect(metalGain);
    metalGain.connect(out);

    noiseSource.start(now);
    noiseSource.stop(now + 0.036);

    // 3. Subtle internal steel tension / escapement pinion ring
    const ringOsc = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(2450, now + 0.004);
    ringGain.gain.setValueAtTime(0.012, now + 0.004);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    ringOsc.connect(ringGain);
    ringGain.connect(out);
    ringOsc.start(now + 0.004);
    ringOsc.stop(now + 0.027);
  }

  /**
   * PIKACHU: Natural Pokémon-style "Pika pika!" vocal sound.
   * Two rapid high-pitched expressive vocal chirps with authentic Pokémon formant characteristics.
   * Debounced to prevent repetitive looping while interacting.
   */
  playPikachuVocal() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('pikachu_vocal', 450)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const playSyllable = (
      startTime: number,
      startFreq: number,
      peakFreq: number,
      endFreq: number,
      duration: number,
      gainVal: number
    ) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Vocal formant filter (mimics mouth resonance of cute anime character)
      const formant1 = this.ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(2200, startTime);
      formant1.Q.setValueAtTime(3.2, startTime);

      const formant2 = this.ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(3400, startTime);
      formant2.Q.setValueAtTime(2.5, startTime);

      // Fundamental oscillator (triangle/sine blend for warm vocal tone)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, startTime + duration * 0.45);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      // Second harmonic for crispness
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(startFreq * 2, startTime);
      oscHarmonic.frequency.exponentialRampToValueAtTime(peakFreq * 2, startTime + duration * 0.45);
      oscHarmonic.frequency.exponentialRampToValueAtTime(endFreq * 2, startTime + duration);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.015);
      gain.gain.setValueAtTime(gainVal * 0.85, startTime + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(formant1);
      oscHarmonic.connect(formant2);
      formant1.connect(gain);
      formant2.connect(gain);
      gain.connect(out);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(startTime + duration + 0.01);
      oscHarmonic.stop(startTime + duration + 0.01);
    };

    // Syllable 1: "Pi-" (rising 1150 -> 1680 Hz)
    playSyllable(now, 1150, 1680, 1420, 0.09, 0.055);
    // Syllable 1 tail: "-ka" (crisp down sweep 1380 -> 1180 Hz)
    playSyllable(now + 0.085, 1380, 1450, 1180, 0.07, 0.045);

    // Brief breath gap (55ms)

    // Syllable 2: "pi-" (cheerful higher pitch rise 1250 -> 1880 Hz)
    playSyllable(now + 0.21, 1250, 1880, 1620, 0.10, 0.06);
    // Syllable 2 tail: "-ka!" (expressive flourish 1580 -> 1320 Hz)
    playSyllable(now + 0.30, 1580, 1650, 1320, 0.08, 0.05);
  }

  /**
   * TIRAMISU: Subtle ceramic dessert plate contact and dessert placement.
   * Porcelain ring with soft dampening. Strictly NO liquid or sip sound.
   */
  playTiramisuSound() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('tiramisu', 40)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Ceramic dessert plate porcelain chime (delicate high-pitched ceramic ring)
    const ceramicOsc = this.ctx.createOscillator();
    const ceramicGain = this.ctx.createGain();
    ceramicOsc.type = 'sine';
    ceramicOsc.frequency.setValueAtTime(this.vary(1820, 0.03), now);
    ceramicOsc.frequency.exponentialRampToValueAtTime(1650, now + 0.05);

    ceramicGain.gain.setValueAtTime(0.032, now);
    ceramicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    ceramicOsc.connect(ceramicGain);
    ceramicGain.connect(out);
    ceramicOsc.start(now);
    ceramicOsc.stop(now + 0.058);

    // Secondary porcelain overtone
    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(3250, now);
    overGain.gain.setValueAtTime(0.012, now);
    overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    overtone.connect(overGain);
    overGain.connect(out);
    overtone.start(now);
    overtone.stop(now + 0.03);

    // Soft dessert mass settling on plate (gentle low thud, 30ms)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(110, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.03);

    thudGain.gain.setValueAtTime(0.024, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    thudOsc.connect(thudGain);
    thudGain.connect(out);
    thudOsc.start(now);
    thudOsc.stop(now + 0.035);
  }

  /**
   * 15. WORLD TOUR TICKETS / POSTCARDS: Paper shuffle and card flick.
   */
  playTicketShuffle() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('ticket', 60)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;
    const noiseBuf = this.createNoiseBuffer(0.06);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1520, now);
    filter.frequency.exponentialRampToValueAtTime(1950, now + 0.055);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.034, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(now);
    noise.stop(now + 0.06);
  }

  /**
   * 16. MUMBAI POLAROID: Glossy photograph / card flick.
   */
  playPolaroidFlick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('polaroid', 55)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(1420, 0.03), now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.028);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.034);
  }

  /**
   * 17. PROJECT CARDS: Thick paper / cardboard handling + spring binder clip wire resonance.
   */
  playProjectCardSound() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('projectCard', 55)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Heavy cardstock slide
    this.playPaperSheetTap(1);

    // Chrome wire binder clip ping
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(2750, 0.03), now);
    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.026);
  }

  /**
   * 18. RCB & HARD OBJECTS / BADGES: Hard enamel/metal badge tap.
   */
  playBadgeTap() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('badge', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(1420, 0.03), now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.024);

    gain.gain.setValueAtTime(0.042, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.028);
  }

  /**
   * 19. VINTAGE LIGHTER: Flint wheel spark rasp + metal cap flick.
   */
  playLighterFlick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('lighter', 60)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    // Flint wheel rasp
    const noiseBuf = this.createNoiseBuffer(0.028);
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.Q.setValueAtTime(3.2, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.028, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      noise.start(now);
      noise.stop(now + 0.028);
    }

    // Metal cap latch snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3250, now + 0.012);
    gain.gain.setValueAtTime(0.032, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now + 0.012);
    osc.stop(now + 0.04);
  }

  /**
   * 20. 100-YEN COIN: Crystalline metallic coin chime.
   */
  playCoinClink() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('coin', 55)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(3750, 0.02), now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.125);
  }

  /**
   * Washi tape roll / soft adhesive tap
   */
  playTapeSound() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('tape', 45)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(850, 0.04), now);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.02);

    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.023);
  }

  /**
   * Vinyl sticker tap
   */
  playStickerTap() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('sticker', 40)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.vary(940, 0.04), now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.022);
  }

  // =========================================================================
  // INTERACTION DISPATCHERS (GRAB, DRAG, RELEASE, CLICK, HOVER)
  // =========================================================================

  /**
   * ON GRAB: Tiny physical pickup sound matching the object material
   */
  public playGrab(id: string) {
    if (!this.enabled) return;
    const profile = getMaterialProfile(id);

    switch (profile) {
      case 'keyboard':
        this.playKeyboardClick();
        break;
      case 'matcha':
        this.playMatchaGlassSound(true);
        break;
      case 'mouse':
        this.playMouseClick();
        break;
      case 'macbook':
        this.playMacBookTap();
        break;
      case 'pixel9a':
        this.playPixelGlassTap();
        break;
      case 'controller':
        this.playControllerClick();
        break;
      case 'earphones':
        this.playEarphonesSound();
        break;
      case 'book':
        this.playBookRustle();
        break;
      case 'pen':
        this.playPenTap();
        break;
      case 'packaging':
        this.playPackagingFlick();
        break;
      case 'car':
        this.playCarEngineBlip();
        break;
      case 'watch':
        this.playWatchClick();
        break;
      case 'pikachu':
        this.playPikachuVocal();
        break;
      case 'tiramisu':
        this.playTiramisuSound();
        break;
      case 'ticket':
        this.playTicketShuffle();
        break;
      case 'polaroid':
        this.playPolaroidFlick();
        break;
      case 'paperCrush':
        this.playPaperCrushCrinkle();
        break;
      case 'projectCard':
        this.playProjectCardSound();
        break;
      case 'badge':
        this.playBadgeTap();
        break;
      case 'lighter':
        this.playLighterFlick();
        break;
      case 'coin':
        this.playCoinClink();
        break;
      case 'tape':
        this.playTapeSound();
        break;
      case 'sticker':
        this.playStickerTap();
        break;
      case 'paper':
      default:
        this.playPaperSheetTap();
        break;
    }
  }

  /**
   * ON RELEASE: Soft physical placement sound matching the object on the cutting mat
   */
  public playRelease(id: string) {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    if (!this.isCooledDown('release', 75)) return;

    const now = this.ctx.currentTime;
    const out = this.masterGain;
    const profile = getMaterialProfile(id);

    // Cutting mat vinyl thump (damped low triangle)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.vary(140, 0.05), now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.058);

    // Material settlement response
    if (profile === 'mouse') {
      this.playMouseRelease();
    } else if (profile === 'matcha') {
      this.playMatchaGlassSound(false);
    } else if (profile === 'macbook') {
      this.playMacBookTap();
    } else if (profile === 'paperCrush') {
      this.playPaperCrushCrinkle();
    } else if (profile === 'paper' || profile === 'ticket' || profile === 'book' || profile === 'polaroid') {
      this.playPaperSheetTap(2);
    } else if (profile === 'coin') {
      this.playCoinClink();
    } else if (profile === 'car') {
      this.playCarRolling();
    } else if (profile === 'tiramisu') {
      this.playTiramisuSound();
    }
  }

  /**
   * WHILE DRAGGING: Extremely subtle, intermittent material movement sound.
   * Throttled to min ~240ms, very low volume. NOT continuous loud audio.
   */
  public playDrag(id: string) {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;

    const nowMs = Date.now();
    if (nowMs - this.lastDragSoundTime < 240) return;
    this.lastDragSoundTime = nowMs;

    const now = this.ctx.currentTime;
    const out = this.masterGain;
    const profile = getMaterialProfile(id);

    // If car is dragged, miniature wheels rolling on cutting mat
    if (profile === 'car') {
      this.playCarRolling();
      return;
    }

    // If paper/profile is dragged, subtle fibrous paper friction/crinkle
    if (profile === 'paperCrush' || profile === 'paper') {
      const noiseBuf = this.createNoiseBuffer(0.03);
      if (!noiseBuf) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(this.vary(1350, 0.08), now);
      filter.Q.setValueAtTime(1.9, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.016, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      noise.start(now);
      noise.stop(now + 0.03);
      return;
    }

    // Default quiet surface friction
    const noiseBuf = this.createNoiseBuffer(0.028);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const centerFreq = profile === 'macbook' || profile === 'coin' || profile === 'lighter' ? 1800 : 920;
    filter.frequency.setValueAtTime(this.vary(centerFreq, 0.06), now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(now);
    noise.stop(now + 0.03);
  }

  /**
   * ON CLICK: Object-specific tactile sound.
   */
  public playClick(id: string) {
    this.playGrab(id);
  }

  /**
   * ON HOVER: Silent by default per prompt to ensure no unwanted noise when moving the cursor.
   */
  public playHover(_id: string) {
    // Kept silent to respect prompt: "ON HOVER: Usually silent. If used, extremely subtle and almost imperceptible."
  }

  // =========================================================================
  // BACKWARD COMPATIBILITY & SYSTEM SOUNDS
  // =========================================================================

  playPaperGrab() {
    this.playPaperCrushCrinkle();
  }

  playWoodTap() {
    this.playRelease('cuttingMat');
  }

  playPaperDrop() {
    this.playPaperCrushCrinkle();
    this.playWoodTap();
  }

  playCardFlip() {
    this.playProjectCardSound();
  }

  playPaperTap() {
    this.playPaperCrushCrinkle();
  }

  playSoftClick() {
    if (!this.enabled || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const out = this.masterGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundFX = new PhysicalSoundEngine();
