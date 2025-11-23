
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2.5rem] p-12 md:p-20 text-white text-center shadow-2xl relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">{t('aboutPageTitle')}</h1>
          <p className="text-xl text-blue-100">{t('aboutPageSubtitle')}</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div className="space-y-6">
          <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-4xl mb-2">🚀</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-heading">{t('ourMission')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            {t('ourMissionDesc')}
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{t('valueInnovation')}</span>
             </div>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{t('valueCommunity')}</span>
             </div>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{t('valueGrowth')}</span>
             </div>
          </div>
        </div>
        <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
           <img 
             src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
             alt="Team" 
             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
           <div className="absolute bottom-8 left-8 text-white">
              <div className="text-4xl font-bold mb-1">10,000+</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Active Members</div>
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
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
               <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{stat.label}</div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default AboutPage;
