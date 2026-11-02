import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACT } from '../translations';
import { MessageCircle, Menu, X, Shield, Globe, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenSubmit: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSubmit, onOpenAdmin }) => {
  const { lang, setLang, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'fr' : 'ar');
  };

  const navLinks = [
    { label: t.nav.home, href: '#home' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.categories, href: '#categories' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsAppDirectUrl = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
    lang === 'ar' ? OFFICIAL_CONTACT.defaultWhatsAppMessageAr : OFFICIAL_CONTACT.defaultWhatsAppMessageFr
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-[#3B2921]/95 backdrop-blur-md border-b border-[#B08A45]/30 text-white shadow-xl transition-all">
      {/* Top micro-announcement bar */}
      <div className="bg-[#2A1C16] border-b border-[#B08A45]/20 py-1.5 px-4 text-xs text-[#D9C8A9] flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            <span className="font-medium text-white/90">
              {isRtl ? 'الموقع الرسمي المعتمد • مول البزار' : 'Site officiel certifié • Moul LBazar'}
            </span>
            <span className="hidden sm:inline text-[#B08A45]">|</span>
            <span className="hidden sm:inline text-xs text-[#D9C8A9]">
              {isRtl ? 'شراء وتقييم التحف والمقتنيات القديمة' : 'Achat et expertise d\'antiquités'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors font-mono"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span dir="ltr">{OFFICIAL_CONTACT.phoneDisplay}</span>
            </a>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-xs text-[#D9C8A9]/80 hover:text-[#B08A45] transition-colors"
              title={t.nav.admin}
            >
              <Shield className="w-3 h-3 text-[#B08A45]" />
              <span className="hidden md:inline">{t.nav.admin}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity: Official Logo & Name */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#B08A45] shadow-lg group-hover:scale-105 transition-transform bg-[#292521]">
              <img
                src={OFFICIAL_CONTACT.officialLogo}
                alt="مول البزار - اللوجو الرسمي"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#B08A45] rounded-full p-0.5 border border-[#3B2921]">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-heritage tracking-wide text-white group-hover:text-[#D4AF37] transition-colors">
                مول البزار
              </span>
              <span className="text-sm font-semibold text-[#D4AF37] font-latin-luxury hidden sm:inline">
                Moul LBazar
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-[#D9C8A9] font-medium leading-tight">
              {isRtl ? 'شراء التحف والمقتنيات القديمة' : 'Achat d\'antiquités & objets anciens'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="text-sm font-medium text-white/90 hover:text-[#D4AF37] transition-colors py-1 border-b-2 border-transparent hover:border-[#B08A45]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions: Submit Button, Language Selector, WhatsApp CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#B08A45]/40 bg-[#2D1E18] text-xs font-medium text-[#D9C8A9] hover:text-white hover:border-[#B08A45] transition-colors"
            title="تغيير اللغة / Changer de langue"
          >
            <Globe className="w-3.5 h-3.5 text-[#B08A45]" />
            <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
          </button>

          {/* Submit Item Button */}
          <button
            onClick={onOpenSubmit}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#B08A45] to-[#8C6B2D] hover:from-[#C49B4D] hover:to-[#9E7A33] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#FFE699]/30"
          >
            {t.nav.submit}
          </button>

          {/* Direct WhatsApp Action Button */}
          <a
            href={whatsAppDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BA59] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="hidden md:inline">{t.nav.whatsappBtn}</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded border border-[#B08A45]/40 text-xs text-[#D9C8A9]"
          >
            {lang === 'ar' ? 'FR' : 'عر'}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#2D1E18] text-white hover:text-[#B08A45] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#2D1E18] border-b border-[#B08A45]/40 px-4 py-5 shadow-2xl animate-fadeIn">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-right py-2 px-3 rounded text-sm font-medium text-white/90 hover:bg-[#3B2921] hover:text-[#D4AF37] transition-colors"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-[#B08A45]/20 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubmit();
                }}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#B08A45] to-[#8C6B2D] text-white font-bold text-center text-sm shadow"
              >
                {t.nav.submit}
              </button>

              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-lg bg-[#25D366] text-white font-bold text-center text-sm flex items-center justify-center gap-2 shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.nav.whatsappBtn} ({OFFICIAL_CONTACT.phoneDisplay})</span>
              </a>

              <div className="flex items-center justify-between pt-2 text-xs text-[#D9C8A9]">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'Passer en Français' : 'التحويل إلى العربية'}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center gap-1 text-[#B08A45] underline"
                >
                  <Shield className="w-3 h-3" />
                  <span>{t.nav.admin}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
