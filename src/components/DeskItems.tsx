import React from 'react';

/**
 * Realistic Frosted Washi / Drafting Tape
 * Semi-translucent with jagged torn dispenser ends, micro-fiber texture, and contact shadow.
 */
export const Tape = ({ className = '' }: { className?: string }) => (
  <div 
    className={`absolute pointer-events-none z-30 select-none ${className}`}
    style={{
      height: '24px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(248,245,232,0.56) 100%)',
      backdropFilter: 'blur(1.5px)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.22), 0 3px 6px rgba(0,0,0,0.10), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.08)',
      clipPath: 'polygon(0% 0%, 98% 0%, 100% 12%, 97% 24%, 100% 38%, 98% 52%, 100% 66%, 97% 80%, 100% 92%, 98% 100%, 2% 100%, 0% 88%, 3% 76%, 0% 62%, 2% 48%, 0% 34%, 3% 20%, 0% 8%)',
      opacity: 0.94,
    }}
  >
    {/* Micro tape surface texture */}
    <div 
      className="w-full h-full opacity-35 mix-blend-multiply"
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
        backgroundSize: '80px 80px',
      }}
    />
  </div>
);

/**
 * Realistic Spring-Steel Binder Clip with chrome wire arms
 */
export const BinderClip = ({ className = '' }: { className?: string }) => (
  <div className={`absolute flex flex-col items-center z-30 select-none pointer-events-none ${className}`} style={{ width: '36px', height: '48px' }}>
    {/* Wire arms with chrome gradient and cast shadow */}
    <div className="relative w-full h-6 flex justify-between px-1">
      <div 
        className="w-3 h-8 border-2 border-[#d0d0d0] rounded-t-full rotate-[-16deg] origin-bottom absolute left-0.5"
        style={{
          boxShadow: '1px 2px 3px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.9)',
          background: 'linear-gradient(90deg, #b0b0b0 0%, #e8e8e8 50%, #989898 100%)',
        }}
      />
      <div 
        className="w-3 h-8 border-2 border-[#d0d0d0] rounded-t-full rotate-[16deg] origin-bottom absolute right-0.5"
        style={{
          boxShadow: '1px 2px 3px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.9)',
          background: 'linear-gradient(90deg, #989898 0%, #e8e8e8 50%, #b0b0b0 100%)',
        }}
      />
    </div>
    {/* Black spring steel clip body with tight contact shadow */}
    <div 
      className="w-full h-5 rounded-[1px] relative z-10"
      style={{
        background: 'linear-gradient(180deg, #2a2a2a 0%, #151515 80%, #0a0a0a 100%)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
        borderTop: '1px solid #444',
      }}
    >
      <div className="w-full h-1 border-b border-black/80" />
    </div>
  </div>
);

/**
 * Heavyweight Physical Studio Paper Document
 * Multi-layered contact ambient occlusion, directional cast shadow, and authentic paper stock.
 */
