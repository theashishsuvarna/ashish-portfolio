import React, { useMemo } from 'react';

interface CuttingMatSurfaceProps {
  width: number;
  height: number;
  className?: string;
}

export const CuttingMatSurface: React.FC<CuttingMatSurfaceProps> = ({
  width = 2700,
  height = 1700,
  className = '',
}) => {
  // Generate ruler tick marks and labels for extreme realism
  const { xTicks, yTicks, xLabels, yLabels } = useMemo(() => {
    const xt: { pos: number; type: 'small' | 'med' | 'large' }[] = [];
    const yt: { pos: number; type: 'small' | 'med' | 'large' }[] = [];
    const xl: { pos: number; num: number }[] = [];
    const yl: { pos: number; num: number }[] = [];

    // Horizontal ticks (from 40 to 2660)
    for (let x = 40; x <= 2660; x += 10) {
      const rel = x - 40;
      if (rel % 100 === 0) {
        xt.push({ pos: x, type: 'large' });
        if (rel > 0 && rel < 2620) {
          xl.push({ pos: x, num: rel / 10 });
        }
      } else if (rel % 50 === 0) {
        xt.push({ pos: x, type: 'med' });
      } else {
        xt.push({ pos: x, type: 'small' });
      }
    }

    // Vertical ticks (from 40 to 1660)
    for (let y = 40; y <= 1660; y += 10) {
      const rel = y - 40;
      if (rel % 100 === 0) {
        yt.push({ pos: y, type: 'large' });
        if (rel > 0 && rel < 1620) {
          yl.push({ pos: y, num: rel / 10 });
        }
      } else if (rel % 50 === 0) {
        yt.push({ pos: y, type: 'med' });
      } else {
        yt.push({ pos: y, type: 'small' });
      }
    }

    return { xTicks: xt, yTicks: yt, xLabels: xl, yLabels: yl };
  }, []);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none rounded-[12px] ${className}`}
      style={{
        backgroundColor: '#1b3827',
        backgroundImage: `
          radial-gradient(ellipse at 42% 35%, #254933 0%, #1e3d2a 50%, #162f20 100%)
        `,
      }}
    >
      {/* Real Self-Healing Vinyl Texture (faint matte micro-noise and rotary blade marks) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.28] mix-blend-overlay"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/scratches.png")`,
          backgroundSize: '300px 300px',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.20] mix-blend-soft-light"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")`,
          backgroundSize: '150px 150px',
        }}
      />

      {/* SVG Precision Measurement Grid & Printed Markings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Minor 10px grid pattern */}
          <pattern id="mat-grid-10" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(240, 248, 235, 0.04)" strokeWidth="0.75" />
          </pattern>

          {/* Medium 50px grid pattern */}
          <pattern id="mat-grid-50" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="url(#mat-grid-10)" />
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(240, 248, 235, 0.08)" strokeWidth="1" />
          </pattern>

          {/* Major 100px grid pattern with precision intersection crosses */}
          <pattern id="mat-grid-100" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#mat-grid-50)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(240, 248, 235, 0.17)" strokeWidth="1.2" />
            {/* Center + mark */}
            <path d="M 47 50 L 53 50 M 50 47 L 50 53" fill="none" stroke="rgba(240, 248, 235, 0.22)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Interior Grid Area (offset 40px from edges for ruler border) */}
        <rect x="40" y="40" width={width - 80} height={height - 80} fill="url(#mat-grid-100)" />

        {/* Ruler Boundary Frames */}
        <rect 
          x="40" 
          y="40" 
          width={width - 80} 
          height={height - 80} 
          fill="none" 
          stroke="rgba(240, 248, 235, 0.38)" 
          strokeWidth="1.5" 
        />
        <rect 
          x="35" 
          y="35" 
          width={width - 70} 
          height={height - 70} 
          fill="none" 
          stroke="rgba(240, 248, 235, 0.12)" 
          strokeWidth="0.8" 
        />

        {/* Top Ruler Ticks */}
        <g stroke="rgba(240, 248, 235, 0.35)" strokeWidth="1">
          {xTicks.map((t, i) => {
            const h = t.type === 'large' ? 14 : t.type === 'med' ? 8 : 4;
            return <line key={`xt-t-${i}`} x1={t.pos} y1={40} x2={t.pos} y2={40 - h} />;
          })}
        </g>

        {/* Bottom Ruler Ticks */}
        <g stroke="rgba(240, 248, 235, 0.35)" strokeWidth="1">
          {xTicks.map((t, i) => {
            const h = t.type === 'large' ? 14 : t.type === 'med' ? 8 : 4;
            return <line key={`xt-b-${i}`} x1={t.pos} y1={height - 40} x2={t.pos} y2={height - 40 + h} />;
          })}
        </g>

        {/* Left Ruler Ticks */}
        <g stroke="rgba(240, 248, 235, 0.35)" strokeWidth="1">
          {yTicks.map((t, i) => {
            const w = t.type === 'large' ? 14 : t.type === 'med' ? 8 : 4;
            return <line key={`yt-l-${i}`} x1={40} y1={t.pos} x2={40 - w} y2={t.pos} />;
          })}
        </g>

        {/* Right Ruler Ticks */}
        <g stroke="rgba(240, 248, 235, 0.35)" strokeWidth="1">
          {yTicks.map((t, i) => {
            const w = t.type === 'large' ? 14 : t.type === 'med' ? 8 : 4;
            return <line key={`yt-r-${i}`} x1={width - 40} y1={t.pos} x2={width - 40 + w} y2={t.pos} />;
          })}
        </g>

        {/* Top Ruler Numbers */}
        <g fill="rgba(240, 248, 235, 0.42)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" fontWeight="600" textAnchor="middle">
          {xLabels.map((l) => (
            <text key={`xl-t-${l.pos}`} x={l.pos} y={22}>{l.num}</text>
          ))}
        </g>

        {/* Bottom Ruler Numbers */}
        <g fill="rgba(240, 248, 235, 0.42)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" fontWeight="600" textAnchor="middle">
          {xLabels.map((l) => (
            <text key={`xl-b-${l.pos}`} x={l.pos} y={height - 14}>{l.num}</text>
          ))}
        </g>

        {/* Left Ruler Numbers */}
        <g fill="rgba(240, 248, 235, 0.42)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" fontWeight="600" textAnchor="middle">
          {yLabels.map((l) => (
            <text key={`yl-l-${l.pos}`} x={20} y={l.pos + 3.5}>{l.num}</text>
          ))}
        </g>

        {/* Right Ruler Numbers */}
        <g fill="rgba(240, 248, 235, 0.42)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" fontWeight="600" textAnchor="middle">
          {yLabels.map((l) => (
            <text key={`yl-r-${l.pos}`} x={width - 20} y={l.pos + 3.5}>{l.num}</text>
          ))}
        </g>

        {/* Authentic 45°, 30°, 60° Precision Angle Guides (subtle dashed lines) */}
        <g stroke="rgba(240, 248, 235, 0.13)" strokeWidth="1" strokeDasharray="6 6">
          {/* 45 degree diagonals */}
          <line x1="40" y1="40" x2="1700" y2="1700" />
          <line x1="1040" y1="40" x2="2660" y2="1660" />
          <line x1="2660" y1="40" x2="1040" y2="1660" />
          <line x1="1700" y1="40" x2="40" y2="1700" />

          {/* 30 degree & 60 degree guides from bottom corners */}
          <line x1="40" y1="1660" x2="1400" y2="875" />
          <line x1="2660" y1="1660" x2="1300" y2="875" />
          <line x1="40" y1="1660" x2="975" y2="40" />
          <line x1="2660" y1="1660" x2="1725" y2="40" />
        </g>

        {/* Angle degree labels */}
        <g fill="rgba(240, 248, 235, 0.25)" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="bold">
          <text x="520" y="525" transform="rotate(45, 520, 525)">45°</text>
          <text x="650" y="655" transform="rotate(45, 650, 655)">45°</text>
          <text x="750" y="1250" transform="rotate(-30, 750, 1250)">30°</text>
          <text x="560" y="1020" transform="rotate(-60, 560, 1020)">60°</text>
          <text x="2150" y="525" transform="rotate(-45, 2150, 525)">45°</text>
        </g>

        {/* Concentric Guide Arcs in Top-Right quadrant */}
        <g fill="none" stroke="rgba(240, 248, 235, 0.08)" strokeWidth="1" strokeDasharray="4 4">
          <circle cx="2660" cy="40" r="150" />
          <circle cx="2660" cy="40" r="300" />
          <circle cx="2660" cy="40" r="450" />
        </g>

        {/* Standard ISO Paper Size Registration Marks */}
        {/* A4 Outline guide */}
        <g stroke="rgba(240, 248, 235, 0.14)" strokeWidth="1">
          {/* A4 (210 x 297mm approx 600 x 840 px) */}
          <path d="M 120 140 L 140 140 M 120 140 L 120 160" />
          <path d="M 720 140 L 700 140 M 720 140 L 720 160" />
          <path d="M 120 980 L 140 980 M 120 980 L 120 960" />
          <path d="M 720 980 L 700 980 M 720 980 L 720 960" />
          <text x="130" y="155" fill="rgba(240, 248, 235, 0.22)" fontSize="10" fontFamily="monospace">A4 [210×297]</text>

          {/* A3 Outline guide */}
          <path d="M 100 120 L 130 120 M 100 120 L 100 150" />
          <path d="M 1300 120 L 1270 120 M 1300 120 L 1300 150" />
          <path d="M 100 970 L 130 970 M 100 970 L 100 940" />
          <path d="M 1300 970 L 1270 970 M 1300 970 L 1300 940" />
          <text x="110" y="115" fill="rgba(240, 248, 235, 0.18)" fontSize="10" fontFamily="monospace">A3 [297×420]</text>
        </g>

        {/* Manufacturer Technical Stamp along bottom border */}
        <g fill="rgba(240, 248, 235, 0.30)" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" letterSpacing="2">
          <text x="80" y="1678" fontWeight="700">HEAVY DUTY 5-PLY SELF-HEALING CUTTING MAT • CM-270</text>
          <text x="1350" y="1678" textAnchor="middle" fontWeight="500">NON-GLARE MATTE SURFACE • 10mm / 100mm DUAL GRID</text>
          <text x="2620" y="1678" textAnchor="end" fontWeight="700">DESIGN STUDIO SPECIFICATION</text>
        </g>

        {/* Subtle realistic healed blade cut marks (genuine studio wear) */}
        <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.75" strokeLinecap="round">
          <line x1="380" y1="420" x2="620" y2="445" />
          <line x1="840" y1="210" x2="1120" y2="200" />
          <line x1="1450" y1="360" x2="1680" y2="410" />
          <line x1="920" y1="840" x2="1140" y2="860" />
          <line x1="1840" y1="620" x2="2050" y2="590" />
          <line x1="430" y1="1240" x2="710" y2="1260" />
          <line x1="1420" y1="1380" x2="1750" y2="1350" />
        </g>
        <g stroke="rgba(0, 0, 0, 0.12)" strokeWidth="0.75" strokeLinecap="round">
          <line x1="381" y1="421" x2="621" y2="446" />
          <line x1="841" y1="211" x2="1121" y2="201" />
          <line x1="1451" y1="361" x2="1681" y2="411" />
          <line x1="921" y1="841" x2="1141" y2="861" />
          <line x1="1841" y1="621" x2="2051" y2="591" />
          <line x1="431" y1="1241" x2="711" y2="1261" />
          <line x1="1421" y1="1381" x2="1751" y2="1351" />
        </g>

        {/* Soft overhead studio lighting vignette */}
        <radialGradient id="mat-lighting" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.28" />
        </radialGradient>
        <rect x="0" y="0" width={width} height={height} fill="url(#mat-lighting)" />
      </svg>
    </div>
  );
};
