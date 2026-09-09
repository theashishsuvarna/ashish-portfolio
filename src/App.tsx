
import React, { useState, useEffect, useRef } from 'react';
import { Draggable, DeskContext } from './components/Draggable';
import { Paper, Tape, BinderClip, ProjectCard, TornPaper } from './components/DeskItems';
import { CuttingMatSurface } from './components/CuttingMatSurface';
import { ASSETS } from './assets';
import { MapPin, Mail, Phone, Link, X, Code, ExternalLink, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  cord: 'drop-shadow-[0.5px_1.5px_1.5px_rgba(0,0,0,0.58)] drop-shadow-[2px_6px_10px_rgba(0,0,0,0.22)]',
  paperCard: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.42)] drop-shadow-[3px_8px_16px_rgba(0,0,0,0.24)]',
  paper: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.42)] drop-shadow-[3px_8px_16px_rgba(0,0,0,0.24)]',
  passport: 'drop-shadow-[1px_2px_2px_rgba(0,0,0,0.62)] drop-shadow-[4px_11px_20px_rgba(0,0,0,0.32)]',
  noteStack: 'drop-shadow-[1px_1.5px_2px_rgba(0,0,0,0.52)] drop-shadow-[3px_7px_14px_rgba(0,0,0,0.25)]',
};

const PROJECTS_DATA = [
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
    github: "https://github.com/theashishsuvarna/revantaai", live: "https://revantaai.vercel.app/"
  },
  {
    id: "nexora",
    title: "NEXORA",
    subtitle: "AI-Powered Procurement OS",
    role: "Frontend Engineer",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    whatIBuilt: "A comprehensive operating system for modern procurement teams, leveraging AI to streamline vendor management, contract analysis, and purchasing workflows.",
    features: [
      "AI-assisted contract parsing",
      "Real-time vendor risk scoring",
      "Automated PO generation"
    ],
    github: "https://github.com/theashishsuvarna/Nexora-Procurement-OS", live: "https://osnexora.vercel.app/"
  },
  {
    id: "aikya",
    title: "AIKYA",
    subtitle: "Organization Intelligence & Management SaaS",
    role: "Full-Stack Developer",
    tags: ["Next.js", "AI Models", "Data Analytics"],
    whatIBuilt: "A centralized management SaaS that aggregates organizational data to provide actionable intelligence, improving team alignment and resource allocation.",
    features: [
      "Cross-department analytics",
      "Resource utilization forecasting",
      "Customizable KPI tracking"
    ],
    github: "https://github.com/theashishsuvarna/aikya", live: "https://aikyaos.vercel.app/"
  },
  {
    id: "zerocap",
    title: "ZEROCAP",
    subtitle: "Trust-less Delivery for Freelancers",
    role: "Web3 Developer",
    tags: ["Web Development", "Payments", "UPI"],
    whatIBuilt: "A secure milestone-based payment and delivery platform for freelancers, ensuring trust-less transactions using escrow-like mechanisms integrated with UPI.",
    features: [
      "Milestone-based payouts",
      "Integrated UPI payment gateway",
      "Automated invoice generation"
    ],
    github: "https://github.com/theashishsuvarna/zerocap", live: "https://zerocap.vercel.app/"
  },
  {
    id: "bunkgo",
    title: "BUNKKGO",
    subtitle: "Hyperlocal Event Discovery Platform",
    role: "Frontend Developer",
    tags: ["Next.js 16", "TypeScript", "Tailwind v4"],
    whatIBuilt: "A hyperlocal social platform designed to help users discover underground events, college fests, and local gatherings in real-time.",
    features: [
      "Location-based event filtering",
      "Real-time social feeds",
      "Ticket booking integration"
    ],
    github: "https://github.com/theashishsuvarna/bunkgo", live: "https://bunkgo.vercel.app/"
  }
];

export interface DeskItemLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  x: number;
  y: number;
}

