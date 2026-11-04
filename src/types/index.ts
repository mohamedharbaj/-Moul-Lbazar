export type Language = 'ar' | 'fr';

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
  descAr: string;
  descFr: string;
  examplesAr: string[];
  examplesFr: string[];
  image: string;
  iconName: string;
}
