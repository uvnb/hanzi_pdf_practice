import { useTranslations } from "next-intl";
import PricingSection from "@/components/Landing/PricingSection";
import "@/app/landing.css";

export default function PremiumContent() {
  const t = useTranslations("Landing");

  const tiers = [
    {
      name: t("tierFree"),
      price: t("tierFreePrice"),
      period: t("tierFreePeriod"),
      features: [t("tierFreeF1"), t("tierFreeF2")],
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
  ];

  return (
    <div className="landing premium-override">
      <style dangerouslySetInnerHTML={{ __html: `
        .landing.premium-override {
          background: transparent !important;
          color: var(--ink) !important;
        }
        .landing.premium-override .pricingSection {
          background: transparent !important;
          padding: 20px 0;
        }
        .landing.premium-override .pricingCard {
          background: var(--paper) !important;
          border-color: var(--line) !important;
        }
        .landing.premium-override .pricingTitle {
          color: var(--ink) !important;
        }
        .landing.premium-override .pricingTier,
        .landing.premium-override .pricingAmount,
        .landing.premium-override .pricingFeatures li {
          color: var(--ink) !important;
        }
        .landing.premium-override .pricingAmount span {
          color: var(--ink) !important;
          opacity: 0.6;
        }
        .landing.premium-override .pricingCta {
          color: var(--ink) !important;
          border-color: var(--line) !important;
        }
        .landing.premium-override .pricingCta:hover {
          background: var(--line) !important;
        }
      `}} />
      <PricingSection title={t("pricingTitle")} tiers={tiers} />
    </div>
  );
}
