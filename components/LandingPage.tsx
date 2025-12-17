
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onNavigate: (tab: 'map' | 'services' | 'subscription') => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isLoggedIn, onLogin }) => {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg overflow-x-hidden">
      
      {/* --- HERO SECTION: Industrial Graphite --- */}
      <div className="relative w-full pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-brand-dark text-white">
        {/* CSS Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-tech-dark opacity-20 pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="flex flex-col items-start text-start animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded border border-white/20 bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">System Online v2.0</span>
              </div>
              
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 ${language !== 'ar' ? 'font-sans tracking-tight' : 'font-heading'}`}>
                {isLoggedIn ? (
                    <span>{t('welcomeBack')}, <br/><span className="text-brand-primary">Architect</span></span>
                ) : (
                    <span>The Future, <br/><span className="text-brand-primary">Your Office.</span></span>
                )}
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed font-normal max-w-lg mb-10 font-mono">
                {isLoggedIn ? t('dashboardSubtitle') : t('heroSubtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => onNavigate('map')}
                      className="h-12 px-8 rounded bg-brand-primary text-white font-bold text-sm hover:brightness-110 transition-all duration-200 shadow-lg shadow-brand-primary/20"
                    >
                      {t('exploreCity')}
                    </button>
                    <button
                      onClick={() => onNavigate('services')}
                      className="h-12 px-8 rounded bg-transparent border border-slate-600 text-white font-bold text-sm hover:border-white transition-all duration-200"
                    >
                      {t('manageServices')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('subscription')}
                      className="h-12 px-8 rounded bg-brand-primary text-white font-bold text-sm hover:brightness-110 transition-all duration-200 shadow-lg shadow-brand-primary/20"
                    >
                      {t('startNow')}
                    </button>
                    <button
                      onClick={onLogin}
                      className="h-12 px-8 rounded bg-transparent border border-slate-600 text-white font-bold text-sm hover:border-white transition-all duration-200"
                    >
                      {t('joinCommunity')}
                    </button>
                  </>
                )}
              </div>

              {/* Stats Mini */}
              <div className="mt-12 flex items-center gap-8 text-sm font-bold text-slate-500 border-t border-white/10 pt-8 w-full max-w-md">
                  <div className="flex flex-col">
                      <span className="text-2xl text-white font-mono">5k+</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Active Members</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col">
                      <span className="text-2xl text-white font-mono">100%</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Digital Compliance</span>
                  </div>
              </div>
            </div>

            {/* Visual Content */}
            <div className="relative">
              {/* Main Image Card */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-brand-dark">
                 <img 
                   src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                   alt="Modern Office" 
                   className="w-full h-auto object-cover opacity-60 hover:opacity-80 transition-opacity duration-700 grayscale hover:grayscale-0"
                 />
                 {/* Technical UI Overlay */}
                 <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/90 p-4 border-t border-white/10 flex justify-between items-center backdrop-blur-sm">
                    <div className="font-mono text-xs text-brand-primary">STATUS: OPERATIONAL</div>
                    <div className="font-mono text-xs text-slate-400">ID: #8821-X</div>
                 </div>
              </div>
              {/* Decorative back element */}
              <div className="absolute -inset-4 border border-brand-primary/20 rounded-2xl -z-10 translate-x-4 translate-y-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRUST STRIP --- */}
      <div className="w-full py-8 border-b border-slate-200 bg-white">
         <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('trustedBy')}</p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
               <span className="text-lg font-bold text-brand-dark">TechVision</span>
               <span className="text-lg font-bold text-brand-dark">ARAMCO Digital</span>
               <span className="text-lg font-bold text-brand-dark">STC Solutions</span>
               <span className="text-lg font-bold text-brand-dark">Riyadh Valley</span>
               <span className="text-lg font-bold text-brand-dark">NEOM</span>
            </div>
         </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="py-24 max-w-[1440px] mx-auto px-6 md:px-12 bg-brand-bg">
          <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6 font-heading">
                  Everything you need to <span className="text-brand-primary">Scale.</span>
              </h2>
              <p className="text-lg text-slate-500">
                  Replace your physical HQ with a smarter, faster, and more efficient digital alternative.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { 
                      title: t('feat_prestige_title'), 
                      desc: t('feat_prestige_desc'), 
                      icon: "🏢",
                      color: "text-blue-600"
                  },
                  { 
                      title: t('feat_ai_title'), 
                      desc: t('feat_ai_desc'), 
                      icon: "🤖",
                      color: "text-brand-dark"
                  },
                  { 
                      title: t('feat_network_title'), 
                      desc: t('feat_network_desc'), 
                      icon: "🌐",
                      color: "text-brand-accent"
                  }
              ].map((feat, i) => (
                  <div key={i} className="group p-8 rounded-2xl bg-white border border-slate-200 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-6 bg-slate-50 ${feat.color}`}>
                          {feat.icon}
                      </div>
                      <h3 className="text-xl font-bold text-brand-dark mb-4">{feat.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-normal text-sm">
                          {feat.desc}
                      </p>
                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-brand-primary font-bold text-xs cursor-pointer group-hover:gap-4 transition-all uppercase tracking-wide">
                          <span>Learn more</span>
                          <span className="rtl:rotate-180">→</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- BIG VISUAL SECTION --- */}
      <div className="w-full bg-white py-32 relative overflow-hidden border-y border-slate-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 font-heading leading-tight text-brand-dark">
                      Experience the <br/><span className="text-brand-primary">Digital Twin.</span>
                  </h2>
                  <p className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
                      Walk through a 3D representation of your business district. See who's active, find partners, and manage your assets in real-time.
                  </p>
                  <button 
                     onClick={() => onNavigate('map')}
                     className="h-12 px-8 rounded bg-brand-dark text-white font-bold text-sm hover:bg-black transition-all shadow-lg"
                  >
                     Launch Map View
                  </button>
              </div>
              <div className="relative">
                   <div className="absolute inset-0 bg-brand-primary/5 rounded-full blur-3xl"></div>
                   <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Digital City" 
                      className="relative z-10 rounded-xl shadow-2xl border border-slate-200 grayscale opacity-90 hover:grayscale-0 transition-all duration-700"
                   />
              </div>
          </div>
      </div>

      {/* --- CTA --- */}
      <div className="w-full py-24 bg-brand-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-tech-dark opacity-10 pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-heading">
                {t('cta_title')}
             </h2>
             <p className="text-lg text-slate-400 mb-10 font-normal">
                {t('cta_desc')}
             </p>
             <button 
                onClick={onLogin}
                className="h-14 px-10 rounded bg-brand-accent text-brand-dark font-bold text-base shadow-lg hover:bg-yellow-400 transition-all duration-300"
             >
                {t('cta_button')}
             </button>
             <p className="mt-8 text-xs text-slate-500 font-mono uppercase tracking-widest">
                No Credit Card Required • Cancel Anytime
             </p>
          </div>
      </div>

    </div>
  );
};

export default LandingPage;
