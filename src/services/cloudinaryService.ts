import { SubmissionPhoto } from '../types';

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tu7covvj',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'moulbazar_upload',
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'moulbazar/listings',
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
};

export const CloudinaryService = {
  /**
   * Upload an image file to Cloudinary using unsigned upload preset.
   * No API secret is exposed in frontend.
   */
  async uploadImage(file: File): Promise<SubmissionPhoto> {
    // 1. Validate file type
    if (!CLOUDINARY_CONFIG.allowedTypes.includes(file.type)) {
      throw new Error(
        `نوع الملف "${file.name}" غير مدعوم. المرجو اختيار صور بصيغة JPG أو PNG أو WebP.`
      );
    }

    // 2. Validate file size
    if (file.size > CLOUDINARY_CONFIG.maxSizeBytes) {
      throw new Error(
        `حجم الصورة "${file.name}" يتجاوز الحد الأقصى المسموح به (10 ميغابايت).`
      );
    }

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    if (CLOUDINARY_CONFIG.folder) {
      formData.append('folder', CLOUDINARY_CONFIG.folder);
    }

    // 4. Send request to Cloudinary API
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Cloudinary upload failed with status ${response.status}`;
      console.error('Cloudinary upload error:', errorMsg);
      throw new Error(
        `فشل رفع الصورة على Cloudinary: ${errorMsg}`
      );
    }

    const data = await response.json();
    if (!data.secure_url || !data.public_id) {
      throw new Error('لم يتم استلام رابط صالح للصورة من Cloudinary.');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  },

  /**
   * Upload multiple images in sequence or parallel and collect results.
   */
  async uploadMultipleImages(
    files: File[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<SubmissionPhoto[]> {
    const results: SubmissionPhoto[] = [];
    let completed = 0;

    for (const file of files) {
      const uploaded = await this.uploadImage(file);
      results.push(uploaded);
      completed++;
      if (onProgress) {
        onProgress(completed, files.length);
      }
    }

    return results;
  },
};
