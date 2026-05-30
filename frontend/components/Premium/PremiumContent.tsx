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
    <div className="landing">
      <PricingSection title={t("pricingTitle")} tiers={tiers} />
    </div>
  );
}
