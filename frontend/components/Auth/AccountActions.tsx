"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";
import ThemeToggle from "@/components/Layout/ThemeToggle";
import { Link } from "@/i18n/navigation";

export default function AccountActions() {
  const t = useTranslations("Nav");
  const { loading, logout, user } = useAuth();

  return (
    <>
      {loading ? <span className="accountMuted">{t("loading")}</span> : null}
      {!loading && !user ? (
        <Link className="navLink" href="/auth/login">
          {t("login")}
        </Link>
      ) : null}
      {!loading && user ? (
        <>
          <Link className="navLink" href="/notebook">
            {t("notebook")}
          </Link>
          <button
            className="textButton"
            onClick={() => void logout().catch(() => undefined)}
            type="button"
          >
            {t("logout")}
          </button>
        </>
      ) : null}
      <LanguageSwitcher />
      <ThemeToggle />
    </>
  );
}
