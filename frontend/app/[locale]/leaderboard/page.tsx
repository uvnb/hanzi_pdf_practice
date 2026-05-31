import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AccountActions from "@/components/Auth/AccountActions";
import styles from "./leaderboard.module.css";

const LightningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const CardsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M2 14h20"/></svg>
);
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
);

const MOCK_TOP3 = [
  {
    id: 2,
    rank: 2,
    name: "Khánh Nguyễn Duy",
    avatar: "https://i.pravatar.cc/150?u=khanh",
    xp: "22.3k",
    cards: 1239,
    books: 66,
    isPremium: true,
  },
  {
    id: 1,
    rank: 1,
    name: "Tâm Phạm thủy minh",
    avatar: "https://i.pravatar.cc/150?u=tam",
    xp: "25.6k",
    cards: 66,
    books: 4,
    isPremium: false,
  },
  {
    id: 3,
    rank: 3,
    name: "Thuy Nguyen",
    avatar: "https://i.pravatar.cc/150?u=thuy",
    xp: "22.3k",
    cards: 1809,
    books: 38,
    isPremium: true,
  },
];

const MOCK_LIST = [
  { id: 4, rank: "04", name: "Nam Tran", avatar: "https://i.pravatar.cc/150?u=nam", xp: "21.8k", cards: 1124, isPremium: true },
  { id: 5, rank: "05", name: "Tài Tử", avatar: "https://i.pravatar.cc/150?u=tai", xp: "19.9k", cards: 608, isPremium: true },
  { id: 6, rank: "06", name: "Mỹ Duyên", avatar: "https://i.pravatar.cc/150?u=my", xp: "19.8k", cards: 3359, isPremium: true },
  { id: 7, rank: "07", name: "Phan Trọng Nhân", avatar: "https://i.pravatar.cc/150?u=phan", xp: "19.8k", cards: 6326, isPremium: true },
  { id: 8, rank: "08", name: "Hanh Nhu Luong", avatar: "https://i.pravatar.cc/150?u=hanh", xp: "18.2k", cards: 2198, isPremium: true },
  { id: 9, rank: "09", name: "Dung Ha", avatar: "https://i.pravatar.cc/150?u=dung", xp: "18.2k", cards: 1144, isPremium: true },
];

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={styles.container}>
      <header style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "1200px", marginBottom: "40px", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>
          汉字 Hanzi
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <AccountActions />
        </div>
      </header>

      <div className={styles.header}>
        <h1 className={styles.title}>Bảng xếp hạng</h1>
        <p className={styles.subtitle}>Top 10 chú ong chăm chỉ</p>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}><span style={{ color: "#fbbf24" }}><LightningIcon /></span> XP</div>
          <div className={styles.statItem}><CardsIcon /> Thẻ ghi nhớ</div>
          <div className={styles.statItem}><BookIcon /> Ngày lộ trình</div>
        </div>
      </div>

      <div className={styles.topThree}>
        {MOCK_TOP3.map((user) => (
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
              <div className={styles.xpText}><LightningIcon /> {user.xp} XP</div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}><CardsIcon /> {user.cards}</div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}><BookIcon /> {user.books}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.list}>
        {MOCK_LIST.map((user) => (
          <div key={user.id} className={styles.listItem}>
            <div className={styles.listRank}>{user.rank}</div>
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
              <div className={styles.listXp}><LightningIcon /> {user.xp} XP</div>
              <div className={styles.listCards}><CardsIcon /> {user.cards}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
