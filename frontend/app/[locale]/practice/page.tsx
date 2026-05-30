import { getTranslations, setRequestLocale } from "next-intl/server";
import AccountActions from "@/components/Auth/AccountActions";
import HanziPracticeBoard from "@/components/HanziWriter/HanziPracticeBoard";
import { Link } from "@/i18n/navigation";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Practice");

  return (
    <main className="practicePage">
      <header className="pageHeader">
        <Link className="brand" href="/">
          汉字 Hanzi
        </Link>
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
        </div>
        <div className="headerActions">
          <AccountActions />
        </div>
      </header>
      <HanziPracticeBoard />
    </main>
  );
}