export const Paper = ({ 
  children, 
  className = '', 
  style = {} 
}: { 
  children: React.ReactNode, 
  className?: string,
  style?: React.CSSProperties 
}) => (
  <div className="relative group">
    {/* Tight Contact Ambient Occlusion (anchors paper to mat) */}
    <div 
      className="absolute inset-0 bg-black/45 rounded-sm"
      style={{
        transform: 'translate(0.5px, 1.5px)',
        filter: 'blur(1.5px)',
      }}
    />
    
    {/* Directional Body Cast Shadow (consistent top-left overhead lighting) */}
    <div 
      className="absolute inset-0 bg-black/28 rounded-sm"
      style={{
        transform: 'translate(3px, 9px)',
        filter: 'blur(8px)',
      }}
    />
    
    {/* Diffuse Ambient Shadow Falloff */}
    <div 
      className="absolute inset-0 bg-black/16 rounded-sm"
      style={{
        transform: 'translate(6px, 18px)',
        filter: 'blur(18px)',
      }}
    />
    
    {/* Main Physical Paper Sheet */}
    <div 
      className={`bg-[#faf8f3] relative z-10 ${className}`}
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          inset 1px 0 0 rgba(255, 255, 255, 0.7),
          inset -1px -1px 0 rgba(0, 0, 0, 0.05),
          0 0.5px 1px rgba(0, 0, 0, 0.15)
        `,
        borderBottom: '1.5px solid #dcd7ca',
        borderRight: '1.5px solid #dcd7ca',
        borderRadius: '1px',
        ...style
      }}
    >
      {/* Subtle organic paper fiber texture */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.22]"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
        }}
      />
      
      {/* Paper corner micro-curl depth impression */}
      <div 
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 100% 100%, rgba(0,0,0,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  </div>
);

/**
 * Realistic 300gsm Cardstock Project Card
 * Multi-layer card with authentic contact shadow, under-sheet border, and taped attachment.
 */
export const ProjectCard = ({ 
  title, 
  subtitle, 
  tags, 
  className = '',
  onClick
}: { 
  title: string, 
  subtitle: string, 
  tags: string[], 
  className?: string,
  onClick?: () => void
}) => (
  <div 
    className={`relative group cursor-pointer active:scale-[0.98] transition-all duration-200 select-none ${className}`}
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick();
    }}
  >
    {/* Tight Contact Ambient Occlusion */}
    <div 
      className="absolute inset-0 bg-black/45 rounded-sm"
      style={{
        transform: 'translate(1px, 2px)',
        filter: 'blur(2px)',
      }}
    />

    {/* Directional Cast Shadow */}
    <div 
      className="absolute inset-0 bg-black/26 rounded-sm transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-12 group-hover:blur-[18px]"
      style={{
        transform: 'translate(4px, 11px)',
        filter: 'blur(9px)',
      }}
    />

    {/* Soft Diffuse Ambient Falloff */}
    <div 
      className="absolute inset-0 bg-black/15 rounded-sm transition-all duration-300 group-hover:blur-[28px]"
      style={{
        transform: 'translate(7px, 20px)',
        filter: 'blur(20px)',
      }}
    />
    
    {/* Layered Physical Card Backsheet */}
    <div 
      className="absolute inset-0 bg-[#ebe5d9] rotate-[1.2deg] border border-[#d6d0c4] w-full h-full transition-transform duration-300 group-hover:rotate-[2.5deg]"
      style={{
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}
    />
    
    {/* Front 300gsm Heavyweight Artboard */}
    <div 
      className={`relative bg-[#fcfbf7] p-5 flex flex-col z-10 transition-transform duration-300 group-hover:-translate-y-2.5 group-hover:scale-[1.015] w-full h-full ${className}`}
      style={{ 
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.95),
          inset 1px 0 0 rgba(255, 255, 255, 0.8),
          inset -1px -1px 0 rgba(0, 0, 0, 0.05),
          0 0.5px 1px rgba(0, 0, 0, 0.12)
        `,
        borderBottom: '1.5px solid #dfdad0',
        borderRight: '1.5px solid #dfdad0',
        borderRadius: '1.5px'
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.22]"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
        }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <Tape className="top-[-12px] left-1/2 -translate-x-1/2 w-[84px]" />
        
        <h3 className="font-extrabold text-[#111827] text-xl mb-1 mt-3 tracking-tight leading-tight">{title}</h3>
        <p className="text-[#4b5563] text-xs mb-4 flex-1 font-medium">{subtitle}</p>
        
        {/* Screen/Art Thumbnail Recess */}
        <div 
          className="w-full h-[100px] bg-[#0f172a] rounded-sm mb-4 overflow-hidden relative border border-[#1e293b]"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.85), inset 0 -1px 1px rgba(255,255,255,0.1)',
          }}
        >
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1.5 text-[11px] text-[#4b5563] font-semibold border-t border-[#e5e7eb] pt-3">
          {tags.map(tag => (
            <div key={tag} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full shadow-inner" />
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Realistic Torn Paper Memo / Sticky Note
 * Hand-torn fibrous perimeter with natural curling cast shadow.
 */
export const TornPaper = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode, 
  className?: string 
}) => (
  <div className="relative group select-none">
    {/* Tight Contact AO */}
    <div 
      className="absolute inset-0 bg-black/40" 
      style={{ 
        clipPath: 'polygon(1% 2%, 99% 1%, 98% 99%, 2% 98%)',
        transform: 'translate(0.5px, 1.5px)',
        filter: 'blur(1.5px)',
      }} 
    />
    
    {/* Directional Cast Shadow */}
    <div 
      className="absolute inset-0 bg-black/24" 
      style={{ 
        clipPath: 'polygon(1% 2%, 99% 1%, 98% 99%, 2% 98%)',
        transform: 'translate(2.5px, 7px)',
        filter: 'blur(6px)',
      }} 
    />
    
    {/* Front Torn Note Sheet */}
    <div 
      className={`bg-[#f9f6e8] p-5 relative z-10 ${className}`} 
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        clipPath: 'polygon(1.5% 2.5%, 98.5% 1%, 98% 98.5%, 2% 97.5%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.85), inset -1px -1px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.24]"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  </div>
);
