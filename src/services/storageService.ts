import { AntiqueSubmission, SubmissionStatus } from '../types';

const STORAGE_KEY = 'moullbazar_submissions_v1';
const DB_NAME = 'MoulLBazarDB';
const DB_VERSION = 1;
const STORE_NAME = 'submissions';

// Initial realistic Moroccan antique submissions for demonstration
const INITIAL_DEMO_SUBMISSIONS: AntiqueSubmission[] = [
  {
    id: 'sub_demo_101',
    referenceCode: 'MLB-84920',
    fullName: 'الحاج بوشعيب التازي',
    city: 'فاس (Fès)',
    phone: '0661234567',
    categoryId: 'coins',
    categoryTitle: 'العملات والأوراق النقدية القديمة',
    description: 'قطعتان من الريال الحسني الفضي ضرب باريس عهد السلطان مولاي عبد العزيز 1321هـ بحالة ممتازة مع كتابات واضحة جداً، ومعهما 4 أوراق نقدية لمخزن المغرب تعود لسنة 1924.',
    expectedPrice: '6,500 درهم',
    photos: [
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'pending',
    createdAt: Date.now() - 3600000 * 4, // 4 hours ago
    adminNotes: 'القطع تبدو أصلية 100%. تم التواصل عبر واتساب لتحديد موعد معاينة بمدينة فاس.',
  },
  {
    id: 'sub_demo_102',
    referenceCode: 'MLB-71204',
    fullName: 'Laila Benjelloun',
    city: 'الدار البيضاء (Casablanca)',
    phone: '0672889911',
    categoryId: 'clocks',
    categoryTitle: 'الساعات القديمة والنادرة',
    description: 'Montre gousset ancienne en or 18k de marque Oméga, numéro de série visible, mécanisme à remontage manuel fonctionnel, héritée de mon grand-père.',
    expectedPrice: '12,000 DH',
    photos: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'reviewed',
    createdAt: Date.now() - 3600000 * 28, // 1 day ago
    adminNotes: 'ساعة أوميغا نادرة جداً، العيار سليم. في انتظار تأكيد السعر النهائي.',
  },
  {
    id: 'sub_demo_103',
    referenceCode: 'MLB-39511',
    fullName: 'عبد الرحيم السوسي',
    city: 'مراكش (Marrakech)',
    phone: '0665443322',
    categoryId: 'copper',
    categoryTitle: 'النحاسيات والأواني التقليدية',
    description: 'صينية نحاسية فاسية أصلية قطر 95 سم منقوشة باليد بآيات قرآنية وزخارف هندسية عتيقة، مع براد نحاس أحمر قديم.',
    expectedPrice: '3,800 درهم',
    photos: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'purchased',
    createdAt: Date.now() - 3600000 * 72, // 3 days ago
    adminNotes: 'تم الاتفاق والشراء بنجاح وتسليم المبلغ نقداً.',
  },
];

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  async getAllSubmissions(): Promise<AntiqueSubmission[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result as AntiqueSubmission[];
          if (!list || list.length === 0) {
            // Seed initial items if completely new
            this.seedInitialSubmissions().then(resolve);
          } else {
            // Sort by newest first
            list.sort((a, b) => b.createdAt - a.createdAt);
            resolve(list);
          }
        };
        req.onerror = () => {
          resolve(this.getLocalStorageFallback());
        };
      });
    } catch {
      return this.getLocalStorageFallback();
    }
  },

  getLocalStorageFallback(): AntiqueSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_SUBMISSIONS;
  },

  async seedInitialSubmissions(): Promise<AntiqueSubmission[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of INITIAL_DEMO_SUBMISSIONS) {
        store.put(item);
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SUBMISSIONS));
    }
    return INITIAL_DEMO_SUBMISSIONS;
  },

  async addSubmission(submission: Omit<AntiqueSubmission, 'id' | 'referenceCode' | 'createdAt' | 'status'>): Promise<AntiqueSubmission> {
    const id = 'sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const referenceCode = 'MLB-' + Math.floor(10000 + Math.random() * 90000);
    const newEntry: AntiqueSubmission = {
      ...submission,
      id,
      referenceCode,
      createdAt: Date.now(),
      status: 'pending',
    };

    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.add(newEntry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // LocalStorage fallback
      const current = this.getLocalStorageFallback();
      current.unshift(newEntry);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch (e) {
        console.warn('LocalStorage full, truncated payload', e);
      }
    }

    return newEntry;
  },

  async updateStatus(id: string, status: SubmissionStatus): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result as AntiqueSubmission;
          if (item) {
            item.status = status;
            store.put(item);
            resolve(true);
          } else {
            resolve(false);
          }
        };
        getReq.onerror = () => resolve(false);
      });
    } catch {
      const current = this.getLocalStorageFallback();
      const idx = current.findIndex(i => i.id === id);
      if (idx !== -1) {
        current[idx].status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return true;
      }
      return false;
    }
  },

  async updateNotes(id: string, notes: string): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result as AntiqueSubmission;
          if (item) {
            item.adminNotes = notes;
            store.put(item);
            resolve(true);
          } else {
            resolve(false);
          }
        };
        getReq.onerror = () => resolve(false);
      });
    } catch {
      const current = this.getLocalStorageFallback();
      const idx = current.findIndex(i => i.id === id);
      if (idx !== -1) {
        current[idx].adminNotes = notes;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return true;
      }
      return false;
    }
  },

  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      const current = this.getLocalStorageFallback().filter(i => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return true;
    }
  },

  // Compress & convert file to clean base64 data URL with max dimension to keep storage lean
  async processImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
