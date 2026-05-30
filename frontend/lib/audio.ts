"use client";

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playCorrectStroke() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function playMistake() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

export function playFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const notes = [
    { freq: 523.25, time: 0, dur: 0.15 },    // C5
    { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
    { freq: 783.99, time: 0.3, dur: 0.15 },  // G5
    { freq: 1046.50, time: 0.45, dur: 0.4 }  // C6
  ];
  
  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

export function speakCharacter(character: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(character);
    utterance.lang = "zh-CN"; // Mandarin Chinese
    utterance.rate = 0.8; // Slightly slower for clarity
    
    // Try to load voices
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith("zh-"));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}
