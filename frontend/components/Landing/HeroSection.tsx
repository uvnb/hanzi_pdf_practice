import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";

interface HeroSectionProps {
  nav: {
    home: string;
    practice: string;
    pdf: string;
    login: string;
  };
  hero: {
    title: string;
  };
  poem: {
    title: string;
    lines: string[];
  };
}

export default function HeroSection({ nav, hero, poem }: HeroSectionProps) {
  return (
    <section className="heroSection" id="hero">
      {/* ── Top navigation ── */}
      <nav className="heroTopNav">
        <div className="heroNavLinks">
          <a href="#hero" className="heroNavActive">{nav.home}</a>
          <Link href="/practice">{nav.practice}</Link>
          <Link href="/pdf">{nav.pdf}</Link>
          <Link href="/auth/login">{nav.login}</Link>
        </div>
        <div className="heroLang">
          <LanguageSwitcher />
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="heroMain">
        <h1 className="heroTitle">{hero.title}</h1>

        {/* ── Poem layout (Vertical text, right-to-left) ── */}
        <div className="heroPoemLayout">
          {/* Title on the far right */}
          <div className="heroPoemTitle">
            {poem.title}
          </div>

          {/* 4 columns of the poem */}
          <div className="heroPoemText">
            {poem.lines.map((line, i) => (
              <p className="heroPoemLine" key={i}>{line}</p>
            ))}
          </div>

          {/* Seal on the far left */}
          <div className="heroPoemAuthor">
            <div className="heroSeal" aria-hidden="true">
              <span>齊</span>
              <span>靜</span>
              <span>春</span>
              <span>印</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
