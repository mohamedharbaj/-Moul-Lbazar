import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACT } from '../translations';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { lang, isRtl } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsAppDirectUrl = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
    lang === 'ar' ? OFFICIAL_CONTACT.defaultWhatsAppMessageAr : OFFICIAL_CONTACT.defaultWhatsAppMessageFr
  )}`;

  return (
    <aside
      aria-label="WhatsApp Contact"
      className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40 flex items-center gap-3`}
    >
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#2D1E18] text-[#F5EFE3] text-xs font-semibold py-2 px-3.5 rounded-xl border border-[#B08A45]/50 shadow-2xl animate-bounce">
          <span>
            {isRtl ? 'راسلنا على واتساب للتقييم الفوري' : 'WhatsApp direct pour estimation'}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            className="text-[#D9C8A9] hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsAppDirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20BA59] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 active:scale-95"
        title="WhatsApp Direct - Moul LBazar"
        aria-label="تواصل مع مول البزار عبر واتساب"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none"></span>

        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white relative z-10" />

        {/* Online Indicator Badge */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-white border-2 border-[#25D366] rounded-full flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
        </span>
      </a>
    </aside>
  );
};
