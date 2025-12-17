
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import NetworkIntelligence from './NetworkIntelligence';
import AIConsultant from './AIConsultant';
import { Business, BusinessGenome } from '../types';
import { MY_BUSINESS_GENOME } from '../constants';

interface BusinessNetworkPageProps {
  businesses: Business[];
}

const BusinessNetworkPage: React.FC<BusinessNetworkPageProps> = ({ businesses }) => {
  const { t } = useLanguage();
  
  // --- Business DNA Profile State ---
  const [userGenome, setUserGenome] = useState<BusinessGenome>(MY_BUSINESS_GENOME.genomeProfile as BusinessGenome);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Modal Form States for adding array items
  const [newServiceOffer, setNewServiceOffer] = useState('');
  const [newServiceNeed, setNewServiceNeed] = useState('');
  const [newCollabPref, setNewCollabPref] = useState('');

  // Extract unique industries and sizes from the ecosystem for dropdown options
  const { uniqueIndustries } = useMemo(() => {
    const industries = new Set<string>();
    businesses.forEach(b => {
       if (b.isOccupied && b.genomeProfile?.industrySector) {
           industries.add(b.genomeProfile.industrySector);
       }
    });
    return {
        uniqueIndustries: Array.from(industries).sort()
    };
  }, [businesses]);

  // Handlers for Profile Editing (Array manipulation)
  const addServiceOffer = () => {
      if(newServiceOffer.trim()) {
          setUserGenome(prev => ({...prev, servicesOffered: [...prev.servicesOffered, newServiceOffer]}));
          setNewServiceOffer('');
      }
  };
  const removeServiceOffer = (idx: number) => {
      setUserGenome(prev => ({...prev, servicesOffered: prev.servicesOffered.filter((_, i) => i !== idx)}));
  };

  const addServiceNeed = () => {
      if(newServiceNeed.trim()) {
          setUserGenome(prev => ({...prev, servicesNeeded: [...prev.servicesNeeded, newServiceNeed]}));
          setNewServiceNeed('');
      }
  };
  const removeServiceNeed = (idx: number) => {
      setUserGenome(prev => ({...prev, servicesNeeded: prev.servicesNeeded.filter((_, i) => i !== idx)}));
  };

  const addCollabPref = () => {
      if(newCollabPref.trim()) {
          setUserGenome(prev => ({...prev, collaborationPreferences: [...(prev.collaborationPreferences || []), newCollabPref]}));
          setNewCollabPref('');
      }
  };
  const removeCollabPref = (idx: number) => {
      setUserGenome(prev => ({...prev, collaborationPreferences: (prev.collaborationPreferences || []).filter((_, i) => i !== idx)}));
  };

  return (
    <div className="animate-fade-in w-full bg-brand-bg min-h-screen">
       
       {/* Page Header - Solid Background */}
       <div className="bg-brand-surface border-b border-white/5 pt-16 pb-24 text-white text-center relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-6">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                Beta Feature
             </div>
             <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{t('businessNetworkPage')}</h1>
             <p className="text-text-sub text-lg max-w-2xl mx-auto leading-relaxed">
               {t('businessNetworkSubtitle')}
             </p>
          </div>
       </div>

       {/* Content Container */}
       <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 relative z-20 pb-20">
          
          {/* Network Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             {[
                { label: 'activeCompanies', value: '1,240', icon: '🏢', color: 'text-blue-500' },
                { label: 'totalMatches', value: '85', icon: '🤝', color: 'text-green-500' },
                { label: 'openOpportunities', value: '12', icon: '💼', color: 'text-purple-500' },
                { label: 'newMember', value: '+5', icon: '🚀', color: 'text-orange-500' }
             ].map((stat, i) => (
                <div key={i} className="bg-brand-surface rounded-2xl p-4 shadow-card border border-white/5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 bg-brand-bg border border-white/5 ${stat.color}`}>
                      {stat.icon}
                   </div>
                   <div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t(stat.label)}</div>
                   </div>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main Column: Network Intelligence (8 cols) */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                  <div className="bg-brand-surface rounded-3xl shadow-elevated overflow-hidden min-h-[800px] flex flex-col border border-white/5">
                      <NetworkIntelligence businesses={businesses} userGenome={userGenome} />
                  </div>
              </div>

              {/* Sidebar (4 cols) */}
              <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                  
                  {/* --- AI Networking Assistant (Prominent at top) --- */}
                  <div className="bg-brand-surface rounded-[32px] shadow-card border border-white/5 overflow-hidden h-[500px]">
                     <AIConsultant />
                  </div>

                  {/* --- Live Opportunities Widget --- */}
                  <div className="bg-brand-surface rounded-3xl p-6 shadow-card border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-heading font-bold text-white flex items-center gap-2">
                             <span className="text-orange-500 animate-pulse">⚡</span> {t('liveOpportunities')}
                          </h3>
                          <button className="text-xs font-bold text-brand-primary hover:underline">{t('viewAll')}</button>
                      </div>
                      <div className="space-y-4">
                          {[
                             { title: 'rfpRequest', company: 'TechVision', type: 'Project' },
                             { title: 'partnershipReq', company: 'Logistics+', type: 'Partnership' },
                             { title: 'opp_tech', company: 'EduFuture', type: 'Project' }
                          ].map((opp, i) => (
                              <div key={i} className="p-4 bg-brand-bg rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-brand-surface text-slate-400 border border-white/5">{opp.type}</span>
                                      <span className="text-[10px] text-slate-500">{t('postedTime')}</span>
                                  </div>
                                  <h4 className="font-bold text-white text-sm mb-1 leading-tight group-hover:text-brand-primary transition-colors">{t(opp.title)}</h4>
                                  <div className="flex justify-between items-center mt-3">
                                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                         <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                         {opp.company}
                                      </span>
                                      <button className="text-xs font-bold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:brightness-110 transition-colors shadow-sm">
                                         {t('apply')}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* --- My Business DNA Widget --- */}
                  <div className="bg-brand-surface rounded-3xl p-6 shadow-card border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
                      
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                             {t('businessDNA')}
                          </h3>
                          <button 
                             onClick={() => setIsEditingProfile(true)}
                             className="p-2 bg-brand-bg text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                             title={t('editProfile')}
                          >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                      </div>

                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-white/5">
                              <span className="text-xs text-slate-500 font-bold">{t('industrySector')}</span>
                              <span className="text-xs font-bold text-white bg-brand-surface px-2 py-1 rounded shadow-sm">{userGenome.industrySector || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-white/5">
                              <span className="text-xs text-slate-500 font-bold">{t('companySize')}</span>
                              <span className="text-xs font-bold text-white bg-brand-surface px-2 py-1 rounded shadow-sm">{userGenome.companySize || '-'}</span>
                          </div>
                          
                          <div>
                              <span className="text-xs text-slate-500 font-bold mb-2 block">{t('servicesOffered_label')}</span>
                              <div className="flex flex-wrap gap-1.5">
                                  {userGenome.servicesOffered.slice(0,3).map((s,i) => (
                                      <span key={i} className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20 truncate max-w-full">
                                          {s}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full mt-6 py-3 border border-brand-primary text-brand-primary font-bold rounded-xl text-xs hover:bg-brand-primary hover:text-white transition-all"
                      >
                        {t('clickToEdit')}
                      </button>
                  </div>

              </div>
          </div>
       </div>

       {/* --- Edit Profile Modal --- */}
       {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-brand-surface w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-scale-in my-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 font-heading">{t('editProfile')}</h2>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Industry Sector */}
                    <div>
                        <label className="text-sm font-bold text-slate-500 block mb-2">{t('industrySector')}</label>
                        <select 
                            value={userGenome.industrySector}
                            onChange={(e) => setUserGenome({...userGenome, industrySector: e.target.value})}
                            className="w-full px-4 py-3 bg-brand-bg border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-brand-primary/50"
                        >
                            <option value="">Select Industry</option>
                            {uniqueIndustries.map(ind => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Company Size */}
                    <div>
                        <label className="text-sm font-bold text-slate-500 block mb-2">{t('companySize')}</label>
                        <select 
                            value={userGenome.companySize}
                            onChange={(e) => setUserGenome({...userGenome, companySize: e.target.value as any})}
                            className="w-full px-4 py-3 bg-brand-bg border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-brand-primary/50"
                        >
                            <option value="Startup">Startup</option>
                            <option value="SME">SME</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>

                    {/* Services Offered */}
                    <div>
                        <label className="text-sm font-bold text-slate-500 block mb-2">{t('servicesOffered_label')}</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                              type="text" 
                              value={newServiceOffer} 
                              onChange={(e) => setNewServiceOffer(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addServiceOffer()}
                              className="flex-1 px-4 py-2 bg-brand-bg border border-white/10 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/30 outline-none text-white"
                              placeholder={t('addService')}
                            />
                            <button onClick={addServiceOffer} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-colors shadow-sm">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {userGenome.servicesOffered.map((s, i) => (
                                <div key={i} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-500/20">
                                    {s}
                                    <button onClick={() => removeServiceOffer(i)} className="text-blue-400 hover:text-red-500 transition-colors">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Services Needed */}
                    <div>
                        <label className="text-sm font-bold text-slate-500 block mb-2">{t('servicesNeeded_label')}</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                              type="text" 
                              value={newServiceNeed} 
                              onChange={(e) => setNewServiceNeed(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addServiceNeed()}
                              className="flex-1 px-4 py-2 bg-brand-bg border border-white/10 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500/30 outline-none text-white"
                              placeholder={t('addService')}
                            />
                            <button onClick={addServiceNeed} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-sm">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {userGenome.servicesNeeded.map((s, i) => (
                                <div key={i} className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-orange-500/20">
                                    {s}
                                    <button onClick={() => removeServiceNeed(i)} className="text-orange-400 hover:text-red-500 transition-colors">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-white/10">
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-slate-400 hover:bg-white/5 transition-colors">
                        {t('cancel')}
                    </button>
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold shadow-lg hover:brightness-110 transition-colors">
                        {t('saveProfile')}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default BusinessNetworkPage;
