interface LandingFooterProps {
  brand: string;
  privacy: string;
  terms: string;
  copyright: string;
}

export default function LandingFooter({
  brand,
  privacy,
  terms,
  copyright,
}: LandingFooterProps) {
  return (
    <footer className="landingFooter" id="footer">
      <p className="footerBrand">{brand}</p>

      <div className="footerLinks">
        <a href="#">{privacy}</a>
        <a href="#">{terms}</a>
      </div>

      <div className="footerSocials">
        <a
          aria-label="Facebook"
          href="https://facebook.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          ⓕ
        </a>
        <a
          aria-label="Instagram"
          href="https://instagram.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          ⓘ
        </a>
        <a
          aria-label="YouTube"
          href="https://youtube.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          ▶
        </a>
      </div>

      <p className="footerCopy">{copyright}</p>
    </footer>
  );
}
