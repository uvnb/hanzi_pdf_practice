import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AccountActions from "@/components/Auth/AccountActions";
import styles from "./leaderboard.module.css";

const LightningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const FlameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c0 0-4 3.5-5 8 0 3 2 5 2 5s-1-2-1-4c0-2.5 4-7 4-7s-2 4.5-2 7c0 3 4 5 4 5s-1-2-1-4c0-3 3-5.5 3-5.5s-1.5 2-1.5 4.5c0 4.5-3 8-5 8-3.5 0-6.5-2-6.5-5.5 0-3.5 2-7.5 2-7.5z"/></svg>
);
const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
);

import { fetchLeaderboard, LeaderboardUser } from "@/lib/hanzi-api";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let users: LeaderboardUser[] = [];
  try {
    users = await fetchLeaderboard();
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
  }

  const topThreeRaw = users.slice(0, 3);
  let topThree: LeaderboardUser[] = [];
  if (topThreeRaw.length === 3) {
    topThree = [topThreeRaw[1], topThreeRaw[0], topThreeRaw[2]];
  } else if (topThreeRaw.length === 2) {
    topThree = [topThreeRaw[1], topThreeRaw[0]];
  } else {
    topThree = topThreeRaw;
  }
  const listUsers = users.slice(3);

  return (
    <main className="practicePage">
      <header className="pageHeader">
        <Link className="brand" href="/">
          汉字 Hanzi
        </Link>
        <div>
          <p className="eyebrow">LEADERBOARD</p>
          <h1>Xếp hạng</h1>
        </div>
        <div className="headerActions">
          <AccountActions />
        </div>
      </header>

      <div className={styles.header} style={{ marginTop: 40 }}>
        <h1 className={styles.title}>Bảng xếp hạng</h1>
        <p className={styles.subtitle}>Top 10 chú ong chăm chỉ</p>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}><span style={{ color: "#fbbf24" }}><LightningIcon /></span> Lượt viết</div>
          <div className={styles.statItem}><span style={{ color: "var(--success, #22c55e)" }}><StarIcon /></span> Hoàn hảo</div>
          <div className={styles.statItem}><span style={{ color: "#ef4444" }}><FlameIcon /></span> Chuỗi</div>
        </div>
      </div>

      <div className={styles.topThree}>
        {topThree.map((user) => (
          <div key={user.id} className={`${styles.card} ${styles[`rank${user.rank}`]}`}>
            <div className={styles.crown}><CrownIcon /></div>
            <div className={`${styles.badge} ${styles[`badge${user.rank}`]}`}>{user.rank}</div>
            
            <div className={styles.avatarWrapper}>
              <img src={user.avatar} alt={user.name} className={styles.avatar} />
            </div>
            
            <div className={styles.name}>{user.name}</div>
            {user.isPremium && (
              <div className={styles.premiumTag}>
                <CrownIcon /> Premium
              </div>
            )}
            
            <div className={styles.userStats}>
              <div className={styles.xpText}><LightningIcon /> {user.attempts}</div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center", color: "var(--success, #22c55e)" }}><StarIcon /> {user.perfect}</div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center", color: "#ef4444" }}><FlameIcon /> {user.streak}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.list}>
        {listUsers.map((user) => (
          <div key={user.id} className={styles.listItem}>
            <div className={styles.listRank}>{user.rank.toString().padStart(2, "0")}</div>
            <div className={styles.listAvatar}>
              <img src={user.avatar} alt={user.name} />
            </div>
            <div className={styles.listInfo}>
              <div className={styles.listName}>{user.name}</div>
              {user.isPremium && (
                <div className={styles.premiumTag} style={{ marginBottom: 0, marginTop: "2px", width: "fit-content" }}>
                  <CrownIcon /> Premium
                </div>
              )}
            </div>
            <div className={styles.listStats}>
              <div className={styles.listXp}><LightningIcon /> {user.attempts}</div>
              <div className={styles.listCards} style={{ color: "var(--success, #22c55e)" }}><StarIcon /> {user.perfect}</div>
              <div className={styles.listCards} style={{ color: "#ef4444" }}><FlameIcon /> {user.streak}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
