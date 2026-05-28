import { getTranslations, setRequestLocale } from "next-intl/server";
import GoogleLoginButton from "@/components/Auth/GoogleLoginButton";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";
import ThemeToggle from "@/components/Layout/ThemeToggle";
import { Link } from "@/i18n/navigation";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");

  return (
    <main className="authPage">
      <div className="authHeader">
        <Link className="brand" href="/">
          汉字 Hanzi
        </Link>
        <div className="authUtilities">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <section className="authCard">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <GoogleLoginButton />
      </section>
    </main>
  );
}
