// 邪馬台国サウンド：Web Audio API でBGM・効果音をその場で合成します（音源ファイル不要）
// BGM は雅楽・古代風：笙のような持続和音 + 琴の爪弾き + 龍笛風の旋律 + 太鼓

const YO = [0, 2, 5, 7, 9]; // 律・陽音階（D E G A B）
const BASE = 146.83; // D3

function freq(step, octave = 0) {
  const idx = ((step % 5) + 5) % 5;
  const oct = Math.floor(step / 5) + octave;
  return BASE * Math.pow(2, (YO[idx] + 12 * oct) / 12);
}

class Sound {
  constructor() {
    this.ctx = null;
    this.bgmOn = true;
    this.sfxOn = true;
    this.bgmTimer = null;
    this.ksCache = new Map();
  }

  // ユーザー操作の中で呼ぶ（ブラウザの自動再生制限のため）
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(c.destination);

      this.reverb = c.createConvolver();
      this.reverb.buffer = this.makeImpulse(3.2);
      this.reverbGain = c.createGain();
      this.reverbGain.gain.value = 0.45;
      this.reverb.connect(this.reverbGain).connect(this.master);

      this.bgmBus = c.createGain();
      this.bgmBus.gain.value = this.bgmOn ? 0.55 : 0;
      this.bgmBus.connect(this.master);
      this.bgmBus.connect(this.reverb);

