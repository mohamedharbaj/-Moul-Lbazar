import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { CATEGORIES_DATA, MOROCCAN_CITIES, OFFICIAL_CONTACT } from '../translations';
import { AntiqueSubmission } from '../types';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface SubmitItemSectionProps {
  initialCategoryId?: string;
  onSubmissionSuccess?: (sub: AntiqueSubmission) => void;
}

export const SubmitItemSection: React.FC<SubmitItemSectionProps> = ({
  initialCategoryId = '',
  onSubmissionSuccess,
}) => {
  const { lang, t, isRtl } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [description, setDescription] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Photos: stored as base64 data URLs
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Loading & Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<AntiqueSubmission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update category when prop changes
  React.useEffect(() => {
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Moroccan phone number validation: 06..., 07..., 05..., or +212...
  const validatePhone = (number: string): boolean => {
    const cleaned = number.replace(/[\s\-\(\)]/g, '');
    const moroccoRegex = /^(0|\+212|00212)[5-7]\d{8}$/;
    return moroccoRegex.test(cleaned);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB per file

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        setPhotoError(
          isRtl
            ? `نوع الملف "${file.name}" غير مدعوم. المرجو اختيار صور بصيغة JPG أو PNG أو WebP.`
            : `Le format de "${file.name}" n'est pas supporté. Utilisez JPG, PNG ou WebP.`
        );
        continue;
      }

      if (file.size > maxSizeBytes) {
        setPhotoError(
          isRtl
            ? `حجم الصورة "${file.name}" كبير جداً (أكبر من 10 ميغابايت).`
            : `La taille de "${file.name}" dépasse 10 Mo.`
        );
        continue;
      }

      try {
        const processed = await StorageService.processImageFile(file);
        newPhotos.push(processed);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = t.submitSection.validation.nameRequired;
    }

    if (!city.trim()) {
      errors.city = t.submitSection.validation.cityRequired;
    }

    if (!phone.trim()) {
      errors.phone = t.submitSection.validation.phoneRequired;
    } else if (!validatePhone(phone)) {
      errors.phone = t.submitSection.validation.phoneInvalid;
    }

    if (!categoryId) {
      errors.categoryId = t.submitSection.validation.categoryRequired;
    }

    if (!description.trim() || description.trim().length < 10) {
      errors.description = t.submitSection.validation.descRequired;
    }

    if (photos.length === 0) {
      errors.photos = t.submitSection.validation.photosRequired;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const selectedCat = CATEGORIES_DATA.find((c) => c.id === categoryId);
      const catTitle = selectedCat
        ? lang === 'ar'
          ? selectedCat.titleAr
          : selectedCat.titleFr
        : categoryId;

      const newSubmission = await StorageService.addSubmission({
        fullName: fullName.trim(),
        city: city.trim(),
        phone: phone.trim(),
        categoryId,
        categoryTitle: catTitle,
        description: description.trim(),
        expectedPrice: expectedPrice.trim() || undefined,
        photos,
      });

      setSubmittedData(newSubmission);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(newSubmission);
      }

      // Reset form fields
      setFullName('');
      setCity('');
      setPhone('');
      setCategoryId('');
      setDescription('');
      setExpectedPrice('');
      setPhotos([]);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(
        isRtl
          ? 'حدث خطأ أثناء حفظ طلبك. المرجو المحاولة مرة أخرى أو مراسلتنا مباشرة عبر واتساب.'
          : 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer ou nous contacter sur WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled WhatsApp message for reference follow up
  const getSuccessWhatsAppLink = (refCode: string) => {
    const text =
      lang === 'ar'
        ? `السلام عليكم مول البزار، لقد أرسلت للتو طلباً لتقييم مقتنيات قديمة عبر الموقع برقم المرجع: [${refCode}]. المرجو الاطلاع عليه.`
        : `Bonjour Moul LBazar, je viens de soumettre un objet ancien pour estimation sur votre site avec la référence : [${refCode}]. Merci de bien vouloir l'examiner.`;
    return `${OFFICIAL_CONTACT.whatsAppUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="submit-section" className="py-16 lg:py-24 bg-[#2D1E18] text-white relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B08A45]/20 border border-[#B08A45]/40 text-xs sm:text-sm font-bold text-[#D4AF37] mb-3">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{isRtl ? 'عرض مباشر ومجاني' : 'Proposition Directe & Gratuite'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heritage text-[#F5EFE3] mb-4">
            {t.submitSection.title}
          </h2>
          <p className="text-base sm:text-lg text-[#D9C8A9]">
            {t.submitSection.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B08A45] to-transparent mx-auto mt-4"></div>
        </div>

        {/* Main Form Box */}
        <div className="max-w-3xl mx-auto bg-[#3B2921]/95 rounded-2xl p-6 sm:p-10 border-2 border-[#B08A45]/40 shadow-2xl relative">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name and City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                  {t.submitSection.nameLabel}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.submitSection.namePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl bg-[#2D1E18] border ${
                    formErrors.fullName ? 'border-red-500' : 'border-[#B08A45]/40 focus:border-[#D4AF37]'
                  } text-white text-sm focus:outline-none transition-colors placeholder:text-white/30`}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                  {t.submitSection.cityLabel}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-[#2D1E18] border ${
                    formErrors.city ? 'border-red-500' : 'border-[#B08A45]/40 focus:border-[#D4AF37]'
                  } text-white text-sm focus:outline-none transition-colors`}
                >
                  <option value="" disabled className="text-gray-500">
                    {t.submitSection.citySelect}
                  </option>
                  {MOROCCAN_CITIES.map((c, idx) => (
                    <option key={idx} value={c} className="bg-[#2D1E18] text-white">
                      {c}
                    </option>
                  ))}
                </select>
                {formErrors.city && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Phone and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                  {t.submitSection.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.submitSection.phonePlaceholder}
                  dir="ltr"
                  className={`w-full px-4 py-3 rounded-xl bg-[#2D1E18] border ${
                    formErrors.phone ? 'border-red-500' : 'border-[#B08A45]/40 focus:border-[#D4AF37]'
                  } text-white text-sm focus:outline-none transition-colors placeholder:text-white/30 text-left`}
                />
                <p className="mt-1 text-[11px] text-[#D9C8A9]/70">
                  {t.submitSection.phoneHelp}
                </p>
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                  {t.submitSection.categoryLabel}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-[#2D1E18] border ${
                    formErrors.categoryId ? 'border-red-500' : 'border-[#B08A45]/40 focus:border-[#D4AF37]'
                  } text-white text-sm focus:outline-none transition-colors`}
                >
                  <option value="" disabled className="text-gray-500">
                    {t.submitSection.categorySelect}
                  </option>
                  {CATEGORIES_DATA.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#2D1E18] text-white">
                      {lang === 'ar' ? cat.titleAr : cat.titleFr}
                    </option>
                  ))}
                  <option value="other" className="bg-[#2D1E18] text-white">
                    {isRtl ? 'تحف ومقتنيات أخرى متنوعة' : 'Autres curiosités & antiquités'}
                  </option>
                </select>
                {formErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.categoryId}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Expected Price (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                {t.submitSection.priceLabel}
              </label>
              <input
                type="text"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder={t.submitSection.pricePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-[#2D1E18] border border-[#B08A45]/40 focus:border-[#D4AF37] text-white text-sm focus:outline-none transition-colors placeholder:text-white/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                {t.submitSection.descLabel}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.submitSection.descPlaceholder}
                className={`w-full px-4 py-3 rounded-xl bg-[#2D1E18] border ${
                  formErrors.description ? 'border-red-500' : 'border-[#B08A45]/40 focus:border-[#D4AF37]'
                } text-white text-sm focus:outline-none transition-colors placeholder:text-white/30 resize-none`}
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{formErrors.description}</span>
                </p>
              )}
            </div>

            {/* Multiple Photos Upload Zone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#D9C8A9] mb-1.5">
                {t.submitSection.photosLabel}
              </label>
              <p className="text-[11px] text-[#D9C8A9]/70 mb-2">
                {t.submitSection.photosHelp}
              </p>

              {/* Upload trigger box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#B08A45]/50 hover:border-[#D4AF37] rounded-xl p-6 text-center cursor-pointer bg-[#2D1E18]/70 hover:bg-[#2D1E18] transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform mx-auto mb-2" />
                <p className="text-sm font-bold text-[#F5EFE3]">
                  {t.submitSection.dropzoneText}
                </p>
                <p className="text-xs text-[#D9C8A9]/80 mt-1">
                  {t.submitSection.dropzoneSub}
                </p>
              </div>

              {photoError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{photoError}</span>
                </p>
              )}
              {formErrors.photos && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{formErrors.photos}</span>
                </p>
              )}

              {/* Thumbnail Previews */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden aspect-square border border-[#B08A45]/60 bg-[#1E1410] group"
                    >
                      <img
                        src={src}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                        title="حذف الصورة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="bg-[#2D1E18]/60 rounded-xl p-3 border border-[#B08A45]/20 flex items-center gap-2 text-xs text-[#D9C8A9]">
              <Lock className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t.submitSection.privacyNote}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-base font-bold shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-[#B08A45] via-[#C49B4D] to-[#8C6B2D] hover:from-[#C49B4D] hover:to-[#B08A45] text-white border border-[#FFE699]/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t.submitSection.submittingBtn}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>{t.submitSection.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#3B2921] rounded-2xl p-6 sm:p-8 max-w-lg w-full border-2 border-[#D4AF37] shadow-2xl relative text-center">
            <button
              onClick={() => setSubmittedData(null)}
              className="absolute top-4 right-4 text-[#D9C8A9] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border-2 border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold font-heritage text-[#F5EFE3] mb-2">
              {t.submitSection.successModal.title}
            </h3>

            {/* Reference Code Box */}
            <div className="my-4 p-3 bg-[#2D1E18] rounded-xl border border-[#B08A45]/50 inline-block">
              <span className="text-xs text-[#D9C8A9] block">
                {t.submitSection.successModal.ref}
              </span>
              <span className="text-xl font-mono font-bold text-[#D4AF37]">
                {submittedData.referenceCode}
              </span>
            </div>

            <p className="text-sm text-[#D9C8A9] leading-relaxed mb-6">
              {t.submitSection.successModal.message}
            </p>

            {/* Fast Track WhatsApp follow up */}
            <div className="bg-[#2D1E18]/80 p-4 rounded-xl border border-[#25D366]/30 mb-6 text-xs text-[#EFE4D2]">
              <p className="mb-3 font-medium">
                {t.submitSection.successModal.fastTrackText}
              </p>
              <a
                href={getSuccessWhatsAppLink(submittedData.referenceCode)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA59] text-white text-sm font-bold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.submitSection.successModal.fastTrackBtn}</span>
              </a>
            </div>

            <button
              onClick={() => setSubmittedData(null)}
              className="px-6 py-2.5 rounded-xl bg-[#4A342A] hover:bg-[#5A3F33] text-sm text-[#D9C8A9] hover:text-white transition-colors"
            >
              {t.submitSection.successModal.closeBtn}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
