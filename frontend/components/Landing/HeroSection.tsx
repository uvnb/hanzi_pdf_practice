import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface HeroSectionProps {
  nav: {
    home: string;
    features: string;
    pricing: string;
    notebook: string;
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

export default function HeroSection({ nav, hero, sidebar }: HeroSectionProps) {
  return (
    <section className="heroSection" id="hero">
      <aside className="heroSidebar" aria-label="Quick links">
        <a href="#hero">{sidebar.home}</a>
        <a href="#features">{sidebar.courses}</a>
        <a href="#features">{sidebar.practice}</a>
        <a href="#pricing">{sidebar.community}</a>
        <a href="#footer">{sidebar.about}</a>
      </aside>

      <div className="heroMain">
        <nav className="heroTopNav">
          <a href="#hero">{nav.home}</a>
          <a href="#features">{nav.features}</a>
          <a href="#pricing">{nav.pricing}</a>
          <Link href="/notebook">{nav.notebook}</Link>
          <Link href="/auth/login">{nav.login}</Link>
          <Link href="/auth/login">{nav.register}</Link>
        </nav>

        <h1 className="heroTitle">{hero.title}</h1>
        <p className="heroSubtitle">{hero.subtitle}</p>

        <div className="heroCtas">
          <Link className="heroCta" href="/practice">
            {hero.ctaPractice}
          </Link>
          <Link className="heroCta" href="/pdf">
            {hero.ctaCourses}
          </Link>
        </div>
      </div>

      <div className="heroArt">
        <Image
          alt="Traditional Chinese magnolia painting"
          height={1200}
          priority
          src="/landing/magnolia.png"
          width={800}
        />
      </div>
    </section>
  );
}
