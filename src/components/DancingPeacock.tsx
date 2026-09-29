import { useEffect, useRef, useState } from 'react';

export default function DancingPeacock() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const [dancing, setDancing] = useState(false);
  const rafRef = useRef<number>(0);
  const danceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      });
    };
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
      if (danceTimer.current) clearTimeout(danceTimer.current);
    };
  }, []);

  const triggerDance = () => {
    setDancing(true);
    if (danceTimer.current) clearTimeout(danceTimer.current);
    danceTimer.current = setTimeout(() => setDancing(false), 3000);
  };

  const tiltX = (mouse.y - 0.5) * 12;
  const tiltY = (mouse.x - 0.5) * 18;
  const parallax = scrollY * 0.12;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Soft glow behind peacock */}
      <div
        className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087f83]/8 blur-[100px] pointer-events-none"
        style={{ transform: `translate(-50%, calc(-50% + ${parallax}px))` }}
      />

      {/* Dancing peacock SVG — click to make it dance */}
      <div
        className="absolute left-1/2 top-1/2 cursor-pointer"
        onClick={triggerDance}
        role="button"
        tabIndex={-1}
        style={{
          transform: `translate(calc(-50% + ${tiltY * 3}px), calc(-50% + ${parallax + tiltX * 2}px)) ${dancing ? 'scale(1.08)' : ''}`,
          width: 'min(90vw, 900px)',
          height: 'min(90vw, 900px)',
          opacity: dancing ? 0.22 : 0.13,
          transition: 'opacity .4s ease, transform .4s ease',
        }}
      >
        <PeacockSVG dancing={dancing} />
      </div>

      {/* Trailing feathers — left */}
      <div
        className="absolute bottom-[-8%] left-[-6%] pointer-events-none"
        style={{
          transform: `rotate(-20deg) translateY(${parallax * 0.3}px)`,
          width: 'min(40vw, 380px)',
          opacity: 0.07,
        }}
      >
        <PeacockFeatherSVG />
      </div>

      {/* Trailing feathers — right */}
      <div
        className="absolute bottom-[-5%] right-[-6%] pointer-events-none"
        style={{
          transform: `rotate(15deg) translateY(${parallax * 0.25}px)`,
          width: 'min(44vw, 420px)',
          opacity: 0.06,
        }}
      >
        <PeacockFeatherSVG />
      </div>
    </div>
  );
}

function PeacockSVG({ dancing = false }: { dancing?: boolean }) {
  const fanAnim = dancing ? 'peacock-dance 0.8s ease-in-out infinite' : 'peacock-fan 6s ease-in-out infinite';
  const neckAnim = dancing ? 'peacock-neck-dance 0.6s ease-in-out infinite' : 'peacock-neck 4s ease-in-out infinite';
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Tail fan — animated spread */}
      <g style={{ transformOrigin: '200px 220px', animation: fanAnim }}>
        {[...Array(24)].map((_, i) => {
          const angle = (i - 11.5) * 7.2;
          const rad = (angle * Math.PI) / 180;
          const x1 = 200 + Math.cos(rad - Math.PI / 2) * 60;
          const y1 = 220 + Math.sin(rad - Math.PI / 2) * 60;
          const x2 = 200 + Math.cos(rad - Math.PI / 2) * 175;
          const y2 = 220 + Math.sin(rad - Math.PI / 2) * 175;
          return (
            <g key={i} style={{ animation: `feather-sway 5s ease-in-out ${i * 0.08}s infinite`, transformOrigin: `${x1}px ${y1}px` }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#087f83" strokeWidth="2.5" strokeLinecap="round" />
              {/* Eye at tip */}
              <ellipse cx={x2} cy={y2} rx="14" ry="18" fill="#087f83" opacity="0.5" />
              <ellipse cx={x2} cy={y2} rx="9" ry="12" fill="#c38b2d" opacity="0.6" />
              <ellipse cx={x2} cy={y2} rx="5" ry="7" fill="#123c40" opacity="0.7" />
              <ellipse cx={x2 - 1.5} cy={y2 - 2} rx="2" ry="3" fill="#e5f1e8" opacity="0.5" />
            </g>
          );
        })}
      </g>

      {/* Body */}
      <ellipse cx="200" cy="230" rx="28" ry="48" fill="#087f83" opacity="0.35" />

      {/* Neck — animated sway */}
      <g style={{ transformOrigin: '200px 200px', animation: neckAnim }}>
        <path d="M200 200 Q195 170 205 140 Q210 120 200 100" stroke="#087f83" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* Head */}
        <circle cx="200" cy="95" r="13" fill="#087f83" opacity="0.45" />
        {/* Crest */}
        <g opacity="0.4">
          <line x1="200" y1="82" x2="197" y2="70" stroke="#c38b2d" strokeWidth="2" strokeLinecap="round" />
          <line x1="203" y1="82" x2="205" y2="68" stroke="#c38b2d" strokeWidth="2" strokeLinecap="round" />
          <line x1="200" y1="82" x2="201" y2="66" stroke="#c38b2d" strokeWidth="2" strokeLinecap="round" />
          <circle cx="197" cy="69" r="2.5" fill="#c38b2d" />
          <circle cx="205" cy="67" r="2.5" fill="#c38b2d" />
          <circle cx="201" cy="65" r="2.5" fill="#c38b2d" />
        </g>
        {/* Beak */}
        <path d="M213 95 L222 93 L213 98 Z" fill="#c38b2d" opacity="0.5" />
        {/* Eye */}
        <circle cx="206" cy="93" r="2.5" fill="#123c40" opacity="0.6" />
      </g>

      {/* Legs */}
      <line x1="192" y1="275" x2="188" y2="320" stroke="#b06e2c" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <line x1="208" y1="275" x2="212" y2="320" stroke="#b06e2c" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <g style={{ transformOrigin: '188px 320px', animation: 'peacock-step 3s ease-in-out infinite' }}>
        <line x1="188" y1="320" x2="180" y2="328" stroke="#b06e2c" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
        <line x1="188" y1="320" x2="196" y2="328" stroke="#b06e2c" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
      </g>
      <g style={{ transformOrigin: '212px 320px', animation: 'peacock-step 3s ease-in-out 1.5s infinite' }}>
        <line x1="212" y1="320" x2="204" y2="328" stroke="#b06e2c" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
        <line x1="212" y1="320" x2="220" y2="328" stroke="#b06e2c" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
      </g>
    </svg>
  );
}

function PeacockFeatherSVG() {
  return (
    <svg viewBox="0 0 100 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ animation: 'feather-sway 7s ease-in-out infinite' }}>
      <line x1="50" y1="290" x2="50" y2="80" stroke="#087f83" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="290" x2="45" y2="180" stroke="#087f83" strokeWidth="1.5" opacity="0.4" />
      <line x1="50" y1="290" x2="55" y2="180" stroke="#087f83" strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="50" cy="60" rx="28" ry="38" fill="#087f83" opacity="0.5" />
      <ellipse cx="50" cy="60" rx="20" ry="28" fill="#c38b2d" opacity="0.55" />
      <ellipse cx="50" cy="60" rx="12" ry="17" fill="#123c40" opacity="0.65" />
      <ellipse cx="47" cy="55" rx="5" ry="7" fill="#e5f1e8" opacity="0.4" />
    </svg>
  );
}
