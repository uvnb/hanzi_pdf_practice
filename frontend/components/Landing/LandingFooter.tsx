import { Link } from "@/i18n/navigation";

interface LandingFooterProps {
  brand: string;
  copyright: string;
}

export default function LandingFooter({
  brand,
  copyright,
}: LandingFooterProps) {
  return (
    <footer className="landingFooter" id="footer">
      <div className="footerGrid">
        <section className="footerIntro" aria-label="Brand">
          <p className="footerBrand">{brand}</p>
          <p className="footerDescription">
            Luyện viết chữ Hán, lưu sổ tay và tạo PDF luyện tập cá nhân.
          </p>
        </section>

        <section className="footerRoadmap" aria-labelledby="footerRoadmapTitle">
          <h2 id="footerRoadmapTitle">Lộ trình</h2>
          <Link href="/practice">Bắt đầu luyện viết</Link>
          <Link href="/pdf">Tạo phiếu PDF</Link>
          <Link href="/notebook">Sổ tay từ vựng</Link>
          <Link href="/auth/login">Đăng nhập</Link>
        </section>

        <section className="footerContact" aria-labelledby="footerContactTitle">
          <div className="footerContactHeading">
            <span aria-hidden="true">@</span>
            <h2 id="footerContactTitle">Liên hệ</h2>
          </div>
          <a
            className="footerContactItem"
            href="https://www.facebook.com/share/18xtxAzeQa/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span aria-hidden="true">f</span>
            Quan Vu
          </a>
          <a
            className="footerContactItem"
            href="mailto:vnquan.hust.2006.03@gmail.com"
          >
            <span aria-hidden="true">@</span>
            vnquan.hust.2006.03@gmail.com
          </a>
          <p className="footerContactItem">
            <span aria-hidden="true">⌂</span>
            Hai Bà Trưng, Hà Nội
          </p>
        </section>
      </div>

      <p className="footerCopy">{copyright}</p>
    </footer>
  );
}
