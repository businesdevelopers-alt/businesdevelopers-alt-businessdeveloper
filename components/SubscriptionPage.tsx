
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SubscriptionPageProps {
  onSubscribe: (plan: string) => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onSubscribe }) => {
  const { t } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: 'basic',
      name: t('planBasic'),
      price: t('priceBasic'),
      features: [
        t('featureAddress'),
        t('featureMail'),
        'Community Access'
      ],
      isPopular: false
    },
    {
      id: 'comm',
      name: t('planComm'),
      price: t('priceComm'),
      features: [
        t('featureAddress'),
        t('featureMail'),
        t('featureCallCenter'),
        t('featureSecretary')
      ],
      isPopular: true
    },
    {
      id: 'exec',
      name: t('planExec'),
      price: t('priceExec'),
      features: [
        t('featureAddress'),
        t('featureMail'),
        t('featureCallCenter'),
        t('featureMeetingRooms'),
        t('featureEvents')
      ],
      isPopular: false
    },
    {
      id: 'elite',
      name: t('planElite'),
      price: t('priceElite'),
      features: [
        'Everything in Executive',
        t('featureAI'),
        t('logistics'),
        'Unlimited Event Access',
        'Priority Support'
      ],
      isPopular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-brand-primary mb-4 font-heading">{t('plansTitle')}</h1>
        <p className="text-lg text-text-sub max-w-2xl mx-auto">
          {t('plansSubtitle')}
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center mt-10 gap-4">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-brand-primary' : 'text-slate-400'}`}>
            {t('monthly')}
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isAnnual ? 'bg-brand-primary' : 'bg-slate-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isAnnual ? 'translate-x-6 rtl:-translate-x-6' : ''}`}></div>
          </button>
          <span className={`text-sm font-bold ${isAnnual ? 'text-brand-primary' : 'text-slate-400'}`}>
            {t('yearly')} <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-1 font-bold">{t('savePercent')}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-white rounded-[32px] p-8 flex flex-col transition-all duration-300 hover:translate-y-[-8px] ${plan.isPopular ? 'border-2 border-brand-primary shadow-xl z-10 scale-105 lg:scale-110' : 'border border-slate-100 shadow-card'}`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
            )}

            <h3 className="text-lg font-bold text-brand-primary mb-4 text-center">{plan.name}</h3>
            <div className="flex items-baseline justify-center gap-1 mb-8">
               <span className="text-4xl font-bold text-brand-primary">{plan.price}</span>
               <span className="text-slate-500 font-medium text-sm">{t('currency')} / {t('month')}</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                   <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                     <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onSubscribe(plan.id)}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 
                ${plan.id === 'basic' 
                  ? 'bg-slate-100 text-brand-primary hover:bg-slate-200' 
                  : 'bg-brand-primary hover:bg-[#052c42] text-white shadow-blue-900/20'
                }`}
            >
              {t('subscribe')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
