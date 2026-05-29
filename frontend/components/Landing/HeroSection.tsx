import Image from "next/image";
import { Link } from "@/i18n/navigation";

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
  sidebar: {
    home: string;
    courses: string;
    practice: string;
    community: string;
    about: string;
  };
}

export default function HeroSection({ nav, hero }: HeroSectionProps) {
  return (
    <section className="newHeroSection" id="hero">
      <div className="newHeroBg">
        <Image
          alt="Traditional classical painting"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "left center" }}
          src="/landing/new-hero-bg.png"
        />
      </div>

      <nav className="newHeroNav">
        <a href="#hero">{nav.home}</a>
        <a href="#features">{nav.features}</a>
        <a href="#pricing">{nav.pricing}</a>
        <Link href="/auth/login">{nav.login}</Link>
        <Link href="/auth/login">{nav.register}</Link>
      </nav>

      <div className="newHeroContent">
        <h1 className="newHeroTitle">{hero.title}</h1>
        
        <div className="newHeroSubtitleCol">
          <p className="newHeroSubtitle">{hero.subtitle}</p>
        </div>

        <div className="newHeroCtas">
          <Link className="newHeroCta" href="/practice">
            {hero.ctaPractice}
          </Link>
          <a className="newHeroCtaSecondary" href="#features">
            {hero.ctaCourses}
          </a>
        </div>
      </div>
    </section>
  );
}
