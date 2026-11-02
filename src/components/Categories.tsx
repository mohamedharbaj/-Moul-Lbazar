import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES_DATA, OFFICIAL_CONTACT } from '../translations';
import { MessageCircle, Sparkles, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoriesProps {
  onSelectCategoryForForm?: (categoryId: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ onSelectCategoryForForm }) => {
  const { lang, t, isRtl } = useLanguage();

  const handleInquireCategory = (catTitle: string) => {
    const text = lang === 'ar'
      ? `السلام عليكم، عندي قطعة من صنف "${catTitle}" وبغيت نقترحها عليكم للتقييم والبيع.`
      : `Bonjour, j'ai un objet de la catégorie "${catTitle}" et je souhaite vous le proposer pour estimation et vente.`;
    const url = `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="categories" className="py-16 lg:py-24 bg-[#2D1E18] text-white relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B08A45]/20 border border-[#B08A45]/40 text-xs font-bold text-[#D4AF37] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.categories.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heritage text-[#F5EFE3] mb-4">
            {t.categories.title}
          </h2>
          <p className="text-base sm:text-lg text-[#D9C8A9]">
            {t.categories.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B08A45] to-transparent mx-auto mt-4"></div>
        </div>

        {/* Categories Grid (9 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16">
          {CATEGORIES_DATA.map((cat, index) => {
            const title = lang === 'ar' ? cat.titleAr : cat.titleFr;
            const desc = lang === 'ar' ? cat.descAr : cat.descFr;
            const examples = lang === 'ar' ? cat.examplesAr : cat.examplesFr;

            return (
              <div
                key={cat.id}
                className="group bg-[#3B2921]/90 rounded-2xl overflow-hidden border border-[#B08A45]/30 hover:border-[#D4AF37] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Category Image with Golden Tag */}
                  <div className="relative h-56 sm:h-60 overflow-hidden bg-[#1E1410]">
                    <img
                      src={cat.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3B2921] via-black/30 to-transparent"></div>

                    {/* Category number badge */}
                    <div className="absolute top-3 right-3 bg-[#2D1E18]/85 backdrop-blur-sm border border-[#B08A45]/50 text-[#D4AF37] text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                      {index + 1}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-xl font-bold font-heritage text-[#F5EFE3] group-hover:text-[#D4AF37] transition-colors mb-2.5">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#D9C8A9] leading-relaxed mb-4">
                      {desc}
                    </p>

                    {/* Example Items */}
                    <div className="bg-[#2D1E18]/80 rounded-xl p-3 border border-[#B08A45]/20 mb-4">
                      <p className="text-[11px] font-semibold text-[#D4AF37] mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{t.categories.examplesLabel}</span>
                      </p>
                      <ul className="text-xs text-[#EFE4D2] space-y-1">
                        {examples.map((ex, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B08A45]"></span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 border-t border-[#B08A45]/20 mt-auto flex flex-col gap-2">
                  <button
                    onClick={() => handleInquireCategory(title)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 hover:border-[#25D366] text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.categories.inquireCategory}</span>
                  </button>

                  {onSelectCategoryForForm && (
                    <button
                      onClick={() => onSelectCategoryForForm(cat.id)}
                      className="w-full py-2 text-center text-xs text-[#D9C8A9] hover:text-[#D4AF37] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>{isRtl ? 'عرض هذا الصنف في الاستمارة' : 'Proposer cet objet dans le formulaire'}</span>
                      {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom inquiry banner for items outside categories */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-[#3B2921] via-[#4A342A] to-[#3B2921] p-6 sm:p-8 border-2 border-[#B08A45]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#B08A45]/20 text-[#D4AF37] border border-[#B08A45] flex items-center justify-center shrink-0">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl font-bold font-heritage text-[#F5EFE3] mb-1">
                {t.categories.cantFindCategory}
              </h4>
              <p className="text-xs sm:text-sm text-[#D9C8A9]">
                {t.categories.cantFindDesc}
              </p>
            </div>
          </div>

          <a
            href={`${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(
              lang === 'ar'
                ? 'السلام عليكم، عندي قطعة قديمة فريدة من نوعها وبغيت نستفسر عليها بخصوص التقييم.'
                : 'Bonjour, je possède une pièce ancienne unique et souhaite avoir votre avis pour une évaluation.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA59] text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{t.categories.sendCustomWhatsapp}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
