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
      setIsPlaying(true); // Set immediately for UI responsiveness
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false); // Revert if failed
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
      setIsPlaying(true);
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
      setCustomTrackName(file.name);
    }
  };

  if (!isExpanded) {
    return (
      <>
        <div style={{ position: "fixed", top: "80px", right: "24px", zIndex: 50 }}>
          <button 
            onClick={() => setIsExpanded(true)}
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--ink)",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}
            title="Mở nhạc nền"
          >
            {isPlaying ? (
              <div style={{ display: "flex", gap: "2px", height: "14px", alignItems: "flex-end" }}>
                <div style={{ width: "3px", height: "14px", background: "var(--primary)", animation: "bounce 1s infinite ease-in-out" }}></div>
                <div style={{ width: "3px", height: "8px", background: "var(--primary)", animation: "bounce 1s infinite ease-in-out 0.2s" }}></div>
                <div style={{ width: "3px", height: "12px", background: "var(--primary)", animation: "bounce 1s infinite ease-in-out 0.4s" }}></div>
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            )}
          </button>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes bounce {
            0%, 100% { height: 6px; }
            50% { height: 14px; }
          }
        `}} />
      </>
    );
  }

  return (
    <div style={{ position: "fixed", top: "80px", right: "24px", zIndex: 50 }}>
      <div style={{
        position: "absolute",
        top: "45px", // Dropdown below the icon
        right: "0",
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 50,
        minWidth: "250px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "15px", fontWeight: "bold", color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Nhạc nền
          </span>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              onClick={togglePlay}
              style={{ 
                background: "var(--primary)", 
                color: "white", 
                border: "none", 
                borderRadius: "50%", 
                width: "36px", 
                height: "36px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button 
              onClick={() => setIsExpanded(false)}
              style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, color: "var(--ink)", padding: "4px" }}
              title="Thu nhỏ"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <input 
            type="range" 
            min="0" max="1" step="0.05" 
            value={volume} 
            onChange={handleVolumeChange} 
            style={{ flex: 1, accentColor: "var(--primary)", height: "4px", cursor: "pointer" }}
          />
        </div>

        <div style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: "rgba(0,0,0,0.03)", padding: "6px 8px", borderRadius: "6px" }}>
          {customTrackName || "Nhạc thư giãn (Mặc định)"}
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "none",
            border: "1px dashed var(--line)",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--ink)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "4px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Tải nhạc từ máy (mp3)
        </button>
        <input 
          type="file" 
          accept="audio/*" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileUpload} 
        />
      </div>
      
      {/* Nút icon đại diện luôn hiện để đóng/mở */}
      <button 
        onClick={() => setIsExpanded(false)}
        style={{
          background: "var(--primary)",
          border: "1px solid var(--line)",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}
        title="Đóng nhạc nền"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </button>
    </div>
  );
}
// Trigger rebuild
