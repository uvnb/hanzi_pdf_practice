"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

const CrownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 7 2a1 1 0 0 1 1 1v7z"/><path d="m9 12 2 2 4-4"/></svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const TrophyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

export default function AccountActions() {
  const t = useTranslations("Nav");
  const { loading, logout, user, subscription } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  const [readIds, setReadIds] = useState<string[]>([]);

  // Music state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [musicExpanded, setMusicExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initialize audio only once
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio("/audio/bg-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return () => {
      // We don't want to destroy the audio when AccountActions unmounts
      // because it might be a page transition where we want music to keep playing?
      // Actually, AccountActions is in the global layout, so it rarely unmounts.
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
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
      audioRef.current.play().catch(() => setIsPlaying(false));
      setCustomTrackName(file.name);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const read = localStorage.getItem(`read_notifications_${user.id}`);
      if (read) {
        try { setReadIds(JSON.parse(read)); } catch(e) {}
      }
    }
  }, [user?.id]);

  const notifications = useMemo(() => {
    const list = [];
    if (subscription && subscription.plan !== "free" && subscription.status === "active") {
      list.push({
        id: `upgrade-success-${subscription.started_at || '1'}`,
        title: "Đã kích hoạt thành công!",
        message: `Gói ${subscription.plan === "yearly" ? "Năm" : subscription.plan === "monthly" ? "Tháng" : "Tuần"} của bạn đã được kích hoạt.`,
        date: new Date(subscription.started_at || Date.now()).toLocaleDateString("vi-VN")
      });
    }
    return list;
  }, [subscription]);
  
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleNotificationClick = () => {
    setNotificationsOpen(true);
    if (unreadCount > 0 && user?.id) {
      const newReadIds = Array.from(new Set([...readIds, ...notifications.map(n => n.id)]));
      setReadIds(newReadIds);
      localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(newReadIds));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmDelete = async () => {
    if (deleteEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      setDeleteError("Vui lòng nhập chính xác email của bạn");
      return;
    }
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/confirm-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteEmail.trim() })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Có lỗi xảy ra");
      }
      alert("Tài khoản đã được xóa thành công");
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 16px",
    background: "none",
    border: "none",
    color: "var(--ink)",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left" as const,
  };

  return (
    <>
      {!pathname.includes('/practice') && (
        <Link className="pageAction" href="/practice">{t("practice")}</Link>
      )}
      {!pathname.includes('/pdf') && (
        <Link className="pageAction" href="/pdf">{t("pdf")}</Link>
      )}
      {!pathname.includes('/notebook') && user && (
        <Link className="pageAction" href="/notebook">{t("notebook")}</Link>
      )}

      {loading ? <span className="accountMuted">{t("loading")}</span> : null}
      {!loading && !user ? (
        <Link className="navLink" href="/auth/login">{t("login")}</Link>
      ) : null}
      {!loading && user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            {unreadCount > 0 && !dropdownOpen && (
              <div style={{
                position: "absolute",
                right: "calc(100% + 12px)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#ef4444",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                pointerEvents: "none",
                animation: "pulseText 2s infinite",
                zIndex: 10
              }}>
                Bạn có thông báo mới
                <div style={{
                  position: "absolute",
                  right: "-4px",
                  top: "50%",
                  marginTop: "-4px",
                  width: "8px",
                  height: "8px",
                  background: "#ef4444",
                  transform: "rotate(45deg)",
                  zIndex: -1
                }} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                border: "none", 
                background: "none", 
                cursor: "pointer", 
                padding: 0,
                animation: unreadCount > 0 ? "shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite" : "none"
              }}
            >
              <div style={{ position: "relative" }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {unreadCount > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "10px",
                    height: "10px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "2px solid var(--paper)"
                  }} />
                )}
              </div>
            </button>
          
          {dropdownOpen && (
            <div className="avatarDropdown">
              <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--line)", marginBottom: "4px" }}>
                {notificationsOpen ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "4px" }}>
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--ink)", opacity: 0.7 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--ink)" }}>Thông báo</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                    
                    {subscription && subscription.plan !== "free" && subscription.expires_at && (
                      <div style={{ 
                        marginTop: "8px", 
                        padding: "6px 8px", 
                        background: "rgba(245, 158, 11, 0.1)", 
                        border: "1px solid rgba(245, 158, 11, 0.3)", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        color: "#d97706",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}>
                        <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CrownIcon /> Gói {subscription.plan === "weekly" ? "Trải nghiệm" : subscription.plan === "monthly" ? "Thường xuyên" : "Năm"}
                        </div>
                        <div>Còn lại: {(() => {
                          const diff = new Date(subscription.expires_at).getTime() - Date.now();
                          if (diff <= 0) return "Đã hết hạn";
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          return `${days} ngày ${hours} giờ`;
                        })()}</div>
                      </div>
                    )}
                    {subscription && subscription.plan === "free" && (
                       <div style={{ marginTop: "8px", fontSize: "12px", color: "#ef4444" }}>
                         Gói Free (Đã hết hạn hoặc chưa đăng ký)
                       </div>
                    )}
                  </>
                )}
              </div>

              {notificationsOpen ? (
                <div style={{ maxHeight: "300px", overflowY: "auto", padding: "8px 0" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}>
                      Chưa có thông báo nào.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ fontWeight: "bold", color: "var(--accent)", fontSize: "14px", marginBottom: "4px" }}>{n.title}</div>
                        <div style={{ color: "var(--ink)", opacity: 0.8, fontSize: "13px", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", marginTop: "6px" }}>{n.date}</div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={{ padding: "4px 0" }}>
                <button 
                  onClick={() => { setDropdownOpen(false); router.push("/premium"); }}
                  style={{ ...menuItemStyle, color: "#f59e0b" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <CrownIcon />
                  {subscription && subscription.plan !== "free" ? "Gia hạn Premium" : "Nâng cấp Premium"}
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); router.push("/leaderboard"); }}
                  style={{ ...menuItemStyle }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <TrophyIcon />
                  Bảng xếp hạng
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); router.push("/terms"); }}
                  style={{ ...menuItemStyle }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <ShieldCheckIcon />
                  Chính sách sử dụng
                </button>

                <button 
                  onClick={handleNotificationClick}
                  style={{ ...menuItemStyle, position: "relative" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <BellIcon />
                  Thông báo
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", right: "16px", background: "#ef4444", color: "white", borderRadius: "10px", padding: "2px 6px", fontSize: "11px", fontWeight: "bold" }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Collapsible Music Menu */}
                <div style={{ borderTop: "1px solid var(--line)", marginTop: "4px", paddingTop: "4px" }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMusicExpanded(!musicExpanded); }}
                    style={{ ...menuItemStyle, justifyContent: "space-between" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <MusicIcon /> Nhạc nền
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: musicExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {musicExpanded && (
                    <div style={{ padding: "8px 16px 12px 44px", background: "rgba(0,0,0,0.01)" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePlay(e); }}
                          style={{ 
                            background: "var(--primary)", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "50%", 
                            minWidth: "32px", 
                            maxWidth: "32px",
                            height: "32px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0
                          }}
                        >
                          {isPlaying ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          )}
                        </button>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                          <input 
                            type="range" min="0" max="1" step="0.05" value={volume} 
                            onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                            onInput={(e) => { e.stopPropagation(); handleVolumeChange(e as any); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.7, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {customTrackName || "Nhạc thư giãn"}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          style={{ background: "white", border: "1px dashed var(--line)", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", color: "var(--ink)", cursor: "pointer", minWidth: "max-content" }}
                        >
                          Tải lên (mp3)
                        </button>
                      </div>
                      <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} onClick={(e) => e.stopPropagation()} />
                    </div>
                  )}
                </div>
              </div>
              )}

              <div style={{ padding: "4px 0", borderTop: "1px solid var(--line)", marginTop: "4px" }}>
                <button 
                  onClick={() => { setDropdownOpen(false); void logout().catch(() => undefined); }}
                  style={{ ...menuItemStyle, color: "#ef4444" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <LogoutIcon />
                  {t("logout")}
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); setDeleteModalOpen(true); setDeleteError(""); setDeleteEmail(""); }}
                  style={{ ...menuItemStyle, color: "#ef4444", fontSize: "13px", opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <TrashIcon />
                  Xóa tài khoản
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      ) : null}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-3deg); }
          20%, 80% { transform: translate3d(1px, 0, 0) rotate(3deg); }
          30%, 50%, 70% { transform: translate3d(-2px, 0, 0) rotate(-3deg); }
          40%, 60% { transform: translate3d(2px, 0, 0) rotate(3deg); }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.85; transform: translateY(-50%) scale(0.96); }
        }
      `}</style>

      {deleteModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--paper)", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "400px", color: "var(--ink)" }}>
            <h3 style={{ marginTop: 0 }}>Xác nhận xóa tài khoản</h3>
            <p style={{ fontSize: "14px", opacity: 0.8 }}>Hành động này không thể hoàn tác. Để tiếp tục, vui lòng nhập chính xác email của bạn (<strong>{user?.email}</strong>).</p>
            {deleteError && <div style={{ fontSize: "14px", color: "#ef4444", marginBottom: "12px" }}>{deleteError}</div>}
            
            <input 
              type="email" 
              placeholder="Nhập email của bạn" 
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: "14px" }}
            />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", color: "var(--ink)", cursor: "pointer" }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={isDeleting || !deleteEmail}
                style={{ flex: 1, padding: "10px", background: "#ef4444", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", opacity: (isDeleting || !deleteEmail) ? 0.5 : 1, fontWeight: "bold" }}
              >
                {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
