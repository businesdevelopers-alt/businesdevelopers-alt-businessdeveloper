
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Business } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { searchBusinessesWithAI, analyzeMapTrends } from '../services/geminiService';

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

  // Animation class for high traffic/activity - Disable in Low LOD for performance
  const showPulse = lod !== 'low' && ((mapMode === 'heatmap' && heatmapIntensity > 0.7) || (mapMode === 'traffic' && (business.activeVisitors || 0) > 40));
  const pulseClass = showPulse ? 'animate-pulse-slow' : '';

  if (business.isOccupied) {
      if (mapMode === 'heatmap') {
         // Heatmap coloring
         if (heatmapIntensity > 0.8) statusColor = 'bg-red-500 shadow-glow';
         else if (heatmapIntensity > 0.6) statusColor = 'bg-orange-500';
         else if (heatmapIntensity > 0.4) statusColor = 'bg-yellow-500';
         else statusColor = 'bg-blue-500';
         
         dotColor = 'bg-white';
         statusText = `${business.activeVisitors} ${t('visitorNow')}`;
      } else if (mapMode === 'traffic') {
         // Traffic coloring (Active Visitors)
         const visitors = business.activeVisitors || 0;
         if (visitors > 40) {
             statusColor = 'bg-rose-600 shadow-glow';
             dotColor = 'bg-rose-200';
         } else if (visitors > 20) {
             statusColor = 'bg-amber-500';
             dotColor = 'bg-amber-200';
         } else {
             statusColor = 'bg-emerald-500';
             dotColor = 'bg-emerald-200';
         }
         statusText = `${visitors} ${t('visitorNow')}`;
      } else if (mapMode === 'networking') {
         // Networking coloring (Category)
         switch (business.category) {
             case 'TECHNOLOGY': statusColor = 'bg-blue-600'; break;
             case 'ENGINEERING': statusColor = 'bg-purple-600'; break;
             case 'TRANSPORT': statusColor = 'bg-orange-600'; break;
             case 'EDUCATION': statusColor = 'bg-pink-600'; break;
             default: statusColor = 'bg-slate-600';
         }
         dotColor = 'bg-white';
         statusText = t('cat_' + business.category) || business.category;
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

  // Details Visibility: High LOD shows text/logo. Medium shows solid block. Hover always shows detail.
  const showContent = lod === 'high' || isHovered;
  const showBanner = (showContent || isSelected) && business.isOccupied; 
  
  const faceClass = "absolute inset-0 backface-hidden transition-all duration-300";

  // --- Premium Texture & Facade Logic ---
  const { frontFacade, sideFacade, roofStyle } = useMemo(() => {
    const isOcc = business.isOccupied;
    
    // Building Base Color logic
    let wallBase = isOcc ? '#1E293B' : '#F1F5F9';
    let wallGradient = '';

    if (isOcc) {
        if (mapMode === 'heatmap') {
             // Smoothed Heatmap Gradient: Blue -> Teal -> Green -> Yellow -> Red
             const hue = Math.max(0, 240 - (heatmapIntensity * 240));
             wallBase = `hsl(${hue}, 75%, 50%)`;
             // Vertical gradient for "volume" heat effect
             wallGradient = `linear-gradient(to bottom, hsl(${hue}, 85%, 60%) 0%, hsl(${hue}, 75%, 45%) 100%)`;
        } else if (mapMode === 'traffic') {
             const visitors = business.activeVisitors || 0;
             if (visitors > 40) wallBase = '#e11d48'; 
             else if (visitors > 20) wallBase = '#f59e0b';
             else wallBase = '#10b981';
        } else if (mapMode === 'networking') {
             switch(business.category) {
                 case 'TECHNOLOGY': wallBase = '#2563eb'; break;
                 case 'ENGINEERING': wallBase = '#9333ea'; break;
                 case 'TRANSPORT': wallBase = '#ea580c'; break;
                 case 'EDUCATION': wallBase = '#db2777'; break;
                 default: wallBase = '#475569';
             }
        }
    }

    // --- LOW & MEDIUM LOD (Optimized) ---
    // No gradients for windows to save performance on zoomed out views.
    if (lod !== 'high') {
        const bgImage = (mapMode === 'heatmap' && wallGradient) ? wallGradient : 'none';
        return {
            frontFacade: { 
                backgroundColor: wallBase, 
                backgroundImage: bgImage, 
                // Medium gets a subtle inset shadow for depth, Low gets nothing
                boxShadow: lod === 'medium' ? 'inset 0 0 20px rgba(0,0,0,0.3)' : 'none',
                transition: 'background-color 0.3s'
            },
            sideFacade: { 
                backgroundColor: wallBase, 
                backgroundImage: bgImage, 
                filter: 'brightness(0.7)', 
                boxShadow: 'none',
                transition: 'background-color 0.3s'
            },
            roofStyle: { 
                backgroundColor: isOcc ? (mapMode === 'standard' ? '#0F172A' : wallBase) : '#FFFFFF',
                border: isOcc ? 'none' : '1px dashed #cbd5e1',
                backgroundImage: 'none',
                transition: 'background-color 0.3s'
            }
        };
    }

    // --- HIGH LOD RENDERING (Detailed) ---
    // Windows / Lights
    const winLight = 'rgba(255,255,255,0.9)';
    const winDim = 'rgba(255,255,255,0.1)';
    const activeWin = isOcc ? (mapMode !== 'standard' ? winDim : winLight) : winDim;
    
    // Gradient Windows Pattern
    const windowPattern = `
      linear-gradient(to bottom, transparent 5%, ${activeWin} 5%, ${activeWin} 20%, transparent 20%, transparent 40%, ${activeWin} 40%, ${activeWin} 55%, transparent 55%),
      linear-gradient(to right, transparent 5%, rgba(255,255,255,0.05) 5%, rgba(255,255,255,0.05) 95%, transparent 95%)
    `;

    // Combine window pattern with heatmap gradient if active
    const finalBgImage = (mapMode === 'heatmap' && wallGradient) 
        ? `${windowPattern}, ${wallGradient}` 
        : windowPattern;
        
    const finalBgSize = (mapMode === 'heatmap' && wallGradient)
        ? '100% 40px, 20px 100%, 100% 100%'
        : '100% 40px, 20px 100%';

    const front = {
      backgroundColor: wallBase,
      backgroundImage: finalBgImage,
      backgroundSize: finalBgSize,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    };
    
    const side = {
      backgroundColor: wallBase,
      backgroundImage: finalBgImage,
      backgroundSize: finalBgSize,
      filter: 'brightness(0.85)',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    };

    const roof = {
        backgroundColor: isOcc ? (mapMode !== 'standard' ? wallBase : '#0F172A') : '#FFFFFF',
        backgroundImage: isOcc ? 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)' : 'none',
    };

    return { frontFacade: front, sideFacade: side, roofStyle: roof };
  }, [business.isOccupied, lod, mapMode, heatmapIntensity, business.category, business.activeVisitors]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(business); }}
      onMouseEnter={() => onHover(business.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative w-full h-full group pointer-events-auto cursor-pointer preserve-3d ${pulseClass}`}
    >
        {/* Floor Shadow: Scales blur with LOD for realism */}
        <div 
          className={`absolute inset-0 bg-black/20 rounded-full transition-all duration-500 ${lod === 'high' ? 'blur-xl' : lod === 'medium' ? 'blur-md' : 'blur-sm'}`}
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
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor} ${showPulse ? 'animate-ping' : ''} z-30`} />
                      
                      {showContent && (
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
                  <div className={`${faceClass} origin-bottom rotate-x-90 h-[40px] bottom-0 border-b border-white/5`} style={frontFacade}>
                      {/* Entrance Detail - High LOD only */}
                      {lod === 'high' && (
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-black/80 border-t border-white/20"></div>
                      )}
                  </div>
                  <div className={`${faceClass} origin-top rotate-x-[-90deg] h-[40px] top-0 brightness-75`} style={frontFacade} />
                  <div className={`${faceClass} origin-right rotate-y-90 w-[40px] right-0 top-0 bottom-0`} style={sideFacade} />
                  <div className={`${faceClass} origin-left rotate-y-[-90deg] w-[40px] left-0 top-0 bottom-0`} style={sideFacade} />
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

  // New Filter & Sort States
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // AI Analysis State
  const [showInsights, setShowInsights] = useState(false);
  const [insightsContent, setInsightsContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Interaction State
  const [interactionMode, setInteractionMode] = useState<'pan' | 'rotate'>('pan');
  const [viewState, setViewState] = useState({ zoom: 0.8, rotateX: 55, rotateZ: 45, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{x: number, y: number} | null>(null);

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

  const handleAnalyzeTrends = async () => {
      setIsAnalyzing(true);
      setShowInsights(true);
      try {
          const result = await analyzeMapTrends(businesses, language);
          setInsightsContent(result);
      } catch (e) {
          console.error(e);
          setInsightsContent("Failed to generate insights.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  // Computed properties for filters
  const categories = useMemo(() => {
    const cats = new Set(businesses.filter(b => b.category !== 'AVAILABLE').map(b => b.category));
    return ['all', ...Array.from(cats)];
  }, [businesses]);
  
  const processedBusinesses = useMemo(() => {
    let result = [...businesses];

    if (aiFilteredIds !== null) {
         result = result.filter(b => aiFilteredIds.includes(b.id));
    } else {
         // 1. Text Search
         if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => 
                b.name.toLowerCase().includes(q) || 
                (b.description && b.description.toLowerCase().includes(q)) ||
                b.category.toLowerCase().includes(q)
            );
         }

         // 2. Status Filter
         if (filterStatus !== 'all') {
             if (filterStatus === 'occupied') {
                 result = result.filter(b => b.isOccupied);
             } else if (filterStatus === 'available') {
                 result = result.filter(b => !b.isOccupied);
             }
         }

         // 3. Category Filter
         if (filterCategory !== 'all') {
             result = result.filter(b => b.category === filterCategory);
         }
    }

    // 4. Sorting
    if (sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name, language === 'ar' ? 'ar' : 'en'));
    }

    return result;
  }, [businesses, aiFilteredIds, searchQuery, filterCategory, filterStatus, sortBy, language]);

  const handleMouseDown = (e: React.MouseEvent) => { 
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
      setIsDragging(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; 
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !lastMousePos.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      if (interactionMode === 'rotate') {
         setViewState(prev => ({ 
             ...prev, 
             rotateZ: prev.rotateZ + dx * 0.3, 
             rotateX: Math.max(0, Math.min(85, prev.rotateX - dy * 0.3)) 
         }));
      } else {
         setViewState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseUp = () => setIsDragging(false);

  const selectedBusiness = useMemo(() => businesses.find(b => b.id === selectedBusinessId) || null, [businesses, selectedBusinessId]);

  // Determine global LOD based on zoom level for all blocks
  let currentLod: 'low' | 'medium' | 'high' = 'medium';
  if (viewState.zoom < 0.6) currentLod = 'low';
  else if (viewState.zoom >= 1.1) currentLod = 'high';

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full relative">
       
       <div 
          className="relative flex-1 h-[600px] lg:h-full bg-[#F1F5F9] overflow-hidden rounded-[32px] border border-white shadow-inner group outline-none"
          ref={mapContainerRef}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
       >
           {/* Controls */}
           <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none">
               <div className="pointer-events-auto bg-white/90 backdrop-blur-xl shadow-card border border-white/50 rounded-2xl p-5 w-80 max-h-[85vh] overflow-y-auto custom-scrollbar">
                   <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">{t('businessMap')}</h2>
                   
                   {/* Search & AI Analyze */}
                   <div className="relative mb-4 space-y-2">
                       <div className="relative">
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
                       
                       <button 
                          onClick={handleAnalyzeTrends}
                          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                       >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <span className="text-lg">✨</span>
                          {t('analyzeTrends')}
                       </button>
                   </div>

                   {/* Filters */}
                   <div className="mb-4 space-y-3 pt-3 border-t border-slate-100">
                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('status') || 'Status'}</label>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {['all', 'occupied', 'available'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === status ? 'bg-white shadow text-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {status === 'all' ? t('allStatuses') : status === 'occupied' ? t('occupied') : t('available')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('categories')}</label>
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                            >
                                <option value="all">{t('allCategories')}</option>
                                {categories.filter(c => c !== 'all').map(c => (
                                    <option key={c} value={c}>{t('cat_' + c) !== 'cat_' + c ? t('cat_' + c) : c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sorting */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('sortBy')}</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                            >
                                <option value="default">{t('defaultSort')}</option>
                                <option value="name">{t('sortByName')}</option>
                            </select>
                        </div>
                   </div>

                   {/* Mode Toggles */}
                   <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                       {['standard', 'heatmap', 'traffic', 'networking'].map(mode => (
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

                   {/* Mode Legends */}
                   {mapMode === 'heatmap' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('liveActivity')}</label>
                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md animate-pulse">LIVE</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 shadow-inner mb-1"></div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Low Traffic</span>
                                <span>High Traffic</span>
                            </div>
                        </div>
                   )}
                   {mapMode === 'traffic' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('trafficMode')}</label>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 h-2 rounded-full bg-emerald-500"></div>
                                <div className="flex-1 h-2 rounded-full bg-amber-500"></div>
                                <div className="flex-1 h-2 rounded-full bg-rose-600"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                <span>Smooth</span>
                                <span>Heavy</span>
                            </div>
                        </div>
                   )}
                   {mapMode === 'networking' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('connectionsMode')}</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Tech</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Eng</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Transport</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-600"></span> Edu</div>
                            </div>
                        </div>
                   )}
               </div>
               
               {/* Navigation Controls */}
               <div className="pointer-events-auto flex flex-col gap-2 bg-white/90 backdrop-blur rounded-2xl p-2 shadow-card border border-white/50">
                  <button 
                    onClick={() => setInteractionMode(m => m === 'pan' ? 'rotate' : 'pan')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        interactionMode === 'rotate' 
                        ? 'bg-brand-primary text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-brand-primary'
                    }`}
                    title={interactionMode === 'pan' ? "Enable Rotation" : "Enable Panning"}
                  >
                     {interactionMode === 'rotate' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                     )}
                  </button>
                  <div className="w-full h-px bg-slate-200 my-1"></div>
                  <button onClick={() => setViewState(p => ({...p, zoom: Math.min(2.5, p.zoom + 0.1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl transition-transform active:scale-95">+</button>
                  <button onClick={() => setViewState(p => ({...p, zoom: Math.max(0.4, p.zoom - 0.1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl transition-transform active:scale-95">-</button>
               </div>
           </div>

           {/* 3D Scene */}
           <div 
                className={`absolute inset-0 preserve-3d origin-center transition-transform duration-75 ease-linear ${interactionMode === 'rotate' ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}
                style={{
                    transform: `translate3d(${viewState.panX}px, ${viewState.panY}px, 0) scale(${viewState.zoom}) rotateX(${viewState.rotateX}deg) rotateZ(${viewState.rotateZ}deg)`,
                    '--map-inv-rotate-x': `-${viewState.rotateX}deg`,
                    '--map-inv-rotate-z': `-${viewState.rotateZ}deg`
                } as React.CSSProperties}
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
                                   lod={currentLod}
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
           <div className="w-full lg:w-[400px] bg-white rounded-[32px] shadow-elevated flex flex-col z-30 animate-fade-in border border-slate-100 overflow-hidden absolute lg:relative bottom-0 lg:bottom-auto h-[60vh] lg:h-auto">
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
                   
                   {/* Heatmap/Traffic Stats in Sidebar */}
                   {(mapMode === 'heatmap' || mapMode === 'traffic') && selectedBusiness.isOccupied && (
                       <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('liveActivity')}</h4>
                           <div className="flex items-end gap-2">
                               <span className={`text-4xl font-bold ${selectedBusiness.activeVisitors && selectedBusiness.activeVisitors > 20 ? 'text-red-500' : 'text-brand-primary'}`}>
                                   {selectedBusiness.activeVisitors}
                               </span>
                               <span className="text-sm font-bold text-slate-500 mb-1">{t('activeVisitorNow')}</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                               <div 
                                   className={`h-full rounded-full ${selectedBusiness.activeVisitors && selectedBusiness.activeVisitors > 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                                   style={{ width: `${Math.min((selectedBusiness.activeVisitors || 0), 50) * 2}%` }}
                               ></div>
                           </div>
                       </div>
                   )}

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

       {/* AI Insights Modal */}
       {showInsights && (
           <div className="absolute bottom-6 left-6 right-6 lg:left-1/4 lg:right-1/4 z-50 animate-slide-up">
               <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[60vh]">
                   <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-4 flex justify-between items-center text-white">
                       <h3 className="font-bold flex items-center gap-2">
                          <span className="text-xl">📊</span> {t('insightsTitle')}
                       </h3>
                       <button onClick={() => setShowInsights(false)} className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
                   
                   <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 min-h-[200px]">
                       {isAnalyzing ? (
                           <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                <div className="flex flex-col items-center justify-center pt-8">
                                    <div className="w-10 h-10 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin mb-3"></div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('generatingInsights')}</p>
                                </div>
                           </div>
                       ) : (
                           <div className="prose prose-sm prose-slate max-w-none animate-fade-in">
                               <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                                   {insightsContent}
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default OfficeMap;
