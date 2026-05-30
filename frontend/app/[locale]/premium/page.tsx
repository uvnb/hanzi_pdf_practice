import { setRequestLocale } from "next-intl/server";
import AccountActions from "@/components/Auth/AccountActions";
import { Link } from "@/i18n/navigation";
import PremiumContent from "@/components/Premium/PremiumContent";

export default async function PremiumPage({
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
          <p className="eyebrow">Upgrade</p>
          <h1>Nâng cấp tài khoản</h1>
        </div>
        <div className="headerActions">
          <AccountActions />
        </div>
      </header>
      
      <div style={{ maxWidth: "1200px", margin: "40px auto", width: "100%", padding: "0 24px" }}>
        <PremiumContent />
      </div>
    </main>
  );
}
