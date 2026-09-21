import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Draggable, DeskContext, DraggableLayout } from './components/Draggable';
import { Paper, Tape, BinderClip, ProjectCard, TornPaper } from './components/DeskItems';
import { CuttingMatSurface } from './components/CuttingMatSurface';
import { CinematicIntro } from './components/CinematicIntro';
import { ASSETS } from './assets';
import { MapPin, Mail, Phone, Link, X, Code, ExternalLink, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_BOARD_STATE, DEFAULT_BOARD_STATE, BASE_WIDTH, BASE_HEIGHT } from './types';
import { soundFX } from './utils/audio';
import { musicManager, MusicTrackId } from './utils/musicManager';

// Unified physical photographic shadow system (consistent overhead-left studio softbox lighting)
const REAL_SHADOW = {
  sticker: 'drop-shadow-[0.5px_1px_1px_rgba(0,0,0,0.45)] drop-shadow-[1.5px_3px_5px_rgba(0,0,0,0.18)]',
  coin: 'drop-shadow-[0.5px_1px_1px_rgba(0,0,0,0.65)] drop-shadow-[1.5px_3px_5px_rgba(0,0,0,0.28)]',
  smallObject: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.60)] drop-shadow-[3px_8px_14px_rgba(0,0,0,0.28)]',
  mediumObject: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.62)] drop-shadow-[3.5px_9px_16px_rgba(0,0,0,0.30)]',
  thickObject: 'drop-shadow-[1px_2px_3px_rgba(0,0,0,0.65)] drop-shadow-[4px_12px_20px_rgba(0,0,0,0.32)]',
  phone: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.68)] drop-shadow-[4px_11px_18px_rgba(0,0,0,0.34)] drop-shadow-[8px_22px_32px_rgba(0,0,0,0.15)]',
  keyboard: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.65)] drop-shadow-[4px_14px_20px_rgba(0,0,0,0.36)] drop-shadow-[10px_28px_40px_rgba(0,0,0,0.18)]',
  book: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.68)] drop-shadow-[5px_14px_22px_rgba(0,0,0,0.36)] drop-shadow-[12px_30px_42px_rgba(0,0,0,0.16)]',
  matcha: 'drop-shadow-[2px_3px_3px_rgba(0,0,0,0.65)] drop-shadow-[6px_18px_26px_rgba(0,0,0,0.34)] drop-shadow-[12px_32px_46px_rgba(15,35,20,0.18)]',
  mouse: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.60)] drop-shadow-[3px_9px_16px_rgba(0,0,0,0.30)]',
  macbook: 'drop-shadow-[1px_2px_3px_rgba(0,0,0,0.65)] drop-shadow-[5px_16px_28px_rgba(0,0,0,0.38)] drop-shadow-[14px_34px_50px_rgba(0,0,0,0.20)]',
  cord: 'drop-shadow-[0.5px_1.5px_1.5px_rgba(0,0,0,0.58)] drop-shadow-[2px_6px_10px_rgba(0,0,0,0.22)]',
  paperCard: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.42)] drop-shadow-[3px_8px_16px_rgba(0,0,0,0.24)]',
  paper: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.42)] drop-shadow-[3px_8px_16px_rgba(0,0,0,0.24)]',
  passport: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.62)] drop-shadow-[4px_11px_20px_rgba(0,0,0,0.32)]',
  noteStack: 'drop-shadow-[1px_1.5px_2px_rgba(0,0,0,0.52)] drop-shadow-[3px_7px_14px_rgba(0,0,0,0.25)]',
};

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  tags: string[];
  whatIBuilt: string;
  features: string[];
  github: string;
  live: string;
  image?: string;
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "revanta",
    title: "REVANTA AI",
    subtitle: "Business Expansion & Market Redevelopment AI",
    role: "Lead Full-Stack Developer",
    tags: ["AI Models", "Data Analysis", "Automation"],
    whatIBuilt: "An AI-driven platform for identifying market expansion opportunities and optimizing business redevelopment strategies using advanced data analysis.",
    features: [
      "Predictive market modeling",
      "Automated risk assessment reports",
      "Dynamic data visualization dashboard"
    ],
    github: "https://github.com/theashishsuvarna/revantaai", 
    live: "https://revantaai.vercel.app/",
    image: ASSETS.revanta
  },
  {
    id: "nexora",
    title: "NEXORA",
    subtitle: "AI-Powered Procurement OS",
    role: "Frontend Engineer",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    whatIBuilt: "A comprehensive operating system for modern procurement teams, leveraging AI to streamline vendor management, contract analysis, and purchasing workflows.",
    features: [
      "Real-time spend analysis",
      "Automated vendor evaluation",
      "Interactive analytics & insights"
    ],
    github: "https://github.com/theashishsuvarna/Nexora-Procurement-OS", 
    live: "https://osnexora.vercel.app/",
    image: ASSETS.nexora
  },
  {
    id: "aikya",
    title: "AIKYA",
    subtitle: "Community Platform for Emerging Creators",
    role: "Full-Stack Developer",
    tags: ["React", "Node.js", "MongoDB", "WebSockets"],
    whatIBuilt: "A collaborative digital hub designed to empower independent creators, fostering genuine community connections and facilitating content monetization.",
    features: [
      "Decentralized creator hubs",
      "Direct micro-monetization tools",
      "Real-time community chat"
    ],
    github: "https://github.com/theashishsuvarna/aikya", 
    live: "https://aikyaos.vercel.app/",
    image: ASSETS.aikya
  },
  {
    id: "zerocap",
    title: "ZEROCAP",
    subtitle: "Micro-Investing & Wealth Accumulation",
    role: "UI/UX & Mobile Developer",
    tags: ["React Native", "TypeScript", "Tailwind CSS", "APIs"],
    whatIBuilt: "A modern fintech application that rounds up everyday purchases and invests the spare change into diversified portfolio baskets.",
    features: [
      "Automated transaction round-ups",
      "Custom risk-adjusted portfolios",
      "Visual milestone tracking"
    ],
    github: "https://github.com/theashishsuvarna/zerocap", 
    live: "https://zerocap.vercel.app/",
    image: ASSETS.zerocap
  },
  {
    id: "bunkggo",
    title: "BUNKGGO",
    subtitle: "Smart Attendance & College Life Companion",
    role: "Solo Creator & Developer",
    tags: ["React", "PWA", "Tailwind CSS", "Local Storage"],
    whatIBuilt: "A playful yet essential utility for college students to track course attendance, calculate safe bunk margins, and manage daily class schedules.",
    features: [
      "Safe bunk calculator with predictive alerts",
      "Custom timetable visualizer",
      "Offline-first PWA architecture"
    ],
    github: "https://github.com/theashishsuvarna/bunkgo", 
    live: "https://bunkgo.vercel.app/",
    image: ASSETS.bunkgo
  }
];

