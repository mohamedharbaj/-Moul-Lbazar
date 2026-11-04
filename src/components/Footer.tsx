import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES_DATA, OFFICIAL_CONTACT, getDefaultWhatsAppMessage, getCategoryText } from '../translations';
import {
  MessageCircle,
  Facebook,
  Phone,
  Shield,
  Sparkles,
  ArrowUp,
  Heart,
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenSubmit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenSubmit }) => {
  const { lang, t, isRtl, L } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsAppDirectUrl = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
    getDefaultWhatsAppMessage(lang)
  )}`;

  return (
    <footer className="bg-[#231713] text-[#D9C8A9] border-t-2 border-[#B08A45]/40 pt-16 pb-12 relative overflow-hidden">
      {/* Decorative ambient subtle Moroccan background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none moroccan-pattern-dark"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#B08A45]/20">
          {/* Column 1: Brand & Slogan */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#B08A45] shadow-lg bg-[#292521]">
                <img
                  src={OFFICIAL_CONTACT.officialLogo}
                  alt="مول البزار"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heritage text-[#F5EFE3]">
                  مول البزار | Moul LBazar
                </h3>
                <p className="text-xs text-[#D4AF37] font-medium">
                  {t.sloganMain}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D9C8A9]/80 leading-relaxed max-w-md">
              {t.footer.aboutText}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform shadow"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </a>

              <a
                href={OFFICIAL_CONTACT.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow"
                title="Facebook"
              >
                <Facebook className="w-5 h-5 fill-white" />
              </a>

              <button
                onClick={onOpenSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B08A45] to-[#8C6B2D] text-white text-xs font-bold hover:brightness-110 shadow"
              >
                {t.nav.submit}
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold font-heritage text-[#F5EFE3] uppercase tracking-wider border-b border-[#B08A45]/30 pb-2 inline-block">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#home" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.categories}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.howItWorks}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.contact}
                </a>
              </li>
              <li>
                <a href="/privacy.html" className="hover:text-[#D4AF37] transition-colors">
                  {L('سياسة الخصوصية', 'Politique de confidentialité', "Privacy Policy")}
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-[#B08A45] hover:text-[#D4AF37] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t.nav.admin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold font-heritage text-[#F5EFE3] uppercase tracking-wider border-b border-[#B08A45]/30 pb-2 inline-block">
              {t.footer.topCategories}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#D9C8A9]/90">
              {CATEGORIES_DATA.slice(0, 6).map((cat) => (
                <li key={cat.id} className="truncate">
                  <a href="#categories" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#B08A45]"></span>
                    <span>{getCategoryText(cat, lang).title}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[#B08A45]/20">
              <p className="text-xs text-[#D4AF37] font-semibold mb-1">
                {t.footer.contactInfo}
              </p>
              <p className="text-xs text-white/90 font-mono" dir="ltr">
                WhatsApp: {OFFICIAL_CONTACT.phoneDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D9C8A9]/70">
          <p>{t.footer.rights}</p>

          <div className="flex items-center gap-4">
            <span className="text-[#D4AF37]">{t.footer.madeForMorocco}</span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-[#3B2921] text-[#D9C8A9] hover:text-white hover:bg-[#B08A45] transition-colors shadow"
              title="الرجوع للأعلى / Haut de page"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
