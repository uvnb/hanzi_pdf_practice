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
    col1: string[];
    col2: string[];
    col3: string[];
    col4: string[];
  };
}

export default function HeroSection({ nav, hero, poem }: HeroSectionProps) {
  /* Columns are rendered right-to-left as in traditional Chinese poetry */
  const columns = [poem.col1, poem.col2, poem.col3, poem.col4];

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
            {columns.map((col, i) => (
              <div className="heroPoemCol" key={i}>
                {col.map((word, j) => (
                  <span className="heroPoemWord" key={j}>{word}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="heroSeal" aria-hidden="true">
            <span>漢</span>
            <span>字</span>
          </div>
        </div>

      </div>
    </section>
  );
}
