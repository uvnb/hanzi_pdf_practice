import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AccountActions from "@/components/Auth/AccountActions";
import PdfBuilder from "@/components/PdfBuilder/PdfBuilder";
import { Link } from "@/i18n/navigation";

export default async function PdfPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pdf");

  return (
    <main className="pdfPage">
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
      <Suspense fallback={<p className="emptyState">{t("preparing")}</p>}>
        <PdfBuilder />
      </Suspense>
    </main>
  );
}
