import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Camera, Send, Banknote, Sparkles, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { t, isRtl, L } = useLanguage();

  const steps = [
    {
      num: '01',
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: Camera,
      color: 'from-[#B08A45] to-[#8C6B2D]',
    },
    {
      num: '02',
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: Send,
      color: 'from-[#A7653D] to-[#8C4E2D]',
    },
    {
      num: '03',
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: Banknote,
      color: 'from-[#25D366] to-[#1E9E4B]',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#F5EFE3] text-[#292521] relative overflow-hidden moroccan-pattern">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B08A45]/15 border border-[#B08A45]/30 text-xs font-bold text-[#8C6B2D] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B08A45]" />
            <span>{L('بساطة وأمان', 'Simplicité & Sécurité', "Simplicity & Security")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heritage text-[#3B2921] mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-base sm:text-lg text-[#3B2921]/80">
            {t.howItWorks.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B08A45] to-transparent mx-auto mt-4"></div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-7 sm:p-8 border-2 border-[#B08A45]/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComp className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-bold font-latin-luxury text-[#B08A45]/40">
                    {step.num}
                  </span>
                </div>

                {/* Step Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold font-heritage text-[#3B2921] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#292521]/80 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom decorative bar */}
                <div className="pt-4 border-t border-[#B08A45]/20 flex items-center justify-between text-xs text-[#8C6B2D] font-bold">
                  <span>
                    {idx === 0 && (L('تصوير بجودة جيدة', 'Photos de qualité', "Quality photos"))}
                    {idx === 1 && (L('واتساب أو الاستمارة', 'WhatsApp ou Formulaire', "WhatsApp or Form"))}
                    {idx === 2 && (L('دفع فوري نقداً', 'Paiement immédiat', "Immediate payment"))}
                  </span>
                  {idx < 2 && (
                    <span className="hidden md:inline">
                      {isRtl ? <ArrowLeft className="w-4 h-4 text-[#B08A45]" /> : <ArrowRight className="w-4 h-4 text-[#B08A45]" />}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance banner below steps */}
        <div className="mt-14 max-w-3xl mx-auto text-center bg-[#EFE4D2] rounded-xl p-5 border border-[#B08A45]/40 shadow-inner">
          <p className="text-sm sm:text-base font-medium text-[#3B2921]">
            <span className="font-bold text-[#B08A45]">★ {t.sloganSecondary}</span>
            <br />
            {L('لا تتردد في مراسلتنا مهما كانت حالة القطعة أو درجة قدمها. المعاينة والاستشارة مجانية 100%.', 'N\'hésitez pas à nous consulter quel que soit l\'état de conservation de votre pièce. L\'expertise est totalement gratuite.', "Feel free to contact us whatever the condition of your piece. The appraisal is completely free.")}
          </p>
        </div>
      </div>
    </section>
  );
};