export const DESK_LAYOUT: Record<string, DeskItemLayout> = {
  // ==================================================
  // UPPER-LEFT: Profile sheet, Pikachu, Polaroid, Good Ideas note, React sticker
  // ==================================================
  "obj_CreativeDeskPortfolio": { left: 95, top: 90, width: 420, height: 530, rotation: -0.5, zIndex: 2, x: 95, y: 90 },
  "polaroid": { left: 410, top: 110, width: 210, height: 270, rotation: 3, zIndex: 3, x: 410, y: 110 },
  "pikachu": { left: 15, top: 505, width: 160, height: 150, rotation: -6, zIndex: 25, x: 15, y: 505 },
  "goodIdeas": { left: 410, top: 530, width: 180, height: 100, rotation: -3, zIndex: 4, x: 410, y: 530 },
  "obj_20850": { left: 615, top: 530, width: 65, height: 65, rotation: -8, zIndex: 10, x: 615, y: 530 },

  // ==================================================
  // UPPER-MIDDLE: Tech Desk title, Pixel 9a, Keyboard, 404 card, Pendrive, Spearmint gum, Figma, Orange gadget
  // ==================================================
  "techDeskTitle": { left: 1030, top: 75, width: 150, height: 45, rotation: 1, zIndex: 14, x: 1030, y: 75 },
  "pixel9a": { left: 760, top: 40, width: 540, height: 520, rotation: -12, zIndex: 6, x: 760, y: 40 },
  "pen_24951": { left: 1170, top: 130, width: 140, height: 95, rotation: 45, zIndex: 8, x: 1170, y: 130 },
  "keyboard": { left: 885, top: 235, width: 560, height: 250, rotation: -1, zIndex: 12, x: 885, y: 235 },
  "obj_20063": { left: 1165, top: 300, width: 100, height: 60, rotation: 0, zIndex: 9, x: 1165, y: 300 },
  "gum": { left: 720, top: 550, width: 210, height: 75, rotation: -5, zIndex: 13, x: 720, y: 550 },
  "obj_20567": { left: 1120, top: 490, width: 60, height: 85, rotation: 12, zIndex: 11, x: 1120, y: 490 },
  "car2": { left: 1270, top: 480, width: 280, height: 185, rotation: 0, zIndex: 14, x: 1270, y: 480 },

  // ==================================================
  // UPPER-RIGHT: Matcha glass pair (EXACTLY 2 GLASSES), Trimax Pen, Japan Book, Japan Notes, Washi tape, Wired EarPods
  // ==================================================
  "matcha": { left: 1515, top: 12, width: 360, height: 640, rotation: -4, zIndex: 35, x: 1515, y: 12 },
  "pen": { left: 1870, top: 120, width: 450, height: 80, rotation: 40, zIndex: 15, x: 1870, y: 120 },
  "japanBook1": { left: 1995, top: 95, width: 350, height: 495, rotation: -1.5, zIndex: 10, x: 1995, y: 95 },
  "japanNotes": { left: 1830, top: 280, width: 160, height: 170, rotation: -3, zIndex: 13, x: 1830, y: 280 },
  "washiTape": { left: 1700, top: 490, width: 80, height: 60, rotation: -8, zIndex: 14, x: 1700, y: 490 },
  "earPods": { left: 2200, top: 280, width: 500, height: 375, rotation: 0, zIndex: 16, x: 2200, y: 280 },

  // ==================================================
  // MIDDLE: Project Archive row (5 cards in ONE horizontal row) & Badges
  // ==================================================
  "obj_26737": { left: 115, top: 590, width: 180, height: 45, rotation: -1, zIndex: 16, x: 115, y: 590 },
  "clip1": { left: 95, top: 660, width: 260, height: 350, rotation: -0.5, zIndex: 17, x: 95, y: 660 },
  "clip1_27709": { left: 395, top: 665, width: 260, height: 350, rotation: 0.5, zIndex: 18, x: 395, y: 665 },
  "realMadrid": { left: 465, top: 1025, width: 180, height: 120, rotation: -3, zIndex: 25, x: 465, y: 1025 },
  "clip1_28304": { left: 695, top: 675, width: 260, height: 350, rotation: -0.5, zIndex: 19, x: 695, y: 675 },
  "clip1_28899": { left: 995, top: 665, width: 260, height: 350, rotation: 1, zIndex: 20, x: 995, y: 665 },
  "clip1_29494": { left: 1295, top: 660, width: 260, height: 350, rotation: -1.5, zIndex: 21, x: 1295, y: 660 },
  "godLike": { left: 1390, top: 910, width: 160, height: 210, rotation: 5, zIndex: 25, x: 1390, y: 910 },

  // ==================================================
  // MIDDLE-RIGHT: Music cluster (compact vertical stack)
  // ==================================================
  "nowPlaying": { left: 1585, top: 460, width: 150, height: 45, rotation: 2, zIndex: 22, x: 1585, y: 460 },
  "yen": { left: 1720, top: 470, width: 45, height: 45, rotation: 0, zIndex: 23, x: 1720, y: 470 },
  "karanAujla": { left: 1545, top: 520, width: 150, height: 150, rotation: -3, zIndex: 24, x: 1545, y: 520 },
  "krsna": { left: 1585, top: 650, width: 150, height: 150, rotation: 4, zIndex: 25, x: 1585, y: 650 },
  "seedheMaut": { left: 1565, top: 770, width: 150, height: 150, rotation: -2, zIndex: 26, x: 1565, y: 770 },

  // ==================================================
  // RIGHT: Gaming & Sports cluster, Cars, Controller, Watch
  // ==================================================
  "gamingSports": { left: 1930, top: 240, width: 160, height: 45, rotation: -2, zIndex: 27, x: 1930, y: 240 },
  "lighter": { left: 1780, top: 395, width: 250, height: 180, rotation: 12, zIndex: 29, x: 1780, y: 395 },
  "rcb": { left: 1895, top: 530, width: 180, height: 235, rotation: 0, zIndex: 28, x: 1895, y: 530 },
  "car1": { left: 2180, top: 600, width: 270, height: 150, rotation: 30, zIndex: 32, x: 2180, y: 600 },

  // ==================================================
  // LOWER AREA: Work Log, Academic Archive, Tech / Skills, Certifications & AirPods
  // ==================================================
  "clip2": { left: 95, top: 1210, width: 360, height: 450, rotation: 1, zIndex: 33, x: 95, y: 1210 },
  "academicArchive": { left: 445, top: 1230, width: 340, height: 430, rotation: -1.5, zIndex: 34, x: 445, y: 1230 },
  "clip1_39370": { left: 775, top: 1200, width: 360, height: 460, rotation: 1, zIndex: 35, x: 775, y: 1200 },
  "certifications": { left: 1115, top: 1220, width: 340, height: 440, rotation: -1, zIndex: 36, x: 1115, y: 1220 },
  "airpods": { left: 1440, top: 1320, width: 260, height: 260, rotation: 0, zIndex: 42, x: 1440, y: 1320 },

  // ==================================================
  // LOWER-RIGHT: World Tour sequence, Controller, Watch
  // ==================================================
  "worldTour": { left: 1545, top: 1010, width: 150, height: 45, rotation: -2, zIndex: 37, x: 1545, y: 1010 },
  "passport": { left: 1520, top: 1060, width: 190, height: 245, rotation: -4, zIndex: 38, x: 1520, y: 1060 },
  "rome": { left: 1630, top: 1090, width: 210, height: 240, rotation: 1, zIndex: 39, x: 1630, y: 1090 },
  "istanbul": { left: 1735, top: 1020, width: 160, height: 300, rotation: 2, zIndex: 40, x: 1735, y: 1020 },
  "seoul": { left: 1855, top: 1060, width: 140, height: 180, rotation: -1, zIndex: 41, x: 1855, y: 1060 },
  "hongKong": { left: 1955, top: 1010, width: 150, height: 290, rotation: 3, zIndex: 42, x: 1955, y: 1010 },
  "amsterdam": { left: 2085, top: 1050, width: 195, height: 285, rotation: -2, zIndex: 43, x: 2085, y: 1050 },
  "allIWanna": { left: 1755, top: 1330, width: 180, height: 95, rotation: -4, zIndex: 44, x: 1755, y: 1330 },
  "controller": { left: 2270, top: 1120, width: 200, height: 200, rotation: -4, zIndex: 45, x: 2270, y: 1120 },
  "watch": { left: 2270, top: 1340, width: 420, height: 420, rotation: 22, zIndex: 46, x: 2270, y: 1340 },

  // Reserved references for layout integrity
  "pokeBall": { left: 2220, top: 620, width: 50, height: 50, rotation: 5, zIndex: 28, x: 2220, y: 620 },
  "noteStack": { left: 1690, top: 910, width: 180, height: 120, rotation: -9, zIndex: 24, x: 1690, y: 910 },
};