      this.sfxBus = c.createGain();
      this.sfxBus.gain.value = this.sfxOn ? 0.8 : 0;
      this.sfxBus.connect(this.master);
      this.sfxBus.connect(this.reverb);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.bgmOn && !this.bgmTimer) this.startBgm();
  }

  makeImpulse(sec) {
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * sec);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  setBgm(on) {
    this.bgmOn = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.bgmBus.gain.cancelScheduledValues(t);
    this.bgmBus.gain.setTargetAtTime(on ? 0.55 : 0, t, 0.3);
    if (on && !this.bgmTimer) this.startBgm();
    if (!on) this.stopBgm();
  }

  // 広告の表示中・アプリが裏に回ったときに音を止める
  suspend() {
    this.suspended = true;
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    this.suspended = false;
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setSfx(on) {
    this.sfxOn = on;
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(on ? 0.8 : 0, this.ctx.currentTime, 0.05);
  }

  // ---------- 音色 ----------

  // 琴：Karplus-Strong 撥弦
  ksBuffer(f) {
    const key = Math.round(f * 10);
    if (this.ksCache.has(key)) return this.ksCache.get(key);
    const c = this.ctx;
    const sr = c.sampleRate;
    const len = Math.floor(sr * 2.6);
    const buf = c.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / f));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    let p = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[p];
      const next = ring[(p + 1) % period];
      ring[p] = 0.4985 * (cur + next);
      d[i] = cur;
      p = (p + 1) % period;
    }
    this.ksCache.set(key, buf);
    return buf;
  }

  koto(f, t, vol = 0.35, bus = this.sfxBus, bend = true) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.ksBuffer(f);
    if (bend) {
      // 押し手（わずかなピッチの揺れ）
      src.playbackRate.setValueAtTime(1, t);
      src.playbackRate.setValueAtTime(1, t + 0.25);
      src.playbackRate.linearRampToValueAtTime(1.012, t + 0.45);
      src.playbackRate.linearRampToValueAtTime(1, t + 0.8);
    }
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    src.connect(lp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 2.6);
  }

  // 笙のような持続音（複数の正弦波）
  sho(freqs, t, dur, vol = 0.05) {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
    g.gain.setValueAtTime(vol, t + dur * 0.65);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    g.connect(lp).connect(this.bgmBus);
    for (const f of freqs) {
      for (const det of [-4, 4]) {
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        o.detune.value = det;
        o.connect(g);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    }
  }

  // 龍笛風（ビブラート付きの正弦波＋息の音）
  flute(f, t, dur, vol = 0.07) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 0.97, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
    const lfo = c.createOscillator();
    lfo.frequency.value = 5.2;
    const lfoG = c.createGain();
    lfoG.gain.setValueAtTime(0, t);
    lfoG.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.6);
    lfo.connect(lfoG).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.15);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.bgmBus);
    // 息
    const n = this.noise(t, dur, 0.012, 'bandpass', f * 2);
    n.connect(this.bgmBus);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  noise(t, dur, vol, type = 'lowpass', fq = 1000, q = 1) {
    const c = this.ctx;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = fq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g);
    src.start(t);
    return g;
  }

  // 太鼓
  taiko(t, vol = 0.5, bus = this.bgmBus, pitch = 90) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(pitch * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(pitch, t + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 1);
    this.noise(t, 0.08, vol * 0.4, 'lowpass', 900).connect(bus);
  }

  // 銅鐸・鈴のような金属音
  bell(f, t, vol = 0.18, dur = 2.2, bus = this.sfxBus) {
    const c = this.ctx;
    const ratios = [1, 2.76, 5.4, 8.93];
    ratios.forEach((r, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * r;
      const g = c.createGain();
      const v = vol / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i * 0.6 + 1));
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur);
    });
  }

  // 銅鑼
  gong(t, vol = 0.4, bus = this.sfxBus) {
    const c = this.ctx;
    [[70, 1], [112, 0.6], [163, 0.45], [217, 0.3], [291, 0.2]].forEach(([f, a]) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 1.02, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 1.5);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol * a, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + 4.1);
    });
    this.noise(t, 0.4, vol * 0.25, 'bandpass', 400, 0.7).connect(bus);
  }

  // 拍子木
  wood(t, vol = 0.3, f = 1100) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.06);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 0.1);
    this.noise(t, 0.03, vol * 0.5, 'highpass', 2500).connect(this.sfxBus);
  }

  // ---------- 効果音 ----------
  play(name, arg = 0) {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case 'button':
        this.wood(t, 0.25, 900);
        break;
      case 'tap':
        this.wood(t, 0.18, 1400);
        break;
      case 'open': // arg = 数字
        this.koto(freq(5 + Math.min(arg, 6), 0), t, 0.32);
        break;
      case 'cascade': // arg = 開いたマス数
        for (let i = 0; i < Math.min(arg, 10); i++) this.koto(freq(5 + i), t + i * 0.06, 0.22, this.sfxBus, false);
        break;
      case 'flag':
        this.bell(freq(10), t, 0.16, 1.6);
        break;
      case 'unflag':
        this.wood(t, 0.2, 700);
        break;
      case 'deny':
        this.wood(t, 0.15, 500);
        this.wood(t + 0.08, 0.12, 450);
        break;
      case 'mistake':
        this.gong(t, 0.5);
        this.taiko(t, 0.7, this.sfxBus, 70);
        [7, 6, 4, 2, 0].forEach((s, i) => this.koto(freq(s), t + 0.25 + i * 0.13, 0.25, this.sfxBus, false));
        break;
      case 'scatter':
        for (let i = 0; i < 8; i++) this.bell(freq(8 + ((i * 3) % 7)), t + i * 0.07, 0.07, 1.2);
        break;
      case 'win': {
        const seq = [0, 2, 3, 4, 5, 7, 8, 10];
        seq.forEach((s, i) => this.koto(freq(s), t + i * 0.12, 0.3, this.sfxBus, false));
        this.bell(freq(10), t + 1.0, 0.22, 3);
        this.bell(freq(12), t + 1.2, 0.16, 3);
        this.gong(t + 1.0, 0.35);
        this.taiko(t + 1.0, 0.6, this.sfxBus, 80);
        break;
      }
      case 'start':
        this.taiko(t, 0.5, this.sfxBus, 85);
        this.taiko(t + 0.35, 0.4, this.sfxBus, 85);
        this.bell(freq(7), t + 0.35, 0.12, 2);
        break;
      case 'reveal':
        this.bell(freq(5 + (arg % 6)), t, 0.12, 1.4);
        break;
    }
  }

  // ---------- BGM（自動生成） ----------
  startBgm() {
    if (!this.ctx) return;
    this.beat = 0.52; // 1拍の長さ（秒）
    this.nextTime = this.ctx.currentTime + 0.2;
    this.step = 0;
    this.phrase = this.makePhrase();
    this.chordIdx = 0;
    this.bgmTimer = setInterval(() => this.scheduleBgm(), 120);
  }

  stopBgm() {
    clearInterval(this.bgmTimer);
    this.bgmTimer = null;
  }

  makePhrase() {
    // 16拍のフレーズ。null は休符
    const out = [];
    let s = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < 16; i++) {
      if (Math.random() < 0.38 || i % 8 === 7) {
        out.push(null);
        continue;
      }
      s += [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
      s = Math.max(2, Math.min(11, s));
      out.push(s);
    }
    out[0] = out[0] ?? 5;
    return out;
  }

  scheduleBgm() {
    const c = this.ctx;
    const CHORDS = [
      [freq(0), freq(3), freq(4), freq(7)],
      [freq(1), freq(3), freq(6), freq(8)],
      [freq(-1), freq(2), freq(4), freq(6)],
      [freq(0), freq(2), freq(4), freq(7)],
    ];
    while (this.nextTime < c.currentTime + 0.6) {
      const t = this.nextTime;
      const i = this.step % 16;

      // 笙：8拍ごとに和音
      if (i % 8 === 0) {
        this.sho(CHORDS[this.chordIdx % CHORDS.length], t, this.beat * 8.4, 0.022);
        this.chordIdx++;
      }
      // 琴の旋律
      const n = this.phrase[i];
      if (n !== null && n !== undefined) {
        this.koto(freq(n), t, 0.22, this.bgmBus);
        if (Math.random() < 0.18) this.koto(freq(n + 5), t + this.beat / 2, 0.12, this.bgmBus);
      }
      // 低音の琴（根音）
      if (i % 4 === 0) this.koto(freq(i % 8 === 0 ? 0 : -2), t, 0.2, this.bgmBus, false);
      // 太鼓
      if (i === 0) this.taiko(t, 0.38);
      if (i === 12 || i === 14) this.taiko(t, 0.18, this.bgmBus, 110);
      // 龍笛：時々長い音
      if (i === 4 && Math.random() < 0.45) {
        const s = 10 + Math.floor(Math.random() * 3);
        this.flute(freq(s), t, this.beat * 3.5);
        this.flute(freq(s - 1), t + this.beat * 3.6, this.beat * 3.8);
      }

      this.nextTime += this.beat;
      this.step++;
      if (this.step % 32 === 0 || (this.step % 16 === 0 && Math.random() < 0.5)) {
        this.phrase = this.makePhrase();
      }
    }
  }
}

export const sound = new Sound();
