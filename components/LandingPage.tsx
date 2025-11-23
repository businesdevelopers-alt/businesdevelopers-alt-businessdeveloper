
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
    <div className="flex flex-col min-h-screen bg-brand-surface overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-brand-gold/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="flex flex-col items-start text-start animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">The Digital District is Live</span>
              </div>
              
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-brand-primary mb-8 ${language !== 'ar' ? 'font-sans tracking-tight' : 'font-heading'}`}>
                {isLoggedIn ? (
                    <span>{t('welcomeBack')}, <br/><span className="text-gradient">Architect</span></span>
                ) : (
                    <span>The Future, <br/><span className="text-gradient">Your Office.</span></span>
                )}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-lg mb-12">
                {isLoggedIn ? t('dashboardSubtitle') : t('heroSubtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => onNavigate('map')}
                      className="h-14 px-8 rounded-full bg-brand-primary text-white font-bold text-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-1 transition-all duration-300"
                    >
                      {t('exploreCity')}
                    </button>
                    <button
                      onClick={() => onNavigate('services')}
                      className="h-14 px-8 rounded-full bg-white border border-slate-200 text-brand-primary font-bold text-sm hover:border-brand-primary hover:bg-slate-50 transition-all duration-300"
                    >
                      {t('manageServices')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('subscription')}
                      className="h-14 px-8 rounded-full bg-brand-primary text-white font-bold text-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-1 transition-all duration-300"
                    >
                      {t('startNow')}
                    </button>
                    <button
                      onClick={onLogin}
                      className="h-14 px-8 rounded-full bg-white border border-slate-200 text-brand-primary font-bold text-sm hover:border-brand-primary hover:bg-slate-50 transition-all duration-300"
                    >
                      {t('joinCommunity')}
                    </button>
                  </>
                )}
              </div>

              {/* Stats Mini */}
              <div className="mt-12 flex items-center gap-8 text-sm font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                      <span className="text-2xl text-brand-primary">5k+</span>
                      <span className="leading-tight text-xs uppercase tracking-wide">Active<br/>Members</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                      <span className="text-2xl text-brand-primary">100%</span>
                      <span className="leading-tight text-xs uppercase tracking-wide">Digital<br/>Compliance</span>
                  </div>
              </div>
            </div>

            {/* Visual Content */}
            <div className="relative animate-float">
              {/* Main Image Card */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                 <img 
                   src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                   alt="Modern Office" 
                   className="w-full h-auto object-cover"
                 />
                 {/* Floating UI Element */}
                 <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Current Status</div>
                        <div className="text-brand-primary font-bold">Office Occupied • 98% Efficiency</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                 </div>
              </div>
              
              {/* Decorative elements behind */}
              <div className="absolute top-10 -right-10 w-full h-full bg-brand-accent rounded-3xl -z-10 opacity-10 transform rotate-[3deg]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRUST STRIP --- */}
      <div className="w-full py-10 border-y border-slate-200 bg-white">
         <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('trustedBy')}</p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-12 opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
               <span className="text-xl font-serif font-bold text-slate-800">TechVision</span>
               <span className="text-xl font-serif font-bold text-slate-800">ARAMCO Digital</span>
               <span className="text-xl font-serif font-bold text-slate-800">STC Solutions</span>
               <span className="text-xl font-serif font-bold text-slate-800">Riyadh Valley</span>
               <span className="text-xl font-serif font-bold text-slate-800">NEOM</span>
            </div>
         </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="py-24 max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-brand-primary mb-6 font-heading">
                  Everything you need to <span className="text-gradient">Scale.</span>
              </h2>
              <p className="text-lg text-slate-600">
                  Replace your physical HQ with a smarter, faster, and more efficient digital alternative.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { 
                      title: t('feat_prestige_title'), 
                      desc: t('feat_prestige_desc'), 
                      icon: "🏢",
                      color: "bg-blue-50 text-blue-600"
                  },
                  { 
                      title: t('feat_ai_title'), 
                      desc: t('feat_ai_desc'), 
                      icon: "🤖",
                      color: "bg-purple-50 text-purple-600"
                  },
                  { 
                      title: t('feat_network_title'), 
                      desc: t('feat_network_desc'), 
                      icon: "🌐",
                      color: "bg-green-50 text-green-600"
                  }
              ].map((feat, i) => (
                  <div key={i} className="group p-8 rounded-[32px] bg-white border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 ${feat.color}`}>
                          {feat.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-brand-primary mb-4">{feat.title}</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">
                          {feat.desc}
                      </p>
                      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-2 text-brand-primary font-bold text-sm cursor-pointer group-hover:gap-4 transition-all">
                          <span>Learn more</span>
                          <span className="rtl:rotate-180">→</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- BIG VISUAL SECTION --- */}
      <div className="w-full bg-brand-primary py-32 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 font-heading leading-tight">
                      Experience the <br/><span className="text-brand-gold">Digital Twin.</span>
                  </h2>
                  <p className="text-xl text-blue-100 mb-10 max-w-md leading-relaxed">
                      Walk through a 3D representation of your business district. See who's active, find partners, and manage your assets in real-time.
                  </p>
                  <button 
                     onClick={() => onNavigate('map')}
                     className="h-14 px-10 rounded-full bg-white text-brand-primary font-bold text-sm hover:bg-brand-gold hover:text-white transition-all shadow-lg shadow-white/10"
                  >
                     Launch Map View
                  </button>
              </div>
              <div className="relative">
                   <div className="absolute inset-0 bg-brand-accent blur-[100px] opacity-30 rounded-full"></div>
                   <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Digital City" 
                      className="relative z-10 rounded-2xl shadow-2xl border border-white/10 transform rotate-3 hover:rotate-1 transition-transform duration-700 opacity-90 hover:opacity-100"
                   />
              </div>
          </div>
      </div>

      {/* --- CTA --- */}
      <div className="w-full py-24 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-accent/5 to-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
             <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6 font-heading">
                {t('cta_title')}
             </h2>
             <p className="text-lg text-slate-600 mb-10 font-medium">
                {t('cta_desc')}
             </p>
             <button 
                onClick={onLogin}
                className="h-16 px-12 rounded-full bg-brand-primary text-white font-bold text-lg shadow-xl shadow-brand-primary/30 hover:shadow-2xl hover:scale-105 transition-all duration-300"
             >
                {t('cta_button')}
             </button>
             <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                No Credit Card Required • Cancel Anytime
             </p>
          </div>
      </div>

    </div>
  );
};

export default LandingPage;
