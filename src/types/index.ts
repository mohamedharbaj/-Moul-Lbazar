export type Language = 'ar' | 'fr';

export type SubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'purchased' | 'rejected';

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
  photos: string[]; // Base64 data URLs or remote storage URLs
  status: SubmissionStatus;
  createdAt: number;
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
