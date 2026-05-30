"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";
import ThemeToggle from "@/components/Layout/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";

export default function AccountActions() {
  const t = useTranslations("Nav");
  const { loading, logout, user } = useAuth();
  const pathname = usePathname();

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
        <button
          className="textButton"
          onClick={() => void logout().catch(() => undefined)}
          type="button"
        >
          {t("logout")}
        </button>
      ) : null}
      <LanguageSwitcher />
      <ThemeToggle />
    </>
  );
}
