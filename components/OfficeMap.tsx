
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Business } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { searchBusinessesWithAI } from '../services/geminiService';

declare const ResizeObserver: any;

// --- Constants for Spatial Layout ---
const CONTAINER_SIZE = 1200;
const GRID_COLS = 3;
const PADDING = 120;
const GAP = 120;
const CELL_SIZE = (CONTAINER_SIZE - (PADDING * 2) - (GAP * (GRID_COLS - 1))) / GRID_COLS;

type MapMode = 'standard' | 'heatmap' | 'networking' | 'traffic';

interface OfficeMapProps {
  businesses: Business[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRentClick: (business: Business) => void;
  onAddBusiness: (business: Business) => void;
  onUpdateBusiness: (business: Business) => void;
}

interface BuildingBlockProps {
  business: Business;
  isHovered: boolean;
  isSelected: boolean;
  isFeatured: boolean;
  lod: 'high' | 'medium' | 'low';
  onSelect: (business: Business) => void;
  onHover: (id: string | null) => void;
  t: (key: string) => string;
  mapMode: MapMode;
}

const BuildingBlock = React.memo(({ business, isHovered, isSelected, isFeatured, lod, onSelect, onHover, t, mapMode }: BuildingBlockProps) => {
  // Enhanced Dimensions & Physics
  const baseDepth = 40;
  const hoverLift = isHovered ? 30 : 0; 
  
  // Dynamic Colors based on State
  let statusColor = 'bg-slate-100'; 
  let dotColor = 'bg-slate-400'; 
  let statusText = t('available');

  let heatmapIntensity = 0;
  if (mapMode === 'heatmap' && business.isOccupied) {
     const visitors = business.activeVisitors || 0;
     heatmapIntensity = Math.min(visitors / 50, 1); 
  }

  if (business.isOccupied) {
      if (mapMode === 'heatmap') {
         // Heatmap coloring
         if (heatmapIntensity > 0.8) statusColor = 'bg-red-500 shadow-glow';
         else if (heatmapIntensity > 0.6) statusColor = 'bg-orange-500';
         else if (heatmapIntensity > 0.4) statusColor = 'bg-yellow-500';
         else statusColor = 'bg-blue-500';
         
         dotColor = 'bg-white';
         statusText = `${business.activeVisitors} ${t('active')}`;
      } else {
          statusColor = 'bg-brand-primary'; 
          dotColor = 'bg-emerald-400';
          statusText = t('occupied');
          
          if (isFeatured) {
              dotColor = 'bg-brand-gold';
          }
      }
  }

  const borderColor = isSelected 
    ? 'border-brand-accent ring-2 ring-brand-accent ring-opacity-50' 
    : isHovered
      ? 'border-brand-primary shadow-2xl'
      : 'border-white/20';

  const showSides = lod !== 'low';
  const showBanner = (lod === 'high' || isSelected || isHovered) && business.isOccupied; 
  
  const faceClass = "absolute inset-0 backface-hidden transition-all duration-300";

  // --- Premium Texture & Facade Logic ---
  const { frontFacade, sideFacade, roofStyle } = useMemo(() => {
    if (lod === 'low') return { frontFacade: {}, sideFacade: {}, roofStyle: {} };
    const isOcc = business.isOccupied;
    
    // Building Base Color
    let wallBase = isOcc 
      ? '#1E293B' // Dark Slate for occupied
      : '#F1F5F9'; // Light Slate for vacant

    if (mapMode === 'heatmap' && isOcc) {
         const hue = Math.max(0, 240 - (heatmapIntensity * 240));
         wallBase = `hsl(${hue}, 70%, 40%)`;
    }

    // Windows / Lights
    const winLight = 'rgba(255,255,255,0.9)';
    const winDim = 'rgba(255,255,255,0.1)';
    const activeWin = isOcc ? (mapMode === 'heatmap' ? winDim : winLight) : winDim;
    
    // Gradient Windows Pattern
    const windowPattern = `
      linear-gradient(to bottom, transparent 5%, ${activeWin} 5%, ${activeWin} 20%, transparent 20%, transparent 40%, ${activeWin} 40%, ${activeWin} 55%, transparent 55%),
      linear-gradient(to right, transparent 5%, rgba(255,255,255,0.05) 5%, rgba(255,255,255,0.05) 95%, transparent 95%)
    `;

    const front = {
      backgroundColor: wallBase,
      backgroundImage: windowPattern,
      backgroundSize: '100% 40px, 20px 100%',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    };
    
    const side = {
      backgroundColor: wallBase,
      backgroundImage: windowPattern,
      backgroundSize: '100% 40px, 20px 100%',
      filter: 'brightness(0.85)',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    };

    const roof = {
        backgroundColor: isOcc ? '#0F172A' : '#FFFFFF',
        backgroundImage: isOcc ? 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)' : 'none',
    };

    return { frontFacade: front, sideFacade: side, roofStyle: roof };
  }, [business.isOccupied, isFeatured, lod, mapMode, heatmapIntensity]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(business); }}
      onMouseEnter={() => onHover(business.id)}
      onMouseLeave={() => onHover(null)}
      className="relative w-full h-full group pointer-events-auto cursor-pointer preserve-3d"
    >
        {/* Floor Shadow */}
        <div 
          className={`absolute inset-0 bg-black/20 blur-xl rounded-full transition-all duration-500`}
          style={{
            transform: `translateZ(0) scale(${isHovered ? 0.9 : 0.8})`, 
            opacity: isHovered ? 0.4 : 0.2
          }}
        />

