import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
  moreLabel: string;
}

export default function FeaturesSection({
  title,
  subtitle,
  features,
  moreLabel,
}: FeaturesSectionProps) {

  return (
    <section className="featuresSection" id="features">
      <h2 className="featuresTitle">{title}</h2>
      <p className="featuresSubtitle">{subtitle}</p>

      <div className="featuresGrid">
        {features.map((feature) => (
          <article className="featureCard" key={feature.title}>
            <Image
              alt={feature.title}
              height={210}
              src={feature.icon}
              width={250}
            />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>

      <a className="featuresMore" href="#pricing">
        {moreLabel}
      </a>
    </section>
  );
}
