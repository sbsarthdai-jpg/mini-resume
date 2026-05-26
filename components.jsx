/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   Reusable: Magnet — magnetic mouse follow effect
============================================================ */
function Magnet({ children, strength = 4, padding = 120, className = '' }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      const el = wrapRef.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const limit = Math.max(rect.width, rect.height) / 2 + padding;
      if (dist < limit) {
        setActive(true);
        inner.style.transition = 'transform 0.3s ease-out';
        inner.style.transform = `translate3d(${dx / strength}px, ${dy / strength}px, 0)`;
      } else if (active) {
        setActive(false);
        inner.style.transition = 'transform 0.6s cubic-bezier(.2,.7,.3,1)';
        inner.style.transform = 'translate3d(0,0,0)';
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [active, padding, strength]);

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', height: '100%' }}>
      <div ref={innerRef} style={{ willChange: 'transform', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   FadeIn — scroll-triggered translate + fade
============================================================ */
function FadeIn({ children, delay = 0, y = 30, x = 0, duration = 700, as = 'div', className = '', style = {} }) {
  // Preview iframes throttle Web Animations and CSS transitions to 0,
  // which would freeze any "fade in from below" mid-animation. We attempt
  // the animation only when the document is visible and verify it actually
  // advances; otherwise the element stays in its natural visible state.
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || document.hidden) return;
    let played = false;
    const play = () => {
      if (played || !el.isConnected) return;
      played = true;
      try {
        const anim = el.animate(
          [
            { opacity: 0, transform: `translate(${x}px, ${y}px)` },
            { opacity: 1, transform: 'translate(0,0)' },
          ],
          { duration, delay, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'none' }
        );
        // Safety: if the iframe is throttled, the animation never advances.
        // After 1.5× total runtime, force-finish so the element can't stay hidden.
        setTimeout(() => { try { anim.finish(); } catch (e) {} }, (duration + delay) * 1.5);
      } catch (e) { /* element stays at its natural visible state */ }
    };
    const tryPlay = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40 && r.bottom > 0) play();
    };
    const t = setTimeout(tryPlay, 30);
    window.addEventListener('scroll', tryPlay, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', tryPlay); };
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/* ============================================================
   ScrollFadeText — char-by-char scroll-driven opacity
============================================================ */
function ScrollFadeText({ text, className = '' }) {
  const ref = useRef(null);
  const charRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when bottom of paragraph is at 80% viewport, 1 when top at 20%
      const start = vh * 0.85;
      const end = vh * 0.15;
      const total = start - end;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / total));
      const n = charRefs.current.length;
      charRefs.current.forEach((node, i) => {
        if (!node) return;
        const charProgress = Math.min(1, Math.max(0, progress * n - i + 1));
        node.style.opacity = 0.35 + 0.65 * charProgress;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          ref={(el) => (charRefs.current[i] = el)}
          style={{ opacity: 0.35, transition: 'opacity 0.3s ease' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </p>
  );
}

/* ============================================================
   StickyCard — about me sticky card with scale stacking
============================================================ */
function StickyCard({ index, total, offsetTop = 80, gap = 24, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const stickPoint = offsetTop;
      // when the next card pushes this one up, scale down
      // approximate progress: 0 when card is at sticky position, 1 when next card has fully arrived
      const cardHeight = el.offsetHeight;
      const distAfterStick = stickPoint - rect.top;
      const progress = Math.min(1, Math.max(0, distAfterStick / cardHeight));
      const remaining = total - 1 - index;
      const targetScale = 1 - remaining * 0.03;
      const scale = 1 - progress * (1 - targetScale);
      const opacity = 1 - progress * 0.15;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = opacity;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [index, total, offsetTop]);

  return (
    <div
      ref={ref}
      className="about-card"
      style={{
        top: `${offsetTop + index * 16}px`,
        marginBottom: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Image placeholder
============================================================ */
function ImgPh({ tone = '', label, style }) {
  return (
    <div className={`imgph ${tone}`} style={style}>
      <span className="label">{label}</span>
    </div>
  );
}

/* ============================================================
   Marquee
============================================================ */
function Marquee({ items, reverse = false }) {
  const row = (
    <span className="row">
      {items.map((t, i) => (
        <React.Fragment key={i}>
          <span>{t}</span>
          <span className="dot"></span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className={`marquee ${reverse ? 'reverse' : ''}`}>
      <div className="track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ============================================================
   AppleDecor — CSS apple
============================================================ */
function Apple({ style, soft = false }) {
  return (
    <div className={`apple ${soft ? 'soft' : ''}`} style={style}>
      <div className="stem"></div>
      <div className="leaf"></div>
      <div className="body"></div>
      <div className="shine"></div>
    </div>
  );
}

window.Magnet = Magnet;
window.FadeIn = FadeIn;
window.ScrollFadeText = ScrollFadeText;
window.StickyCard = StickyCard;
window.ImgPh = ImgPh;
window.Marquee = Marquee;
window.Apple = Apple;
