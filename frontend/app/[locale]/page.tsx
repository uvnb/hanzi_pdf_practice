import { getTranslations, setRequestLocale } from "next-intl/server";
import HeroSection from "@/components/Landing/HeroSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import PricingSection from "@/components/Landing/PricingSection";
import LandingFooter from "@/components/Landing/LandingFooter";
import "../landing.css";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Landing");

  return (
    <div className="landing">
      <HeroSection
        hero={{
          title: t("heroTitle"),
        }}
        nav={{
          home: t("navHome"),
          practice: t("navPractice"),
          pdf: t("navPdf"),
          login: t("navLogin"),
        }}
        poem={{
          title: "齐静春",
          lines: [
            "遇事不决",
            "可问春风",
            "春风不语",
            "即随本心"
          ]
        }}
      />

      <FeaturesSection
        features={[
          {
            icon: "/landing/icon-1.png",
            title: t("featPractice"),
            description: t("featPracticeDesc"),
            href: "/practice",
          },
          {
            icon: "/landing/icon-2.png",
            title: t("featEtymology"),
            description: t("featEtymologyDesc"),
            href: "/practice",
          },
          {
            icon: "/landing/icon-3.png",
            title: t("featPdf"),
            description: t("featPdfDesc"),
            href: "/pdf",
          },
        ]}
        moreLabel={t("learnMore")}
        subtitle={t("featuresSubtitle")}
        title={t("featuresTitle")}
      />

      <PricingSection
        tiers={[
          {
            name: t("tierFree"),
            price: t("tierFreePrice"),
            period: t("tierFreePeriod"),
            features: [t("tierFreeF1"), t("tierFreeF2"), t("tierFreeF3")],
            cta: t("tierFreeCta"),
          },
          {
            name: t("tierPro"),
            price: t("tierProPrice"),
            period: t("tierProPeriod"),
            features: [t("tierProF1"), t("tierProF2"), t("tierProF3")],
            cta: t("tierProCta"),
          },
          {
            name: t("tierMaster"),
            price: t("tierMasterPrice"),
            period: t("tierMasterPeriod"),
            features: [t("tierMasterF1"), t("tierMasterF2"), t("tierMasterF3")],
            cta: t("tierMasterCta"),
          },
        ]}
        title={t("pricingTitle")}
      />

      <LandingFooter
        brand={t("footerBrand")}
        copyright={t("footerCopy")}
      />
    </div>
  );
}
