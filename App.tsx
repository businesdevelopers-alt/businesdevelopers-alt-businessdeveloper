
import React, { useState, useEffect } from 'react';
import OfficeMap from './components/OfficeMap';
import AIConsultant from './components/AIConsultant';
import TaskManager from './components/TaskManager';
import ServicesDashboard from './components/ServicesDashboard';
import ServiceStats from './components/ServiceStats';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import SubscriptionPage from './components/SubscriptionPage';
import ProfilePage from './components/ProfilePage';
import AboutPage from './components/AboutPage';
import FaqPage from './components/FaqPage';
import ContactPage from './components/ContactPage';
import ServicesPage from './components/ServicesPage';
import LoadingScreen from './components/LoadingScreen';
import NetworkIntelligence from './components/NetworkIntelligence'; 
import BusinessNetworkPage from './components/BusinessNetworkPage'; 
import ConsultingPage from './components/ConsultingPage'; 
import { Business, ServiceType, Invoice, BusinessGenome } from './types';
import { getMockBusinesses, MY_BUSINESS_GENOME } from './constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from './utils/translations';

type AppView = 'home' | 'map' | 'services' | 'business-network' | 'consulting' | 'profile' | 'subscription' | 'about' | 'faq' | 'contact' | 'our-services';

const App: React.FC = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppView>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [businesses, setBusinesses] = useState<Business[]>(() => getMockBusinesses(language));
  const [activeService, setActiveService] = useState<ServiceType>(ServiceType.NETWORK_INTELLIGENCE);
  const [consultationCount, setConsultationCount] = useState(24);
  
  // Favorite State
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Rental Modal State
  const [rentingBusiness, setRentingBusiness] = useState<Business | null>(null);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [rentalStep, setRentalStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  // Invoice & Wallet State
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Language Switcher Logic
  useEffect(() => {
    const localizedBusinesses = getMockBusinesses(language);
    setBusinesses(prev => {
        if (prev.length === 0) return localizedBusinesses;
        return localizedBusinesses.map(biz => {
            const existing = prev.find(b => b.id === biz.id);
            if (existing) {
                if (existing.isOccupied && (biz.id === '4' || biz.id === '5')) {
                    return existing;
                }
                return { 
                    ...biz, 
                    isOccupied: existing.isOccupied, 
                    activeVisitors: existing.activeVisitors,
                    genomeProfile: biz.genomeProfile // Keep Genome data sync
                };
            }
            return biz;
        });
    });
  }, [language]);

  // Real-time data simulation
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setBusinesses(prev => prev.map(b => {
        if (b.isOccupied) {
          const variance = Math.floor(Math.random() * 7) - 3; 
          const current = b.activeVisitors || 0;
          const next = Math.max(0, current + variance);
          return { ...b, activeVisitors: next };
        }
        return b;
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home'); 
  };

  const toggleFavorite = (id: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleRentClick = (business: Business) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setRentingBusiness(business);
    setRentalStep('confirm');
    setShowRentalModal(true);
  };

  const handleAddBusiness = (newBusiness: Business) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setBusinesses(prev => [...prev, newBusiness]);
  };

  const handleUpdateBusiness = (updatedBusiness: Business) => {
    setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
  };

  const confirmRental = () => {
    setRentalStep('processing');
    setTimeout(() => {
      if (rentingBusiness) {
        const updatedBusiness: Business = {
          ...rentingBusiness,
          isOccupied: true,
          name: language === 'ar' ? 'شركتك الناشئة' : 'Your Startup',
          category: 'TECHNOLOGY',
          logoUrl: `https://ui-avatars.com/api/?name=New+Company&background=073D5A&color=fff`,
          description: language === 'ar' ? 'مكتب افتراضي جديد.' : 'New virtual office.',
          activeVisitors: 1, 
          services: [t('cat_TECHNOLOGY')],
          contact: {
             email: 'contact@startup.com',
             website: 'www.startup.com'
          }
        };
        setBusinesses(prev => prev.map(b => b.id === rentingBusiness.id ? updatedBusiness : b));
      }
      setRentalStep('success');
    }, 2500);
  };

  const handleConsultationSent = () => {
    setConsultationCount(prev => prev + 1);
  };

  const handleSubscribe = (planId: string) => {
      if (!isLoggedIn) {
          setShowAuthModal(true);
          return;
      }
      const planPrice = planId === 'free' ? '0' : planId === 'pro' ? '299' : '899';
      const planName = planId === 'free' ? t('planFree') : planId === 'pro' ? t('planPro') : t('planEnterprise');
      
      const newInvoice: Invoice = {
          id: Date.now().toString(),
          planName: planName,
          amount: planPrice,
          date: new Date(),
          status: 'pending',
          reference: Math.floor(100000 + Math.random() * 900000).toString()
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setActiveTab('profile');
  };

  const handlePayInvoice = (invoiceId: string) => {
      setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
      ));
  };

  const navItems: {id: AppView, label: string}[] = [
      { id: 'home', label: 'home' },
      { id: 'map', label: 'map' },
      { id: 'our-services', label: 'ourServices' },
      { id: 'consulting', label: 'consultingPage' },
      { id: 'business-network', label: 'businessNetworkPage' },
      { id: 'subscription', label: 'plansTitle' },
  ];

  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-brand-surface text-text-main flex flex-col font-sans relative selection:bg-brand-accent selection:text-white">
      
      {/* Premium Navigation Bar */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-soft py-3' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
              <div className="relative">
                <div className="absolute inset-0 bg-brand-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-brand-primary to-[#1e293b] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl leading-none text-brand-primary tracking-tight">
                   {language === 'ar' ? 'مطورو الاعمال' : 'Business Dev'}
                </span>
                <span className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                   Digital District
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/40 shadow-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'text-white' 
                      : 'text-text-sub hover:text-brand-primary hover:bg-white/60'
                  }`}
                >
                  {activeTab === item.id && (
                     <div className="absolute inset-0 bg-brand-primary rounded-full shadow-md -z-10 animate-fade-in"></div>
                  )}
                  {t(item.label)}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
               {/* Language Switcher */}
               <div className="relative group">
                  <button className="flex items-center gap-1 text-xs font-bold text-brand-secondary hover:text-brand-primary transition-colors bg-white/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200">
                     <span>{language.toUpperCase()}</span>
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-2">
                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-24 overflow-hidden">
                        {(['ar', 'en', 'es'] as Language[]).map(lang => (
                           <button 
                             key={lang}
                             onClick={() => setLanguage(lang)}
                             className={`w-full text-start px-3 py-2 text-xs font-bold rounded-lg ${language === lang ? 'bg-brand-surface text-brand-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                           >
                              {lang.toUpperCase()}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Auth Button */}
               {isLoggedIn ? (
                 <button 
                   onClick={() => setActiveTab('profile')}
                   className="flex items-center gap-2 pl-1 pr-4 py-1 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all group"
                 >
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
                       AA
                    </div>
                    <span className="text-sm font-bold text-brand-primary group-hover:text-brand-accent transition-colors">Ahmed</span>
                 </button>
               ) : (
                 <button
                   onClick={() => setShowAuthModal(true)}
                   className="px-6 py-2.5 rounded-full bg-brand-primary text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-accent hover:shadow-brand-accent/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                 >
                   {t('loginButton')}
                 </button>
               )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="lg:hidden p-2 text-brand-primary rounded-lg hover:bg-slate-100 transition-colors"
            >
               {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
               )}
            </button>
        </div>

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
           <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl p-6 flex flex-col gap-2 animate-slide-up">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full text-start px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                     activeTab === item.id ? 'bg-brand-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex items-center justify-between px-4">
                  <span className="text-sm font-bold text-slate-500">Language</span>
                  <div className="flex gap-2">
                     {(['ar', 'en', 'es'] as Language[]).map(lang => (
                        <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-1 rounded text-xs font-bold border ${language === lang ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-500 border-slate-200'}`}>
                           {lang.toUpperCase()}
                        </button>
                     ))}
                  </div>
              </div>
              {!isLoggedIn && (
                 <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="mt-4 w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg">
                    {t('loginButton')}
                 </button>
              )}
           </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-24">
        
        {/* Animated Page Transitions */}
        <div key={activeTab} className="animate-fade-in min-h-[calc(100vh-6rem)]">
           {activeTab === 'home' && (
             <LandingPage 
               onNavigate={(tab) => setActiveTab(tab as any)} 
               isLoggedIn={isLoggedIn}
               onLogin={() => setShowAuthModal(true)}
             />
           )}

           {activeTab === 'about' && (
              <div className="max-w-7xl mx-auto px-6 mt-8">
                 <AboutPage />
              </div>
           )}
           
           {activeTab === 'our-services' && (
              <ServicesPage />
           )}

           {activeTab === 'business-network' && (
              <BusinessNetworkPage businesses={businesses} />
           )}

           {activeTab === 'consulting' && (
              <ConsultingPage />
           )}

           {activeTab === 'faq' && (
              <div className="max-w-7xl mx-auto px-6 mt-8">
                 <FaqPage />
              </div>
           )}

           {activeTab === 'contact' && (
              <div className="max-w-7xl mx-auto px-6 mt-8">
                 <ContactPage />
              </div>
           )}

           {activeTab === 'profile' && isLoggedIn && (
             <div className="max-w-7xl mx-auto px-6 mt-8">
                <ProfilePage 
                   onLogout={handleLogout} 
                   invoices={invoices}
                   onPayInvoice={handlePayInvoice}
                   onAddBusiness={handleAddBusiness}
                   businesses={businesses}
                />
             </div>
           )}

           {activeTab === 'subscription' && (
              <div className="max-w-7xl mx-auto px-6 mt-8">
                 <SubscriptionPage onSubscribe={handleSubscribe} />
              </div>
           )}

           {activeTab === 'map' && (
             <div className="h-[calc(100vh-6rem)] w-full relative bg-slate-50 overflow-hidden">
               <div className="absolute inset-0 max-w-[1920px] mx-auto p-4 md:p-6 h-full">
                 <OfficeMap 
                   businesses={businesses} 
                   favorites={favorites}
                   onToggleFavorite={toggleFavorite}
                   onRentClick={handleRentClick}
                   onAddBusiness={handleAddBusiness}
                   onUpdateBusiness={handleUpdateBusiness}
                 />
               </div>
             </div>
           )}

           {activeTab === 'services' && isLoggedIn && (
             <div className="max-w-[1600px] mx-auto px-6 mt-8 pb-20">
               <ServiceStats consultationCount={consultationCount} />
               
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-22rem)] min-h-[600px]">
                  <div className="xl:col-span-3 h-full overflow-y-auto custom-scrollbar pr-2">
                    <ServicesDashboard activeService={activeService} onSelectService={setActiveService} />
                  </div>
                  
                  <div className="xl:col-span-9 h-full">
                    {activeService === ServiceType.NETWORK_INTELLIGENCE ? (
                       <NetworkIntelligence businesses={businesses} userGenome={MY_BUSINESS_GENOME.genomeProfile as BusinessGenome} />
                    ) : activeService === ServiceType.CONSULTING ? (
                      <AIConsultant onMessageSent={handleConsultationSent} />
                    ) : activeService === ServiceType.TASK_MANAGER ? (
                      <TaskManager />
                    ) : (
                      <div className="h-full min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-card flex flex-col items-center justify-center text-center p-10">
                         <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center text-brand-primary mb-6 animate-pulse">
                           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                           </svg>
                         </div>
                         <h2 className="text-3xl font-bold mb-3 font-heading text-brand-primary">{t('comingSoon')}</h2>
                         <p className="text-text-sub max-w-md leading-relaxed text-lg">
                           {t('serviceDeveloping', { service: t(activeService.toLowerCase() as any) })}
                         </p>
                      </div>
                    )}
                  </div>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Footer */}
      {activeTab !== 'map' && <Footer onNavigate={(view) => setActiveTab(view)} />}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-brand-primary/40 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
           <div className="relative w-full max-w-md animate-scale-in">
             <button 
               onClick={() => setShowAuthModal(false)}
               className="absolute -top-12 right-0 p-2 text-white hover:opacity-80 transition-opacity"
             >
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <AuthPage onLogin={handleLogin} />
           </div>
        </div>
      )}

      {/* Rental Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-primary/50 backdrop-blur-md">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-in">
              <div className="p-10 text-center">
                 {rentalStep === 'confirm' && (
                   <>
                     <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-8 text-brand-primary shadow-inner">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h2 className="text-3xl font-bold text-brand-primary mb-3 font-heading">{t('confirmBooking')}</h2>
                     <p className="text-text-sub mb-8 text-lg">{t('getFreePlan')}</p>
                     <div className="bg-slate-50 rounded-2xl p-6 text-start mb-8 space-y-4 border border-slate-100">
                        <p className="font-bold text-xs text-slate-400 uppercase tracking-widest">{t('planFeatures')}</p>
                        {['Address', 'AI Assistant', 'Network Access'].map((item,i) => (
                            <li key={i} className="text-sm text-brand-primary font-bold flex items-center gap-3">
                               <div className="w-2 h-2 bg-brand-gold rounded-full shadow-glow"></div>
                               {item}
                            </li>
                        ))}
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={() => setShowRentalModal(false)}
                          className="flex-1 h-14 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          onClick={confirmRental}
                          className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-accent text-white font-bold shadow-lg shadow-brand-primary/20 transition-all transform hover:-translate-y-1"
                        >
                          {t('confirm')}
                        </button>
                     </div>
                   </>
                 )}

                 {rentalStep === 'processing' && (
                   <div className="py-12">
                      <div className="relative w-20 h-20 mx-auto mb-8">
                         <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-brand-primary">{t('processing')}</h3>
                      <p className="text-text-sub">{t('activating')}</p>
                   </div>
                 )}

                 {rentalStep === 'success' && (
                   <>
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 animate-bounce">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                     <h2 className="text-3xl font-bold text-brand-primary mb-3 font-heading">{t('successBooking')}</h2>
                     <p className="text-text-sub mb-10 max-w-xs mx-auto leading-relaxed">{t('congratsBooking')}</p>
                     <button 
                       onClick={() => {
                         setShowRentalModal(false);
                         setActiveTab('profile');
                       }}
                       className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-accent text-white font-bold shadow-lg transition-all"
                     >
                       {t('startWork')}
                     </button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
