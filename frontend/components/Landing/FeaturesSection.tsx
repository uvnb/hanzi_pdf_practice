import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface FeaturesSectionProps {
  nav: {
    home: { label: string; emoji: string };
    practice: { label: string; emoji: string };
    pdf: { label: string; emoji: string };
    login: { label: string; emoji: string };
  };
  title: string;
  subtitle: string;
  features: FeatureItem[];
  moreLabel: string;
}

export default function FeaturesSection({
  nav,
  title,
  subtitle,
  features,
  moreLabel,
}: FeaturesSectionProps) {
  const navItems = [
    { ...nav.home, href: "/" },
    { ...nav.practice, href: "/practice" },
    { ...nav.pdf, href: "/pdf" },
    { ...nav.login, href: "/auth/login" },
  ];

  return (
    <section className="featuresSection" id="features">
      <nav className="featuresNav">
        {navItems.map((item) => (
          <Link className="featuresNavItem" href={item.href} key={item.href}>
            <span className="featuresNavIcon">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="featuresTitle">{title}</h2>
      <p className="featuresSubtitle">{subtitle}</p>

      <div className="featuresGrid">
        {features.map((feature) => (
          <article className="featureCard" key={feature.title}>
            <Image
              alt={feature.title}
              height={150}
              src={feature.icon}
              width={150}
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
