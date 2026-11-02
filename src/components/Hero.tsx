import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACT } from '../translations';
import { MessageCircle, UploadCloud, CheckCircle2, ShieldCheck, MapPin, Sparkles, Award } from 'lucide-react';

interface HeroProps {
  onOpenSubmit: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSubmit }) => {
  const { lang, t, isRtl } = useLanguage();

  const whatsAppDirectUrl = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
    lang === 'ar' ? OFFICIAL_CONTACT.defaultWhatsAppMessageAr : OFFICIAL_CONTACT.defaultWhatsAppMessageFr
  )}`;

  return (
    <section id="home" className="relative overflow-hidden bg-[#2D1E18] text-white pt-6 pb-16 lg:pb-24 border-b border-[#B08A45]/30">
      {/* Decorative ambient Moroccan pattern glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none moroccan-pattern-dark"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B08A45]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#A7653D]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Top Official Certification Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B2921]/90 border border-[#B08A45]/50 shadow-md backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold text-[#D9C8A9]">
              {t.hero.badge}
            </span>
          </div>
        </div>

        {/* Official Facebook Cover Image Showcase — Authentic Brand Reference */}
        <div className="max-w-5xl mx-auto mb-10 group">
          <div className="relative rounded-2xl overflow-hidden p-1.5 sm:p-2.5 bg-gradient-to-r from-[#B08A45] via-[#D4AF37] to-[#8C6B2D] shadow-2xl">
            <div className="relative rounded-xl overflow-hidden bg-[#1E1410] border border-[#FFE699]/30">
              <img
                src={OFFICIAL_CONTACT.officialCover}
                alt="مول البزار - الغلاف الرسمي لصفحة فيسبوك الرسمية"
                className="w-full h-auto object-cover max-h-[460px] md:max-h-[520px] transition-transform duration-700 group-hover:scale-[1.01]"
                loading="eager"
              />
              {/* Subtle inner parchment vignette */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

              {/* Floating verified badge on image */}
              <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} bg-[#2A1C16]/90 backdrop-blur-md border border-[#B08A45]/60 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg`}>
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#F5EFE3]">
                  {isRtl ? 'الهوية الرسمية المعتمدة • مول البزار' : 'Identité Officielle • Moul LBazar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Text Content and CTAs */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heritage leading-tight mb-5 tracking-wide text-[#F5EFE3]">
            {t.hero.headline}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#D9C8A9] font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            {t.hero.subhead}
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {/* Primary: WhatsApp direct */}
            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20BA59] text-white text-base font-bold shadow-xl hover:shadow-[#25D366]/30 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{t.hero.primaryCta}</span>
            </a>

            {/* Secondary: Submit antique */}
            <button
              onClick={onOpenSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B08A45] via-[#C49B4D] to-[#8C6B2D] hover:from-[#C49B4D] hover:to-[#B08A45] text-white text-base font-bold shadow-xl border border-[#FFE699]/40 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <UploadCloud className="w-5 h-5 text-white" />
              <span>{t.hero.secondaryCta}</span>
            </button>
          </div>

          {/* Trust points bar */}
          <div className="pt-6 border-t border-[#B08A45]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-[#D9C8A9] bg-[#3B2921]/60 py-2.5 px-3 rounded-lg border border-[#B08A45]/20">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="font-medium">{t.hero.trustItem1}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#D9C8A9] bg-[#3B2921]/60 py-2.5 px-3 rounded-lg border border-[#B08A45]/20">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
              <span className="font-medium">{t.hero.trustItem2}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#D9C8A9] bg-[#3B2921]/60 py-2.5 px-3 rounded-lg border border-[#B08A45]/20">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="font-medium">{t.hero.trustItem3}</span>
            </div>
          </div>

          {/* Extra reassurance tagline */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#D9C8A9]/80">
            <MapPin className="w-3.5 h-3.5 text-[#B08A45]" />
            <span>{t.hero.trustNationwide}</span>
            <span className="text-[#B08A45]">•</span>
            <span className="text-[#25D366] font-semibold">{t.hero.freeAppraisal}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
