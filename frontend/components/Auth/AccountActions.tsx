"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";
import ThemeToggle from "@/components/Layout/ThemeToggle";
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

export default function AccountActions() {
  const t = useTranslations("Nav");
  const { loading, logout, user, subscription } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <Link className="pageAction" href="/practice">
          {t("practice")}
        </Link>
      )}
      {!pathname.includes('/pdf') && (
        <Link className="pageAction" href="/pdf">
          {t("pdf")}
        </Link>
      )}
      {!pathname.includes('/notebook') && user && (
        <Link className="pageAction" href="/notebook">
          {t("notebook")}
        </Link>
      )}

      {loading ? <span className="accountMuted">{t("loading")}</span> : null}
      {!loading && !user ? (
        <Link className="navLink" href="/auth/login">
          {t("login")}
        </Link>
      ) : null}
      {!loading && user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: "flex", alignItems: "center", border: "none", background: "none", cursor: "pointer", padding: 0 }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          
          {dropdownOpen && (
            <div style={{ 
              position: "absolute", 
              top: "calc(100% + 12px)", 
              right: 0, 
              width: "220px", 
              background: "var(--paper)", 
              border: "1px solid var(--line)", 
              borderRadius: "8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "8px 0",
              overflow: "hidden"
            }}>
              <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--line)", marginBottom: "4px" }}>
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
              </div>

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
                  onClick={() => setDropdownOpen(false)}
                  style={{ ...menuItemStyle }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <BellIcon />
                  Thông báo
                </button>
              </div>

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
              </div>
            </div>
          )}
          </div>
        </div>
      ) : null}
      <LanguageSwitcher />
      <ThemeToggle />
    </>
  );
}
