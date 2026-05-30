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
    ctaPractice: string;
  };
}

export default function HeroSection({ nav, hero }: HeroSectionProps) {
  return (
    <section className="heroSection" id="hero">
      <nav className="heroTopNav">
        <a href="#hero">{nav.home}</a>
        <a href="#features">{nav.features}</a>
        <a href="#pricing">{nav.pricing}</a>
        <Link href="/auth/login">{nav.login}</Link>
      </nav>

      <div className="heroMain">
        <h1 className="heroTitle">{hero.title}</h1>
        
        <div className="heroPoemWrapper">
          <div className="heroPoemInner">
            <div className="heroPoemCol">Con<br/>tim<br/>sáng<br/>ngời</div>
            <div className="heroPoemCol">Đất<br/>tập<br/>chỉ<br/>hướng</div>
            <div className="heroPoemCol">Bút<br/>viết<br/>cỏ<br/>cây</div>
            <div className="heroPoemCol">Tạo<br/>nên<br/>dáng<br/>vóc</div>
          </div>
          <div className="heroSeal">
            Hán<br/>Tự
          </div>
        </div>

        <Link className="heroCta" href="/practice">
          {hero.ctaPractice}
        </Link>
      </div>
    </section>
  );
}