const BASE_WIDTH = 2700;
const BASE_HEIGHT = 1700;

export default function App() {
  const [activeProject, setActiveProject] = useState<typeof PROJECTS_DATA[0] | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('about');
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      return window.innerWidth / BASE_WIDTH;
    }
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = viewportRef.current?.clientWidth || window.innerWidth;
      if (containerWidth > 0) {
        setScale(containerWidth / BASE_WIDTH);
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

  // Close project modal on Escape key press
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

  useEffect(() => {
    const imageUrls = Object.values(ASSETS);
    let loadedCount = 0;
    
    if (imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    const onLoad = () => {
      loadedCount++;
      if (loadedCount >= imageUrls.length) {
        setImagesLoaded(true);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = url;
    });
  }, []);

  return (
    <DeskContext.Provider value={{ scale, resetKey }}>
      {/* Real White Drafting Desk Surface with intentional top framing and subtle studio table atmosphere */}
      <div 
        id="desk-surface"
        className="w-full font-sans selection:bg-black selection:text-white relative overflow-x-hidden pt-8 sm:pt-10 md:pt-14 pb-16 sm:pb-20 px-3 sm:px-6 md:px-8"
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
          {/* Desk Surface (Realistic Self-Healing Cutting Mat) */}
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
              TOP LEFT 
          ========================================= */}
          
          <Draggable id="obj_CreativeDeskPortfolio" layout={DESK_LAYOUT.obj_CreativeDeskPortfolio}>
            <div className="relative">
              <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[-2deg] w-[100px]" />
              <Paper className="w-[420px] flex flex-col pt-10 pb-12 px-10 text-gray-800">
                <div className="flex justify-between items-start text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-widest border-b border-gray-200 pb-2">
                  <span>Creative Desk / Portfolio</span>
                  <span>Est. 2025</span>
                </div>
                
                <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-gray-900">ASHISH SUVARNA</h1>
                <p className="text-lg font-bold text-gray-600 mb-4 border-l-2 border-gray-900 pl-4">Product Designer | UI/UX & Web Dev</p>
                
                <div className="flex items-center gap-2 text-gray-500 mb-8 text-sm font-medium">
                  <MapPin size={16} />
                  <span>Navi Mumbai, India</span>
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

          <Draggable id="polaroid" layout={DESK_LAYOUT.polaroid}>
            <div 
              className="bg-[#faf8f4] p-3.5 pb-4 rounded-[2px] relative"
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.42), 2px 7px 16px rgba(0,0,0,0.25), 6px 18px 28px rgba(0,0,0,0.14)',
                borderBottom: '1.5px solid #dcd7ca',
                borderRight: '1.5px solid #dcd7ca',
              }}
            >
              <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[-2deg] w-14" />
              <div className="w-[180px] h-[200px] bg-gray-900 mb-3 overflow-hidden shadow-inner relative z-10 border border-gray-300">
                <img src={ASSETS.mumbai} alt="Mumbai Skyline" className="w-full h-full object-cover filter contrast-125 saturate-50" draggable={false} />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
              </div>
              <div className="font-['Caveat'] text-2xl text-gray-800 -mt-1 font-bold z-10 px-1">Navi Mumbai ♡</div>
            </div>
          </Draggable>
          
          <Draggable id="goodIdeas" layout={DESK_LAYOUT.goodIdeas}>
            <TornPaper className="w-[180px] text-center font-['Caveat'] text-2xl flex flex-col items-center">
              <Tape className="top-[-8px] w-12 rotate-[-5deg]" />
              <span className="mb-2 text-gray-800 font-bold">Good Ideas</span>
              <span className="mb-2 text-gray-800 font-bold">Better Products</span>
            </TornPaper>
          </Draggable>

          {/* =========================================
              TOP CENTER (TECH DESK)
          ========================================= */}

          <Draggable id="techDeskTitle" layout={DESK_LAYOUT.techDeskTitle}>
            <TornPaper className="w-[150px] text-center font-bold text-sm tracking-widest uppercase">
              <Tape className="top-[-8px] w-10 rotate-3" />
              TECH DESK
            </TornPaper>
          </Draggable>

          <Draggable id="keyboard" layout={DESK_LAYOUT.keyboard}>
            <img src={ASSETS.keyboard} alt="Keyboard" className={`w-[560px] h-auto ${REAL_SHADOW.keyboard}`} draggable={false} />
          </Draggable>

          <Draggable id="pixel9a" layout={DESK_LAYOUT.pixel9a}>
            <img src={ASSETS.pixel9a} alt="Pixel 9a" className={`w-[540px] h-auto ${REAL_SHADOW.phone} scale-[1.18] transform origin-center`} draggable={false} />
          </Draggable>

          <Draggable id="airpods" layout={DESK_LAYOUT.airpods}>
            <img src={ASSETS.airpods} alt="AirPods" className={`w-[260px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
          </Draggable>

          <Draggable id="obj_20063" layout={DESK_LAYOUT.obj_20063}>
            <div 
              className="bg-[#faf8f4] p-4 rounded-sm border border-[#e0dad0]"
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.40), 2px 6px 14px rgba(0,0,0,0.22)',
              }}
            >
              <div className="font-extrabold text-2xl text-gray-800">404</div>
              <div className="text-[8px] tracking-widest font-bold text-gray-600">NOT FOUND</div>
            </div>
          </Draggable>

          <Draggable id="obj_20567" layout={DESK_LAYOUT.obj_20567}>
            <img src={ASSETS.figma} alt="Figma" className={`w-[60px] h-auto ${REAL_SHADOW.sticker}`} draggable={false} />
          </Draggable>

          <Draggable id="obj_20850" layout={DESK_LAYOUT.obj_20850}>
            <img src={ASSETS.react} alt="React" className={`w-[65px] h-auto ${REAL_SHADOW.sticker}`} draggable={false} />
          </Draggable>

          {/* =========================================
              TOP RIGHT
          ========================================= */}

          <Draggable id="japanBook1" layout={DESK_LAYOUT.japanBook1}>
            <img src={ASSETS.japanBook1} alt="Japanese Book 1" className={`w-[350px] h-auto ${REAL_SHADOW.book} scale-[1.15] transform origin-center`} draggable={false} />
          </Draggable>

          <Draggable id="matcha" layout={DESK_LAYOUT.matcha}>
            <img src={ASSETS.matcha} alt="Matcha Drink Pair" className={`w-[360px] h-auto ${REAL_SHADOW.matcha} opacity-95 mix-blend-normal`} draggable={false} />
          </Draggable>

          <Draggable id="japanNotes" layout={DESK_LAYOUT.japanNotes}>
            <div 
              className="relative bg-[#ffffff] p-8 rounded-xl border border-gray-200"
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.36), 2px 8px 18px rgba(0,0,0,0.22), 6px 18px 30px rgba(0,0,0,0.12)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
              <span className="text-center font-bold tracking-widest text-[12px] mb-4 border-b border-gray-300 pb-2 text-gray-700 relative z-10 block">JAPAN NOTES</span>
              <div className="flex-1 w-full flex flex-col gap-3 opacity-40 relative z-10">
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-[70%] h-0.5 bg-gray-600 rounded"></div>
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-[90%] h-0.5 bg-gray-600 rounded"></div>
              </div>
            </div>
          </Draggable>

          <Draggable id="washiTape" layout={DESK_LAYOUT.washiTape}>
            <img src={ASSETS.washiTape} alt="Washi Tape" className={`w-[80px] h-auto ${REAL_SHADOW.mediumObject} scale-[1.20] transform origin-center`} draggable={false} />
          </Draggable>

          <Draggable id="yen" layout={DESK_LAYOUT.yen}>
            <img src={ASSETS.yen} alt="Yen Coin" className={`w-[45px] h-[45px] ${REAL_SHADOW.coin}`} draggable={false} />
          </Draggable>

          <Draggable id="earPods" layout={DESK_LAYOUT.earPods}>
            <img src={ASSETS.earPods} alt="Wired EarPods" className={`w-[500px] h-auto ${REAL_SHADOW.cord}`} draggable={false} />
          </Draggable>
          <Draggable id="pen" layout={DESK_LAYOUT.pen}>
            <img src={ASSETS.pen} alt="Pen" className={`w-[450px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
          </Draggable>
          <Draggable id="lighter" layout={DESK_LAYOUT.lighter}>
            <img src={ASSETS.lighter} alt="Lighter" className={`w-[250px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
          </Draggable>
          <Draggable id="gum" layout={DESK_LAYOUT.gum}>
            <img src={ASSETS.gum} alt="Gum" className={`w-[210px] h-auto ${REAL_SHADOW.smallObject} scale-[1.20] transform origin-center`} draggable={false} />
          </Draggable>
          <Draggable id="pen_24951" layout={DESK_LAYOUT.pen_24951}>
            <img src={ASSETS.pendrive} alt="Pendrive" className={`w-[140px] h-auto ${REAL_SHADOW.smallObject} scale-[1.25] transform origin-center`} draggable={false} />
          </Draggable>
          <Draggable id="watch" layout={DESK_LAYOUT.watch}>
            <img src={ASSETS.watch} alt="Watch" className={`w-[420px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
          </Draggable>

          <Draggable id="car2" layout={DESK_LAYOUT.car2}>
            <img src={ASSETS.car2} alt="Car 2" className={`w-[280px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
          </Draggable>
          <Draggable id="car1" layout={DESK_LAYOUT.car1}>
            <img src={ASSETS.car} alt="Car 1" className={`w-[270px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
          </Draggable>

          {/* =========================================
              CENTER (PROJECT ARCHIVE)
          ========================================= */}
          
          <Draggable id="obj_26737" layout={DESK_LAYOUT.obj_26737}>
            <TornPaper className="w-[180px] text-center font-bold text-sm tracking-widest uppercase shadow-[0_10px_15px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)]">
              <Tape className="top-[-8px] w-12" />
              PROJECT ARCHIVE
            </TornPaper>
          </Draggable>

          <Draggable id="clip1" layout={DESK_LAYOUT.clip1} onClick={() => setActiveProject(PROJECTS_DATA[0])}>
            <div className="relative w-[260px] cursor-pointer" onClick={() => setActiveProject(PROJECTS_DATA[0])}>
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center pointer-events-none" alt="Clip" />
              <ProjectCard 
                title={PROJECTS_DATA[0].title}
                subtitle={PROJECTS_DATA[0].subtitle}
                tags={PROJECTS_DATA[0].tags}
                onClick={() => setActiveProject(PROJECTS_DATA[0])}
              />
            </div>
          </Draggable>

          <Draggable id="clip1_27709" layout={DESK_LAYOUT.clip1_27709} onClick={() => setActiveProject(PROJECTS_DATA[1])}>
            <div className="relative w-[260px] cursor-pointer" onClick={() => setActiveProject(PROJECTS_DATA[1])}>
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center pointer-events-none" alt="Clip" />
              <ProjectCard 
                title={PROJECTS_DATA[1].title}
                subtitle={PROJECTS_DATA[1].subtitle}
                tags={PROJECTS_DATA[1].tags}
                onClick={() => setActiveProject(PROJECTS_DATA[1])}
              />
            </div>
          </Draggable>

          <Draggable id="clip1_28304" layout={DESK_LAYOUT.clip1_28304} onClick={() => setActiveProject(PROJECTS_DATA[2])}>
            <div className="relative w-[260px] cursor-pointer" onClick={() => setActiveProject(PROJECTS_DATA[2])}>
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center pointer-events-none" alt="Clip" />
              <ProjectCard 
                title={PROJECTS_DATA[2].title}
                subtitle={PROJECTS_DATA[2].subtitle}
                tags={PROJECTS_DATA[2].tags}
                onClick={() => setActiveProject(PROJECTS_DATA[2])}
              />
            </div>
          </Draggable>

          <Draggable id="clip1_28899" layout={DESK_LAYOUT.clip1_28899} onClick={() => setActiveProject(PROJECTS_DATA[3])}>
            <div className="relative w-[260px] cursor-pointer" onClick={() => setActiveProject(PROJECTS_DATA[3])}>
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center pointer-events-none" alt="Clip" />
              <ProjectCard 
                title={PROJECTS_DATA[3].title}
                subtitle={PROJECTS_DATA[3].subtitle}
                tags={PROJECTS_DATA[3].tags}
                onClick={() => setActiveProject(PROJECTS_DATA[3])}
              />
            </div>
          </Draggable>

          <Draggable id="clip1_29494" layout={DESK_LAYOUT.clip1_29494} onClick={() => setActiveProject(PROJECTS_DATA[4])}>
            <div className="relative w-[260px] cursor-pointer" onClick={() => setActiveProject(PROJECTS_DATA[4])}>
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center pointer-events-none" alt="Clip" />
              <ProjectCard 
                title={PROJECTS_DATA[4].title}
                subtitle={PROJECTS_DATA[4].subtitle}
                tags={PROJECTS_DATA[4].tags}
                onClick={() => setActiveProject(PROJECTS_DATA[4])}
              />
            </div>
          </Draggable>

          {/* =========================================
              CENTER RIGHT (NOW PLAYING)
          ========================================= */}

          <Draggable id="nowPlaying" layout={DESK_LAYOUT.nowPlaying}>
            <TornPaper className="w-[150px] text-center font-bold text-sm tracking-widest uppercase">
              <Tape className="top-[-8px] w-12 rotate-[-4deg]" />
              NOW PLAYING
            </TornPaper>
          </Draggable>

          <Draggable id="karanAujla" layout={DESK_LAYOUT.karanAujla}>
            <div 
              className="w-[150px] h-[150px] bg-black border border-[#2a2a2a] relative overflow-hidden"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.45), 2px 8px 18px rgba(0,0,0,0.30)',
              }}
            >
              <img src={ASSETS.karanAujla} alt="Karan Aujla" className="w-full h-full object-cover opacity-90" draggable={false} />
              <div className="absolute top-1.5 left-1.5 text-white font-bold text-[10px] tracking-widest drop-shadow-md">KARAN AUJLA</div>
            </div>
          </Draggable>

          <Draggable id="krsna" layout={DESK_LAYOUT.krsna}>
            <div 
              className="w-[150px] h-[150px] bg-black border border-[#2a2a2a] relative overflow-hidden"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.45), 2px 8px 18px rgba(0,0,0,0.30)',
              }}
            >
              <img src={ASSETS.krsna} alt="KR$NA" className="w-full h-full object-cover opacity-90" draggable={false} />
              <div className="absolute top-1.5 left-1.5 text-white font-bold text-[10px] tracking-widest drop-shadow-md">KR$NA</div>
            </div>
          </Draggable>
          
          <Draggable id="seedheMaut" layout={DESK_LAYOUT.seedheMaut}>
            <div 
              className="w-[150px] h-[150px] bg-black border border-[#2a2a2a] relative overflow-hidden"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.45), 2px 8px 18px rgba(0,0,0,0.30)',
              }}
            >
              <img src={ASSETS.seedheMaut} alt="Seedhe Maut" className="w-full h-full object-cover opacity-90" draggable={false} />
              <div className="absolute top-1.5 left-1.5 text-white font-bold text-[10px] tracking-widest drop-shadow-md">SEEDHE MAUT</div>
            </div>
          </Draggable>

          {/* =========================================
              RIGHT (GAMING / SPORTS)
          ========================================= */}

          <Draggable id="gamingSports" layout={DESK_LAYOUT.gamingSports}>
            <TornPaper className="w-[160px] text-center font-bold text-sm tracking-widest uppercase">
              <Tape className="top-[-8px] w-12 rotate-3" />
              GAMING & SPORTS
            </TornPaper>
          </Draggable>

          <Draggable id="controller" layout={DESK_LAYOUT.controller}>
            <img src={ASSETS.controller} alt="Controller" className={`w-[200px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
          </Draggable>

          <Draggable id="pikachu" layout={DESK_LAYOUT.pikachu}>
            <img src={ASSETS.pikachu} alt="Pikachu" className={`w-[160px] h-auto ${REAL_SHADOW.mediumObject}`} draggable={false} />
          </Draggable>
          
          <Draggable id="godLike" layout={DESK_LAYOUT.godLike}>
            <img src={ASSETS.godLike} alt="GodLike" className={`w-[160px] h-auto ${REAL_SHADOW.sticker}`} draggable={false} />
          </Draggable>

          <Draggable id="realMadrid" layout={DESK_LAYOUT.realMadrid}>
            <img src={ASSETS.realMadrid} alt="Real Madrid" className={`w-[180px] h-auto ${REAL_SHADOW.sticker}`} draggable={false} />
          </Draggable>
          
          <Draggable id="rcb" layout={DESK_LAYOUT.rcb}>
            <img src={ASSETS.rcb} alt="RCB" className={`w-[180px] h-auto ${REAL_SHADOW.sticker}`} draggable={false} />
          </Draggable>


          {/* =========================================
              BOTTOM LEFT (WORK LOG)
          ========================================= */}

          <Draggable id="clip2" layout={DESK_LAYOUT.clip2}>
            <div className="relative">
              <img src={ASSETS.clip2} className="absolute top-[-20px] left-1/4 -translate-x-1/2 w-[50px] drop-shadow-md z-20 rotate-[10deg] scale-[1.20] transform origin-center" alt="Clip" />
              <Tape className="top-[-8px] left-3/4 -translate-x-1/2 rotate-[-4deg] w-[60px]" />
              <Paper className="w-[360px] p-8 text-gray-800">
                <h2 className="text-base font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-5">WORK LOG</h2>
                
                <div className="mb-6 border-b border-gray-300 pb-5">
                  <h3 className="font-bold text-gray-900 text-sm">Influencer Marketing Associate</h3>
                  <p className="text-xs font-medium text-gray-500 mb-3">Past Experience – Navi Mumbai</p>
                  <ul className="list-disc pl-5 text-xs font-medium text-gray-700 space-y-1.5">
                    <li>Coordinated influencer collaborations</li>
                    <li>Managed creator communications</li>
                    <li>Designed campaign creatives</li>
                  </ul>
                </div>
                
                <div className="mb-6 border-b border-gray-300 pb-5">
                  <h3 className="font-bold text-gray-900 text-sm">DI'CORSA Clothing Brand</h3>
                  <p className="text-xs font-medium text-gray-500 mb-3">Designer</p>
                  <ul className="list-disc pl-5 text-xs font-medium text-gray-700 space-y-1.5">
                    <li>Branding systems & visual assets</li>
                    <li>Marketing creatives</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Freelance Video Editor & Designer</h3>
                  <ul className="list-disc pl-5 text-xs font-medium text-gray-700 space-y-1.5 mt-3">
                    <li>Short-form video</li>
                    <li>Thumbnails & posters</li>
                    <li>Creator and brand work</li>
                  </ul>
                </div>
              </Paper>
            </div>
          </Draggable>

          {/* =========================================
              BOTTOM CENTER-LEFT (ACADEMIC ARCHIVE)
          ========================================= */}

          <Draggable id="academicArchive" layout={DESK_LAYOUT.academicArchive}>
            <div className="relative">
              <Tape className="top-[-8px] left-1/2 -translate-x-1/2 rotate-[2deg] w-[90px]" />
              <Paper className="w-[340px] p-8 text-gray-800">
                <h2 className="text-base font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-5">ACADEMIC ARCHIVE</h2>
                
                <div className="mb-6 border-b border-gray-300 pb-5">
                  <h3 className="font-bold text-gray-900 text-sm">Ratan Tata Maharashtra State<br/>Skills University</h3>
                  <p className="text-xs font-bold text-gray-500 mt-2">B.Tech in Computer Technology</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs font-bold text-gray-500 mt-2">CGPA: 8.5/10</p>
                    <p className="text-xs font-bold text-gray-900">CGPA: 7.7</p>
                  </div>
                </div>
                
                <div className="mb-6 border-b border-gray-300 pb-5">
                  <h3 className="font-bold text-gray-900 text-sm">Jijamata Junior College</h3>
                  <p className="text-xs font-bold text-gray-500 mt-2">12th – Computer Science (HSC)</p>
                  <p className="text-xs font-bold text-gray-500 mt-2">CGPA: 8.5/10</p>
</div>
                
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">St. Mary's Multipurpose High School</h3>
                  <p className="text-xs font-bold text-gray-500 mt-2">Kindergarten to Xth</p>
                  <p className="text-xs font-bold text-gray-500 mt-2">CGPA: 8.5/10</p>
</div>
              </Paper>
            </div>
          </Draggable>

          {/* =========================================
              BOTTOM CENTER (TECH / SKILLS)
          ========================================= */}

          <Draggable id="clip1_39370" layout={DESK_LAYOUT.clip1_39370}>
            <div className="relative">
              <img src={ASSETS.clip1} className="absolute top-[-20px] left-[20px] w-[50px] drop-shadow-md z-20 scale-[1.20] transform origin-center" alt="Clip" />
              <Paper className="w-[360px] p-8 text-gray-800">
                <h2 className="text-base font-extrabold uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-5">TECH / SKILLS</h2>
                
                <div className="flex flex-wrap gap-2.5 text-xs font-extrabold text-gray-700">
                  <span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">HTML5</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">CSS3</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">JavaScript</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">TypeScript</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">React.js</span>
<span className="bg-gray-800 text-white px-2.5 py-1.5 rounded-sm border border-gray-900 shadow-md">React</span>
                  <span className="bg-gray-800 text-white px-2.5 py-1.5 rounded-sm border border-gray-900 shadow-md">Next.js</span>
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-sm border border-blue-200 shadow-sm">Figma</span>
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-sm border border-blue-200 shadow-sm">Adobe XD</span>
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-sm border border-blue-200 shadow-sm">Photoshop</span>
                  <span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">Next.js</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">Tailwind CSS</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">Node.js</span>
<span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">Figma</span>
</div>
                
                <hr className="my-6 border-gray-300" />
                
                <div className="flex flex-wrap gap-2.5 text-xs font-extrabold text-gray-700">
                  <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1.5 rounded-sm border border-yellow-200 shadow-sm">UI/UX Design</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1.5 rounded-sm border border-yellow-200 shadow-sm">Product Design</span>
                  <span className="bg-green-100 text-green-800 px-2.5 py-1.5 rounded-sm border border-green-200 shadow-sm">Content Strategy</span>
                  <span className="bg-[#eae6dc] px-2.5 py-1.5 rounded-sm border border-[#d4cfc5] shadow-sm">Framer Motion</span>
</div>
              </Paper>
            </div>
          </Draggable>

          {/* =========================================
              BOTTOM CENTER-RIGHT (WORLD TOUR)
          ========================================= */}

          <Draggable id="worldTour" layout={DESK_LAYOUT.worldTour}>
            <TornPaper className="w-[150px] text-center font-bold text-sm tracking-widest uppercase">
              <Tape className="top-[-8px] w-12 rotate-3" />
              WORLD TOUR
            </TornPaper>
          </Draggable>

          <Draggable id="passport" layout={DESK_LAYOUT.passport}>
            <img src={ASSETS.passport} alt="Passport" className={`w-[190px] h-auto ${REAL_SHADOW.thickObject}`} draggable={false} />
          </Draggable>
          
          <Draggable id="rome" layout={DESK_LAYOUT.rome}>
            <img src={ASSETS.rome} alt="Rome Passport" className={`w-[210px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
          </Draggable>
          
          <Draggable id="istanbul" layout={DESK_LAYOUT.istanbul}>
            <img src={ASSETS.istanbul} alt="Istanbul Ticket" className={`w-[160px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
          </Draggable>
          
          <Draggable id="seoul" layout={DESK_LAYOUT.seoul}>
            <img src={ASSETS.seoul} alt="Seoul Tag" className={`w-[140px] h-auto ${REAL_SHADOW.smallObject}`} draggable={false} />
          </Draggable>
          
          <Draggable id="hongKong" layout={DESK_LAYOUT.hongKong}>
            <img src={ASSETS.hongKong} alt="Hong Kong Ticket" className={`w-[150px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
          </Draggable>
          
          <Draggable id="amsterdam" layout={DESK_LAYOUT.amsterdam}>
            <img src={ASSETS.amsterdam} alt="Amsterdam Postcard" className={`w-[195px] h-auto ${REAL_SHADOW.paper}`} draggable={false} />
          </Draggable>

          <Draggable id="allIWanna" layout={DESK_LAYOUT.allIWanna}>
            <TornPaper className="w-[180px] text-center font-['Caveat'] text-2xl flex flex-col items-center p-4">
              <span>All I wanna</span>
              <span>go to... ✈️</span>
            </TornPaper>
          </Draggable>

          {/* =========================================
              BOTTOM RIGHT (CERTIFICATIONS)
          ========================================= */}

          <Draggable id="certifications" layout={DESK_LAYOUT.certifications}>
            <div className="relative">
              <Tape className="top-[-10px] left-1/2 -translate-x-1/2 rotate-[4deg] w-[80px]" />
              <Paper className="w-[340px] p-8 text-gray-800">
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
            onClick={() => setActiveProject(null)}
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
                onClick={() => setActiveProject(null)}
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

                {/* Role / Contribution */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Role / Contribution:</span>
                  <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-xs font-bold rounded-sm tracking-wide shadow-2xs">
                    {activeProject.role}
                  </span>
                </div>
                
                {/* Tech Stack */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5 border-b border-neutral-200 pb-1">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tags.map(tag => (
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

      {/* Bottom Floating Liquid Glass Navigation */}
      <div className="fixed bottom-5 sm:bottom-6 left-0 right-0 flex justify-center z-[90000] pointer-events-none px-4">
        <nav 
          aria-label="Desk portfolio navigation"
          className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-[24px] max-w-[96vw] overflow-x-auto select-none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.68)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            boxShadow: `
              0 16px 40px -6px rgba(0, 0, 0, 0.14),
              0 4px 14px rgba(0, 0, 0, 0.05),
              inset 0 1px 1.5px rgba(255, 255, 255, 0.95),
              inset 0 -1px 1px rgba(0, 0, 0, 0.04)
            `,
          }}
        >
          {[
            { id: 'about', label: 'ABOUT', targetY: 0 },
            { id: 'work', label: 'WORK', targetY: 480 },
            { id: 'experience', label: 'EXPERIENCE', targetY: 980 },
            { id: 'tech', label: 'TECH', targetY: 40 },
            { id: 'culture', label: 'CULTURE', targetY: 500 },
            { id: 'worldTour', label: 'WORLD TOUR', targetY: 980 },
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
                  relative px-2.5 sm:px-3.5 py-1.5 rounded-[16px] text-[11px] sm:text-[12px] font-medium tracking-[0.03em]
                  transition-all duration-150 cursor-pointer whitespace-nowrap
                  ${isActive 
                    ? 'text-neutral-950 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),_inset_0_1px_0.5px_rgba(255,255,255,0.95)]' 
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/40 active:bg-white/60'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}

          {/* Subtle Divider */}
          <div className="w-[1px] h-3.5 bg-neutral-400/30 mx-1 shrink-0" aria-hidden="true" />

          {/* Secondary Reset Board Button */}
          <button
            onClick={() => setResetKey((prev) => prev + 1)}
            title="Reset desk objects to original composition"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[16px] text-[11px] sm:text-[12px] font-medium tracking-[0.02em] text-neutral-500 hover:text-neutral-900 hover:bg-white/40 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw size={12} className="opacity-70" />
            <span>RESET BOARD</span>
          </button>
        </nav>
      </div>

    </div>
  </DeskContext.Provider>
);
}
