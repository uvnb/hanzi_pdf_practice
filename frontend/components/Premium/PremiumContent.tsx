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
    <div className="premium-override">
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-override {
          --font-brush: "ThuPhapScript", "ThuPhap", "Dancing Script", "Merienda", "Noto Serif SC", cursive;
          --premium-text: var(--ink);
          --premium-border: var(--line);
          --premium-bg: var(--paper);
          --premium-accent: var(--accent);
        }
        .premium-override .pricingSection {
          background: transparent !important;
          padding: 20px 0 !important;
        }
        .premium-override .pricingCard {
          background: var(--premium-bg) !important;
          border: 1px solid var(--premium-border) !important;
          box-shadow: none !important;
          color: var(--premium-text) !important;
        }
        .premium-override .pricingCard * {
          color: var(--premium-text) !important;
        }
        .premium-override .pricingTitle {
          color: var(--premium-text) !important;
        }
        .premium-override .pricingAmount {
          color: var(--premium-accent) !important;
        }
        .premium-override .pricingAmount span {
          color: var(--premium-text) !important;
          opacity: 0.7 !important;
        }
        .premium-override .pricingFeatures li::before {
          color: var(--premium-accent) !important;
        }
        .premium-override .pricingCta {
          color: var(--premium-text) !important;
          border: 1px solid var(--premium-border) !important;
          background: transparent !important;
        }
        .premium-override .pricingCta:hover {
          background: var(--premium-border) !important;
        }
      `}} />
      <PricingSection title={t("pricingTitle")} tiers={tiers} />
    </div>
  );
}
