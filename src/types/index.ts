export type Language = 'ar' | 'fr' | 'en';

export type SubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'purchased' | 'rejected';

export interface SubmissionPhoto {
  url: string;
  publicId: string;
}

export interface AntiqueSubmission {
  id: string;
  referenceCode: string;
  fullName: string;
  city: string;
  phone: string;
  categoryId: string;
  categoryTitle: string;
  description: string;
  expectedPrice?: string;
  photos: SubmissionPhoto[];
  status: SubmissionStatus;
  createdAt: number;
  expiresAt: number; // Expiration timestamp (createdAt + 7 days)
  adminNotes?: string;
}

export interface CategoryItem {
  id: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  examplesAr: string[];
  examplesFr: string[];
  examplesEn: string[];
  image: string;
  iconName: string;
}
