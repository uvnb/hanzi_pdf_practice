"use client";

import React, { useState, useRef, useEffect } from "react";

export default function MusicWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/audio/bg-music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setCustomTrackName(file.name);
      }).catch(console.error);
    }
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        style={{
          position: "fixed",
          top: "80px",
          right: "24px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          cursor: "pointer",
          color: "var(--ink)"
        }}
        title="Nhạc nền"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: "80px", // Below the avatar/header
      right: "24px",
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: "12px",
      padding: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: 50,
      minWidth: "220px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Nhạc nền
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button 
            onClick={togglePlay}
            style={{ 
              background: "var(--primary)", 
              color: "white", 
              border: "none", 
              borderRadius: "50%", 
              width: "32px", 
              height: "32px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button 
            onClick={() => setIsExpanded(false)}
            style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, color: "var(--ink)", padding: "4px" }}
            title="Thu nhỏ"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <input 
          type="range" 
          min="0" max="1" step="0.05" 
          value={volume} 
          onChange={handleVolumeChange} 
          style={{ flex: 1, accentColor: "var(--primary)", height: "4px" }}
        />
      </div>

      <div style={{ fontSize: "11px", color: "var(--ink)", opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {customTrackName || "Nhạc thư giãn (Mặc định)"}
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: "none",
          border: "1px dashed var(--line)",
          borderRadius: "6px",
          padding: "6px",
          fontSize: "12px",
          color: "var(--ink)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          marginTop: "4px",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Tải nhạc của bạn (mp3)
      </button>
      <input 
        type="file" 
        accept="audio/*" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        onChange={handleFileUpload} 
      />
    </div>
  );
}
