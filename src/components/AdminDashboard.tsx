import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { auth, db, isFirebaseConfigured, AUTHORIZED_ADMIN_EMAIL } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { CATEGORIES_DATA } from '../translations';
import { AntiqueSubmission, SubmissionStatus, SubmissionPhoto } from '../types';
import {
  Shield,
  Lock,
  LogOut,
  Search,
  CheckCircle2,
  Trash2,
  MessageCircle,
  Phone,
  Eye,
  FileText,
  X,
  Database,
  MapPin,
  AlertTriangle,
  Save,
  Download,
  Mail,
  KeyRound,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { lang, t, isRtl } = useLanguage();

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState(false);

  // Data states
  const [submissions, setSubmissions] = useState<AntiqueSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [showExpired, setShowExpired] = useState(false);

  // Selected item modal / detail view
  const [selectedItem, setSelectedItem] = useState<AntiqueSubmission | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'firebase'>('submissions');

  // Monitor Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const authInstance = auth;
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        if (user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setCurrentUser(user);
        } else {
          // Unauthorized email attempted login: sign out immediately
          await signOut(authInstance);
          setCurrentUser(null);
          setLoginError(
            isRtl
              ? `غير مصرح بالدخول. الحساب المعتمد للإدارة هو فقط: ${AUTHORIZED_ADMIN_EMAIL}`
              : `Accès non autorisé. Seul le compte ${AUTHORIZED_ADMIN_EMAIL} est autorisé.`
          );
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isRtl]);

  // Load submissions from Firestore whenever admin is authenticated
  const loadSubmissions = async () => {
    if (!currentUser) return;
    setLoading(true);
    setDataError(null);
    try {
      const data = await StorageService.getAllSubmissions(showExpired);
      setSubmissions(data);
    } catch (err: any) {
      console.error('Error loading submissions from Firestore:', err);
      setDataError(
        err?.message ||
          (isRtl
            ? 'تعذر جلب البيانات من Firestore. تأكد من صلاحيات وقواعد الأمان.'
            : 'Échec de récupération des données depuis Firestore.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isOpen) {
      loadSubmissions();
    }
  }, [currentUser, isOpen, showExpired]);

  if (!isOpen) return null;

  // Firebase Email/Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSentMessage(false);

    if (!isFirebaseConfigured() || !auth) {
      setLoginError(
        isRtl
          ? 'إعدادات Firebase غير مكتملة (VITE_FIREBASE_API_KEY مفقود في ملف البيئة).'
          : 'Configuration Firebase incomplète (VITE_FIREBASE_API_KEY manquant).'
      );
      return;
    }

    const authInstance = auth;

    if (emailInput.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setLoginError(
        isRtl
          ? `البريد الإلكتروني المعتمد للإدارة هو: ${AUTHORIZED_ADMIN_EMAIL}`
          : `L'adresse e-mail autorisée est : ${AUTHORIZED_ADMIN_EMAIL}`
      );
      return;
    }

    if (!passwordInput) {
      setLoginError(
        isRtl ? 'يرجى إدخال كلمة المرور.' : 'Veuillez saisir votre mot de passe.'
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const cred = await signInWithEmailAndPassword(authInstance, emailInput.trim(), passwordInput);
      if (cred.user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(authInstance);
        throw new Error(
          isRtl
            ? 'هذا الحساب غير مصرح له بالدخول للوحة الإدارة.'
            : 'Ce compte n\'est pas autorisé à accéder à l\'administration.'
        );
      }
      setPasswordInput('');
    } catch (err: any) {
      console.error('Login error:', err);
      let message = isRtl
        ? 'فشل تسجيل الدخول. تأكد من صحة البريد وكلمة المرور.'
        : 'Échec de connexion. Vérifiez vos identifiants.';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = isRtl
          ? 'كلمة المرور أو البريد غير صحيح.'
          : 'Mot de passe ou identifiant incorrect.';
      } else if (err.code === 'auth/user-not-found') {
        message = isRtl
          ? 'المستخدم غير مسجل في Firebase Authentication.'
          : 'Utilisateur introuvable dans Firebase Auth.';
      } else if (err.code === 'auth/too-many-requests') {
        message = isRtl
          ? 'محاولات كثيرة خاطئة. يرجى الانتظار قليلاً.'
          : 'Trop de tentatives. Veuillez patienter.';
      } else if (err.message) {
        message = err.message;
      }

      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    const authInstance = auth;
    try {
      await sendPasswordResetEmail(authInstance, AUTHORIZED_ADMIN_EMAIL);
      setResetSentMessage(true);
      setLoginError(null);
    } catch (err: any) {
      setLoginError(
        isRtl
          ? `تعذر إرسال رابط استعادة كلمة المرور: ${err.message}`
          : `Impossible d'envoyer l'e-mail de réinitialisation: ${err.message}`
      );
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setSelectedItem(null);
  };

  const handleStatusChange = async (id: string, newStatus: SubmissionStatus) => {
    try {
      await StorageService.updateStatus(id, newStatus);
      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (err: any) {
      alert(isRtl ? `فشل تحديث الحالة: ${err.message}` : `Erreur: ${err.message}`);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedItem) return;
    try {
      await StorageService.updateNotes(selectedItem.id, adminNoteText);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, adminNotes: adminNoteText } : item
        )
      );
      setSelectedItem({ ...selectedItem, adminNotes: adminNoteText });
      setNoteSavedMessage(true);
      setTimeout(() => setNoteSavedMessage(false), 2500);
    } catch (err: any) {
      alert(isRtl ? `فشل حفظ الملاحظات: ${err.message}` : `Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      try {
        await StorageService.deleteSubmission(id);
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } catch (err: any) {
        alert(isRtl ? `فشل الحذف من Firestore: ${err.message}` : `Erreur: ${err.message}`);
      }
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Reference',
      'Date',
      'ExpiresAt',
      'Name',
      'City',
      'Phone',
      'Category',
      'Price',
      'Status',
      'Description',
      'PhotosCount',
    ];
    const rows = submissions.map((sub) => [
      sub.referenceCode,
      new Date(sub.createdAt).toLocaleDateString(),
      new Date(sub.expiresAt).toLocaleDateString(),
      `"${sub.fullName.replace(/"/g, '""')}"`,
      `"${sub.city.replace(/"/g, '""')}"`,
      `"${sub.phone}"`,
      `"${sub.categoryTitle.replace(/"/g, '""')}"`,
      `"${sub.expectedPrice || ''}"`,
      sub.status,
      `"${sub.description.replace(/"/g, '""')}"`,
      sub.photos.length,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Moul_LBazar_Submissions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to extract photo URL safely
  const getPhotoUrl = (p: SubmissionPhoto | string): string => {
    if (typeof p === 'string') return p;
    return p?.url || '';
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
  const reviewedCount = submissions.filter(
    (s) => s.status === 'reviewed' || s.status === 'approved'
  ).length;
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
              {currentUser
                ? `${isRtl ? 'حساب متصل:' : 'Connecté en tant que :'} ${currentUser.email}`
                : isRtl
                ? 'تسجيل الدخول الآمن عبر Firebase Auth'
                : 'Authentification sécurisée Firebase Auth'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
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
        {authLoading ? (
          <div className="py-24 text-center text-[#D9C8A9]">
            <div className="w-10 h-10 border-2 border-[#B08A45] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">{isRtl ? 'جارٍ التحقق من جلسة المدير...' : 'Vérification de la session...'}</p>
          </div>
        ) : !currentUser ? (
          /* Secure Firebase Email & Password Login Screen */
          <div className="max-w-md mx-auto my-10 bg-[#3B2921] rounded-2xl p-8 border-2 border-[#B08A45]/50 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#B08A45]/20 border border-[#B08A45] text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold font-heritage text-[#F5EFE3] mb-2">
              {t.admin.loginTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#D9C8A9] mb-6 leading-relaxed">
              {isRtl
                ? 'لوحة إدارة مول البزار محمية عبر Firebase Authentication. الدخول مقتصر على المدير المعتمد.'
                : 'Espace d\'administration sécurisé par Firebase Auth. Accès réservé au gérant.'}
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 text-right">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {resetSentMessage && (
              <div className="mb-4 p-3 rounded-xl bg-green-950/80 border border-green-500/50 text-green-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>
                  {isRtl
                    ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${AUTHORIZED_ADMIN_EMAIL}. تفقد بريدك.`
                    : `Lien de réinitialisation envoyé à ${AUTHORIZED_ADMIN_EMAIL}.`}
                </span>
              </div>
            )}

            <form onSubmit={handleEmailPasswordLogin} className="space-y-4 text-right">
              <div>
                <label className="block text-xs text-[#D9C8A9] mb-1 font-semibold">
                  {isRtl ? 'البريد الإلكتروني المعتمد' : 'Adresse e-mail'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-[#D9C8A9] absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    dir="ltr"
                    className={`w-full py-3 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl bg-[#2D1E18] border border-[#B08A45]/40 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#D9C8A9] mb-1 font-semibold">
                  {isRtl ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <div className="relative">
                  <KeyRound className={`w-4 h-4 text-[#D9C8A9] absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full py-3 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl bg-[#2D1E18] border border-[#B08A45]/40 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]`}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[#D4AF37] hover:underline"
                >
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2 ${
                  isLoggingIn
                    ? 'bg-gray-600 opacity-75 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#B08A45] to-[#8C6B2D] hover:brightness-110'
                }`}
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRtl ? 'جارٍ التحقق...' : 'Connexion...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول إلى الإدارة' : 'Se connecter'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#B08A45]/20 text-xs text-[#D9C8A9]/80">
              <p>
                {isRtl
                  ? `الحساب المرخص له فقط: ${AUTHORIZED_ADMIN_EMAIL}`
                  : `Compte gérant autorisé : ${AUTHORIZED_ADMIN_EMAIL}`}
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6">
            {/* Navigation Tabs: Submissions vs Firebase Diagnostics */}
            <div className="flex items-center justify-between border-b border-[#B08A45]/30 pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    activeTab === 'submissions'
                      ? 'bg-[#B08A45] text-white'
                      : 'bg-[#2D1E18] text-[#D9C8A9] hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{isRtl ? 'عروض المقتنيات (Firestore)' : 'Propositions (Firestore)'}</span>
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
                  <span>{isRtl ? 'إعدادات وأمان السحابة' : 'Cloud & Sécurité'}</span>
                </button>
              </div>

              {/* 7-Day Expired Listings Toggle */}
              <label className="flex items-center gap-2 text-xs text-[#D9C8A9] cursor-pointer bg-[#2D1E18] px-3 py-1.5 rounded-lg border border-[#B08A45]/30">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="rounded text-[#B08A45] focus:ring-0"
                />
                <span>{isRtl ? 'إظهار الطلبات المنتهية (+7 أيام)' : 'Afficher propositions expirées (+7j)'}</span>
              </label>
            </div>

            {dataError && (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{isRtl ? 'تنبيه أمان / اتصال Firestore' : 'Erreur Firestore'}</p>
                  <p className="text-xs text-red-300 mt-1">{dataError}</p>
                </div>
              </div>
            )}

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

                    {/* Refresh */}
                    <button
                      onClick={loadSubmissions}
                      className="px-3 py-2 rounded-lg bg-[#2D1E18] border border-[#B08A45]/30 hover:border-[#D4AF37] text-xs text-[#D9C8A9] hover:text-white transition-colors"
                      title="تحديث القائمة"
                    >
                      {isRtl ? 'تحديث' : 'Actualiser'}
                    </button>

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
                    <p className="text-xs">{isRtl ? 'جارٍ تحميل العروض من Firestore...' : 'Chargement des dossiers Firestore...'}</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-[#3B2921]/60 rounded-2xl p-12 text-center border border-[#B08A45]/20 text-[#D9C8A9]">
                    <div className="w-14 h-14 rounded-full bg-[#2D1E18] text-[#D4AF37] flex items-center justify-center mx-auto mb-4 border border-[#B08A45]/30">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-lg font-bold font-heritage text-[#F5EFE3] mb-1">
                      {isRtl ? 'لا توجد طلبات واردة حالياً' : 'Aucune proposition reçue actuellement'}
                    </p>
                    <p className="text-xs text-[#D9C8A9]/80 max-w-md mx-auto mt-2 leading-relaxed">
                      {isRtl
                        ? 'قاعدة البيانات نظيفة وفارغة. ستظهر هنا طلبات الزوار تلقائياً بمجرد إرسالها عبر استمارة الموقع ومزامنتها في Cloud Firestore.'
                        : 'La base de données est propre et vide. Les propositions envoyées par les visiteurs via le formulaire apparaîtront ici automatiquement.'}
                    </p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="bg-[#3B2921]/60 rounded-2xl p-12 text-center border border-[#B08A45]/20 text-[#D9C8A9]">
                    <p className="text-base font-medium">{t.admin.noSubmissions}</p>
                    <p className="text-xs text-[#D9C8A9]/70 mt-2">
                      {isRtl
                        ? 'يرجى تجربة البحث بكلمات أخرى أو إعادة تعيين الفلاتر.'
                        : 'Veuillez essayer d\'autres termes ou réinitialiser les filtres.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSubmissions.map((sub) => {
                      const isExpired = sub.expiresAt <= Date.now();
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
                          className={`bg-[#3B2921] rounded-2xl p-5 border ${
                            isExpired ? 'border-red-900/60 opacity-80' : 'border-[#B08A45]/30 hover:border-[#D4AF37]'
                          } shadow-xl flex flex-col justify-between transition-all`}
                        >
                          <div>
                            {/* Card Top: Ref + Status + Expiry Badge */}
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#2D1E18] px-2.5 py-1 rounded-md border border-[#B08A45]/30">
                                {sub.referenceCode}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {isExpired && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-900 text-red-200 border border-red-600/50">
                                    {isRtl ? 'منتهي (7 أيام)' : 'Expiré (7j)'}
                                  </span>
                                )}
                                <span
                                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}
                                >
                                  {t.admin.statuses[sub.status]}
                                </span>
                              </div>
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
                              <span className="text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#B08A45]" />
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Description snippet */}
                            <p className="text-xs text-[#EFE4D2] line-clamp-3 mb-4 leading-relaxed bg-[#2D1E18]/30 p-2.5 rounded-lg border border-[#B08A45]/15">
                              {sub.description}
                            </p>

                            {/* Cloudinary Photos Preview Bar */}
                            {sub.photos && sub.photos.length > 0 && (
                              <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1">
                                {sub.photos.slice(0, 4).map((p, idx) => {
                                  const url = getPhotoUrl(p);
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        setSelectedItem(sub);
                                        setPreviewPhoto(url);
                                      }}
                                      className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#B08A45]/40 cursor-pointer hover:scale-105 transition-transform bg-[#1E1410]"
                                    >
                                      <img
                                        src={url}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  );
                                })}
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
              /* Cloud & Firebase Architecture Tab */
              <div className="bg-[#3B2921] rounded-2xl p-6 sm:p-8 border-2 border-[#B08A45]/40 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#B08A45]/20 border border-[#B08A45] text-[#D4AF37] flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heritage text-[#F5EFE3]">
                      {isRtl ? 'معلومات السحابة وتكامل الخدمات' : 'Architecture Cloud & Services'}
                    </h3>
                    <p className="text-xs text-[#D9C8A9]">
                      Firebase Project ID: <span className="font-mono text-white">moul-lbazar</span> |
                      Cloudinary Cloud: <span className="font-mono text-white">tu7covvj</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Firebase Card */}
                  <div className="p-4 rounded-xl bg-[#2D1E18] border border-[#B08A45]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#D4AF37]">Firebase Firestore & Auth</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isFirebaseConfigured() ? 'bg-green-950 text-green-300 border border-green-600' : 'bg-yellow-950 text-yellow-300'}`}>
                        {isFirebaseConfigured() ? (isRtl ? 'مهيأ ومفعل' : 'Configuré') : (isRtl ? 'في انتظار VITE_FIREBASE_API_KEY' : 'En attente clé API')}
                      </span>
                    </div>
                    <ul className="text-xs text-[#D9C8A9] space-y-1.5">
                      <li>• <strong>Project ID:</strong> moul-lbazar</li>
                      <li>• <strong>App ID:</strong> 1:97949564837:web:7d9aa5cf7538a65fad324c</li>
                      <li>• <strong>Collection:</strong> submissions</li>
                      <li>• <strong>Admin:</strong> {AUTHORIZED_ADMIN_EMAIL}</li>
                      <li>• <strong>Plan:</strong> Spark (مجاني 100% بدون تكاليف)</li>
                    </ul>
                  </div>

                  {/* Cloudinary Card */}
                  <div className="p-4 rounded-xl bg-[#2D1E18] border border-[#B08A45]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#D4AF37]">Cloudinary Image Storage</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-950 text-green-300 border border-green-600">
                        {isRtl ? 'نشط ومفعل' : 'Actif'}
                      </span>
                    </div>
                    <ul className="text-xs text-[#D9C8A9] space-y-1.5">
                      <li>• <strong>Cloud Name:</strong> tu7covvj</li>
                      <li>• <strong>Upload Preset:</strong> moulbazar_upload (Unsigned)</li>
                      <li>• <strong>Folder:</strong> moulbazar/listings</li>
                      <li>• <strong>الأمان:</strong> لا يتم تخزين أي سر أو مفتاح خاص في الواجهة الأمامية</li>
                    </ul>
                  </div>
                </div>

                {/* 7-Day Auto Cleanup Script & GitHub Actions info */}
                <div className="p-4 rounded-xl bg-[#2D1E18] border border-[#B08A45]/30 space-y-2 text-xs text-[#D9C8A9]">
                  <h4 className="font-bold text-sm text-[#D4AF37]">
                    {isRtl ? 'آلية الحذف التلقائي بعد 7 أيام (GitHub Actions):' : 'Nettoyage automatique après 7 jours :'}
                  </h4>
                  <p className="leading-relaxed">
                    {isRtl
                      ? 'يحتوي المشروع على سكريبت scripts/cleanup-expired-listings.cjs ومخطط عمل .github/workflows/cleanup-expired-listings.yml يعمل تلقائياً كل ساعة أو يدوياً عبر workflow_dispatch.'
                      : 'Le workflow GitHub Actions s\'exécute toutes les heures pour supprimer les annonces dont expiresAt est dépassé et supprimer leurs images sur Cloudinary via public_id.'}
                  </p>
                  <p className="text-[#D4AF37] font-semibold">
                    {isRtl
                      ? 'أسرار GitHub المطلوبة: FIREBASE_SERVICE_ACCOUNT, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
                      : 'Secrets GitHub requis : FIREBASE_SERVICE_ACCOUNT, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'}
                  </p>
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
                <p className="text-xs text-[#D9C8A9]">
                  <strong className="text-white">{isRtl ? 'تاريخ الانتهاء (7 أيام):' : 'Date d\'expiration :'}</strong>{' '}
                  <span className="text-yellow-400 font-mono">
                    {new Date(selectedItem.expiresAt).toLocaleString()}
                  </span>
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
                <span>{isRtl ? 'الصور المرفوعة على Cloudinary' : 'Photos hébergées sur Cloudinary'} ({selectedItem.photos.length})</span>
                <span className="text-[11px] text-[#D9C8A9] font-normal">
                  {isRtl ? 'اضغط على أي صورة لتكبيرها' : 'Cliquez pour agrandir'}
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedItem.photos.map((photoObj, idx) => {
                  const url = getPhotoUrl(photoObj);
                  return (
                    <div
                      key={idx}
                      onClick={() => setPreviewPhoto(url)}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#B08A45]/60 bg-[#1E1410] cursor-pointer group shadow"
                    >
                      <img
                        src={url}
                        alt={`Attached ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Internal Notes Editor */}
            <div className="bg-[#2D1E18] p-4 rounded-xl border border-[#B08A45]/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#D4AF37]">
                  {isRtl ? 'ملاحظات الإدارة الداخلية (مخزنة في Firestore):' : 'Notes internes de gestion (dans Firestore) :'}
                </label>
                {noteSavedMessage && (
                  <span className="text-xs text-[#25D366] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تم الحفظ في Firestore!' : 'Enregistré sur Firestore !'}</span>
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
