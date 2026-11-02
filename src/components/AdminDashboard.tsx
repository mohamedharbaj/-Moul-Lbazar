import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { CATEGORIES_DATA, OFFICIAL_CONTACT } from '../translations';
import { AntiqueSubmission, SubmissionStatus } from '../types';
import {
  Shield,
  Lock,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  MessageCircle,
  Phone,
  Eye,
  FileText,
  X,
  Database,
  Calendar,
  MapPin,
  Tag,
  AlertTriangle,
  ChevronDown,
  Save,
  Download,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { lang, t, isRtl } = useLanguage();

  // Authentication state (Session-based)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('moullbazar_admin_session') === 'active';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Data states
  const [submissions, setSubmissions] = useState<AntiqueSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Selected item modal / detail view
  const [selectedItem, setSelectedItem] = useState<AntiqueSubmission | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'firebase'>('submissions');

  // Load submissions
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadSubmissions();
    }
  }, [isAuthenticated, isOpen]);

  if (!isOpen) return null;

  // Secure PIN authentication
  // Default PIN is 1984 or moullbazar or 0674695172 or admin2024
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['moul2024', '0674695172', '1984', 'admin2024'];
    if (validCodes.includes(pinInput.trim().toLowerCase())) {
      setIsAuthenticated(true);
      sessionStorage.setItem('moullbazar_admin_session', 'active');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('moullbazar_admin_session');
    setSelectedItem(null);
  };

  const handleStatusChange = async (id: string, newStatus: SubmissionStatus) => {
    await StorageService.updateStatus(id, newStatus);
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedItem) return;
    await StorageService.updateNotes(selectedItem.id, adminNoteText);
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id ? { ...item, adminNotes: adminNoteText } : item
      )
    );
    setSelectedItem({ ...selectedItem, adminNotes: adminNoteText });
    setNoteSavedMessage(true);
    setTimeout(() => setNoteSavedMessage(false), 2500);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      await StorageService.deleteSubmission(id);
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Reference', 'Date', 'Name', 'City', 'Phone', 'Category', 'Price', 'Status', 'Description'];
    const rows = submissions.map((sub) => [
      sub.referenceCode,
      new Date(sub.createdAt).toLocaleDateString(),
      `"${sub.fullName.replace(/"/g, '""')}"`,
      `"${sub.city.replace(/"/g, '""')}"`,
      `"${sub.phone}"`,
      `"${sub.categoryTitle.replace(/"/g, '""')}"`,
      `"${sub.expectedPrice || ''}"`,
      sub.status,
      `"${sub.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Moul_LBazar_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.includes(searchQuery) ||
      sub.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' || sub.categoryId === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' || sub.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Metrics
  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const reviewedCount = submissions.filter((s) => s.status === 'reviewed' || s.status === 'approved').length;
  const purchasedCount = submissions.filter((s) => s.status === 'purchased').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col animate-fadeIn">
      {/* Top Navbar */}
      <div className="bg-[#2D1E18] border-b border-[#B08A45]/40 text-white px-4 sm:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B08A45] flex items-center justify-center text-white shadow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heritage text-[#F5EFE3]">
              {t.admin.title}
            </h2>
            <p className="text-xs text-[#D9C8A9]">
              {isRtl ? 'الموقع الرسمي لمول البزار • لوحة الإدارة الآمنة' : 'Moul LBazar • Espace d\'administration'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B2921] hover:bg-red-950/70 border border-red-500/30 text-xs text-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.admin.logout}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#3B2921] text-[#D9C8A9] hover:text-white hover:bg-[#4A342A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="max-w-md mx-auto my-12 bg-[#3B2921] rounded-2xl p-8 border-2 border-[#B08A45]/50 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#B08A45]/20 border border-[#B08A45] text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold font-heritage text-[#F5EFE3] mb-2">
              {t.admin.loginTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#D9C8A9] mb-6 leading-relaxed">
              {t.admin.loginDesc}
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder={t.admin.pinPlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[#2D1E18] border border-[#B08A45]/50 text-white text-center text-sm tracking-wider focus:outline-none focus:border-[#D4AF37]"
                  autoFocus
                />
                {pinError && (
                  <p className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'رمز المرور غير صحيح. حاول مجدداً.' : 'Code d\'accès incorrect.'}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B08A45] to-[#8C6B2D] text-white font-bold text-sm shadow hover:brightness-110 transition-all"
              >
                {t.admin.pinSubmit}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#B08A45]/20 text-xs text-[#D9C8A9]/70">
              <span>{isRtl ? 'الرمز الافتراضي للإدارة: moul2024' : 'Code administrateur par défaut : moul2024'}</span>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6">
            {/* Navigation Tabs: Submissions vs Firebase Setup */}
            <div className="flex items-center gap-3 border-b border-[#B08A45]/30 pb-3">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  activeTab === 'submissions'
                    ? 'bg-[#B08A45] text-white'
                    : 'bg-[#2D1E18] text-[#D9C8A9] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isRtl ? 'قائمة عروض البيع' : 'Propositions reçues'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
                  {submissions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('firebase')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  activeTab === 'firebase'
                    ? 'bg-[#B08A45] text-white'
                    : 'bg-[#2D1E18] text-[#D9C8A9] hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>{isRtl ? 'حالة قاعدة البيانات (Firebase)' : 'Statut Base de Données'}</span>
              </button>
            </div>

            {activeTab === 'submissions' ? (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#3B2921] p-4 rounded-xl border border-[#B08A45]/40 shadow">
                    <span className="text-xs text-[#D9C8A9] block mb-1">
                      {t.admin.totalSubmissions}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-latin-luxury text-white">
                      {totalCount}
                    </span>
                  </div>

                  <div className="bg-[#3B2921] p-4 rounded-xl border border-yellow-500/40 shadow">
                    <span className="text-xs text-yellow-300 block mb-1">
                      {t.admin.pendingSubmissions}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-latin-luxury text-yellow-400">
                      {pendingCount}
                    </span>
                  </div>

                  <div className="bg-[#3B2921] p-4 rounded-xl border border-blue-500/40 shadow">
                    <span className="text-xs text-blue-300 block mb-1">
                      {t.admin.approvedSubmissions}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-latin-luxury text-blue-400">
                      {reviewedCount}
                    </span>
                  </div>

                  <div className="bg-[#3B2921] p-4 rounded-xl border border-green-500/40 shadow">
                    <span className="text-xs text-green-300 block mb-1">
                      {t.admin.purchasedSubmissions}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-latin-luxury text-[#25D366]">
                      {purchasedCount}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-[#3B2921] p-4 rounded-xl border border-[#B08A45]/40 shadow flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className={`w-4 h-4 text-[#D9C8A9] absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.admin.searchPlaceholder}
                      className={`w-full py-2.5 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-lg bg-[#2D1E18] border border-[#B08A45]/30 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Category Filter */}
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#2D1E18] border border-[#B08A45]/30 text-white text-xs focus:outline-none"
                    >
                      <option value="all">{t.admin.filterAllCategories}</option>
                      {CATEGORIES_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {lang === 'ar' ? c.titleAr : c.titleFr}
                        </option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#2D1E18] border border-[#B08A45]/30 text-white text-xs focus:outline-none"
                    >
                      <option value="all">{t.admin.filterAllStatuses}</option>
                      <option value="pending">{t.admin.statuses.pending}</option>
                      <option value="reviewed">{t.admin.statuses.reviewed}</option>
                      <option value="approved">{t.admin.statuses.approved}</option>
                      <option value="purchased">{t.admin.statuses.purchased}</option>
                      <option value="rejected">{t.admin.statuses.rejected}</option>
                    </select>

                    {/* Export to CSV */}
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4A342A] hover:bg-[#5A3F33] text-xs text-[#D9C8A9] hover:text-white transition-colors"
                      title="تصدير إلى ملف CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تصدير CSV' : 'Exporter CSV'}</span>
                    </button>
                  </div>
                </div>

                {/* Submissions List */}
                {loading ? (
                  <div className="py-12 text-center text-[#D9C8A9]">
                    <div className="w-8 h-8 border-2 border-[#B08A45] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs">{isRtl ? 'جارٍ تحميل العروض...' : 'Chargement des dossiers...'}</p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="bg-[#3B2921]/60 rounded-2xl p-12 text-center border border-[#B08A45]/20 text-[#D9C8A9]">
                    <p className="text-base font-medium">{t.admin.noSubmissions}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSubmissions.map((sub) => {
                      const statusColor =
                        sub.status === 'purchased'
                          ? 'bg-green-950 text-green-300 border-green-500/40'
                          : sub.status === 'pending'
                          ? 'bg-yellow-950 text-yellow-300 border-yellow-500/40'
                          : sub.status === 'rejected'
                          ? 'bg-red-950 text-red-300 border-red-500/40'
                          : 'bg-blue-950 text-blue-300 border-blue-500/40';

                      return (
                        <div
                          key={sub.id}
                          className="bg-[#3B2921] rounded-2xl p-5 border border-[#B08A45]/30 hover:border-[#D4AF37] shadow-xl flex flex-col justify-between transition-all"
                        >
                          <div>
                            {/* Card Top: Ref + Status */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#2D1E18] px-2.5 py-1 rounded-md border border-[#B08A45]/30">
                                {sub.referenceCode}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}
                              >
                                {t.admin.statuses[sub.status]}
                              </span>
                            </div>

                            {/* Customer info */}
                            <h4 className="text-base font-bold text-[#F5EFE3] mb-1">
                              {sub.fullName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-[#D9C8A9] mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#B08A45]" />
                                {sub.city}
                              </span>
                              <span className="flex items-center gap-1 font-mono" dir="ltr">
                                <Phone className="w-3 h-3 text-[#25D366]" />
                                {sub.phone}
                              </span>
                            </div>

                            {/* Category & Date */}
                            <div className="flex items-center justify-between text-xs text-[#D9C8A9]/80 mb-3 bg-[#2D1E18]/60 p-2 rounded-lg">
                              <span className="font-medium text-[#D4AF37] truncate">
                                {sub.categoryTitle}
                              </span>
                              <span className="text-[11px]">
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Description snippet */}
                            <p className="text-xs text-[#EFE4D2] line-clamp-3 mb-4 leading-relaxed bg-[#2D1E18]/30 p-2.5 rounded-lg border border-[#B08A45]/15">
                              {sub.description}
                            </p>

                            {/* Photos Preview Bar */}
                            {sub.photos && sub.photos.length > 0 && (
                              <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1">
                                {sub.photos.slice(0, 4).map((p, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setSelectedItem(sub);
                                      setPreviewPhoto(p);
                                    }}
                                    className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#B08A45]/40 cursor-pointer hover:scale-105 transition-transform"
                                  >
                                    <img src={p} alt="Thumbnail" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {sub.photos.length > 4 && (
                                  <span className="text-[10px] text-[#D4AF37] font-bold">
                                    +{sub.photos.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3 border-t border-[#B08A45]/20 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(sub);
                                setAdminNoteText(sub.adminNotes || '');
                              }}
                              className="flex-1 py-2 px-3 rounded-lg bg-[#4A342A] hover:bg-[#B08A45] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'معاينة وإدارة' : 'Détails & Action'}</span>
                            </button>

                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-2 rounded-lg bg-[#2D1E18] text-red-400 hover:bg-red-950/60 transition-colors"
                              title={t.admin.deleteBtn}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Firebase Configuration & Architecture Tab */
              <div className="bg-[#3B2921] rounded-2xl p-6 sm:p-8 border-2 border-[#B08A45]/40 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#B08A45]/20 border border-[#B08A45] text-[#D4AF37] flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heritage text-[#F5EFE3]">
                      {t.admin.firebaseStatusTitle}
                    </h3>
                    <p className="text-xs text-[#D9C8A9]">
                      {isRtl ? 'معلومات التزامن السحابي وأمن البيانات' : 'Synchronisation Cloud & Sécurité des données'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#2D1E18] border border-[#25D366]/40 text-xs sm:text-sm text-[#F5EFE3] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#25D366] mb-1">
                      {isRtl ? 'النظام يعمل بكفاءة وأمان 100%' : 'Système opérationnel à 100%'}
                    </p>
                    <p className="text-[#D9C8A9] leading-relaxed">
                      {t.admin.firebaseFallback}
                    </p>
                  </div>
                </div>

                {/* Setup Steps */}
                <div className="space-y-4 text-xs sm:text-sm text-[#D9C8A9]">
                  <h4 className="font-bold text-base text-[#D4AF37]">
                    {isRtl ? 'كيفية ربط فايربيس (Firebase) المباشر:' : 'Instructions pour lier Firebase :'}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-[#EFE4D2]">
                    <li>{isRtl ? 'أنشئ مشروعاً جديداً على console.firebase.google.com (مجاني تماماً على خطة Spark).' : 'Créez un projet sur console.firebase.google.com (gratuit Spark).'}</li>
                    <li>{isRtl ? 'فعل خدمة Cloud Firestore و Firebase Authentication.' : 'Activez Cloud Firestore et Firebase Auth.'}</li>
                    <li>{isRtl ? 'أنشئ ملف firebase-applet-config.json في المجلد الرئيسي وضع فيه مفاتيح الاتصال.' : 'Créez le fichier firebase-applet-config.json à la racine.'}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Detail / Management Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#3B2921] rounded-2xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#D4AF37] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-[#D9C8A9] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#B08A45]/30">
              <div>
                <span className="text-xs text-[#D9C8A9] block">
                  {t.admin.itemDetails}
                </span>
                <h3 className="text-2xl font-bold font-heritage text-[#F5EFE3]">
                  {selectedItem.fullName} — {selectedItem.referenceCode}
                </h3>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#D9C8A9]">{t.admin.statusLabel}</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) =>
                    handleStatusChange(selectedItem.id, e.target.value as SubmissionStatus)
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#2D1E18] border border-[#B08A45] text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="pending">{t.admin.statuses.pending}</option>
                  <option value="reviewed">{t.admin.statuses.reviewed}</option>
                  <option value="approved">{t.admin.statuses.approved}</option>
                  <option value="purchased">{t.admin.statuses.purchased}</option>
                  <option value="rejected">{t.admin.statuses.rejected}</option>
                </select>
              </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3 bg-[#2D1E18]/80 p-4 rounded-xl border border-[#B08A45]/30">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  {t.admin.customerInfo}
                </h4>
                <p className="text-sm text-white font-semibold">
                  {selectedItem.fullName}
                </p>
                <p className="text-xs text-[#D9C8A9] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B08A45]" />
                  <span>{selectedItem.city}</span>
                </p>
                <p className="text-xs text-[#D9C8A9] flex items-center gap-1.5 font-mono" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{selectedItem.phone}</span>
                </p>

                {/* Direct Action Buttons for this customer */}
                <div className="pt-3 border-t border-[#B08A45]/20 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/${selectedItem.phone.replace(/[\s\+\-]/g, '')}?text=${encodeURIComponent(
                      lang === 'ar'
                        ? `السلام عليكم ${selectedItem.fullName}، معكم "مول البزار". بخصوص القطعة التي أرسلتموها لنا عبر الموقع (المرجع: ${selectedItem.referenceCode})...`
                        : `Bonjour ${selectedItem.fullName}, ici Moul LBazar concernant votre proposition d'objet (Réf: ${selectedItem.referenceCode})...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20BA59] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{t.admin.contactCustomerWa}</span>
                  </a>

                  <a
                    href={`tel:${selectedItem.phone}`}
                    className="w-full py-2 px-3 rounded-lg bg-[#4A342A] hover:bg-[#5A3F33] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t.admin.callCustomer}</span>
                  </a>
                </div>
              </div>

              {/* Item details */}
              <div className="space-y-3 bg-[#2D1E18]/80 p-4 rounded-xl border border-[#B08A45]/30">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  {t.admin.itemDetails}
                </h4>
                <p className="text-xs text-[#D9C8A9]">
                  <strong className="text-white">{t.admin.category}</strong> {selectedItem.categoryTitle}
                </p>
                <p className="text-xs text-[#D9C8A9]">
                  <strong className="text-white">{t.admin.expectedPrice}</strong>{' '}
                  <span className="text-[#D4AF37] font-bold">
                    {selectedItem.expectedPrice || (isRtl ? 'لم يحدد (طلب التقييم أولاً)' : 'Non précisé')}
                  </span>
                </p>
                <p className="text-xs text-[#D9C8A9]">
                  <strong className="text-white">{t.admin.submittedAt}</strong>{' '}
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
                <div className="pt-2">
                  <strong className="text-xs text-white block mb-1">{t.admin.description}</strong>
                  <p className="text-xs text-[#EFE4D2] leading-relaxed bg-[#1E1410] p-2.5 rounded-lg border border-[#B08A45]/20 max-h-32 overflow-y-auto">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos Lightbox Gallery */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>{isRtl ? 'الصور المرفقة بالطلب' : 'Photos attachées'} ({selectedItem.photos.length})</span>
                <span className="text-[11px] text-[#D9C8A9] font-normal">
                  {isRtl ? 'اضغط على أي صورة لتكبيرها' : 'Cliquez pour agrandir'}
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedItem.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewPhoto(photo)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#B08A45]/60 bg-[#1E1410] cursor-pointer group shadow"
                  >
                    <img src={photo} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Internal Notes Editor */}
            <div className="bg-[#2D1E18] p-4 rounded-xl border border-[#B08A45]/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#D4AF37]">
                  {isRtl ? 'ملاحظات الإدارة الداخلية (سرية ولا تظهر للعميل):' : 'Notes internes de gestion (confidentielles) :'}
                </label>
                {noteSavedMessage && (
                  <span className="text-xs text-[#25D366] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تم الحفظ!' : 'Enregistré !'}</span>
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder={t.admin.notesPlaceholder}
                className="w-full px-3 py-2 rounded-lg bg-[#1E1410] border border-[#B08A45]/30 text-white text-xs focus:outline-none focus:border-[#D4AF37] resize-none mb-2"
              ></textarea>

              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-lg bg-[#B08A45] hover:bg-[#C49B4D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.admin.saveNotes}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Popup */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={previewPhoto}
            alt="Full antique preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-[#B08A45] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
