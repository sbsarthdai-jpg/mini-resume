/* global React, ReactDOM */
/* global Hero, ProfileSection, AboutSection, QnASection, CommentsSection, ContactSection */
/* global Marquee, TweaksPanel, TweakSection, TweakText, TweakColor, TweakToggle, useTweaks */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "displayName": "MINI",
  "fullName": "김미니 (MINI)",
  "role": "Motion Graphic Designer",
  "tagline": "통통 튀는 모션과 5년의 손맛으로 이야기를 움직이게 합니다.",
  "primary": "#BB1616",
  "showApples": true,
  "showMarquee": true
}/*EDITMODE-END*/;

function AppWrapper() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty('--red', t.primary);
    document.title = `${t.fullName} — ${t.role}`;
    document.body.classList.toggle('no-apples', !t.showApples);
  }, [t.primary, t.fullName, t.role, t.showApples]);

  const dn = (t.displayName || 'MINI').toUpperCase();
  const marqueeItems = [
    `${dn}'S ABOUT ME`,
    `${t.role.toUpperCase()}`,
    'OPEN FOR PROJECTS',
    '5 YEARS · 1827 DAYS',
    `${dn} · MOTION`,
    'SEOUL → WORLD',
  ];

  return (
    <div className="page">
      <Hero displayName={t.displayName} tagline={t.tagline} />

      <ProfileSection />

      {t.showMarquee && <Marquee items={marqueeItems} />}

      <AboutSection />

      {t.showMarquee && <Marquee items={marqueeItems} reverse />}

      <QnASection />

      <CommentsSection />

      <ContactSection />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Identity">
          <TweakText label="Display Name" value={t.displayName} onChange={(v) => setTweak('displayName', v)} />
          <TweakText label="Full Name" value={t.fullName} onChange={(v) => setTweak('fullName', v)} />
          <TweakText label="Role" value={t.role} onChange={(v) => setTweak('role', v)} />
          <TweakText label="Hero Tagline" value={t.tagline} onChange={(v) => setTweak('tagline', v)} />
        </TweakSection>
        <TweakSection title="Style">
          <TweakColor
            label="Primary Red"
            value={t.primary}
            onChange={(v) => setTweak('primary', v)}
            options={['#BB1616', '#D81F26', '#E84A3A', '#B0181E', '#2A6FDB', '#1F8A5B']}
          />
          <TweakToggle label="Apple Decorations" value={t.showApples} onChange={(v) => setTweak('showApples', v)} />
          <TweakToggle label="Red Marquee" value={t.showMarquee} onChange={(v) => setTweak('showMarquee', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppWrapper />);
