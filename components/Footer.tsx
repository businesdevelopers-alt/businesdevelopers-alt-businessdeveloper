
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const handleNav = (e: React.MouseEvent, view: string) => {
    e.preventDefault();
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-dark border-t border-white/5 pt-16 pb-8 mt-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl shadow-md">
                م
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight">Business Dev</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t('footer_about_desc')}
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              <button className="w-10 h-10 rounded bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                𝕏
              </button>
              <button className="w-10 h-10 rounded bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                in
              </button>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="font-heading font-bold text-white mb-6 text-lg">{t('footer_links')}</h3>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><button onClick={(e) => handleNav(e, 'home')} className="hover:text-brand-primary transition-colors">{t('home')}</button></li>
              <li><button onClick={(e) => handleNav(e, 'map')} className="hover:text-brand-primary transition-colors">{t('map')}</button></li>
              <li><button onClick={(e) => handleNav(e, 'subscription')} className="hover:text-brand-primary transition-colors">{t('plansTitle')}</button></li>
              <li><button onClick={(e) => handleNav(e, 'about')} className="hover:text-brand-primary transition-colors">{t('aboutUs')}</button></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-heading font-bold text-white mb-6 text-lg">{t('footer_support')}</h3>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><button onClick={(e) => handleNav(e, 'faq')} className="hover:text-brand-primary transition-colors">{t('faqTitle')}</button></li>
              <li><button onClick={(e) => handleNav(e, 'contact')} className="hover:text-brand-primary transition-colors">{t('footer_contact')}</button></li>
              <li><button className="hover:text-brand-primary transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-brand-primary transition-colors">Terms of Service</button></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-heading font-bold text-white mb-6 text-lg">{t('footer_contact')}</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-brand-primary">📍</span> 
                <span>Riyadh, Business Developers District<br/><span className="text-xs opacity-70">Kingdom of Saudi Arabia</span></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-primary">📧</span> <a href="mailto:support@businessdev.sa" className="hover:text-white">support@businessdev.sa</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-primary">📞</span> <span className="font-mono" dir="ltr">+966 11 234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 font-mono">
            {t('rights_reserved')}
          </p>
          <div className="flex gap-2 items-center text-xs text-slate-500 bg-white/5 px-3 py-1 rounded border border-white/10 font-mono">
            <span>Powered by</span>
            <span className="font-bold text-brand-primary">Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
