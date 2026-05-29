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

      <header className="newHeroHeader">
        <nav className="newHeroNav">
          <a href="#hero">{nav.home}</a>
          <a href="#features">{nav.features}</a>
          <a href="#pricing">{nav.pricing}</a>
          <Link href="/auth/login">{nav.login}</Link>
          <Link href="/auth/login">{nav.register}</Link>
        </nav>
        
        <div className="newHeroLang">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="newHeroContent">
        <h1 className="newHeroTitle">
          {hero.title.split(' ').map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </h1>
      </div>
    </section>
  );
}
