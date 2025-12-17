
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
import MentorsPage from './components/MentorsPage';
import { Business, ServiceType, Invoice, BusinessGenome } from './types';
import { getMockBusinesses, MY_BUSINESS_GENOME } from './constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from './utils/translations';

type AppView = 'home' | 'map' | 'services' | 'business-network' | 'consulting' | 'mentors' | 'profile' | 'subscription' | 'about' | 'faq' | 'contact' | 'our-services';

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AppView>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [businesses, setBusinesses] = useState<Business[]>(() => getMockBusinesses(language));
  const [activeService, setActiveService] = useState<ServiceType>(ServiceType.NETWORK_INTELLIGENCE);
  const [consultationCount, setConsultationCount] = useState(24);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [rentingBusiness, setRentingBusiness] = useState<Business | null>(null);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [rentalStep, setRentalStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                    genomeProfile: biz.genomeProfile 
                };
            }
            return biz;
        });
    });
  }, [language]);

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
      { id: 'mentors', label: 'mentorsPage' },
      { id: 'business-network', label: 'businessNetworkPage' },
      { id: 'subscription', label: 'plansTitle' },
  ];

  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-text-main flex flex-col font-sans relative selection:bg-brand-primary selection:text-white">
      
      {/* Navbar: Industrial Graphite */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-brand-dark border-b border-white/5 py-3 shadow-lg' 
            : 'bg-brand-dark border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
              <div className="relative w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl leading-none text-white tracking-tight">
                   {language === 'ar' ? 'مطورو الاعمال' : 'Business Dev'}
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">
                   Industrial District
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center bg-[#252932] border border-white/5 rounded-full p-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
               {/* Language Switcher */}
               <div className="relative group">
                  <button className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20">
                     <span>{language.toUpperCase()}</span>
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                     <div className="bg-brand-dark border border-white/10 rounded-lg shadow-xl p-1 w-24">
                        {(['ar', 'en', 'es'] as Language[]).map(lang => (
                           <button 
                             key={lang}
                             onClick={() => setLanguage(lang)}
                             className={`w-full text-start px-3 py-2 text-xs font-bold rounded-md ${language === lang ? 'bg-brand-primary text-white' : 'text-slate-400 hover:bg-white/5'}`}
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
                   className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white/5 border border-white/10 rounded-full hover:border-brand-primary/50 transition-all group"
                 >
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
                       AA
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">Ahmed</span>
                 </button>
               ) : (
                 <button
                   onClick={() => setShowAuthModal(true)}
                   className="px-6 py-2.5 rounded-lg bg-brand-primary text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg"
                 >
                   {t('loginButton')}
                 </button>
               )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="xl:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
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
           <div className="xl:hidden absolute top-full left-0 right-0 bg-brand-dark border-t border-white/10 shadow-xl p-6 flex flex-col gap-2 animate-slide-up h-screen overflow-y-auto pb-20">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full text-start px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                     activeTab === item.id ? 'bg-brand-primary text-white' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex items-center justify-between px-4">
                  <span className="text-sm font-bold text-slate-500">Language</span>
                  <div className="flex gap-2">
                     {(['ar', 'en', 'es'] as Language[]).map(lang => (
                        <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-1 rounded text-xs font-bold border ${language === lang ? 'bg-brand-primary text-white border-brand-primary' : 'bg-transparent text-slate-500 border-white/10'}`}>
                           {lang.toUpperCase()}
                        </button>
                     ))}
                  </div>
              </div>
              {!isLoggedIn && (
                 <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="mt-4 w-full py-3 bg-brand-primary text-white font-bold rounded-lg shadow-lg">
                    {t('loginButton')}
                 </button>
              )}
           </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-24">
        
        <div key={activeTab} className="animate-fade-in min-h-[calc(100vh-6rem)]">
           {activeTab === 'home' && (
             <LandingPage 
               onNavigate={(tab) => setActiveTab(tab as any)} 
               isLoggedIn={isLoggedIn}
               onLogin={() => setShowAuthModal(true)}
             />
           )}

           {activeTab === 'about' && <div className="max-w-7xl mx-auto px-6 mt-8"><AboutPage /></div>}
           {activeTab === 'our-services' && <ServicesPage />}
           {activeTab === 'business-network' && <BusinessNetworkPage businesses={businesses} />}
           {activeTab === 'consulting' && <ConsultingPage />}
           {activeTab === 'mentors' && <MentorsPage />}
           {activeTab === 'faq' && <div className="max-w-7xl mx-auto px-6 mt-8"><FaqPage /></div>}
           {activeTab === 'contact' && <div className="max-w-7xl mx-auto px-6 mt-8"><ContactPage /></div>}

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

           {activeTab === 'subscription' && <div className="max-w-7xl mx-auto px-6 mt-8"><SubscriptionPage onSubscribe={handleSubscribe} /></div>}

           {activeTab === 'map' && (
             <div className="h-[calc(100vh-6rem)] w-full relative bg-brand-bg overflow-hidden">
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
                      <div className="h-full min-h-[400px] bg-brand-surface rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center p-10">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-brand-secondary mb-6">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                           </svg>
                         </div>
                         <h2 className="text-2xl font-bold mb-2 font-heading text-brand-dark">{t('comingSoon')}</h2>
                         <p className="text-text-sub max-w-md leading-relaxed">
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
        <div className="fixed inset-0 z-[100] bg-brand-dark/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
           <div className="bg-brand-surface rounded-2xl shadow-elevated w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-in">
              <div className="p-10 text-center">
                 {rentalStep === 'confirm' && (
                   <>
                     <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h2 className="text-2xl font-bold text-brand-dark mb-3 font-heading">{t('confirmBooking')}</h2>
                     <p className="text-text-sub mb-8">{t('getFreePlan')}</p>
                     <div className="bg-slate-50 rounded-xl p-6 text-start mb-8 space-y-4 border border-slate-100">
                        <p className="font-bold text-xs text-slate-400 uppercase tracking-widest">{t('planFeatures')}</p>
                        {['Address', 'AI Assistant', 'Network Access'].map((item,i) => (
                            <li key={i} className="text-sm text-brand-dark font-medium flex items-center gap-3">
                               <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                               {item}
                            </li>
                        ))}
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={() => setShowRentalModal(false)}
                          className="flex-1 h-12 rounded-lg border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          onClick={confirmRental}
                          className="flex-1 h-12 rounded-lg bg-brand-primary hover:brightness-110 text-white font-bold shadow-md transition-all"
                        >
                          {t('confirm')}
                        </button>
                     </div>
                   </>
                 )}

                 {rentalStep === 'processing' && (
                   <div className="py-12">
                      <div className="relative w-16 h-16 mx-auto mb-8">
                         <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-brand-dark">{t('processing')}</h3>
                      <p className="text-text-sub">{t('activating')}</p>
                   </div>
                 )}

                 {rentalStep === 'success' && (
                   <>
                     <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                     <h2 className="text-2xl font-bold text-brand-dark mb-3 font-heading">{t('successBooking')}</h2>
                     <p className="text-text-sub mb-8 max-w-xs mx-auto leading-relaxed">{t('congratsBooking')}</p>
                     <button 
                       onClick={() => {
                         setShowRentalModal(false);
                         setActiveTab('profile');
                       }}
                       className="w-full h-12 rounded-lg bg-brand-primary hover:brightness-110 text-white font-bold shadow-md transition-all"
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
