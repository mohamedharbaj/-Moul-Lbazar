import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACT } from '../translations';
import { ShieldCheck, Handshake, History, Banknote, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { t, isRtl, L } = useLanguage();

  const valueIcons = [
    ShieldCheck,
    Handshake,
    History,
    Banknote,
    Globe2,
  ];

  return (
    <section id="about" className="py-16 lg:py-24 bg-[#F5EFE3] text-[#292521] relative overflow-hidden moroccan-pattern">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B08A45]/15 border border-[#B08A45]/30 text-xs font-bold text-[#8C6B2D] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B08A45]" />
            <span>{t.about.title}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heritage text-[#3B2921] mb-4">
            {t.about.subtitle}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B08A45] to-transparent mx-auto"></div>
        </div>

        {/* Grid: Image of Moul LBazar & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto mb-16">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-md w-full">
              {/* Antique golden frame with layered borders */}
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[#B08A45] via-[#D4AF37] to-[#3B2921] shadow-2xl">
                <div className="relative rounded-xl overflow-hidden bg-[#2D1E18] aspect-[4/5] border border-[#FFE699]/40">
                  <img
                    src={OFFICIAL_CONTACT.officialLogo}
                    alt="مول البزار - صورة البروفايل الرسمية"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#2D1E18]/80 via-transparent to-transparent"></div>

                  <div className="absolute bottom-4 inset-x-4 text-center bg-[#2D1E18]/90 backdrop-blur-md py-3 px-4 rounded-xl border border-[#B08A45]/50 shadow-lg">
                    <p className="text-lg font-bold font-heritage text-[#D4AF37]">
                      مول البزار | Moul LBazar
                    </p>
                    <p className="text-xs text-[#D9C8A9]">
                      {L('خبير ومختص في شراء وتقييم المقتنيات النادرة', 'Expert en rachat et évaluation d\'antiquités', "Expert in buying and appraising antiques")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative accent seals */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#B08A45] flex items-center justify-center text-white shadow-lg border-2 border-[#F5EFE3]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-5 text-base sm:text-lg leading-relaxed text-[#3B2921]">
            <p className="font-medium text-[#292521]">
              {t.about.p1}
            </p>
            <p className="text-[#3B2921]/90">
              {t.about.p2}
            </p>
            <p className="text-[#3B2921]/90">
              {t.about.p3}
            </p>

            {/* Antique Quotation Box */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#EFE4D2] border-r-4 border-l-4 border-[#B08A45] shadow-inner mt-6">
              <blockquote className="font-heritage text-lg sm:text-xl font-bold text-[#3B2921] italic mb-2">
                {t.about.quote}
              </blockquote>
              <p className="text-xs sm:text-sm text-[#8C6B2D] font-medium">
                — {t.about.author}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Core Values Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold font-heritage text-[#3B2921]">
              {t.about.valuesTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.about.values.map((val, idx) => {
              const IconComp = valueIcons[idx] || CheckCircle2;
              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-[#B08A45]/30 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#3B2921] text-[#D4AF37] flex items-center justify-center mb-4 group-hover:bg-[#B08A45] group-hover:text-white transition-colors shadow">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold font-heritage text-[#3B2921] mb-2">
                    {val.title}
                  </h4>
                  <p className="text-sm text-[#292521]/80 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}

            {/* 6th bonus highlight card for immediate call */}
            <div className="bg-gradient-to-br from-[#3B2921] to-[#2D1E18] text-white p-6 rounded-xl border border-[#B08A45] shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37] mb-2 block">
                  {L('ضمان مول البزار', 'Garantie Moul LBazar', "Moul LBazar Guarantee")}
                </span>
                <h4 className="text-lg font-bold font-heritage text-white mb-2">
                  {L('كنوز الماضي تستحق التقدير', 'Valorisation équitable', "Fair valuation")}
                </h4>
                <p className="text-xs sm:text-sm text-[#D9C8A9] leading-relaxed">
                  {L('يمكن تكون عندك قطعة قديمة بالبيت كتعتقد أنها بدون قيمة، بينما تسوى الكثير في سوق المقتنيات. نحن هنا لندلك على قيمتها الحقيقية.', 'Un objet ancien oublié chez vous peut receler une valeur considérable. Nous vous aidons à en révéler la véritable valeur marchande.', "An old object forgotten at home may hold considerable value. We help you discover its true market value.")}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#B08A45]/30 flex items-center gap-2 text-xs text-[#25D366] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{L('استشارة وتقييم مجاني 100%', 'Expertise 100% Gratuite', "100% Free Appraisal")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