export interface DeskItemLayout {
  left: number;
  top: number;
  width?: number | string;
  height?: number | string;
  rotation: number;
  zIndex: number;
  x?: number;
  y?: number;
}

export const DESK_LAYOUT: Record<string, DeskItemLayout> = Object.fromEntries(
  Object.entries(INITIAL_BOARD_STATE).map(([k, v]) => [
    k,
    {
      left: v.x,
      top: v.y,
      width: v.width,
      height: v.height,
      rotation: v.rotation,
      zIndex: v.zIndex,
      x: v.x,
      y: v.y,
    },
  ])
);

export default function App() {
  const [activeProject, setActiveProject] = useState<typeof PROJECTS_DATA[0] | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [showResetToast, setShowResetToast] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('desk_sound_enabled');
        if (saved !== null) {
          return saved === 'true';
        }
      } catch {
        // fallback
      }
    }
    return true;
  });
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [boardRevealed, setBoardRevealed] = useState<boolean>(false);
  const [activeMusicTrack, setActiveMusicTrack] = useState<MusicTrackId | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const topZIndexRef = useRef<number>(100);

  useEffect(() => {
    const unsubscribe = musicManager.subscribe((track, playing) => {
      setActiveMusicTrack(track);
      setIsMusicPlaying(playing);
    });
    return unsubscribe;
  }, []);

  // Fresh visitors always start at canonical master INITIAL_BOARD_STATE.
  // In-session dragging updates React state and resets smoothly with RESET BOARD.
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number; rotation?: number; zIndex: number }>>({});

  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
    setTimeout(() => {
      setBoardRevealed(true);
      if (soundEnabled) {
        soundFX.playPaperDrop();
      }
    }, 120);
  }, [soundEnabled]);

  const getNextZIndex = useCallback(() => {
    topZIndexRef.current += 1;
    return topZIndexRef.current;
  }, []);

  const handleObjectMoved = useCallback((id: string, x: number, y: number, zIndex: number) => {
    const currentRotation = INITIAL_BOARD_STATE[id]?.rotation ?? 0;
    setSavedPositions((prev) => ({
      ...prev,
      [id]: { x: Math.round(x), y: Math.round(y), rotation: currentRotation, zIndex },
    }));
  }, []);

  const handleResetBoard = useCallback(() => {
    soundFX.playWoodTap();
    setSavedPositions({});
    setResetKey((prev) => prev + 1);
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 2400);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundFX.setEnabled(next);
      musicManager.setMuted(!next);
      if (next) soundFX.playSoftClick();
      return next;
    });
  }, []);

  const getObjectLayout = useCallback((id: string, defaultLayout?: DeskItemLayout): DraggableLayout => {
    const master = INITIAL_BOARD_STATE[id] || defaultLayout;
    const saved = savedPositions[id];
    if (saved) {
      return {
        ...master,
        left: saved.x,
        top: saved.y,
        x: saved.x,
        y: saved.y,
        rotation: saved.rotation !== undefined ? saved.rotation : (master?.rotation ?? 0),
        zIndex: saved.zIndex ?? master?.zIndex ?? 1,
      };
    }
    return master;
  }, [savedPositions]);

  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      const padding = window.innerWidth >= 768 ? 64 : (window.innerWidth >= 640 ? 48 : 24);
      const available = Math.max(320, Math.min(window.innerWidth - padding, BASE_WIDTH));
      return available / BASE_WIDTH;
    }
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const measuredWidth = viewportRef.current?.clientWidth;
      if (measuredWidth && measuredWidth > 0) {
        setScale(measuredWidth / BASE_WIDTH);
      } else if (typeof window !== 'undefined') {
        const padding = window.innerWidth >= 768 ? 64 : (window.innerWidth >= 640 ? 48 : 24);
        const available = Math.max(320, Math.min(window.innerWidth - padding, BASE_WIDTH));
        setScale(available / BASE_WIDTH);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (viewportRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => handleResize());
      ro.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setActiveProject(null);
      }
    };
    if (activeProject) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject]);

  const scrollToSection = (targetY: number) => {
    const topOffset = viewportRef.current
      ? viewportRef.current.getBoundingClientRect().top + window.scrollY
      : 0;
    window.scrollTo({
      top: topOffset + targetY * scale,
      behavior: 'smooth',
    });
  };

  return (
    <DeskContext.Provider 
      value={{ 
        scale, 
        resetKey, 
        boardWidth: BASE_WIDTH, 
        boardHeight: BASE_HEIGHT,
        onObjectMoved: handleObjectMoved,
        getNextZIndex
      }}
    >
      {/* Premium Japanese Cinematic Intro Sequence */}
      {!introCompleted && (
        <CinematicIntro onComplete={handleIntroComplete} soundEnabled={soundEnabled} />
      )}

      {/* Real White Drafting Desk Surface with subtle studio table atmosphere */}
      <div 
        id="desk-surface"
        className="w-full font-sans selection:bg-black selection:text-white relative overflow-x-hidden pt-8 sm:pt-10 md:pt-14 pb-20 sm:pb-24 px-3 sm:px-6 md:px-8"
        style={{
          backgroundColor: '#faf9f5',
          backgroundImage: `
            radial-gradient(ellipse at 50% 12%, #ffffff 0%, #f7f5ee 50%, #ece8dd 100%),
            url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")
          `,
        }}
      >
        {/* Scaled Desk Viewport: Centered on white desk, maintains exact aspect ratio */}
        <div 
          ref={viewportRef}
          id="mat-viewport"
          className="w-full max-w-[2700px] mx-auto relative overflow-visible"
          style={{
            height: `${BASE_HEIGHT * scale}px`,
          }}
        >
          {/* Desk Surface (Realistic Self-Healing Cutting Mat) — completely stationary, physical workspace */}
          <div 
            id="cutting-mat"
            key={resetKey}
            className="board rounded-[14px] p-0 relative select-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: '#1b3827',
              /* Multi-layered physical contact shadow onto the white desk surface + 3mm PVC composite edge */
              boxShadow: `
                0 2px 5px rgba(16, 28, 18, 0.40),
                0 10px 28px rgba(14, 24, 16, 0.20),
                0 28px 65px rgba(10, 18, 12, 0.12),
                0 3px 0 #132418,
                0 5px 0 #0d1a11,
                0 6px 2px rgba(0, 0, 0, 0.22),
                inset 0 1px 1px rgba(255, 255, 255, 0.22),
                inset 1px 0 1px rgba(255, 255, 255, 0.15),
                inset -1px -1px 2px rgba(0, 0, 0, 0.45)
              `,
              border: '1px solid #142a1d',
            }}
          >
            {/* Realistic cutting mat surface texture, measurement grids, angle guides, and healed cut marks */}
            <CuttingMatSurface width={BASE_WIDTH} height={BASE_HEIGHT} />

            {/* =========================================
                FIRST-VISIT DISCOVERY NOTE
            ========================================= */}
            <Draggable id="discoveryNote" layout={getObjectLayout('discoveryNote', DESK_LAYOUT.discoveryNote)}>
              <div className="relative group cursor-grab active:cursor-grabbing">
                <Tape className="top-[-8px] left-1/2 -translate-x-1/2 w-14 rotate-[-3deg]" />
                <div 
                  className="bg-[#fef9c3] border border-[#fef08a] px-3.5 py-1.5 rounded-sm shadow-md transition-opacity duration-1000 select-none text-center"
                  style={{
                    boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
                  }}
                >
                  <span className="font-['Caveat'] text-lg text-emerald-950 font-bold tracking-wide whitespace-nowrap">
                    ✦ Everything here can move.
                  </span>
                </div>
              </div>
            </Draggable>

            {/* =========================================
                TOP LEFT: Profile sheet, Pikachu, Polaroid, Good Ideas note
            ========================================= */}
            <Draggable id="obj_CreativeDeskPortfolio" layout={getObjectLayout('obj_CreativeDeskPortfolio', DESK_LAYOUT.obj_CreativeDeskPortfolio)}>
              <div className="relative">
                <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[-2deg] w-[120px]" />
                <Paper className="w-[520px] flex flex-col pt-8 pb-10 px-8 text-gray-800">
                  <div className="flex justify-between items-start text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-200 pb-2">
                    <span>Creative Desk / Portfolio</span>
                    <span>Est. 2024</span>
                  </div>
                  
                  <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900">ASHISH SUVARNA</h1>
                  <p className="text-base font-bold text-gray-600 mb-4 border-l-2 border-gray-900 pl-4">Product Designer | UI/UX & Web Dev</p>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm font-medium">
                    <MapPin size={16} />
                    <span>Mumbai, India</span>
                  </div>
                  
                  <p className="text-base text-gray-700 leading-relaxed mb-8 font-medium">
                    End-to-end product builder combining UX design, modern frontend engineering, and AI workflows. Experienced across fintech, creator economy, and community platforms.
                  </p>
                  
                  <div className="flex flex-col gap-3 text-sm text-gray-600 font-bold bg-[#fafafa] p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <a href="mailto:ashishsuvarna23@gmail.com" onPointerDown={(e) => e.stopPropagation()} className="hover:text-black hover:underline transition-colors cursor-pointer relative z-50">ashishsuvarna23@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <a href="tel:+919372169983" onPointerDown={(e) => e.stopPropagation()} className="hover:text-black hover:underline transition-colors cursor-pointer relative z-50">+91 9372169983</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link size={16} className="text-gray-400" />
                      <a href="https://linkedin.com/in/a5shish/" onPointerDown={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline transition-colors cursor-pointer relative z-50">linkedin.com/in/a5shish/</a>
                    </div>
                  </div>
                </Paper>
              </div>
            </Draggable>

            <Draggable id="polaroid" layout={getObjectLayout('polaroid', DESK_LAYOUT.polaroid)}>
              <div 
                className="w-[240px] bg-[#faf8f4] p-3.5 pb-4 rounded-[2px] relative"
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.42), 2px 7px 16px rgba(0,0,0,0.25), 6px 18px 28px rgba(0,0,0,0.14)',
                  borderBottom: '1.5px solid #dcd7ca',
                  borderRight: '1.5px solid #dcd7ca',
                }}
              >
                <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[-2deg] w-14" />
                <div className="w-[212px] h-[230px] bg-gray-900 mb-3 overflow-hidden shadow-inner relative z-10 border border-gray-300">
                  <img src={ASSETS.mumbai} alt="Mumbai Skyline" className="w-full h-full object-cover filter contrast-125 saturate-50" draggable={false} />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
                <div className="font-['Caveat'] text-2xl text-gray-800 -mt-1 font-bold z-10 px-1">Mumbai, India ♡</div>
              </div>
            </Draggable>
            
            <Draggable id="pikachu" layout={getObjectLayout('pikachu', DESK_LAYOUT.pikachu)}>
              <img src={ASSETS.pikachu} alt="Pikachu" className={`w-[220px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            <Draggable id="goodIdeas" layout={getObjectLayout('goodIdeas', DESK_LAYOUT.goodIdeas)}>
              <TornPaper className="w-[220px] text-center font-['Caveat'] text-2xl flex flex-col items-center">
                <Tape className="top-[-8px] w-12 rotate-[-5deg]" />
                <span className="mb-1 text-gray-900 font-bold text-xl leading-snug">currently building<br/>cool stuff →</span>
                <span className="text-[10px] text-gray-500 font-mono tracking-wider mt-1 font-semibold uppercase">GOOD IDEAS</span>
              </TornPaper>
            </Draggable>

            {/* =========================================
                TOP CENTER (TECH DESK)
            ========================================= */}
            <Draggable id="techDeskTitle" layout={getObjectLayout('techDeskTitle', DESK_LAYOUT.techDeskTitle)}>
              <TornPaper className="w-[150px] text-center font-bold text-sm tracking-widest uppercase">
                <Tape className="top-[-8px] w-10 rotate-3" />
                TECH DESK
              </TornPaper>
            </Draggable>

            {/* 404 NOT FOUND / SHIP IT Paper */}
            <Draggable id="paper404" layout={getObjectLayout('paper404', DESK_LAYOUT.paper404)}>
              <div className="relative bg-white px-3 py-2 rounded-sm border border-gray-200 shadow-sm flex flex-col items-center justify-center select-none w-[100px] h-[95px]">
                <Tape className="top-[-8px] left-1/2 -translate-x-1/2 w-8 rotate-1" />
                <span className="text-2xl font-black text-gray-900 leading-none">404</span>
                <span className="text-[7.5px] font-mono font-bold text-gray-400 tracking-wider my-0.5 uppercase">NOT FOUND</span>
                <span className="bg-[#e11d48] text-white text-[8px] font-bold px-2 py-0.5 rounded-sm shadow-xs flex items-center gap-1 mt-0.5">
                  SHIP IT <span>🚀</span>
                </span>
              </div>
            </Draggable>

            <Draggable id="keyboard" layout={getObjectLayout('keyboard', DESK_LAYOUT.keyboard)}>
              <img 
                src={ASSETS.keyboard} 
                alt="Mechanical Keyboard" 
                className={`w-[390px] h-auto ${REAL_SHADOW.keyboard}`} 
                draggable={false} 
              />
            </Draggable>

            {/* Restored Apple-style Wireless Mouse */}
            <Draggable id="mouse" layout={getObjectLayout('mouse', DESK_LAYOUT.mouse)}>
              <img src={ASSETS.mouse} alt="Wireless Mouse" className={`w-[95px] h-auto ${REAL_SHADOW.mouse}`} draggable={false} />
            </Draggable>

            {/* Pixel 9a */}
            <Draggable id="pixel9a" layout={getObjectLayout('pixel9a', DESK_LAYOUT.pixel9a)}>
              <img 
                src={ASSETS.pixel9a} 
                alt="Pixel 9a" 
                title="Pixel 9a" 
                className={`w-[160px] h-auto ${REAL_SHADOW.phone}`} 
                draggable={false} 
              />
            </Draggable>

            {/* Wrigley's Spearmint pack */}
            <Draggable id="gum" layout={getObjectLayout('gum', DESK_LAYOUT.gum)}>
              <img src={ASSETS.gum} alt="Gum" className={`w-[300px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
            </Draggable>

            <Draggable id="pen_24951" layout={getObjectLayout('pen_24951', DESK_LAYOUT.pen_24951)}>
              <img src={ASSETS.pendrive} alt="Pendrive" className={`w-[100px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
            </Draggable>

            <Draggable id="car2" layout={getObjectLayout('car2', DESK_LAYOUT.car2)}>
              <img src={ASSETS.car2} alt="Car 2" className={`w-[95px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
            </Draggable>

            {/* =========================================
                TOP RIGHT: Matcha drink pair (EXACTLY 2 GLASSES), Japan Book & Notes
            ========================================= */}
            <Draggable id="japanBook1" layout={getObjectLayout('japanBook1', DESK_LAYOUT.japanBook1)}>
              <img src={ASSETS.japanBook1} alt="Japanese Book 1" className={`w-[350px] h-auto ${REAL_SHADOW.book}`} draggable={false} />
            </Draggable>

            <Draggable id="matcha" layout={getObjectLayout('matcha', DESK_LAYOUT.matcha)}>
              <img 
                src={ASSETS.matcha} 
                alt="Matcha Drink Pair" 
                className={`w-[425px] h-auto ${REAL_SHADOW.matcha} select-none`} 
                draggable={false} 
              />
            </Draggable>

            {/* Photographic Artisanal Tiramisu on Ceramic Dessert Plate */}
            <Draggable id="tiramisu" layout={getObjectLayout('tiramisu', DESK_LAYOUT.tiramisu)}>
              <img 
                src={ASSETS.tiramisu} 
                alt="Authentic Tiramisu Dessert" 
                className={`w-[195px] h-auto object-contain ${REAL_SHADOW.mediumObject} select-none pointer-events-auto`} 
                draggable={false} 
              />
            </Draggable>

            <Draggable id="japanNotes" layout={getObjectLayout('japanNotes', DESK_LAYOUT.japanNotes)}>
              <div 
                className="relative bg-[#fcfbf9] p-5 rounded-sm border border-[#e5e0d3] overflow-hidden"
                style={{
                  width: '180px',
                  height: '200px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.36), 2px 8px 18px rgba(0,0,0,0.22), 6px 18px 30px rgba(0,0,0,0.12)',
                  backgroundImage: `
                    linear-gradient(to right, rgba(74, 144, 226, 0.12) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(74, 144, 226, 0.12) 1px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
                }}
              >
                <Tape className="top-[-8px] left-1/2 -translate-x-1/2 w-14 rotate-[-3deg]" />
                <div className="flex justify-between items-start border-b border-[#d8d3c5] pb-1.5 mb-2 mt-1">
                  <span className="font-bold tracking-widest text-[10px] text-gray-700">JAPAN NOTES</span>
                  <span className="font-mono text-[9px] text-gray-400">5mm 方眼</span>
                </div>
                <div className="flex flex-col gap-2 opacity-60 text-[10px] font-mono text-gray-600 mt-1">
                  <div className="border-b border-gray-400/40 pb-0.5">▪ 渋谷 / 新宿</div>
                  <div className="border-b border-gray-400/40 pb-0.5">▪ 宇治 抹茶</div>
                  <div className="border-b border-gray-400/40 pb-0.5">▪ 銀座 伊東屋</div>
                </div>
                {/* Authentic Red Tokyo Hanko Stamp */}
                <div 
                  className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-[2px] border border-[#c53030] flex flex-col items-center justify-center rotate-[-8deg] pointer-events-none opacity-85"
                  style={{
                    boxShadow: 'inset 0 0 1px #c53030',
                    color: '#c53030',
                  }}
                >
                  <span className="text-[7px] font-extrabold tracking-tighter leading-none">東京</span>
                  <span className="text-[6px] font-mono tracking-tighter leading-none scale-75">TOKYO</span>
                </div>
              </div>
            </Draggable>

            <Draggable id="washiTape" layout={getObjectLayout('washiTape', DESK_LAYOUT.washiTape)}>
              <img src={ASSETS.washiTape} alt="Washi Tape" className={`w-[100px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            <Draggable id="yen" layout={getObjectLayout('yen', DESK_LAYOUT.yen)}>
              <img src={ASSETS.yen} alt="Yen Coin" className={`w-[44px] h-[44px] ${REAL_SHADOW.coin}`} draggable={false} />
            </Draggable>

            <Draggable id="earPods" layout={getObjectLayout('earPods', DESK_LAYOUT.earPods)}>
              <img src={ASSETS.earPods} alt="Wired EarPods" className={`w-[320px] h-auto ${REAL_SHADOW.cord}`} draggable={false} />
            </Draggable>

            <Draggable id="pen" layout={getObjectLayout('pen', DESK_LAYOUT.pen)}>
              <img src={ASSETS.pen} alt="Pen" className={`w-[330px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            {/* =========================================
                ROW 2: PROJECT ARCHIVE (5 CARDS IN HORIZONTAL ROW)
            ========================================= */}
            <Draggable id="obj_26737" layout={getObjectLayout('obj_26737', DESK_LAYOUT.obj_26737)}>
              <TornPaper className="w-[200px] text-center font-bold text-sm tracking-widest uppercase shadow-[0_10px_15px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)]">
                <Tape className="top-[-8px] w-12" />
                PROJECT ARCHIVE
              </TornPaper>
            </Draggable>

            <Draggable id="clip1" layout={getObjectLayout('clip1', DESK_LAYOUT.clip1)} onClick={() => setActiveProject(PROJECTS_DATA[0])}>
              <div className="relative w-[265px] cursor-pointer">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <ProjectCard 
                  title={PROJECTS_DATA[0].title}
                  subtitle={PROJECTS_DATA[0].subtitle}
                  tags={PROJECTS_DATA[0].tags}
                  image={PROJECTS_DATA[0].image}
                  onClick={() => setActiveProject(PROJECTS_DATA[0])}
                />
              </div>
            </Draggable>

            <Draggable id="clip1_27709" layout={getObjectLayout('clip1_27709', DESK_LAYOUT.clip1_27709)} onClick={() => setActiveProject(PROJECTS_DATA[1])}>
              <div className="relative w-[265px] cursor-pointer">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <ProjectCard 
                  title={PROJECTS_DATA[1].title}
                  subtitle={PROJECTS_DATA[1].subtitle}
                  tags={PROJECTS_DATA[1].tags}
                  image={PROJECTS_DATA[1].image}
                  onClick={() => setActiveProject(PROJECTS_DATA[1])}
                />
              </div>
            </Draggable>

            <Draggable id="realMadrid" layout={getObjectLayout('realMadrid', DESK_LAYOUT.realMadrid)}>
              <img src={ASSETS.realMadrid} alt="Real Madrid" className={`w-[125px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            <Draggable id="clip1_28304" layout={getObjectLayout('clip1_28304', DESK_LAYOUT.clip1_28304)} onClick={() => setActiveProject(PROJECTS_DATA[2])}>
              <div className="relative w-[265px] cursor-pointer">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <ProjectCard 
                  title={PROJECTS_DATA[2].title}
                  subtitle={PROJECTS_DATA[2].subtitle}
                  tags={PROJECTS_DATA[2].tags}
                  image={PROJECTS_DATA[2].image}
                  onClick={() => setActiveProject(PROJECTS_DATA[2])}
                />
              </div>
            </Draggable>

            <Draggable id="clip1_28899" layout={getObjectLayout('clip1_28899', DESK_LAYOUT.clip1_28899)} onClick={() => setActiveProject(PROJECTS_DATA[3])}>
              <div className="relative w-[265px] cursor-pointer">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <ProjectCard 
                  title={PROJECTS_DATA[3].title}
                  subtitle={PROJECTS_DATA[3].subtitle}
                  tags={PROJECTS_DATA[3].tags}
                  image={PROJECTS_DATA[3].image}
                  onClick={() => setActiveProject(PROJECTS_DATA[3])}
                />
              </div>
            </Draggable>

            <Draggable id="clip1_29494" layout={getObjectLayout('clip1_29494', DESK_LAYOUT.clip1_29494)} onClick={() => setActiveProject(PROJECTS_DATA[4])}>
              <div className="relative w-[265px] cursor-pointer">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <ProjectCard 
                  title={PROJECTS_DATA[4].title}
                  subtitle={PROJECTS_DATA[4].subtitle}
                  tags={PROJECTS_DATA[4].tags}
                  image={PROJECTS_DATA[4].image}
                  onClick={() => setActiveProject(PROJECTS_DATA[4])}
                />
              </div>
            </Draggable>

            <Draggable id="godLike" layout={getObjectLayout('godLike', DESK_LAYOUT.godLike)}>
              <img src={ASSETS.godLike} alt="GodLike" className={`w-[175px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            {/* =========================================
                ROW 2 (RIGHT): MUSIC & GAMING CLUSTERS
            ========================================= */}
            <Draggable id="nowPlaying" layout={getObjectLayout('nowPlaying', DESK_LAYOUT.nowPlaying)}>
              <TornPaper className="w-[160px] text-center font-bold text-sm tracking-widest uppercase">
                <Tape className="top-[-8px] w-10 rotate-[-2deg]" />
                NOW PLAYING
              </TornPaper>
            </Draggable>

            <Draggable 
              id="karanAujla" 
              layout={getObjectLayout('karanAujla', DESK_LAYOUT.karanAujla)}
              onClick={() => musicManager.toggleTrack('karanAujla')}
            >
              <div className="relative group cursor-pointer select-none">
                <img 
                  src={ASSETS.karanAujla} 
                  alt="Karan Aujla - 52 Bars" 
                  className={`w-[165px] h-[165px] object-cover rounded-sm ${REAL_SHADOW.smallObject} transition-all duration-300 ${activeMusicTrack === 'karanAujla' && isMusicPlaying ? 'ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.35)]' : ''}`} 
                  draggable={false} 
                />
                {activeMusicTrack === 'karanAujla' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 pointer-events-none shadow-md">
                    {isMusicPlaying ? (
                      <span className="flex items-end gap-[2px] h-3">
                        <span className="w-[2.5px] h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-[2.5px] h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-[2.5px] h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400/90" title="Paused" />
                    )}
                  </div>
                )}
              </div>
            </Draggable>

            <Draggable 
              id="krsna" 
              layout={getObjectLayout('krsna', DESK_LAYOUT.krsna)}
              onClick={() => musicManager.toggleTrack('krsna')}
            >
              <div className="relative group cursor-pointer select-none">
                <img 
                  src={ASSETS.krsna} 
                  alt="KR$NA - Kaha Tak" 
                  className={`w-[165px] h-[170px] object-cover rounded-sm ${REAL_SHADOW.smallObject} transition-all duration-300 ${activeMusicTrack === 'krsna' && isMusicPlaying ? 'ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.35)]' : ''}`} 
                  draggable={false} 
                />
                {activeMusicTrack === 'krsna' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 pointer-events-none shadow-md">
                    {isMusicPlaying ? (
                      <span className="flex items-end gap-[2px] h-3">
                        <span className="w-[2.5px] h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-[2.5px] h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-[2.5px] h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400/90" title="Paused" />
                    )}
                  </div>
                )}
              </div>
            </Draggable>

            <Draggable 
              id="seedheMaut" 
              layout={getObjectLayout('seedheMaut', DESK_LAYOUT.seedheMaut)}
              onClick={() => musicManager.toggleTrack('seedheMaut')}
            >
              <div className="relative group cursor-pointer select-none">
                <img 
                  src={ASSETS.seedheMaut} 
                  alt="Seedhe Maut - Barsaat" 
                  className={`w-[165px] h-[160px] object-cover rounded-sm ${REAL_SHADOW.smallObject} transition-all duration-300 ${activeMusicTrack === 'seedheMaut' && isMusicPlaying ? 'ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.35)]' : ''}`} 
                  draggable={false} 
                />
                {activeMusicTrack === 'seedheMaut' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 pointer-events-none shadow-md">
                    {isMusicPlaying ? (
                      <span className="flex items-end gap-[2px] h-3">
                        <span className="w-[2.5px] h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-[2.5px] h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-[2.5px] h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400/90" title="Paused" />
                    )}
                  </div>
                )}
              </div>
            </Draggable>

            <Draggable id="gamingSports" layout={getObjectLayout('gamingSports', DESK_LAYOUT.gamingSports)}>
              <TornPaper className="w-[160px] text-center font-bold text-sm tracking-widest uppercase">
                <Tape className="top-[-8px] w-12 rotate-[-4deg]" />
                GAMING / SPORTS
              </TornPaper>
            </Draggable>

            <Draggable id="rcb" layout={getObjectLayout('rcb', DESK_LAYOUT.rcb)}>
              <img src={ASSETS.rcb} alt="RCB" className={`w-[150px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            <Draggable id="car1" layout={getObjectLayout('car1', DESK_LAYOUT.car1)}>
              <img src={ASSETS.car} alt="Car 1" className={`w-[240px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
            </Draggable>

            {/* Realistic Silver MacBook Air M1 Photographic Cutout */}
            <Draggable id="macbook" layout={getObjectLayout('macbook', DESK_LAYOUT.macbook)}>
              <img 
                src={ASSETS.macbook} 
                alt="Silver MacBook Air M1" 
                className={`w-[560px] h-auto ${REAL_SHADOW.macbook} pointer-events-auto select-none`} 
                draggable={false} 
              />
            </Draggable>

            {/* =========================================
                ROW 3: EXPERIENCE & ACADEMIC ARCHIVE & TECH
            ========================================= */}
            <Draggable id="clip2" layout={getObjectLayout('clip2', DESK_LAYOUT.clip2)}>
              <div className="relative">
                <BinderClip className="top-[-20px] left-6" />
                <Paper className="w-[285px] p-4 text-gray-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">WORK LOG</h2>
                  
                  <div className="mb-4 border-b border-gray-300 pb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-xs">Groyyo</h3>
                      <span className="text-[10px] font-bold text-gray-400">Mar 2024 - Jul 2024</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">Product Design & Tech Intern</p>
                    <ul className="text-[11px] list-disc list-inside mt-2 space-y-1 font-medium text-gray-600">
                      <li>Designed core SaaS workflows</li>
                      <li>Built responsive web modules in React</li>
                      <li>Collaborated directly with engineering</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-xs">Freelance</h3>
                      <span className="text-[10px] font-bold text-gray-400">2023 - Present</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">Design & Video Production</p>
                    <ul className="text-[11px] list-disc list-inside mt-2 space-y-1 font-medium text-gray-600">
                      <li>Short-form video</li>
                      <li>Thumbnails & posters</li>
                      <li>Creator and brand work</li>
                    </ul>
                  </div>
                </Paper>
              </div>
            </Draggable>

            <Draggable id="academicArchive" layout={getObjectLayout('academicArchive', DESK_LAYOUT.academicArchive)}>
              <div className="relative">
                <Tape className="top-[-8px] left-1/2 -translate-x-1/2 rotate-[2deg] w-[90px]" />
                <Paper className="w-[315px] p-4 text-gray-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">ACADEMIC ARCHIVE</h2>
                  
                  <div className="mb-4 border-b border-gray-300 pb-3">
                    <h3 className="font-bold text-gray-900 text-xs">Ratan Tata Maharashtra State<br/>Skills University</h3>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">B.Tech in Computer Technology</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <p className="text-[11px] font-bold text-gray-500">CGPA: 8.5/10</p>
                      <p className="text-[11px] font-bold text-gray-900">CGPA: 7.7</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 border-b border-gray-300 pb-3">
                    <h3 className="font-bold text-gray-900 text-xs">Jijamata Junior College</h3>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">12th – Computer Science (HSC)</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">CGPA: 8.5/10</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs">St. Mary's Multipurpose High School</h3>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">Kindergarten to Xth</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">CGPA: 8.5/10</p>
                  </div>
                </Paper>
              </div>
            </Draggable>

            <Draggable id="clip1_39370" layout={getObjectLayout('clip1_39370', DESK_LAYOUT.clip1_39370)}>
              <div className="relative">
                <img src={ASSETS.clip1} className="absolute top-[-20px] left-[16px] w-[44px] drop-shadow-md z-20 pointer-events-none" alt="Clip" />
                <Paper className="w-[315px] p-4 text-gray-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">TECH / SKILLS</h2>
                  
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-gray-700">
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">HTML5</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">CSS3</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">JavaScript</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">TypeScript</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">React.js</span>
                    <span className="bg-gray-800 text-white px-2 py-1 rounded-sm border border-gray-900 shadow-sm text-[11px]">React</span>
                    <span className="bg-gray-800 text-white px-2 py-1 rounded-sm border border-gray-900 shadow-sm text-[11px]">Next.js</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm border border-blue-200 shadow-xs text-[11px]">Figma</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm border border-blue-200 shadow-xs text-[11px]">Adobe XD</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm border border-blue-200 shadow-xs text-[11px]">Photoshop</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">Tailwind</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">Node.js</span>
                  </div>
                  
                  <hr className="my-4 border-gray-300" />
                  
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-gray-700">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm border border-yellow-200 shadow-xs text-[11px]">UI/UX Design</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm border border-yellow-200 shadow-xs text-[11px]">Product Design</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm border border-green-200 shadow-xs text-[11px]">Content Strategy</span>
                    <span className="bg-[#eae6dc] px-2 py-1 rounded-sm border border-[#d4cfc5] shadow-xs text-[11px]">Motion</span>
                  </div>
                </Paper>
              </div>
            </Draggable>

            <Draggable id="certifications" layout={getObjectLayout('certifications', DESK_LAYOUT.certifications)}>
              <div className="relative">
                <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[4deg] w-[80px]" />
                <Paper className="w-[345px] p-4.5 text-gray-800">
                  <h2 className="text-base font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-5">CERTIFICATIONS</h2>
                  
                  <ul className="space-y-4 text-xs font-bold text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Software Engineer – HackerRank
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Frontend Developer (React) – HackerRank
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      SQL Advanced – HackerRank
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Product Management – GeeksforGeeks
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Foundations of Cybersecurity – Google/Coursera
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Generative AI & ChatGPT – GeeksforGeeks
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1" />
                      Machine Learning & Data Science – SkillUp
                    </li>
                  </ul>
                </Paper>
              </div>
            </Draggable>

            {/* =========================================
                ROW 4 (RIGHT): WORLD TOUR SEQUENCE & GADGETS
                Strict sequence: Rome → Istanbul → Seoul → Hong Kong → Amsterdam
            ========================================= */}
            <Draggable id="worldTour" layout={getObjectLayout('worldTour', DESK_LAYOUT.worldTour)}>
              <TornPaper className="w-[150px] text-center font-bold text-sm tracking-widest uppercase">
                <Tape className="top-[-8px] w-10 rotate-3" />
                WORLD TOUR
              </TornPaper>
            </Draggable>

            <Draggable id="passport" layout={getObjectLayout('passport', DESK_LAYOUT.passport)}>
              <img src={ASSETS.passport} alt="Passport" className={`w-[145px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
            </Draggable>
            
            <Draggable id="rome" layout={getObjectLayout('rome', DESK_LAYOUT.rome)}>
              <img src={ASSETS.rome} alt="Rome Passport" className={`w-[195px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
            </Draggable>
            
            <Draggable id="istanbul" layout={getObjectLayout('istanbul', DESK_LAYOUT.istanbul)}>
              <img src={ASSETS.istanbul} alt="Istanbul Ticket" className={`w-[165px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
            </Draggable>
            
            <Draggable id="seoul" layout={getObjectLayout('seoul', DESK_LAYOUT.seoul)}>
              <img src={ASSETS.seoul} alt="Seoul Tag" className={`w-[125px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
            </Draggable>
            
            <Draggable id="hongKong" layout={getObjectLayout('hongKong', DESK_LAYOUT.hongKong)}>
              <img src={ASSETS.hongKong} alt="Hong Kong Ticket" className={`w-[155px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
            </Draggable>
            
            <Draggable id="amsterdam" layout={getObjectLayout('amsterdam', DESK_LAYOUT.amsterdam)}>
              <img src={ASSETS.amsterdam} alt="Amsterdam Postcard" className={`w-[205px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
            </Draggable>

            <Draggable id="allIWanna" layout={getObjectLayout('allIWanna', DESK_LAYOUT.allIWanna)}>
              <TornPaper className="w-[165px] text-center font-['Caveat'] text-2xl flex flex-col items-center p-3">
                <Tape className="top-[-8px] w-10 rotate-[-2deg]" />
                <span className="text-gray-900 font-bold">All I wanna</span>
                <span className="text-gray-900 font-bold">go to… ✈️</span>
              </TornPaper>
            </Draggable>

            <Draggable id="controller" layout={getObjectLayout('controller', DESK_LAYOUT.controller)}>
              <img src={ASSETS.controller} alt="Controller" className={`w-[210px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
            </Draggable>

            <Draggable id="airpods" layout={getObjectLayout('airpods', DESK_LAYOUT.airpods)}>
              <img src={ASSETS.airpods} alt="AirPods" className={`w-[218px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
            </Draggable>

            <Draggable id="watch" layout={getObjectLayout('watch', DESK_LAYOUT.watch)}>
              <img src={ASSETS.watch} alt="Watch" className={`w-[170px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
            </Draggable>

          </div>
        </div>

        {/* Project Details Modal */}
        <AnimatePresence>
          {activeProject && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
              onClick={() => {
                soundFX.playPaperTap();
                setActiveProject(null);
              }}
            >
              <motion.div 
                initial={{ scale: 0.92, y: 18 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 18 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#faf8f3] w-full max-w-2xl rounded-sm shadow-[0_24px_70px_rgba(0,0,0,0.55),0_4px_16px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col border border-[#dcd7ca]"
                style={{
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
                }}
              >
                {/* Decorative top binder bar */}
                <div className="w-full h-1.5 bg-neutral-900" />

                <button 
                  onClick={() => {
                    soundFX.playPaperTap();
                    setActiveProject(null);
                  }}
                  aria-label="Close project modal"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 active:scale-90 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer z-20"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 md:p-10 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-start gap-4 mb-4 pr-8">
                    <div className="w-12 h-12 bg-neutral-900 flex-shrink-0 flex items-center justify-center text-[#faf8f3] font-black text-xl rounded-sm shadow-md border border-black/20">
                      {activeProject.title.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                        {activeProject.title}
                      </h2>
                      <p className="text-neutral-600 font-medium text-sm md:text-base mt-0.5">
                        {activeProject.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Project Screenshot Slot - Automatically adapts to actual image aspect ratio without cropping */}
                  <div className="mb-6 w-full bg-[#f2ece0] rounded-sm overflow-hidden border border-[#d9d1c1] relative flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                    {activeProject.image ? (
                      <img 
                        src={activeProject.image} 
                        alt={activeProject.title} 
                        className="w-full h-auto max-h-[58vh] object-contain object-center block" 
                        style={{ imageRendering: 'auto' }}
                        draggable={false} 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4 select-none">
                        <div className="w-9 h-9 rounded border border-[#b8ae9a] flex items-center justify-center mb-2 text-[#8c826e] bg-[#f9f6f0]">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-[#6c6452] uppercase font-bold">
                          {activeProject.title} · SCREENSHOT SLOT
                        </span>
                        <span className="text-[9px] text-[#9c9380] mt-0.5 font-sans">
                          Ready for uploaded asset
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tech Stack */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5 border-b border-neutral-200 pb-1">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white text-neutral-800 text-xs font-bold rounded-sm border border-neutral-300 shadow-2xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 border-b border-neutral-200 pb-1">
                        Overview
                      </h3>
                      <p className="text-neutral-800 leading-relaxed text-sm md:text-[15px]">
                        {activeProject.whatIBuilt}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5 border-b border-neutral-200 pb-1">
                        Key Features
                      </h3>
                      <ul className="space-y-2 text-neutral-800 text-sm md:text-[15px]">
                        {activeProject.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Independent Link Buttons */}
                  <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-wrap gap-3.5">
                    <a 
                      href={activeProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-bold text-xs sm:text-sm bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition-all shadow-md cursor-pointer select-none"
                    >
                      <Code size={17} />
                      <span>GITHUB ↗</span>
                    </a>
                    <a 
                      href={activeProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-bold text-xs sm:text-sm bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white transition-all shadow-md cursor-pointer select-none"
                    >
                      <ExternalLink size={17} />
                      <span>LIVE DEMO ↗</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>


      {/* Reset Feedback Notification Toast */}
      <AnimatePresence>
        {showResetToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999999] bg-neutral-900/90 backdrop-blur-md text-[#faf8f3] text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 pointer-events-none"
          >
            <RotateCcw size={13} className="text-emerald-400" />
            <span>Desk restored to original curated composition</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewport-Level Floating Liquid Glass Navigation */}
      <div 
        id="portfolio-navbar-container"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99990,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'max-content',
          maxWidth: 'calc(100vw - 24px)',
          margin: 0,
        }}
      >
        <nav 
          id="liquid-glass-navbar"
          aria-label="Portfolio navigation"
          className="pointer-events-auto relative flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-[22px] max-w-full overflow-x-auto no-scrollbar select-none"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(22px) saturate(175%)',
            WebkitBackdropFilter: 'blur(22px) saturate(175%)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: `
              0 12px 32px -4px rgba(0, 0, 0, 0.32),
              0 4px 12px -2px rgba(0, 0, 0, 0.18),
              inset 0 1px 1px 0 rgba(255, 255, 255, 0.22),
              inset 0 -1px 1px 0 rgba(0, 0, 0, 0.15)
            `,
          }}
        >
          {/* Top Luminous Glass Edge Highlight */}
          <div 
            className="absolute inset-x-4 top-0 h-[1px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.10) 15%, rgba(255, 255, 255, 0.26) 50%, rgba(255, 255, 255, 0.10) 85%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* Subtle Moving Liquid Glass Highlight / Sheen */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-[22px] overflow-hidden"
            aria-hidden="true"
          >
            <div 
              className="w-[40%] h-full pointer-events-none animate-glass-sweep"
              style={{
                background: 'linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.006) 30%, rgba(255, 255, 255, 0.030) 50%, rgba(255, 255, 255, 0.006) 70%, transparent 100%)',
              }}
            />
          </div>

          {[
            { id: 'about', label: 'ABOUT', targetY: 0 },
            { id: 'work', label: 'WORK', targetY: 590 },
            { id: 'experience', label: 'EXPERIENCE', targetY: 1140 },
            { id: 'tech', label: 'TECH', targetY: 1140 },
            { id: 'culture', label: 'CULTURE', targetY: 480 },
            { id: 'worldTour', label: 'WORLD TOUR', targetY: 1140 },
            { id: 'contact', label: 'CONTACT', targetY: 0 },
          ].map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  scrollToSection(item.targetY);
                }}
                className={`
                  relative z-10 px-2.5 sm:px-3.5 py-1.5 rounded-[14px] text-[11px] sm:text-[12px] tracking-[0.03em]
                  transition-all duration-150 cursor-pointer whitespace-nowrap
                  ${isActive 
                    ? 'text-white font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08] border border-transparent font-medium'
                  }
                `}
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.70)',
                  ...(isActive ? {
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.20), 0 2px 5px rgba(0, 0, 0, 0.15)',
                  } : {}),
                }}
              >
                {item.label}
              </button>
            );
          })}

          {/* Subtle Glass Divider */}
          <div 
            className="relative z-10 w-[1px] h-3.5 mx-0.5 sm:mx-1 shrink-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.16) 50%, transparent 100%)',
            }}
            aria-hidden="true" 
          />

          {/* Reset Board Button */}
          <button
            onClick={handleResetBoard}
            title="Reset desk objects to original composition"
            className="relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[14px] text-[11px] sm:text-[12px] font-medium tracking-[0.02em] text-white/80 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 border border-transparent"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.70)',
            }}
          >
            <RotateCcw size={12} className="opacity-80" />
            <span>RESET BOARD</span>
          </button>

          {/* Subtle Glass Divider */}
          <div 
            className="relative z-10 w-[1px] h-3.5 mx-0.5 shrink-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.16) 50%, transparent 100%)',
            }}
            aria-hidden="true" 
          />

          {/* Subtle Audio Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute physical sounds" : "Unmute physical sounds"}
            aria-label={soundEnabled ? "Mute physical sounds" : "Unmute physical sounds"}
            className="relative z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-150 cursor-pointer shrink-0"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.70)',
            }}
          >
            {soundEnabled ? <Volume2 size={13} className="opacity-80" /> : <VolumeX size={13} className="opacity-50" />}
          </button>
        </nav>
      </div>
    </DeskContext.Provider>
  );
}
