/*
 * Sound utils
 */

/** Produce sine waves using Web Audio API */
export class VarioTone {
  /**
   * Only needs VarioTone config
   */
  constructor(config: Object) {
    this.config = config;
    this.state = {
      on: false,
      cycle: 0,
    };
    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create Oscillator node
    this.oscillator = this.audioCtx.createOscillator();
    // create Gain node
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0;
    this.oscillator.type = 'square';
    // Start oscillating at some random tone
    this.oscillator.frequency.value = 440;
    this.oscillator.start();
    // Wire it up
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
  }
  /**
   * Set to a certain tone of the list in config.
   * Make sure not to abrubtly change tone.
   * @param level Gets rounded to an integer, indicates tone, off if -1
   */
  set(level: number) {
    console.info(level);
    if (level === -1) {
      this.state.on = false;
      return;
    }
    level = Math.round(level);
    // Restrict to end of array
    if (level >= this.config.tones.length) {
      level = this.config.tones.length - 1;
    }
    // Set state, not tone directly, to avoid abrubtly changing tone
    this.state.freq = this.config.tones[level];
    this.state.dur = this.config.durations[level];
    this.state.dutyCycle = this.config.dutyCycles[level];

    // Switch on if off
    if (this.state.on === false) {
      this.state.on = true;
      this._updateTone();
    }
  }
  /**
   * Internal method that updates oscillator and schedules itself
   */
  _updateTone() {
    if (!this.state.on) {
      this.gainNode.gain.value = 0;
      this.state.cycle = 0;
      return;
    }
    this.oscillator.frequency.value = this.state.freq;
    // If currently in an 'on' cycle, turn off and schedule for low time of
    // duty cycle
    if (this.state.cycle % 2) {
      // Turn off using gain, oscillator.stop() destroys oscillator
      this.gainNode.gain.value = 0;
      window.setTimeout(()=>{
        this._updateTone();
      }, this.state.dur * 1000 * (1-this.state.dutyCycle));
    } else {
      this.gainNode.gain.value = this.config.gain;
      window.setTimeout(()=>{
        this._updateTone();
      }, this.state.dur * 1000 * this.state.dutyCycle);
    }
    this.state.cycle++;
  }
}
