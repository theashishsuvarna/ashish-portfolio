import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicIntroProps {
  onComplete: () => void;
  soundEnabled?: boolean;
}

interface LanguageItem {
  id: string;
  text: string;
}

const LANGUAGES: LanguageItem[] = [
  { id: 'en-1', text: "Hello, I'm Ashish" },
  { id: 'sa', text: "नमस्ते, अहम् आशीषः" },
  { id: 'ja', text: "こんにちは、アシシュです" },
  { id: 'es', text: "Hola, soy Ashish" },
  { id: 'mr', text: "नमस्कार, मी आशीष आहे" },
  { id: 'hi', text: "नमस्ते, मैं आशीष हूँ" },
  { id: 'pa', text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਆਸ਼ੀਸ਼ ਹਾਂ" },
  { id: 'en-final', text: "Hello, I'm Ashish" },
];

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [langIndex, setLangIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Total duration: 6 seconds
  // 0.0 - 0.8s: Subtle fade-in of typography
  // 0.8 - 5.5s: Language sequence plays with smooth crossfades; loading line continuously progresses
  // 5.5 - 6.0s: Loading reaches 100%
  // 6.0s: Smooth fade-out of loader, revealing existing portfolio board
  useEffect(() => {
    const startTime = performance.now();
    const totalDuration = 6000;
    const progressDuration = 5500;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      // Loading line progress (0% -> 100% reached smoothly at 5500ms)
      const lineProgress = Math.min(elapsed / progressDuration, 1);
      setProgress(lineProgress * 100);

      // Natural language cycling intervals across the 6 seconds
      if (elapsed < 750) {
        setLangIndex(0); // Hello, I'm Ashish
      } else if (elapsed < 1450) {
        setLangIndex(1); // नमस्ते, अहम् आशीषः
      } else if (elapsed < 2150) {
        setLangIndex(2); // こんにちは、アシシュです
      } else if (elapsed < 2850) {
        setLangIndex(3); // Hola, soy Ashish
      } else if (elapsed < 3550) {
        setLangIndex(4); // नमस्कार, मी आशीष आहे
      } else if (elapsed < 4250) {
        setLangIndex(5); // नमस्ते, मैं आशीष हूँ
      } else if (elapsed < 4950) {
        setLangIndex(6); // ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਆਸ਼ੀਸ਼ ਹਾਂ
      } else {
        setLangIndex(7); // Final hold: Hello, I'm Ashish
      }

      if (elapsed < totalDuration) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 700);
      }
    };

    const animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  // Keyboard shortcut: Escape to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFadingOut(true);
        setTimeout(onComplete, 200);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const currentLang = LANGUAGES[langIndex];

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          key="minimal-editorial-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] overflow-hidden select-none flex flex-col justify-between items-center py-8 sm:py-10 md:py-12 px-6"
          style={{
            backgroundColor: '#F8F7F3',
          }}
        >
          {/* ==================================================
              TOP TECHNICAL LINE
              REACT.JS · INTERFACES · SYSTEMS · HOSTING · ALGORITHMS
             ================================================== */}
          <header className="w-full flex justify-center text-center pointer-events-none select-none">
            <span className="font-sans text-[10.5px] sm:text-[11px] md:text-[12px] uppercase tracking-[0.34em] sm:tracking-[0.42em] text-[#6E6E66] font-normal pl-[0.35em]">
              REACT.JS · INTERFACES · SYSTEMS · HOSTING · ALGORITHMS
            </span>
          </header>

          {/* ==================================================
              CENTER: MAIN GREETING, SUBTITLE, LOADING INDICATOR
             ================================================== */}
          <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center my-auto">
            {/* Primary Greeting (cycling with pure soft opacity crossfade) */}
            <div className="w-full min-h-[48px] sm:min-h-[56px] md:min-h-[62px] flex items-center justify-center mb-2.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLang.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: 'easeInOut' }}
                  className="flex items-center justify-center text-center select-none"
                >
                  <h1
                    className="text-2xl sm:text-[28px] md:text-[32px] font-serif font-normal text-[#1A1A1A] tracking-[-0.01em] leading-snug px-2"
                    style={{
                      fontFamily: "'Playfair Display', 'Noto Serif', 'Georgia', serif",
                    }}
                  >
                    {currentLang.text}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Subtitle: A DEVELOPER CRAFTING IDEAS INTO REALITY */}
            <div className="mb-8">
              <span className="font-sans text-[10.5px] sm:text-[11px] md:text-[11.5px] uppercase tracking-[0.32em] text-[#666660] font-medium select-none pl-[0.32em]">
                A DEVELOPER CRAFTING IDEAS INTO REALITY
              </span>
            </div>

            {/* Loading Indicator */}
            <div className="w-48 sm:w-56 md:w-60 flex flex-col items-center">
              {/* LOADING . . . */}
              <span className="font-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.34em] text-[#888880] select-none pl-[0.34em] mb-2.5">
                LOADING . . .
              </span>

              {/* Very thin horizontal progress line */}
              <div className="w-full h-[1px] bg-[#E2E0D8] relative overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A] transition-all duration-75 ease-out"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </main>

          {/* ==================================================
              BOTTOM JAPANESE LINE
              リアクト · インターフェース · システム · ホスティング · アルゴリズム
             ================================================== */}
          <footer className="w-full flex justify-center text-center pointer-events-none select-none relative">
            <span className="text-[10px] sm:text-[10.5px] md:text-[11px] tracking-[0.26em] sm:tracking-[0.32em] text-[#7A7A72] font-serif font-normal select-none pl-[0.26em]">
              リアクト · インターフェース · システム · ホスティング · アルゴリズム
            </span>

            {/* Discreet Skip Button [esc] in bottom-right corner */}
            <div className="absolute right-0 bottom-0 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setIsFadingOut(true);
                  setTimeout(onComplete, 200);
                }}
                className="text-[9px] font-sans text-[#999990] hover:text-[#1A1A1A] uppercase tracking-widest py-1 px-2 rounded transition-colors cursor-pointer select-none bg-transparent hover:bg-[#EFECE5]"
              >
                Skip [esc]
              </button>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
