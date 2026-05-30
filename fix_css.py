import re

with open('frontend/app/landing.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove old hero css
css = re.sub(r'/\* ===========================\s+HERO SECTION\s+=========================== \*/.*?/\* ===========================\s+FEATURES SECTION', '/* ===========================\n   FEATURES SECTION', css, flags=re.DOTALL)

# 2. Clean media queries. Since I just want to clean old hero queries, I'll regex just inside @media blocks.
# Actually, I can just find `@media (max-width: 1024px) { ... }` and remove the hero-related inner blocks.
def remove_hero_from_media(m):
    block = m.group(0)
    block = re.sub(r'\s*\.heroSection\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroSidebar\s*a\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroSidebar\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroMain\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroTopNav\s*a\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroTopNav\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroArt\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroCtas\s*\{[^}]+\}', '', block)
    block = re.sub(r'\s*\.heroCta\s*\{[^}]+\}', '', block)
    return block

css = re.sub(r'@media[^{]+\{(?:[^{}]*\{[^{}]*\}[^{}]*)*\}', remove_hero_from_media, css)

new_hero_css = """/* ===========================
   HERO SECTION
   =========================== */
.heroSection {
  background-image: url('/landing/hero-bg.jpeg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.heroTopNav {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 40px 20px;
  position: relative;
  z-index: 10;
}

.heroTopNav a {
  color: #000;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.heroTopNav a:first-child,
.heroTopNav a:hover {
  color: #c1272d;
}

.heroMain {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 60px;
  position: relative;
  z-index: 10;
}

.heroTitle {
  font-family: var(--font-chinese-brush);
  font-size: clamp(60px, 12vw, 150px);
  color: #000;
  margin: 0 0 20px;
  line-height: 1.1;
  text-align: center;
  text-shadow: 2px 2px 10px rgba(255,255,255,0.7);
}

.heroPoemWrapper {
  border: 1px solid rgba(0, 0, 0, 0.4);
  padding: 6px;
  margin-bottom: 40px;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
}

.heroPoemInner {
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 30px 50px;
  display: flex;
  flex-direction: row-reverse;
  gap: 30px;
}

.heroPoemCol {
  writing-mode: vertical-rl;
  font-family: var(--font-chinese-brush);
  font-size: 26px;
  color: #000;
  line-height: 1.8;
  letter-spacing: 0.2em;
}

.heroSeal {
  position: absolute;
  bottom: 12px;
  left: 12px;
  border: 2px solid #c1272d;
  color: #c1272d;
  font-family: var(--font-chinese-brush);
  padding: 4px;
  font-size: 16px;
  writing-mode: vertical-rl;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
}

.heroCta {
  background-color: #c1272d;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 18px 48px;
  font-size: 20px;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.15s;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(193, 39, 45, 0.4);
}

.heroCta:hover {
  background-color: #9e1f24;
  transform: translateY(-2px);
}

"""

css = css.replace('/* ===========================\n   FEATURES SECTION', new_hero_css + '/* ===========================\n   FEATURES SECTION')

with open('frontend/app/landing.css', 'w', encoding='utf-8') as f:
    f.write(css)

