import { setRequestLocale } from "next-intl/server";
import AccountActions from "@/components/Auth/AccountActions";
import { Link } from "@/i18n/navigation";
import TermsContent from "@/components/Terms/TermsContent";

export default async function TermsPage({
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
          <h1>Chính sách sử dụng</h1>
        </div>
        <div className="headerActions">
          <AccountActions />
        </div>
      </header>
      
      <div style={{ maxWidth: "800px", margin: "40px auto", width: "100%", padding: "0 24px" }}>
        <TermsContent />
      </div>
    </main>
  );
}
