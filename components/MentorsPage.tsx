
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Mentor {
  id: string;
  name: string;
  image: string;
  initials: string;
  color: string;
  available: boolean;
}

const MentorsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'working_hours' | 'sessions' | 'my_bookings'>('working_hours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<number | null>(17);

  // Stats Data
  const stats = [
    { icon: 'check', count: 0, label: t('myBookings'), color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: 'calendar', count: 0, label: t('upcomingSession'), color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: 'clock', count: 0, label: t('availableTime'), color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'users', count: 11, label: t('expertMentor'), color: 'text-green-500', bg: 'bg-green-50' },
  ];

  // Mock Mentors Data
  const mentorsData: Mentor[] = [
    { id: '1', name: 'Mohamed Salama', image: '', initials: 'MS', color: 'bg-emerald-500', available: true },
    { id: '2', name: 'Mohamed O. Yousif', image: '', initials: 'MO', color: 'bg-emerald-500', available: true },
    { id: '3', name: 'Khalid Khamis', image: '', initials: 'KK', color: 'bg-orange-500', available: true },
    { id: '4', name: 'Mazen Al Wahsh', image: '', initials: 'MA', color: 'bg-emerald-500', available: true },
    { id: '5', name: 'Khalid Khamis', image: '', initials: 'KK', color: 'bg-orange-500', available: true }, // Duplicate as per image sample
    { id: '6', name: 'Issa Ewaiad Alsaedi', image: '', initials: 'IE', color: 'bg-blue-500', available: true },
    { id: '7', name: 'Ahmed', image: '', initials: 'A', color: 'bg-orange-500', available: true },
    { id: '8', name: 'Sara', image: '', initials: 'S', color: 'bg-orange-500', available: true },
    { id: '9', name: 'John Doe', image: '', initials: 'JD', color: 'bg-blue-500', available: true },
  ];

  const filteredMentors = mentorsData.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calendar Mock Data (December 2025)
  const daysInMonth = 31;
  const startDay = 1; // Assume starts on Monday for Dec 2025 mock
  const weekDays = language === 'ar' 
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCalendarDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  // Helper for icons
  const getIcon = (type: string) => {
    switch(type) {
      case 'check': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'calendar': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
      case 'clock': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'users': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in w-full bg-brand-bg min-h-screen">
      
      {/* Header with Background Pattern */}
      <div className="bg-white border-b border-white/5 pt-12 pb-8 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
         <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
               ✨ برنامج الإرشاد 2025
            </div>
            <h1 className="text-4xl font-heading font-bold text-brand-dark mb-4 text-green-600">{t('mentorsTitle')}</h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('mentorsSubtitle')}
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
               <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 text-2xl ${stat.bg} ${stat.color}`}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getIcon(stat.icon)}
                  </svg>
               </div>
               <div className="text-3xl font-bold text-slate-800 mb-1">{stat.count}</div>
               <div className="text-sm font-bold text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar & Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
           
           <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <button 
                onClick={() => setActiveTab('working_hours')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'working_hours' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {t('workingHours')}
              </button>
              <button 
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'sessions' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 {t('sessions')}
              </button>
              <button 
                onClick={() => setActiveTab('my_bookings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'my_bookings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                 {t('myBookings')}
              </button>
           </div>

           <div className="w-full md:w-auto">
              <div className="relative">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder={t('searchMentor')}
                   className="w-full md:w-64 pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium"
                 />
                 <svg className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
           </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 mb-12 overflow-hidden">
           <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 ديسمبر 2025
              </h2>
              <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600">{'<'}</button>
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600">{'>'}</button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
              {/* Week Headers */}
              {weekDays.map((d, i) => (
                 <div key={i} className="bg-white p-3 text-center text-xs font-bold text-slate-500 uppercase">
                    {d}
                 </div>
              ))}
              {/* Days */}
              {calendarDays.map((day, i) => {
                 const isSelected = day === selectedDate;
                 return (
                    <div 
                       key={i} 
                       onClick={() => day && setSelectedDate(day)}
                       className={`bg-white min-h-[100px] p-3 relative cursor-pointer hover:bg-emerald-50/30 transition-colors ${!day ? 'bg-slate-50' : ''} ${isSelected ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/50' : ''}`}
                    >
                       {day && (
                          <>
                             <span className={`text-sm font-bold ${isSelected ? 'text-emerald-600' : 'text-slate-700'}`}>{day}</span>
                             {/* Example indicators for availability */}
                             {[10, 15, 17, 20].includes(day) && (
                                <div className="mt-2 space-y-1">
                                   <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 w-3/4"></div>
                                   </div>
                                </div>
                             )}
                          </>
                       )}
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Search Input (Duplicate as per design - optionally remove one) */}
        <div className="mb-8">
           <div className="relative max-w-md mx-auto">
              <input 
                type="text" 
                placeholder={t('searchMentor')} 
                className="w-full py-3 px-6 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-center"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredMentors.length > 0 ? (
              filteredMentors.map(mentor => (
                 <div key={mentor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-card hover:-translate-y-1">
                    <div className="relative mb-4">
                       <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg ${mentor.color}`}>
                          {mentor.initials}
                       </div>
                       {mentor.available && (
                          <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full">
                             <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                       )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-6">{mentor.name}</h3>
                    
                    <button className="w-full py-3 rounded-xl border border-slate-800 text-slate-800 font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 group">
                       <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.626-2.32l-5.118 1.134 1.956-5.441A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" /></svg>
                       {t('bookSession')}
                    </button>
                 </div>
              ))
           ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                 <div className="text-4xl mb-4">🔍</div>
                 <p>{t('noMentorsFound')}</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default MentorsPage;
