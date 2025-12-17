
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      {/* Hero Section - Industrial Graphite */}
      <div className="bg-brand-dark rounded-2xl p-12 md:p-20 text-center shadow-lg relative overflow-hidden mb-16 border border-white/5">
        <div className="absolute inset-0 bg-grid-tech-dark opacity-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight text-white">{t('aboutPageTitle')}</h1>
          <p className="text-xl text-slate-300 font-light">{t('aboutPageSubtitle')}</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div className="space-y-6">
          <div className="inline-block p-3 bg-brand-primary/10 rounded-lg text-3xl mb-2 text-brand-primary">🚀</div>
          <h2 className="text-3xl font-bold text-brand-dark font-heading">{t('ourMission')}</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t('ourMissionDesc')}
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
             <div className="bg-white p-4 rounded-xl shadow-soft border border-slate-200 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <span className="font-bold text-brand-dark">{t('valueInnovation')}</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-soft border border-slate-200 flex items-center gap-3">
                <span className="text-xl">🤝</span>
                <span className="font-bold text-brand-dark">{t('valueCommunity')}</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-soft border border-slate-200 flex items-center gap-3">
                <span className="text-xl">📈</span>
                <span className="font-bold text-brand-dark">{t('valueGrowth')}</span>
             </div>
          </div>
        </div>
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-card group">
           <img 
             src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
             alt="Team" 
             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent"></div>
           <div className="absolute bottom-8 left-8 text-white">
              <div className="text-4xl font-bold mb-1 font-mono">10,000+</div>
              <div className="text-xs opacity-80 uppercase tracking-widest font-bold">Active Members</div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
         {[
            { label: 'Digital Offices', value: '5,000+' },
            { label: 'Countries', value: '12' },
            { label: 'Partners', value: '50+' },
            { label: 'Satisfaction', value: '99%' }
         ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-soft hover:shadow-card transition-all">
               <div className="text-3xl font-bold text-brand-primary mb-2 font-mono">{stat.value}</div>
               <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">{stat.label}</div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default AboutPage;
