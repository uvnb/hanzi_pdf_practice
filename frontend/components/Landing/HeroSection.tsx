import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";

interface HeroSectionProps {
  nav: {
    home: string;
    features: string;
    pricing: string;
    login: string;
    register: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPractice: string;
    ctaCourses: string;
  };
}

export default function HeroSection({ nav, hero }: HeroSectionProps) {
  return (
    <section className="heroSection" id="hero">
      <aside className="heroSidebar" aria-label="Quick links"></aside>

      <div className="heroMain">
        <nav className="heroTopNav">
          <a href="#hero">{nav.home}</a>
          <a href="#features">{nav.features}</a>
          <a href="#pricing">{nav.pricing}</a>
          <Link href="/auth/login">{nav.login}</Link>
          <Link href="/auth/login">{nav.register}</Link>
        </nav>
        <div className="heroLang">
          <LanguageSwitcher />
        </div>

        <h1 className="heroTitle">{hero.title}</h1>
        <p className="heroSubtitle">{hero.subtitle}</p>

        <div className="heroCtas">
          <Link className="heroCta" href="/practice">
            {hero.ctaPractice}
          </Link>
          <a className="heroCta" href="#features">
            {hero.ctaCourses}
          </a>
        </div>
      </div>

      <div className="heroArt">
        <Image
          alt="Traditional Chinese magnolia painting"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          src="/landing/magnolia.png"
        />
      </div>
    </section>
  );
}
