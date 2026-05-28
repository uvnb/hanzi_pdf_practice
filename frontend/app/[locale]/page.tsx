import { getTranslations, setRequestLocale } from "next-intl/server";
import AccountActions from "@/components/Auth/AccountActions";
import { Link } from "@/i18n/navigation";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const nav = await getTranslations("Nav");

  return (
    <main className="home">
      <nav className="nav">
        <span className="brand">汉字 Hanzi</span>
        <div className="navActions">
          <Link className="navLink" href="/practice">
            {nav("practice")}
          </Link>
          <Link className="navLink" href="/pdf">
            {nav("pdf")}
          </Link>
          <AccountActions />
        </div>
      </nav>
      <section className="hero">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="lede">{t("lede")}</p>
        <div className="heroActions">
          <Link className="primaryButton" href="/practice">
            {t("start")}
          </Link>
          <Link className="secondaryLink" href="/pdf">
            {t("pdf")}
          </Link>
        </div>
      </section>
    </main>
  );
}
