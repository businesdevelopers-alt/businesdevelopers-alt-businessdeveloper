
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Business, MatchResult, BusinessGenome } from '../types';
import { generateBusinessMatches } from '../services/geminiService';
import { MY_BUSINESS_GENOME } from '../constants';

interface NetworkIntelligenceProps {
  businesses: Business[];
  userGenome: BusinessGenome;
}

const MatchSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4 w-full">
        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
        <div className="space-y-2 w-full pt-1">
           <div className="h-4 bg-slate-200 rounded w-3/4"></div>
           <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="w-10 h-10 rounded bg-slate-200 shrink-0"></div>
    </div>
    <div className="space-y-4 flex-1">
       <div className="h-24 bg-slate-100 rounded-xl"></div>
       <div className="space-y-2 pt-2">
         <div className="h-3 bg-slate-100 rounded w-full"></div>
         <div className="h-3 bg-slate-100 rounded w-5/6"></div>
       </div>
    </div>
    <div className="mt-6 h-10 bg-slate-200 rounded-xl w-full"></div>
  </div>
);

const NetworkIntelligence: React.FC<NetworkIntelligenceProps> = ({ businesses, userGenome }) => {
  const { t, language } = useLanguage();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<{result: MatchResult, business: Business} | null>(null);
  const [introMessage, setIntroMessage] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  // Sort State
  const [sortOrder, setSortOrder] = useState<'default' | 'score'>('default');

  // Derive unique options for dropdowns (for filters)
  const { uniqueIndustries, uniqueSizes } = useMemo(() => {
    const industries = new Set<string>();
    const sizes = new Set<string>();
    
    businesses.forEach(b => {
       if (b.isOccupied && b.genomeProfile) {
           if (b.genomeProfile.industrySector) industries.add(b.genomeProfile.industrySector);
           if (b.genomeProfile.companySize) sizes.add(b.genomeProfile.companySize);
       }
    });

    return {
        uniqueIndustries: Array.from(industries).sort(),
        uniqueSizes: Array.from(sizes).sort()
    };
  }, [businesses]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    // Simulate a small delay for smoother transition if API is too fast
    const delay = new Promise(resolve => setTimeout(resolve, 800));
    
    try {
        const filteredCandidates = businesses.filter(b => {
            if (!b.isOccupied) return false;
            
            const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesIndustry = !selectedIndustry || b.genomeProfile?.industrySector === selectedIndustry;
            const matchesSize = !selectedSize || b.genomeProfile?.companySize === selectedSize;
            
            return matchesSearch && matchesIndustry && matchesSize;
        });

        // Only call AI if we have candidates
        if (filteredCandidates.length > 0) {
            const [results] = await Promise.all([
                generateBusinessMatches(userGenome, filteredCandidates, language),
                delay
            ]);
            setMatches(results);
        } else {
            setMatches([]);
            await delay;
        }
        
    } catch (error) {
        console.error(error);
        setMatches([]);
    } finally {
        setLoading(false);
    }
  }, [businesses, language, searchQuery, selectedIndustry, selectedSize, userGenome]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]); 

  const getBusinessById = (id: string) => businesses.find(b => b.id === id);

  const handleOpenMatch = (match: MatchResult, business: Business) => {
      setSelectedMatch({ result: match, business });
      setIntroMessage(t('smartIntroMsg', { 
          field: match.sharedInterests[0] || (language === 'ar' ? 'مجال عملكم' : 'your sector'), 
          topic: match.collaborationOpportunity 
      }));
  };

  // Sort Logic
  const sortedMatches = useMemo(() => {
      let result = [...matches];
      if (sortOrder === 'score') {
          result.sort((a, b) => b.score - a.score);
      }
      return result;
  }, [matches, sortOrder]);

  const getFactorIcon = (factor: string) => {
    const f = factor.toLowerCase();
    if (f.includes('industry') || f.includes('sector') || f.includes('قطاع')) return (
       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    );
    if (f.includes('service') || f.includes('match') || f.includes('offer') || f.includes('need') || f.includes('synergy') || f.includes('خدمة')) return (
       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
    );
    if (f.includes('strategic') || f.includes('fit') || f.includes('market') || f.includes('size') || f.includes('استراتيجي')) return (
       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    );
    return <div className="w-1.5 h-1.5 rounded-full bg-current"></div>;
  };

  return (
    <div className="animate-fade-in h-full flex flex-col bg-brand-surface rounded-3xl overflow-hidden border border-slate-200 shadow-card">
      
      {/* Header */}
      <div className="bg-white p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-heading font-bold text-brand-primary mb-1">{t('smartLounge')}</h2>
           <p className="text-sm text-brand-secondary">{t('network_intelligenceDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI Engine Active</span>
            </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
             {/* Name Search */}
             <div className="relative lg:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('searchPlaceholder')}</label>
                <div className="relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Tech..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium text-brand-primary"
                    />
                    <svg className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
             </div>

             {/* Industry Filter */}
             <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('filterIndustry')}</label>
                <div className="relative">
                    <select 
                       value={selectedIndustry}
                       onChange={(e) => setSelectedIndustry(e.target.value)}
                       className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm appearance-none bg-white cursor-pointer font-bold text-brand-primary"
                    >
                       <option value="">{t('allIndustries')}</option>
                       {uniqueIndustries.map(ind => (
                           <option key={ind} value={ind}>{ind}</option>
                       ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                </div>
             </div>

             {/* Company Size Filter */}
             <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('filterSize')}</label>
                <div className="relative">
                    <select 
                       value={selectedSize}
                       onChange={(e) => setSelectedSize(e.target.value)}
                       className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm appearance-none bg-white cursor-pointer font-bold text-brand-primary"
                    >
                       <option value="">{t('allSizes')}</option>
                       {uniqueSizes.map(size => (
                           <option key={size} value={size}>{size}</option>
                       ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                </div>
             </div>
             
             {/* Sort Dropdown */}
             <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('sortBy')}</label>
                <div className="relative">
                    <select 
                       value={sortOrder}
                       onChange={(e) => setSortOrder(e.target.value as 'default' | 'score')}
                       disabled={loading || matches.length === 0}
                       className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm appearance-none bg-white cursor-pointer font-bold text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <option value="default">{t('sortDefault')}</option>
                       <option value="score">{t('sortScoreHigh')}</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                </div>
             </div>

             {/* Action Button */}
             <button 
                onClick={fetchMatches}
                disabled={loading}
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 h-[46px]"
             >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze Matches
                    </>
                )}
             </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('highValueMatch')}</h3>
         
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
               {[1, 2, 3].map(i => <MatchSkeleton key={i} />)}
            </div>
         ) : sortedMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 flex flex-col items-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400 text-4xl shadow-inner">🔍</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">{t('noResults')}</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">{t('tryRefreshing')}</p>
                <button onClick={fetchMatches} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                   Reset & Search Again
                </button>
            </div>
         ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {sortedMatches.slice(0, 3).map((match, idx) => {
                    const business = getBusinessById(match.companyId);
                    if (!business) return null;

                    const isHighPriority = match.score >= 80;

                    return (
                        <div 
                           key={idx} 
                           className={`group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex flex-col animate-slide-up ${isHighPriority ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-slate-100'}`}
                           style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {isHighPriority && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold"></div>
                             )}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-brand-surface border flex items-center justify-center overflow-hidden shrink-0 transition-transform ${isHighPriority ? 'border-brand-gold/30 scale-110' : 'border-slate-100'}`}>
                                        {business.logoUrl ? (
                                            <img src={business.logoUrl} className="w-full h-full object-cover" alt={business.name} />
                                        ) : (
                                            <div className="text-xs font-bold text-brand-secondary">LOGO</div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-primary text-lg leading-tight line-clamp-1">{business.name}</h4>
                                        <span className="text-xs text-brand-secondary">{business.category}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className={`text-2xl font-bold ${isHighPriority ? 'text-brand-gold' : 'text-brand-primary'}`}>{match.score}%</div>
                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHighPriority ? 'bg-brand-gold/10 text-brand-gold' : 'text-green-600 bg-green-50'}`}>{t('matchScore')}</div>
                                </div>
                            </div>

                            <div className="bg-brand-surface rounded-xl p-4 mb-6 border border-slate-100 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className={`w-4 h-4 ${isHighPriority ? 'text-brand-gold' : 'text-brand-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span className={`text-xs font-bold uppercase ${isHighPriority ? 'text-brand-gold' : 'text-brand-primary'}`}>{t('aiInsight')}</span>
                                </div>
                                <p className="text-sm text-text-sub leading-relaxed font-medium mb-4">{match.matchReason}</p>
                                
                                {match.collaborationOpportunity && (
                                    <div className={`mt-auto p-3 rounded-xl border ${isHighPriority ? 'bg-brand-gold/5 border-brand-gold/20' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">🚀</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isHighPriority ? 'text-amber-600' : 'text-blue-600'}`}>Opportunity</span>
                                        </div>
                                        <p className={`text-xs leading-relaxed font-bold ${isHighPriority ? 'text-amber-800' : 'text-blue-900'}`}>
                                            {match.collaborationOpportunity}
                                        </p>
                                    </div>
                                )}
                            </div>

                             {match.sharedInterests && match.sharedInterests.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {match.sharedInterests.slice(0, 3).map((tag, tIdx) => (
                                        <span key={tIdx} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-sm ${isHighPriority ? 'bg-white border-brand-gold/30 text-brand-primary ring-1 ring-brand-gold/10' : 'bg-white border-slate-200 text-slate-600'}`}>
                                            <svg className={`w-2.5 h-2.5 ${isHighPriority ? 'text-green-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            {tag}
                                        </span>
                                    ))}
                                    {match.sharedInterests.length > 3 && (
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200">+{match.sharedInterests.length - 3}</span>
                                    )}
                                </div>
                             )}

                            <button 
                                onClick={() => handleOpenMatch(match, business)}
                                className={`w-full py-3 rounded-xl font-bold text-sm shadow-soft transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto ${isHighPriority ? 'bg-brand-gold text-white hover:bg-amber-600' : 'bg-brand-primary text-white hover:bg-[#052c42]'}`}
                            >
                                <span>{t('requestIntro')}</span>
                                <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                            </div>
                        </div>
                    );
                })}
                </div>

                {sortedMatches.length > 3 && (
                    <div className="border-t border-slate-100 pt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span>{t('recommendedConnections')}</span>
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </h3>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x custom-scrollbar">
                            {sortedMatches.slice(3).map((match, idx) => {
                                const business = getBusinessById(match.companyId);
                                if (!business) return null;
                                
                                const servicePoint = match.analysisPoints?.find(p => 
                                    p.factor.toLowerCase().includes('service') || 
                                    p.factor.toLowerCase().includes('need') || 
                                    p.factor.toLowerCase().includes('offer')
                                );
                                const briefReason = servicePoint ? servicePoint.description : match.matchReason;

                                return (
                                    <div key={`rec-${idx}`} className="snap-start min-w-[280px] w-[280px] bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-brand-surface border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                {business.logoUrl ? (
                                                    <img src={business.logoUrl} className="w-full h-full object-cover" alt={business.name} />
                                                ) : (
                                                    <div className="text-[10px] font-bold text-brand-secondary">LOGO</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-brand-primary text-sm truncate">{business.name}</h4>
                                                <div className="flex items-center gap-1 text-[10px] text-brand-secondary">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                   <span className="truncate">{t('serviceSynergy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-50 rounded-xl p-4 mb-4 flex-1 border border-blue-100/50">
                                            <div className="flex gap-2 mb-2">
                                                <svg className="w-3 h-3 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-xs text-blue-900 leading-relaxed line-clamp-3 font-medium">
                                                    "{briefReason}"
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleOpenMatch(match, business)}
                                            className="w-full py-2.5 rounded-lg border border-brand-primary text-brand-primary font-bold text-xs hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span>Connect</span>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </>
         )}
      </div>

      {/* Introduction Room Modal */}
      {selectedMatch && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-primary/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-elevated overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
               <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-brand-surface shrink-0">
                  <div>
                     <h3 className="text-xl font-bold text-brand-primary mb-1">{t('introRoom')}</h3>
                     <p className="text-sm text-brand-secondary">AI-Facilitated Connection</p>
                  </div>
                  <button onClick={() => setSelectedMatch(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-red-500">✕</button>
               </div>
               
               <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between gap-4 mb-8">
                     {/* Me */}
                     <div className="flex-1 bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                        <div className="w-12 h-12 bg-brand-primary rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl">M</div>
                        <div className="font-bold text-brand-primary text-sm truncate">{MY_BUSINESS_GENOME.name}</div>
                     </div>
                     
                     <div className="flex flex-col items-center justify-center text-slate-300 px-2 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">{selectedMatch.result.score}% Match</span>
                        <div className="w-full h-px bg-slate-300"></div>
                     </div>

                     {/* Them */}
                     <div className="flex-1 bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                        <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                           {selectedMatch.business.logoUrl ? (
                                <img src={selectedMatch.business.logoUrl} className="w-full h-full object-cover" alt="" />
                           ) : (
                                <span className="text-xs font-bold">LOGO</span>
                           )}
                        </div>
                        <div className="font-bold text-brand-primary text-sm truncate">{selectedMatch.business.name}</div>
                     </div>
                  </div>

                  <div className="space-y-6">
                      {/* Analysis Points */}
                      {selectedMatch.result.analysisPoints && (
                          <div className="grid gap-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compatibility Analysis</h4>
                              {selectedMatch.result.analysisPoints.map((point, i) => (
                                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                      <div className="mt-1 text-brand-primary">{getFactorIcon(point.factor)}</div>
                                      <div>
                                          <h5 className="text-sm font-bold text-slate-700">{point.factor}</h5>
                                          <p className="text-xs text-slate-500 leading-relaxed mt-1">{point.description}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Message Input */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('message')}</h4>
                          <textarea
                              value={introMessage}
                              onChange={(e) => setIntroMessage(e.target.value)}
                              className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm font-medium text-slate-700 resize-none"
                          />
                      </div>
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                  <button className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#052c42] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                     <span>{t('sendMessage')}</span>
                     <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default NetworkIntelligence;
