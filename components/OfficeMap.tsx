
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
const GLOBE_RADIUS = 320; 

const getCellCenter = (gridPos: {x: number, y: number}) => {
    const colIndex = gridPos.x - 1;
    const rowIndex = gridPos.y - 1;
    const x = PADDING + (colIndex * CELL_SIZE) + (colIndex * GAP) + (CELL_SIZE / 2);
    const y = PADDING + (rowIndex * CELL_SIZE) + (rowIndex * GAP) + (CELL_SIZE / 2);
    return { x, y };
};

type MapMode = 'standard' | 'heatmap' | 'networking' | 'traffic' | 'globe';

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
  isNetworkRelated?: boolean;
  networkType?: 'synergy' | 'industry';
}

const BuildingBlock = React.memo(({ business, isHovered, isSelected, isFeatured, lod, onSelect, onHover, t, mapMode, isNetworkRelated, networkType }: BuildingBlockProps) => {
  const isLowLod = lod === 'low';
  const isHighLod = lod === 'high';
  const isDarkMode = mapMode === 'heatmap' || mapMode === 'globe' || mapMode === 'networking';

  const baseDepth = 40;
  const hoverLift = isHovered ? (isLowLod ? 0 : 30) : 0; 
  
  let statusColor = 'bg-slate-100'; 
  let dotColor = 'bg-slate-400'; 
  let statusText = t('available');

  let heatmapIntensity = 0;
  if (mapMode === 'heatmap' && business.isOccupied) {
     const visitors = business.activeVisitors || 0;
     heatmapIntensity = Math.min(visitors / 50, 1); 
  }

  const heatmapHue = Math.max(0, 240 - (heatmapIntensity * 240));
  const heatmapSat = 60 + (heatmapIntensity * 30); 
  const heatmapLight = 65 - (heatmapIntensity * 10); 
  const heatmapColorString = `hsl(${heatmapHue}, ${heatmapSat}%, ${heatmapLight}%)`;

  const showPulse = !isLowLod && (
    (mapMode === 'heatmap' && heatmapIntensity > 0.7) || 
    (mapMode === 'traffic' && (business.activeVisitors || 0) > 40) ||
    (mapMode === 'networking' && isNetworkRelated)
  );
  const pulseClass = showPulse ? 'animate-pulse-slow' : '';

  if (business.isOccupied) {
      if (mapMode === 'heatmap') {
         statusColor = 'shadow-glow text-white'; 
         dotColor = 'bg-white';
         statusText = `${business.activeVisitors} ${t('visitorNow')}`;
      } else if (mapMode === 'traffic') {
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
         if (networkType === 'synergy') {
             statusColor = 'bg-brand-accent shadow-[0_0_15px_#F7C600]';
             dotColor = 'bg-white';
         } else if (networkType === 'industry') {
             statusColor = 'bg-blue-500 shadow-[0_0_15px_#3b82f6]';
             dotColor = 'bg-white';
         } else {
             statusColor = 'bg-slate-700 opacity-40';
             dotColor = 'bg-slate-500';
         }
         statusText = networkType === 'synergy' ? t('highValueMatch') : t('cat_' + business.category);
      } else {
          statusColor = 'bg-brand-primary'; 
          dotColor = 'bg-emerald-400';
          statusText = t('occupied');
          if (isFeatured) dotColor = 'bg-brand-gold';
      }
  }

  const borderColor = isSelected 
    ? 'border-brand-accent ring-2 ring-brand-accent ring-opacity-50' 
    : isHovered
      ? 'border-brand-primary shadow-2xl'
      : (isDarkMode ? 'border-white/10' : 'border-white/20');

  const showContent = isHighLod || isHovered || (mapMode === 'networking' && isNetworkRelated);
  const showBanner = (showContent || isSelected) && business.isOccupied && mapMode !== 'globe'; 
  
  const faceClass = `absolute inset-0 backface-hidden ${!isLowLod ? 'transition-all duration-300' : ''}`;

  const { frontFacade, sideFacade, roofStyle } = useMemo(() => {
    const isOcc = business.isOccupied;
    let wallBase = isOcc ? '#1E293B' : '#F1F5F9';
    let wallGradient = '';

    if (isOcc) {
        if (mapMode === 'heatmap') {
             wallBase = heatmapColorString;
             if (!isLowLod) {
                wallGradient = `linear-gradient(to bottom, 
                    hsl(${heatmapHue}, ${heatmapSat}%, ${Math.min(100, heatmapLight + 10)}%) 0%, 
                    hsl(${heatmapHue}, ${heatmapSat}%, ${Math.max(0, heatmapLight - 10)}%) 100%)`;
             }
        } else if (mapMode === 'traffic') {
             const visitors = business.activeVisitors || 0;
             if (visitors > 40) wallBase = '#e11d48'; 
             else if (visitors > 20) wallBase = '#f59e0b';
             else wallBase = '#10b981';
        } else if (mapMode === 'networking') {
             if (networkType === 'synergy') wallBase = '#F7C600';
             else if (networkType === 'industry') wallBase = '#3b82f6';
             else wallBase = '#0f172a';
        } else if (mapMode === 'globe') {
             wallBase = isOcc ? '#3b82f6' : '#1e293b'; 
        }
    } else if (mapMode === 'globe') {
        wallBase = 'rgba(255,255,255,0.1)';
    }

    if (isLowLod) {
        return {
            frontFacade: { backgroundColor: wallBase },
            sideFacade: { backgroundColor: wallBase, filter: 'brightness(0.7)' },
            roofStyle: { 
                backgroundColor: isOcc ? (mapMode === 'standard' ? '#0F172A' : wallBase) : (mapMode === 'globe' ? '#334155' : '#FFFFFF'),
                border: isOcc ? 'none' : '1px solid #e2e8f0', 
            }
        };
    }

    const transitionStyle = 'background-color 0.3s, background-image 0.3s';

    if (!isHighLod) {
        const bgImage = (mapMode === 'heatmap' && wallGradient) ? wallGradient : 'none';
        return {
            frontFacade: { backgroundColor: wallBase, backgroundImage: bgImage, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)', transition: transitionStyle },
            sideFacade: { backgroundColor: wallBase, backgroundImage: bgImage, filter: 'brightness(0.7)', transition: transitionStyle },
            roofStyle: { 
                backgroundColor: isOcc ? (mapMode === 'standard' ? '#0F172A' : wallBase) : (mapMode === 'globe' ? '#334155' : '#FFFFFF'),
                border: isOcc ? 'none' : '1px dashed #cbd5e1',
                transition: transitionStyle
            }
        };
    }

    const winLight = 'rgba(255,255,255,0.95)';
    const winDim = 'rgba(255,255,255,0.2)';
    const activeWin = isOcc ? (mapMode !== 'standard' ? winDim : winLight) : winDim;
    
    const windowPattern = `
      linear-gradient(to bottom, transparent 5%, ${activeWin} 5%, ${activeWin} 20%, transparent 20%, transparent 40%, ${activeWin} 40%, ${activeWin} 55%, transparent 55%),
      linear-gradient(to right, transparent 10%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.2) 15%, transparent 15%, transparent 85%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0.2) 90%, transparent 90%)
    `;

    const finalBgImage = (mapMode === 'heatmap' && wallGradient) ? `${windowPattern}, ${wallGradient}` : windowPattern;
    const finalBgSize = '100% 40px';

    const glowColor = mapMode === 'networking' ? wallBase : (mapMode === 'heatmap' ? heatmapColorString : '#3b82f6');
    const glowStyle = isOcc ? `0 0 20px ${glowColor}66` : 'none';

    const front = { backgroundColor: wallBase, backgroundImage: finalBgImage, backgroundSize: finalBgSize, boxShadow: `inset 0 0 30px rgba(0,0,0,0.5), ${glowStyle}`, transition: transitionStyle };
    const side = { backgroundColor: wallBase, backgroundImage: finalBgImage, backgroundSize: finalBgSize, filter: 'brightness(0.75)', boxShadow: `inset 0 0 30px rgba(0,0,0,0.6), ${glowStyle}`, transition: transitionStyle };
    const roof = {
        backgroundColor: isOcc ? (mapMode !== 'standard' && mapMode !== 'globe' ? wallBase : '#0F172A') : (mapMode === 'globe' ? '#334155' : '#FFFFFF'),
        backgroundImage: isOcc ? 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)' : 'none',
        transition: transitionStyle,
        border: '1px solid rgba(255,255,255,0.1)'
    };

    return { frontFacade: front, sideFacade: side, roofStyle: roof };
  }, [business.isOccupied, lod, isLowLod, isHighLod, mapMode, heatmapIntensity, networkType, heatmapColorString, heatmapHue, heatmapSat, heatmapLight]);

  const roofClasses = isLowLod
    ? `absolute inset-0 border-2 ${borderColor} overflow-hidden flex flex-col items-center justify-center p-2 text-center backface-hidden z-20`
    : `absolute inset-0 border-2 ${borderColor} rounded-sm overflow-hidden flex flex-col items-center justify-center p-2 text-center shadow-inner backface-hidden z-20 transition-colors duration-300`;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(business); }}
      onMouseEnter={() => onHover(business.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative w-full h-full group pointer-events-auto cursor-pointer preserve-3d ${pulseClass}`}
    >
        {!isLowLod && mapMode !== 'globe' && (
            <div 
              className={`absolute inset-0 bg-black/30 rounded-full transition-all duration-500 ${isHighLod ? 'blur-xl' : 'blur-md'}`}
              style={{ transform: `translateZ(0) scale(${isHovered ? 0.9 : 0.8})`, opacity: isHovered ? 0.5 : 0.3 }}
            />
        )}

        <div 
          className={`w-full h-full preserve-3d ${!isLowLod ? 'transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)' : 'transition-none'} will-change-transform`}
          style={{ transform: `translateZ(${baseDepth + hoverLift}px)` }}
        >
            {business.isOccupied ? (
                <>
                  <div className={roofClasses} style={roofStyle}>
                      {!isLowLod && (
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor} ${showPulse ? 'animate-ping' : ''} z-30`} />
                      )}
                      {showContent && (
                        <div className="animate-fade-in flex flex-col items-center relative z-10">
                          <div className="w-14 h-14 rounded-lg bg-white p-0.5 border border-slate-700/50 shadow-lg relative mb-2">
                              {business.logoUrl ? (
                                  <img src={business.logoUrl} alt="" className="w-full h-full object-cover rounded" />
                              ) : (
                                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[8px] text-white font-bold">BIZ</div>
                              )}
                          </div>
                          {(isHighLod || isHovered || isNetworkRelated) && (
                             <h3 className="font-sans font-bold text-white text-[10px] truncate w-full px-1 tracking-wide uppercase bg-black/40 rounded px-1 backdrop-blur-sm">{business.name}</h3>
                          )}
                        </div>
                      )}
                  </div>
                  <div className={`${faceClass} origin-bottom rotate-x-90 h-[40px] bottom-0 border-b border-white/5`} style={frontFacade}></div>
                  <div className={`${faceClass} origin-top rotate-x-[-90deg] h-[40px] top-0 brightness-75`} style={frontFacade} />
                  <div className={`${faceClass} origin-right rotate-y-90 w-[40px] right-0 top-0 bottom-0`} style={sideFacade} />
                  <div className={`${faceClass} origin-left rotate-y-[-90deg] w-[40px] left-0 top-0 bottom-0`} style={sideFacade} />
                </>
            ) : (
                <div className={`w-full h-full relative preserve-3d ${!isLowLod ? 'opacity-80 hover:opacity-100 transition-all duration-300 group-hover:scale-105' : 'opacity-60'}`}>
                  <div className={`absolute inset-0 border-2 ${isLowLod ? (isDarkMode ? 'border-white/10' : 'border-slate-200') : (isDarkMode ? 'border-white/20' : 'border-slate-300')} ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/60'} ${!isLowLod ? 'backdrop-blur-sm rounded-sm' : ''} flex flex-col items-center justify-center ${borderColor}`}>
                      {isHovered && (
                          <div className="bg-brand-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                              {t('available')}
                          </div>
                      )}
                      {!isLowLod && !isHovered && <span className={`text-3xl ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>+</span>}
                  </div>
                </div>
            )}

            {showBanner && (
              <div className="absolute top-1/2 left-1/2 w-0 h-0 preserve-3d pointer-events-none z-50" style={{ transform: 'translateZ(80px)' }} >
                 <div className="absolute top-0 left-0 flex flex-col items-center gap-1 transition-all duration-300 origin-bottom" style={{ transform: `translate(-50%, -100%) rotateX(var(--map-inv-rotate-x)) rotateZ(var(--map-inv-rotate-z))` }} >
                    <div className={`px-3 py-1.5 rounded-lg shadow-xl border border-white/20 flex items-center gap-2 ${statusColor} backdrop-blur-md`} style={mapMode === 'heatmap' ? { backgroundColor: heatmapColorString } : {}}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">{statusText}</span>
                    </div>
                    <div className={`w-0.5 h-6 opacity-80 ${statusColor}`} style={mapMode === 'heatmap' ? { backgroundColor: heatmapColorString } : {}}></div>
                 </div>
              </div>
            )}
        </div>
    </div>
  );
});

interface NetworkingLayerProps {
    connections: any[];
    activeId: string | null;
}

const NetworkingLayer: React.FC<NetworkingLayerProps> = ({ connections, activeId }) => {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none preserve-3d" style={{ transform: 'translateZ(2px)' }}>
            <defs>
                <filter id="net-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {connections.map(conn => {
                const isRelevant = !activeId || conn.participants.includes(activeId);
                const opacity = isRelevant ? 0.9 : 0.1;
                const color = conn.type === 'synergy' ? '#F7C600' : '#3b82f6';
                const strokeWidth = conn.type === 'synergy' ? 3 : 1.5;

                return (
                    <g key={conn.id} className="transition-opacity duration-500" style={{ opacity }}>
                        <line 
                            x1={conn.start.x} y1={conn.start.y} 
                            x2={conn.end.x} y2={conn.end.y} 
                            stroke={color} 
                            strokeWidth={strokeWidth} 
                            strokeDasharray={conn.type === 'synergy' ? "10, 5" : "none"}
                            filter="url(#net-glow)"
                            className={conn.type === 'synergy' ? 'animate-dash-flow' : ''}
                        />
                        {/* Animated Particle Flow */}
                        {isRelevant && (
                            <circle r={strokeWidth * 1.5} fill="#fff">
                                <animateMotion 
                                    dur={conn.type === 'synergy' ? '3s' : '6s'} 
                                    repeatCount="indefinite" 
                                    path={`M${conn.start.x},${conn.start.y} L${conn.end.x},${conn.end.y}`} 
                                />
                            </circle>
                        )}
                    </g>
                );
            })}
            <style>{`
                @keyframes dash-flow {
                    from { stroke-dashoffset: 30; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-dash-flow {
                    animation: dash-flow 1s linear infinite;
                }
            `}</style>
        </svg>
    );
};

interface OfficeMapProps {
  businesses: Business[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRentClick: (business: Business) => void;
  onAddBusiness: (business: Business) => void;
  onUpdateBusiness: (business: Business) => void;
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

  const [showInsights, setShowInsights] = useState(false);
  const [insightsContent, setInsightsContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [interactionMode, setInteractionMode] = useState<'pan' | 'rotate'>('pan');
  const [viewState, setViewState] = useState({ zoom: 0.8, rotateX: 55, rotateZ: 45, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const lastMousePos = useRef<{x: number, y: number} | null>(null);
  const lastTouchPos = useRef<{x: number, y: number} | null>(null);
  const lastTouchDist = useRef<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (mapMode === 'globe') {
          setViewState({ zoom: 0.9, rotateX: 0, rotateZ: 0, panX: 0, panY: 0 });
          setInteractionMode('rotate');
      } else {
          setViewState({ zoom: 0.8, rotateX: 55, rotateZ: 45, panX: 0, panY: 0 });
          setInteractionMode('pan');
      }
  }, [mapMode]);

  const networkingConnections = useMemo(() => {
    if (mapMode !== 'networking') return [];
    const connections: any[] = [];
    const occupied = businesses.filter(b => b.isOccupied);
    for (let i = 0; i < occupied.length; i++) {
        for (let j = i + 1; j < occupied.length; j++) {
            const b1 = occupied[i];
            const b2 = occupied[j];
            
            // Comprehensive Synergy Check
            const hasSynergy = b1.genomeProfile?.servicesNeeded?.some(need => 
                b2.genomeProfile?.servicesOffered?.some(offer => offer.toLowerCase().includes(need.toLowerCase()) || need.toLowerCase().includes(offer.toLowerCase()))
            ) || b2.genomeProfile?.servicesNeeded?.some(need => 
                b1.genomeProfile?.servicesOffered?.some(offer => offer.toLowerCase().includes(need.toLowerCase()) || need.toLowerCase().includes(offer.toLowerCase()))
            );

            let type: 'synergy' | 'industry' | null = null;
            if (hasSynergy) type = 'synergy';
            else if (b1.category === b2.category) type = 'industry';

            if (type) {
                connections.push({ id: `${b1.id}-${b2.id}`, participants: [b1.id, b2.id], start: getCellCenter(b1.gridPosition), end: getCellCenter(b2.gridPosition), type });
            }
        }
    }
    return connections;
  }, [businesses, mapMode]);

  const trafficSegments = useMemo(() => {
    if (mapMode !== 'traffic') return [];
    const segments = [];
    for (let c = 1; c < GRID_COLS; c++) {
        const x = PADDING + (c-1)*(CELL_SIZE+GAP) + CELL_SIZE + GAP/2;
        const nearby = businesses.filter(b => b.isOccupied && (b.gridPosition.x === c || b.gridPosition.x === c + 1));
        const visitors = nearby.reduce((acc, b) => acc + (b.activeVisitors || 0), 0);
        segments.push({ id: `v-${c}`, x1: x, y1: PADDING, x2: x, y2: CONTAINER_SIZE - PADDING, visitors: visitors, orientation: 'vertical' });
    }
    for (let r = 1; r < GRID_COLS; r++) { 
         const y = PADDING + (r-1)*(CELL_SIZE+GAP) + CELL_SIZE + GAP/2;
         const nearby = businesses.filter(b => b.isOccupied && (b.gridPosition.y === r || b.gridPosition.y === r + 1));
         const visitors = nearby.reduce((acc, b) => acc + (b.activeVisitors || 0), 0);
         segments.push({ id: `h-${r}`, x1: PADDING, y1: y, x2: CONTAINER_SIZE - PADDING, y2: y, visitors: visitors, orientation: 'horizontal' });
    }
    return segments;
  }, [businesses, mapMode]);

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
      } catch (e) { console.error(e); setInsightsContent("Failed to generate insights."); } finally { setIsAnalyzing(false); }
  };

  const processedBusinesses = useMemo(() => {
    let result = [...businesses];
    if (aiFilteredIds !== null) { result = result.filter(b => aiFilteredIds.includes(b.id)); } else {
         if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => b.name.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q)) || b.category.toLowerCase().includes(q) );
         }
    }
    return result;
  }, [businesses, aiFilteredIds, searchQuery]);

  // --- Input Handlers (Pan, Rotate, Zoom) ---

  const handleMouseDown = (e: React.MouseEvent) => { 
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
      setIsDragging(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; 
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !lastMousePos.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      updateNavigation(dx, dy);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const updateNavigation = (dx: number, dy: number) => {
      if (mapMode === 'globe') {
          setViewState(prev => ({ ...prev, rotateZ: prev.rotateZ + dx * 0.5, rotateX: prev.rotateX - dy * 0.5 }));
      } else if (interactionMode === 'rotate') {
         setViewState(prev => ({ ...prev, rotateZ: prev.rotateZ + dx * 0.3, rotateX: Math.max(0, Math.min(85, prev.rotateX - dy * 0.3)) }));
      } else {
         setViewState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
      }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
      const zoomSpeed = 0.0015;
      const delta = -e.deltaY;
      setViewState(prev => ({
          ...prev,
          zoom: Math.max(0.4, Math.min(2.5, prev.zoom + delta * zoomSpeed))
      }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
      setIsDragging(true);
      if (e.touches.length === 1) {
          lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          lastTouchDist.current = null;
      } else if (e.touches.length === 2) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          lastTouchDist.current = dist;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      if (e.touches.length === 1 && lastTouchPos.current) {
          const dx = e.touches[0].clientX - lastTouchPos.current.x;
          const dy = e.touches[0].clientY - lastTouchPos.current.y;
          updateNavigation(dx, dy);
          lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && lastTouchDist.current) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const delta = dist - lastTouchDist.current;
          const zoomSpeed = 0.005;
          setViewState(prev => ({
              ...prev,
              zoom: Math.max(0.4, Math.min(2.5, prev.zoom + delta * zoomSpeed))
          }));
          lastTouchDist.current = dist;
      }
  };

  const handleTouchEnd = () => {
      setIsDragging(false);
      lastTouchPos.current = null;
      lastTouchDist.current = null;
  };

  const selectedBusiness = useMemo(() => businesses.find(b => b.id === selectedBusinessId) || null, [businesses, selectedBusinessId]);

  let currentLod: 'low' | 'medium' | 'high' = 'medium';
  if (viewState.zoom < 0.65 || mapMode === 'globe') currentLod = 'low';
  else if (viewState.zoom > 1.25) currentLod = 'high';

  // Check if a building is part of the active network view
  const getNetworkStatus = (id: string) => {
    if (mapMode !== 'networking') return { isRelated: false };
    const activeId = hoveredId || selectedBusinessId;
    if (!activeId) return { isRelated: true }; // Show all if nothing highlighted
    if (id === activeId) return { isRelated: true };
    
    const conn = networkingConnections.find(c => c.participants.includes(id) && c.participants.includes(activeId));
    if (conn) return { isRelated: true, type: conn.type };
    return { isRelated: false };
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full relative">
       <div 
          className={`relative flex-1 h-[600px] lg:h-full overflow-hidden rounded-[32px] border shadow-inner group outline-none transition-colors duration-700 select-none ${
              mapMode === 'globe' ? 'bg-slate-900 border-slate-700' : 
              mapMode === 'heatmap' ? 'bg-[#0f172a] border-white' : 
              mapMode === 'networking' ? 'bg-[#0B1121] border-brand-primary/20' : 'bg-[#F1F5F9] border-white'
          }`}
          style={{ touchAction: 'none' }}
          ref={mapContainerRef}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
       >
           {/* Scene Enhancements */}
           {(mapMode === 'globe' || mapMode === 'networking') && (
               <div className="absolute inset-0 pointer-events-none">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] opacity-80"></div>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow"></div>
               </div>
           )}

           <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none">
               <div className="pointer-events-auto bg-white/90 backdrop-blur-xl shadow-card border border-white/50 rounded-2xl p-5 w-80 max-h-[85vh] overflow-y-auto custom-scrollbar">
                   <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">{t('businessMap')}</h2>
                   <div className="relative mb-4 space-y-2">
                       <div className="relative">
                           <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('aiSearchPlaceholder')} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all" />
                           <button onClick={handleAISearch} className="absolute right-3 top-3 text-slate-400 hover:text-brand-accent">{isSearchingAI ? <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}</button>
                       </div>
                       <button onClick={handleAnalyzeTrends} className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"><span>✨</span> {t('analyzeTrends')}</button>
                   </div>
                   <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 mb-4">
                       {['standard', 'heatmap', 'traffic', 'networking', 'globe'].map(mode => (
                           <button key={mode} onClick={() => setMapMode(mode as MapMode)} className={`px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${mapMode === mode ? 'bg-brand-primary text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`} >{mode === 'globe' ? '🌍 Globe' : t(mode + 'Mode')}</button>
                       ))}
                   </div>
               </div>
               
               <div className="pointer-events-auto flex flex-col gap-2 bg-white/90 backdrop-blur rounded-2xl p-2 shadow-card border border-white/50">
                  {mapMode !== 'globe' && (
                      <button onClick={() => setInteractionMode(m => m === 'pan' ? 'rotate' : 'pan')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${interactionMode === 'rotate' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`} >{interactionMode === 'rotate' ? '↻' : '✢'}</button>
                  )}
                  <button onClick={() => setViewState(p => ({...p, zoom: Math.min(2.5, p.zoom + 0.1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl">+</button>
                  <button onClick={() => setViewState(p => ({...p, zoom: Math.max(0.4, p.zoom - 0.1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-accent font-bold text-xl">-</button>
               </div>
           </div>

           <div 
                className={`absolute inset-0 preserve-3d origin-center transition-transform duration-75 ease-linear ${interactionMode === 'rotate' || mapMode === 'globe' ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}
                style={{
                    transform: mapMode === 'globe' 
                        ? `translate3d(0,0,0) scale(${viewState.zoom})` 
                        : `translate3d(${viewState.panX}px, ${viewState.panY}px, 0) scale(${viewState.zoom}) rotateX(${viewState.rotateX}deg) rotateZ(${viewState.rotateZ}deg)`,
                    '--map-inv-rotate-x': `-${viewState.rotateX}deg`,
                    '--map-inv-rotate-z': `-${viewState.rotateZ}deg`
                } as React.CSSProperties}
           >
               <div className="absolute top-1/2 left-1/2 preserve-3d" 
                    style={{ 
                        width: mapMode === 'globe' ? 0 : CONTAINER_SIZE, 
                        height: mapMode === 'globe' ? 0 : CONTAINER_SIZE, 
                        transform: mapMode === 'globe' 
                            ? `rotateX(${viewState.rotateX}deg) rotateY(${viewState.rotateZ}deg)` 
                            : 'translate(-50%, -50%)' 
                    }}
               >
                    {mapMode !== 'globe' && (
                        <div className={`absolute inset-0 rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-4 border-white/50 ${mapMode === 'networking' ? 'bg-slate-900/60' : 'bg-white'}`}></div>
                    )}
                    
                    {mapMode === 'globe' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 preserve-3d">
                            <div className="w-[600px] h-[600px] rounded-full bg-blue-900/40 border border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.2)] backdrop-blur-sm animate-pulse-slow"></div>
                        </div>
                    )}

                    {/* Data Visualization Layers */}
                    {mapMode === 'networking' && (
                        <NetworkingLayer connections={networkingConnections} activeId={hoveredId || selectedBusinessId} />
                    )}

                    {mapMode === 'traffic' && (
                        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(2px)' }}>
                            {trafficSegments.map(seg => {
                                const intensity = Math.min(seg.visitors / 50, 1);
                                let color = '#10b981';
                                if (intensity > 0.6) color = '#ef4444';
                                else if (intensity > 0.3) color = '#f59e0b';
                                return (
                                    <div key={seg.id} className="absolute bg-current opacity-80 overflow-hidden rounded-full blur-[1px]" style={{ left: seg.x1, top: seg.y1, width: seg.orientation === 'vertical' ? 40 : (seg.x2 - seg.x1), height: seg.orientation === 'horizontal' ? 40 : (seg.y2 - seg.y1), color: color, marginLeft: seg.orientation === 'vertical' ? -20 : 0, marginTop: seg.orientation === 'horizontal' ? -20 : 0, boxShadow: `0 0 10px ${color}` }} >
                                        <div className={`absolute inset-0 ${seg.orientation === 'vertical' ? 'animate-traffic-v' : 'animate-traffic-h'}`} style={{ backgroundImage: seg.orientation === 'vertical' ? 'linear-gradient(to bottom, transparent 50%, currentColor 50%)' : 'linear-gradient(to right, transparent 50%, currentColor 50%)', backgroundSize: seg.orientation === 'vertical' ? '100% 60px' : '60px 100%' }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {processedBusinesses.map((business, index) => {
                        let style: React.CSSProperties = {};
                        if (mapMode === 'globe') {
                            const total = processedBusinesses.length;
                            const phi = Math.acos(-1 + (2 * index) / total);
                            const theta = Math.sqrt(total * Math.PI) * phi;
                            style = { transform: `rotateY(${theta}rad) rotateX(${phi}rad) translateZ(${GLOBE_RADIUS}px)`, position: 'absolute', left: '50%', top: '50%', marginLeft: -CELL_SIZE/2, marginTop: -CELL_SIZE/2, width: CELL_SIZE, height: CELL_SIZE };
                        } else {
                            const colIndex = business.gridPosition.x - 1;
                            const rowIndex = business.gridPosition.y - 1;
                            const xPos = PADDING + (colIndex * CELL_SIZE) + (colIndex * GAP);
                            const yPos = PADDING + (rowIndex * CELL_SIZE) + (rowIndex * GAP);
                            style = { width: CELL_SIZE, height: CELL_SIZE, left: xPos, top: yPos };
                        }

                        const netStatus = getNetworkStatus(business.id);

                        return (
                            <div key={business.id} className="absolute preserve-3d transition-all duration-500" style={style} >
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
                                    isNetworkRelated={netStatus.isRelated}
                                    networkType={netStatus.type}
                                />
                            </div>
                        );
                    })}
               </div>
           </div>

           {/* Map Legend */}
           {mapMode !== 'standard' && mapMode !== 'globe' && (
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 pointer-events-auto min-w-[200px] z-20 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-100 pb-2">
                        {mapMode === 'traffic' ? 'Traffic Flow' : mapMode === 'networking' ? 'Network Links' : 'Activity Heatmap'}
                    </h4>
                    <div className="space-y-2">
                        {mapMode === 'traffic' && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-8 h-1 bg-emerald-500"></div><span>Stable</span></div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-8 h-1 bg-rose-500"></div><span>Congested</span></div>
                            </>
                        )}
                        {mapMode === 'networking' && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-8 h-px bg-brand-accent shadow-[0_0_5px_#F7C600]"></div><span>Strategic Synergy</span></div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-8 h-px bg-blue-500"></div><span>Sector Peer</span></div>
                            </>
                        )}
                        {mapMode === 'heatmap' && (
                            <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-red-500"></div>
                        )}
                    </div>
                </div>
           )}
       </div>

       {/* Sidebar Details */}
       {isSidebarOpen && selectedBusiness && (
           <div className="w-full lg:w-[400px] bg-white rounded-[32px] shadow-elevated flex flex-col z-30 animate-fade-in border border-slate-100 overflow-hidden absolute lg:relative bottom-0 lg:bottom-auto h-[60vh] lg:h-auto">
               <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                   <div>
                       <h2 className="text-2xl font-bold text-brand-primary font-heading mb-1">{selectedBusiness.name}</h2>
                       <span className="text-xs font-bold uppercase tracking-wide text-brand-secondary">{selectedBusiness.category}</span>
                   </div>
                   <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">✕</button>
               </div>
               <div className="p-8 flex-1 overflow-y-auto">
                   <div className="w-full h-40 bg-brand-surface rounded-2xl mb-8 border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                      {selectedBusiness.logoUrl ? (
                          <img src={selectedBusiness.logoUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" alt="logo" />
                      ) : (
                          <div className="text-4xl font-bold text-slate-100">LOGO</div>
                      )}
                   </div>
                   <p className="text-slate-600 mb-8 leading-relaxed font-medium">{selectedBusiness.description}</p>
                   
                   {/* DNA / Networking context inside sidebar */}
                   {mapMode === 'networking' && selectedBusiness.genomeProfile && (
                       <div className="mb-8 space-y-4">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('businessDNA')}</h4>
                           <div className="flex flex-wrap gap-2">
                               {selectedBusiness.genomeProfile.servicesOffered.map((s, i) => (
                                   <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-bold">{s}</span>
                               ))}
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

       {showInsights && (
           <div className="absolute bottom-6 left-6 right-6 lg:left-1/4 lg:right-1/4 z-50 animate-slide-up">
               <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[60vh]">
                   <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-4 flex justify-between items-center text-white">
                       <h3 className="font-bold flex items-center gap-2"><span className="text-xl">📊</span> {t('insightsTitle')}</h3>
                       <button onClick={() => setShowInsights(false)} className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                   </div>
                   <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 min-h-[200px]">
                       {isAnalyzing ? (
                           <div className="space-y-4 animate-pulse"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-1/2"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div><div className="flex flex-col items-center justify-center pt-8"><div className="w-10 h-10 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin mb-3"></div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('generatingInsights')}</p></div></div>
                       ) : (
                           <div className="prose prose-sm prose-slate max-w-none animate-fade-in"><div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">{insightsContent}</div></div>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default OfficeMap;
