import re

with open('frontend/app/landing.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove old hero CSS from line 29 up to featuresSection
css = re.sub(r'/\* ===========================\s+HERO SECTION\s+=========================== \*/.*?(?=\/\* ===========================\s+FEATURES SECTION\s+=========================== \*/)', '', css, flags=re.DOTALL)

# Insert new Hero CSS
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
  font-size: 16px;
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
  font-size: clamp(60px, 8vw, 120px);
  color: #000;
  margin: 0 0 20px;
  line-height: 1.1;
  text-align: center;
}

.heroPoemWrapper {
  border: 1px solid rgba(0, 0, 0, 0.4);
  padding: 8px;
  margin-bottom: 40px;
  position: relative;
}

.heroPoemInner {
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 20px 40px;
  display: flex;
  flex-direction: row-reverse;
  gap: 30px;
}

.heroPoemCol {
  writing-mode: vertical-rl;
  font-family: var(--font-chinese-brush);
  font-size: 24px;
  color: #000;
  line-height: 1.5;
  letter-spacing: 0.1em;
}

.heroSeal {
  position: absolute;
  bottom: 12px;
  left: 12px;
  border: 2px solid #c1272d;
  color: #c1272d;
  font-family: var(--font-chinese-brush);
  padding: 4px;
  font-size: 14px;
  writing-mode: vertical-rl;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
}

.heroCta {
  background-color: #c1272d;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 16px 40px;
  font-size: 18px;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
}

.heroCta:hover {
  background-color: #9e1f24;
}

"""

# Prepend new hero CSS before FEATURES SECTION
css = css.replace('/* ===========================\n   FEATURES SECTION\n   =========================== */', new_hero_css + '/* ===========================\n   FEATURES SECTION\n   =========================== */')

# Remove hero media queries from tablet
css = re.sub(r'\s*\.heroSection \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroSidebar \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroSidebar a \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroMain \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroTopNav \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroTopNav a \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroArt \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroCtas \{[^}]+\}', '', css)
css = re.sub(r'\s*\.heroCta \{[^}]+\}', '', css)

# Re-add some media queries for the new hero section in the @media (max-width: 760px) and 1024px
new_media = """
  .heroNav {
    flex-wrap: wrap;
    gap: 20px;
  }
  .heroPoemInner {
    padding: 15px 20px;
    gap: 15px;
  }
  .heroPoemCol {
    font-size: 20px;
  }
"""

with open('frontend/app/landing.css', 'w', encoding='utf-8') as f:
    f.write(css)

