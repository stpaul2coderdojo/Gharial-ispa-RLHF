import { ISPATokenId } from '../types';
import { ISPA_VOCABULARY } from '../data/ispaData';

class BioacousticAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.ctx) this.init();
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  public playToken(token: ISPATokenId, startTimeOffset = 0): number {
    this.init();
    if (!this.ctx || !this.analyser) return 0;

    const t0 = this.ctx.currentTime + startTimeOffset;
    const def = ISPA_VOCABULARY[token];
    const duration = (def?.acousticDescriptor.durationMs || 400) / 1000;

    switch (token) {
      case 'HC': {
        // High-pitched hatchling chirp: upward sweep 2400 -> 3400 -> 2800 Hz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, t0);
        osc.frequency.exponentialRampToValueAtTime(3600, t0 + duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(2900, t0 + duration);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.35, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        osc.stop(t0 + duration);
        break;
      }

      case 'CC': {
        // Contact chirp: 1400 -> 1900 Hz harmonic chirp
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(1400, t0);
        osc.frequency.exponentialRampToValueAtTime(1850, t0 + duration * 0.6);
        osc.frequency.exponentialRampToValueAtTime(1600, t0 + duration);

        osc2.frequency.setValueAtTime(2800, t0);
        osc2.frequency.exponentialRampToValueAtTime(3700, t0 + duration * 0.6);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        osc2.start(t0);
        osc.stop(t0 + duration);
        osc2.stop(t0 + duration);
        break;
      }

      case 'DC': {
        // Distress squeal: modulated frequency with harshness
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, t0);
        osc.frequency.linearRampToValueAtTime(3200, t0 + duration * 0.5);
        osc.frequency.linearRampToValueAtTime(2600, t0 + duration);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(22, t0); // rapid vibrato
        lfoGain.gain.setValueAtTime(120, t0);

        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.3, t0 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);

        lfo.start(t0);
        osc.start(t0);
        lfo.stop(t0 + duration);
        osc.stop(t0 + duration);
        break;
      }

      case 'HS': {
        // Defensive hiss: filtered noise
        this.playFilteredNoise(t0, duration, 2400, 1.2, 0.22);
        break;
      }

      case 'JC': {
        // Jaw clap: sharp percussive impulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, t0);
        osc.frequency.exponentialRampToValueAtTime(90, t0 + duration);

        gain.gain.setValueAtTime(0.9, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        osc.stop(t0 + duration);
        this.playFilteredNoise(t0, 0.035, 1200, 0.8, 0.4);
        break;
      }

      case 'BB': {
        // Bubble burst: 5 micro-blips
        const numBubbles = 4;
        for (let i = 0; i < numBubbles; i++) {
          const bt0 = t0 + (i * duration) / numBubbles + Math.random() * 0.04;
          const bDur = 0.07;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const baseFreq = 380 + Math.random() * 260;
          osc.frequency.setValueAtTime(baseFreq, bt0);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, bt0 + bDur);

          gain.gain.setValueAtTime(0.001, bt0);
          gain.gain.linearRampToValueAtTime(0.2, bt0 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, bt0 + bDur);

          osc.connect(gain);
          gain.connect(this.analyser);
          osc.start(bt0);
          osc.stop(bt0 + bDur);
        }
        break;
      }

      case 'GW': {
        // Adult growl: low rumble 120-180 Hz
        const osc = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        oscSub.type = 'sine';
        osc.frequency.setValueAtTime(140, t0);
        osc.frequency.linearRampToValueAtTime(110, t0 + duration);
        oscSub.frequency.setValueAtTime(70, t0);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.4, t0 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        oscSub.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        oscSub.start(t0);
        osc.stop(t0 + duration);
        oscSub.stop(t0 + duration);
        break;
      }

      case 'GR': {
        // Social groan: resonant body chamber
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(210, t0);
        osc.frequency.linearRampToValueAtTime(180, t0 + duration);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, t0);
        filter.Q.setValueAtTime(4.0, t0);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.35, t0 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        osc.stop(t0 + duration);
        break;
      }

      case 'RR': {
        // Large male roar: heavy sub-bass roar
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(160, t0);
        osc1.frequency.linearRampToValueAtTime(95, t0 + duration);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(80, t0);
        osc2.frequency.linearRampToValueAtTime(45, t0 + duration);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.5, t0 + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.analyser);
        osc1.start(t0);
        osc2.start(t0);
        osc1.stop(t0 + duration);
        osc2.stop(t0 + duration);
        break;
      }

      case 'SN': {
        // Snorting hiss using the ghara
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1150, t0);
        osc.frequency.linearRampToValueAtTime(950, t0 + duration);

        oscGain.gain.setValueAtTime(0.001, t0);
        oscGain.gain.linearRampToValueAtTime(0.2, t0 + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(oscGain);
        oscGain.connect(this.analyser);
        osc.start(t0);
        osc.stop(t0 + duration);

        this.playFilteredNoise(t0, duration, 1400, 2.5, 0.3);
        break;
      }

      case 'SAV': {
        // Subaudible vibration: infrasonic torso rumble (22 Hz fundamental) + low sub-bass
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(28, t0); // Infrasonic near hearing threshold

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(7, t0); // 7Hz pulsing ripple
        lfoGain.gain.setValueAtTime(6, t0);
        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.6, t0 + 0.2);
        gain.gain.linearRampToValueAtTime(0.6, t0 + duration - 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);

        lfo.start(t0);
        osc.start(t0);
        lfo.stop(t0 + duration);
        osc.stop(t0 + duration);
        break;
      }

      case 'POP': {
        // Underwater impulsive pop: sharp transient with low water cavitation ringing
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, t0);
        osc.frequency.exponentialRampToValueAtTime(140, t0 + duration);

        gain.gain.setValueAtTime(1.0, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0);
        osc.stop(t0 + duration);
        break;
      }

      case 'BR': {
        // Breathe-roar: expelled air breath into deep male roar
        this.playFilteredNoise(t0, duration * 0.4, 1800, 1.5, 0.3);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, t0 + duration * 0.25);
        osc.frequency.linearRampToValueAtTime(130, t0 + duration);

        gain.gain.setValueAtTime(0.001, t0 + duration * 0.25);
        gain.gain.linearRampToValueAtTime(0.5, t0 + duration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start(t0 + duration * 0.25);
        osc.stop(t0 + duration);
        break;
      }
    }

    return duration;
  }

  private playFilteredNoise(t0: number, duration: number, centerFreq: number, q: number, volume: number) {
    if (!this.ctx || !this.analyser) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(centerFreq, t0);
    filter.Q.setValueAtTime(q, t0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(t0);
    noise.stop(t0 + duration);
  }

  public playSequence(
    tokens: ISPATokenId[],
    gapMs = 250,
    onTokenStart?: (index: number, token: ISPATokenId) => void,
    onComplete?: () => void
  ): { cancel: () => void } {
    this.init();
    let currentDelaySec = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    tokens.forEach((tok, idx) => {
      const def = ISPA_VOCABULARY[tok];
      const tokDurationSec = (def?.acousticDescriptor.durationMs || 400) / 1000;
      const scheduledTime = currentDelaySec;

      const tId = setTimeout(() => {
        if (onTokenStart) onTokenStart(idx, tok);
        this.playToken(tok, 0);
      }, scheduledTime * 1000);

      timeouts.push(tId);
      currentDelaySec += tokDurationSec + gapMs / 1000;
    });

    const completionTId = setTimeout(() => {
      if (onComplete) onComplete();
    }, currentDelaySec * 1000);
    timeouts.push(completionTId);

    return {
      cancel: () => {
        timeouts.forEach((id) => clearTimeout(id));
      },
    };
  }
}

export const bioacousticSynth = new BioacousticAudioEngine();
