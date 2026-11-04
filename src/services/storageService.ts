import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { AntiqueSubmission, SubmissionPhoto, SubmissionStatus } from '../types';

const SUBMISSIONS_COLLECTION = 'submissions';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface CreateSubmissionInput {
  fullName: string;
  city: string;
  phone: string;
  categoryId: string;
  categoryTitle: string;
  description: string;
  expectedPrice?: string;
  photos: SubmissionPhoto[];
}

export const StorageService = {
  /**
   * Fetch all submissions from Firestore.
   * By default hides expired submissions (expiresAt <= now).
   */
  async getAllSubmissions(includeExpired: boolean = false): Promise<AntiqueSubmission[]> {
    if (!isFirebaseConfigured() || !db) {
      throw new Error(
        'قاعدة بيانات Firebase غير مهيأة بعد. يرجى ضبط مفاتيح Firebase في متغيرات البيئة.'
      );
    }

    try {
      const submissionsRef = collection(db, SUBMISSIONS_COLLECTION);
      let snapshot;
      try {
        const q = query(submissionsRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (orderError) {
        console.warn('Fallback without orderBy:', orderError);
        snapshot = await getDocs(submissionsRef);
      }

      const now = Date.now();
      const list: AntiqueSubmission[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Convert createdAt
        let createdAtMillis = now;
        if (data.createdAt instanceof Timestamp) {
          createdAtMillis = data.createdAt.toMillis();
        } else if (typeof data.createdAt === 'number') {
          createdAtMillis = data.createdAt;
        } else if (data.createdAt?.seconds) {
          createdAtMillis = data.createdAt.seconds * 1000;
        }

        // Convert expiresAt (defaults to createdAt + 7 days if not present)
        let expiresAtMillis = createdAtMillis + SEVEN_DAYS_MS;
        if (data.expiresAt instanceof Timestamp) {
          expiresAtMillis = data.expiresAt.toMillis();
        } else if (typeof data.expiresAt === 'number') {
          expiresAtMillis = data.expiresAt;
        } else if (data.expiresAt?.seconds) {
          expiresAtMillis = data.expiresAt.seconds * 1000;
        }

        // Normalize photos array
        const rawPhotos = Array.isArray(data.photos) ? data.photos : [];
        const photos: SubmissionPhoto[] = rawPhotos.map((p: any) => {
          if (typeof p === 'string') {
            return { url: p, publicId: '' };
          }
          return {
            url: p?.url || '',
            publicId: p?.publicId || '',
          };
        });

        const submission: AntiqueSubmission = {
          id: docSnap.id,
          referenceCode: data.referenceCode || `MLB-${docSnap.id.substring(0, 5).toUpperCase()}`,
          fullName: data.fullName || '',
          city: data.city || '',
          phone: data.phone || '',
          categoryId: data.categoryId || '',
          categoryTitle: data.categoryTitle || '',
          description: data.description || '',
          expectedPrice: data.expectedPrice || undefined,
          photos,
          status: (data.status as SubmissionStatus) || 'pending',
          createdAt: createdAtMillis,
          expiresAt: expiresAtMillis,
          adminNotes: data.adminNotes || '',
        };

        // Filter expired items unless explicitly requested
        if (includeExpired || submission.expiresAt > now) {
          list.push(submission);
        }
      });

      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);

      return list;
    } catch (error: any) {
      console.error('Error fetching submissions from Firestore:', error);
      throw new Error(
        error?.message || 'فشل الاتصال بقاعدة بيانات Firestore لجلب الطلبات.'
      );
    }
  },

  /**
   * Save a new submission to Firestore with 7-day expiration.
   */
  async addSubmission(input: CreateSubmissionInput): Promise<AntiqueSubmission> {
    if (!isFirebaseConfigured() || !db) {
      throw new Error(
        'قاعدة بيانات Firebase غير متصلة. يرجى إعداد VITE_FIREBASE_API_KEY في ملف البيئة.'
      );
    }

    const now = Date.now();
    const expiresAt = now + SEVEN_DAYS_MS;
    const referenceCode = 'MLB-' + Math.floor(10000 + Math.random() * 90000);

    const docData = {
      referenceCode,
      fullName: input.fullName.trim(),
      city: input.city.trim(),
      phone: input.phone.trim(),
      categoryId: input.categoryId,
      categoryTitle: input.categoryTitle,
      description: input.description.trim(),
      expectedPrice: input.expectedPrice?.trim() || null,
      photos: input.photos,
      status: 'pending' as SubmissionStatus,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(expiresAt),
      adminNotes: '',
    };

    try {
      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), docData);

      return {
        id: docRef.id,
        referenceCode,
        fullName: input.fullName.trim(),
        city: input.city.trim(),
        phone: input.phone.trim(),
        categoryId: input.categoryId,
        categoryTitle: input.categoryTitle,
        description: input.description.trim(),
        expectedPrice: input.expectedPrice?.trim() || undefined,
        photos: input.photos,
        status: 'pending',
        createdAt: now,
        expiresAt,
        adminNotes: '',
      };
    } catch (error: any) {
      console.error('Error writing submission to Firestore:', error);
      throw new Error(
        `فشل حفظ الطلب في Firestore: ${error?.message || 'تعذر الاتصال بالخادم'}`
      );
    }
  },

  /**
   * Update submission status in Firestore.
   */
  async updateStatus(id: string, status: SubmissionStatus): Promise<boolean> {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase غير متصل.');
    }

    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      await updateDoc(docRef, { status });
      return true;
    } catch (error) {
      console.error('Error updating status in Firestore:', error);
      throw error;
    }
  },

  /**
   * Update admin notes in Firestore.
   */
  async updateNotes(id: string, notes: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase غير متصل.');
    }

    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      await updateDoc(docRef, { adminNotes: notes });
      return true;
    } catch (error) {
      console.error('Error updating admin notes in Firestore:', error);
      throw error;
    }
  },

  /**
   * Delete submission from Firestore.
   */
  async deleteSubmission(id: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase غير متصل.');
    }

    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting submission from Firestore:', error);
      throw error;
    }
  },
};