        {/* 3D Structure */}
        <div 
          className="w-full h-full preserve-3d transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) will-change-transform"
          style={{ transform: `translateZ(${baseDepth + hoverLift}px)` }}
        >
            {business.isOccupied ? (
                <>
                  {/* Roof */}
                  <div 
                    className={`absolute inset-0 border-2 ${borderColor} rounded-sm overflow-hidden flex flex-col items-center justify-center p-2 text-center shadow-inner backface-hidden z-20 transition-colors duration-300`}
                    style={roofStyle}
                  >
                      {/* Roof Activity Indicator */}
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor} ${isHovered ? 'animate-ping' : ''} z-30`} />
                      
                      {lod !== 'low' && (
                        <>
                          <div className="w-14 h-14 rounded-lg bg-white p-0.5 border border-slate-700/50 shadow-lg relative mb-2">
                              {business.logoUrl ? (
                                  <img src={business.logoUrl} alt="" className="w-full h-full object-cover rounded" />
                              ) : (
                                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[8px] text-white">LOGO</div>
                              )}
                          </div>
                          {(lod === 'high' || isHovered) && (
                             <h3 className="font-sans font-bold text-white text-[10px] truncate w-full px-1 tracking-wide uppercase">{business.name}</h3>
                          )}
                        </>
                      )}
                  </div>

                  {/* Walls */}
                  {showSides && (
                    <>
                      <div className={`${faceClass} origin-bottom rotate-x-90 h-[40px] bottom-0 border-b border-white/5`} style={frontFacade}>
                         {/* Entrance Detail */}
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-black/80 border-t border-white/20"></div>
                      </div>
                      <div className={`${faceClass} origin-top rotate-x-[-90deg] h-[40px] top-0 brightness-75`} style={frontFacade} />
                      <div className={`${faceClass} origin-right rotate-y-90 w-[40px] right-0 top-0 bottom-0`} style={sideFacade} />
                      <div className={`${faceClass} origin-left rotate-y-[-90deg] w-[40px] left-0 top-0 bottom-0`} style={sideFacade} />
                    </>
                  )}
                </>
            ) : (
                /* Vacant Plot */
                <div className="w-full h-full relative preserve-3d opacity-80 hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                  <div className={`absolute inset-0 border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center ${borderColor}`}>
                      {isHovered && (
                          <div className="bg-brand-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                              {t('available')}
                          </div>
                      )}
                      {!isHovered && <span className="text-3xl text-slate-300">+</span>}
                  </div>
                </div>
            )}

            {/* Floating Info Banner */}
            {showBanner && (
              <div 
                className="absolute top-1/2 left-1/2 w-0 h-0 preserve-3d pointer-events-none z-50"
                style={{ transform: 'translateZ(80px)' }} 
              >
                 <div 
                    className="absolute top-0 left-0 flex flex-col items-center gap-1 transition-all duration-300 origin-bottom"
                    style={{
                        transform: `translate(-50%, -100%) rotateX(var(--map-inv-rotate-x)) rotateZ(var(--map-inv-rotate-z))`
                    }}
                 >
                    <div className={`px-3 py-1.5 rounded-lg shadow-xl border border-white/20 flex items-center gap-2 ${statusColor} text-white backdrop-blur-md`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{statusText}</span>
                    </div>
                    <div className={`w-0.5 h-6 opacity-80 ${statusColor}`}></div>
                 </div>
              </div>
            )}
        </div>
    </div>
  );
});

const DataGrid: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none preserve-3d">
            {/* Base Grid */}
            <div 
                className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            
            {/* Moving Light Streams */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-50 animate-pulse"></div>
            </div>
        </div>
    );
}

const OfficeMap: React.FC<OfficeMapProps> = ({ businesses, favorites, onToggleFavorite, onRentClick, onAddBusiness, onUpdateBusiness }) => {
  const { t, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [mapMode, setMapMode] = useState<MapMode>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const updateSize = () => {
      if (mapContainerRef.current) {
        setContainerSize({ width: mapContainerRef.current.clientWidth, height: mapContainerRef.current.clientHeight });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAI(true);
    try {
      const result = await searchBusinessesWithAI(searchQuery, businesses, language);
      setAiFilteredIds(result.ids);
    } catch (e) { console.error(e); } finally { setIsSearchingAI(false); }
  };

  const [viewState, setViewState] = useState({ zoom: 0.8, rotateX: 55, rotateZ: 45, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{x: number, y: number} | null>(null);
  
  const processedBusinesses = useMemo(() => {
    let result = [...businesses];
    if (aiFilteredIds !== null) result = result.filter(b => aiFilteredIds.includes(b.id));
    else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    }
    return result;
  }, [businesses, aiFilteredIds, searchQuery]);

  const handleMouseDown = (e: React.MouseEvent) => { 
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
      setIsDragging(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; 
  };
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !lastMousePos.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => setIsDragging(false);

  const selectedBusiness = useMemo(() => businesses.find(b => b.id === selectedBusinessId) || null, [businesses, selectedBusinessId]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full relative">
       
       <div 
          className="relative flex-1 h-[600px] lg:h-full bg-[#F1F5F9] overflow-hidden rounded-[32px] border border-white shadow-inner group outline-none"
          ref={mapContainerRef}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
       >
           {/* Controls */}
           <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none">
               <div className="pointer-events-auto bg-white/90 backdrop-blur-xl shadow-card border border-white/50 rounded-2xl p-5 w-80">
                   <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">{t('businessMap')}</h2>
                   <div className="relative mb-4">
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder={t('aiSearchPlaceholder')}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                       />
                       <button 
                          onClick={handleAISearch}
                          className="absolute right-3 top-3 text-slate-400 hover:text-brand-accent"
                       >
                          {isSearchingAI ? (
                             <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          )}
                       </button>
                   </div>

                   {/* Mode Toggles */}
                   <div className="grid grid-cols-2 gap-2">
                       {['standard', 'heatmap'].map(mode => (
                           <button 
                             key={mode}
                             onClick={() => setMapMode(mode as MapMode)}
                             className={`px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                 mapMode === mode 
                                 ? 'bg-brand-primary text-white shadow-md' 
                                 : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                             }`}
                           >
                              {t(mode + 'Mode')}
                           </button>
                       ))}
                   </div>
               </div>
               
               {/* Navigation Controls */}
               <div className="pointer-events-auto flex flex-col gap-2">
                  <button onClick={() => setViewState(p => ({...p, zoom: p.zoom + 0.1}))} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl">+</button>
                  <button onClick={() => setViewState(p => ({...p, zoom: p.zoom - 0.1}))} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl">-</button>
               </div>
           </div>

           {/* 3D Scene */}
           <div 
                className="absolute inset-0 preserve-3d origin-center transition-transform duration-75 ease-linear cursor-grab active:cursor-grabbing"
                style={{
                    transform: `translate3d(${viewState.panX}px, ${viewState.panY}px, 0) scale(${viewState.zoom}) rotateX(${viewState.rotateX}deg) rotateZ(${viewState.rotateZ}deg)`,
                    '--map-inv-rotate-x': `-${viewState.rotateX}deg`,
                    '--map-inv-rotate-z': `-${viewState.rotateZ}deg`
                } as any}
           >
               <div className="absolute top-1/2 left-1/2 preserve-3d" style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, transform: 'translate(-50%, -50%)' }}>
                    
                    {/* Map Base */}
                    <div className="absolute inset-0 bg-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-4 border-white/50"></div>
                    <DataGrid />

                    {processedBusinesses.map((business) => {
                        const colIndex = business.gridPosition.x - 1;
                        const rowIndex = business.gridPosition.y - 1;
                        const xPos = PADDING + (colIndex * CELL_SIZE) + (colIndex * GAP);
                        const yPos = PADDING + (rowIndex * CELL_SIZE) + (rowIndex * GAP);
                        
                        return (
                            <div
                               key={business.id}
                               className="absolute preserve-3d transition-all duration-500"
                               style={{ width: CELL_SIZE, height: CELL_SIZE, left: xPos, top: yPos }}
                            >
                                <BuildingBlock 
                                   business={business}
                                   isHovered={hoveredId === business.id}
                                   isSelected={selectedBusinessId === business.id}
                                   isFeatured={false}
                                   lod={viewState.zoom < 0.6 ? 'low' : 'high'}
                                   onSelect={(b) => { setSelectedBusinessId(b.id); setIsSidebarOpen(true); }}
                                   onHover={setHoveredId}
                                   t={t}
                                   mapMode={mapMode}
                                />
                            </div>
                        );
                    })}
               </div>
           </div>
       </div>

       {/* Sidebar Details */}
       {isSidebarOpen && selectedBusiness && (
           <div className="w-full lg:w-[400px] bg-white rounded-[32px] shadow-elevated flex flex-col z-30 animate-slide-up border border-slate-100 overflow-hidden absolute lg:relative bottom-0 lg:bottom-auto h-[60vh] lg:h-auto">
               <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                   <div>
                       <h2 className="text-2xl font-bold text-brand-primary font-heading mb-1">{selectedBusiness.name}</h2>
                       <span className="text-xs font-bold uppercase tracking-wide text-brand-secondary">{selectedBusiness.category}</span>
                   </div>
                   <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
               </div>
               
               <div className="p-8 flex-1 overflow-y-auto">
                   <div className="w-full h-40 bg-brand-surface rounded-2xl mb-8 border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                      {selectedBusiness.logoUrl && <img src={selectedBusiness.logoUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" alt="logo" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent pointer-events-none"></div>
                   </div>
                   
                   <p className="text-slate-600 mb-8 leading-relaxed font-medium">{selectedBusiness.description}</p>
                   
                   <div className="space-y-4">
                       {selectedBusiness.isOccupied ? (
                          <>
                             <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all">{t('contact')}</button>
                             <button className="w-full py-4 bg-white border border-slate-200 text-brand-primary rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">{t('viewDetails')}</button>
                          </>
                       ) : (
                          <button onClick={() => onRentClick(selectedBusiness)} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all">{t('rentFree')}</button>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default OfficeMap;
