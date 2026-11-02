import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACT } from '../translations';
import {
  MessageCircle,
  Facebook,
  Phone,
  Camera,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Clock,
  MapPin,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { lang, t, isRtl } = useLanguage();

  const whatsAppDirectUrl = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
    lang === 'ar' ? OFFICIAL_CONTACT.defaultWhatsAppMessageAr : OFFICIAL_CONTACT.defaultWhatsAppMessageFr
  )}`;

  return (
    <section id="contact" className="py-16 lg:py-24 bg-[#F5EFE3] text-[#292521] relative overflow-hidden moroccan-pattern">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B08A45]/15 border border-[#B08A45]/30 text-xs font-bold text-[#8C6B2D] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B08A45]" />
            <span>{isRtl ? 'قنوات الاتصال المعتمدة' : 'Canaux Officiels'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heritage text-[#3B2921] mb-4">
            {t.contact.title}
          </h2>
          <p className="text-base sm:text-lg text-[#3B2921]/80">
            {t.contact.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B08A45] to-transparent mx-auto mt-4"></div>
        </div>

        {/* 2 Main Official Channel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-14">
          {/* Card 1: WhatsApp */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border-2 border-[#25D366]/40 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-8 h-8 fill-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#25D366]/10 text-[#1E9E4B] text-xs font-bold border border-[#25D366]/30">
                  {isRtl ? 'القناة الأساسية والأسرع' : 'Canal Principal & Rapide'}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-heritage text-[#3B2921] mb-2">
                {t.contact.directWaTitle}
              </h3>
              <p className="text-sm text-[#292521]/75 mb-4 leading-relaxed">
                {t.contact.directWaDesc}
              </p>

              <div className="p-3 bg-[#F5EFE3] rounded-xl border border-[#B08A45]/30 mb-6 flex items-center justify-between font-mono">
                <span className="text-sm font-semibold text-[#3B2921] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#25D366]" />
                  <span>{OFFICIAL_CONTACT.phoneDisplay}</span>
                </span>
                <span className="text-xs text-[#8C6B2D]" dir="ltr">
                  {OFFICIAL_CONTACT.internationalPhone}
                </span>
              </div>
            </div>

            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA59] text-white font-bold text-center text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{t.contact.callAction}</span>
            </a>
          </div>

          {/* Card 2: Facebook */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border-2 border-[#1877F2]/40 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg">
                  <Facebook className="w-8 h-8 fill-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold border border-[#1877F2]/30">
                  {isRtl ? 'الصفحة الرسمية المعتمدة' : 'Page Officielle Vérifiée'}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-heritage text-[#3B2921] mb-2">
                {t.contact.directFbTitle}
              </h3>
              <p className="text-sm text-[#292521]/75 mb-4 leading-relaxed">
                {t.contact.directFbDesc}
              </p>

              <div className="p-3 bg-[#F5EFE3] rounded-xl border border-[#B08A45]/30 mb-6 flex items-center justify-between text-xs text-[#3B2921] font-medium">
                <span className="truncate">facebook.com/moullbazar.ma</span>
                <ExternalLink className="w-4 h-4 text-[#1877F2] shrink-0" />
              </div>
            </div>

            <a
              href={OFFICIAL_CONTACT.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-center text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Facebook className="w-5 h-5 fill-white" />
              <span>{t.contact.visitFb}</span>
            </a>
          </div>
        </div>

        {/* Photography Tips Card */}
        <div className="max-w-4xl mx-auto bg-[#3B2921] text-white rounded-2xl p-7 sm:p-9 border border-[#B08A45]/40 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#B08A45] flex items-center justify-center text-white shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold font-heritage text-[#D4AF37]">
              {t.contact.photoTipsTitle}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.contact.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#D9C8A9]">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#B08A45]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#D9C8A9]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{isRtl ? 'الرد على الواتساب عادة في أقل من ساعتين' : 'Réponse sur WhatsApp sous 2 heures'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>{isRtl ? 'المملكة المغربية — كافة الأقاليم' : 'Royaume du Maroc — Toutes préfectures'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
