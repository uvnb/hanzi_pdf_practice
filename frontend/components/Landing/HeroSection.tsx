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
    ctaPractice: string;
  };
  poem: {
    col1: string[];
    col2: string[];
    col3: string[];
    col4: string[];
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

        {/* ── Poem box (4 vertical columns, read right→left) ── */}
        <div className="heroPoemWrapper">
          <div className="heroPoemInner">
            {[poem.col4, poem.col3, poem.col2, poem.col1].map((col, i) => (
              <div className="heroPoemCol" key={i}>
                {col.map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="heroSeal" aria-hidden="true">
            <span>漢</span>
            <span>字</span>
          </div>
        </div>

        <Link className="heroCta" href="/practice">
          {hero.ctaPractice}
        </Link>
      </div>
    </section>
  );
}
