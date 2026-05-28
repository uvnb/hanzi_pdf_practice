"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="utilityControl">
      <span className="srOnly">{t("language")}</span>
      <select
        aria-label={t("language")}
        onChange={(event) =>
          router.replace(`${pathname}${window.location.search}`, {
            locale: event.target.value as "vi" | "en" | "zh",
          })
        }
        value={locale}
      >
        <option value="vi">VI</option>
        <option value="en">EN</option>
        <option value="zh">中文</option>
      </select>
    </label>
  );
}
