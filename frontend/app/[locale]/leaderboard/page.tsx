import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AccountActions from "@/components/Auth/AccountActions";
import LeaderboardContent from "./LeaderboardContent";
import styles from "./leaderboard.module.css";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="practicePage">
      <header className="pageHeader">
        <Link className="brand" href="/">
          汉字 Hanzi
        </Link>
        <div>
          <h1>Xếp hạng</h1>
        </div>
        <div className="headerActions">
          <AccountActions />
        </div>
      </header>

      <LeaderboardContent />
    </main>
  );
}
