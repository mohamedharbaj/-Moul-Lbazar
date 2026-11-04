/**
 * Moul LBazar - Cleanup Expired Listings Script
 * 
 * Automatically purges antique submissions that have exceeded their 7-day expiration
 * window, and securely deletes corresponding photos from Cloudinary using their public_id.
 * 
 * Run in GitHub Actions or locally with:
 * node scripts/cleanup-expired-listings.cjs
 */

const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

async function runCleanup() {
  console.log('--- Starting Moul LBazar Expired Listings Cleanup ---');
  console.log('Timestamp:', new Date().toISOString());

  // 1. Verify and configure Firebase Admin
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    console.error('ERROR: Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (err) {
    try {
      const decoded = Buffer.from(serviceAccountRaw, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    } catch (b64Err) {
      console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON:', err.message);
      process.exit(1);
    }
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'moul-lbazar',
    });
  }

  // 2. Configure Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'tu7covvj';
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('ERROR: Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET.');
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const nowMillis = Date.now();

  console.log('Querying expired submissions (expiresAt <= now)...');

  // Query Firestore for expired submissions
  // Handle both Timestamp and numeric millis representation for safety
  const expiredDocsMap = new Map();

  try {
    const tsQuery = await db.collection('submissions')
      .where('expiresAt', '<=', now)
      .get();
    tsQuery.forEach(docSnap => expiredDocsMap.set(docSnap.id, docSnap));
  } catch (err) {
    console.warn('Timestamp query warning:', err.message);
  }

  try {
    const numQuery = await db.collection('submissions')
      .where('expiresAt', '<=', nowMillis)
      .get();
    numQuery.forEach(docSnap => expiredDocsMap.set(docSnap.id, docSnap));
  } catch (err) {
    console.warn('Numeric query warning:', err.message);
  }

  const expiredDocs = Array.from(expiredDocsMap.values());
  console.log(`Found ${expiredDocs.length} expired submission(s) to process.`);

  let deletedSubmissionsCount = 0;
  let deletedPhotosCount = 0;
  let failedCount = 0;

  for (const docSnap of expiredDocs) {
    const data = docSnap.data();
    const docId = docSnap.id;
    const refCode = data.referenceCode || docId;
    console.log(`\nProcessing expired submission ${refCode} (ID: ${docId})...`);

    const photos = Array.isArray(data.photos) ? data.photos : [];
    let allPhotosDeleted = true;
    const remainingPhotos = [];

    for (const photo of photos) {
      const publicId = typeof photo === 'string' ? null : photo?.publicId;

      if (!publicId) {
        // No publicId stored, nothing to delete in Cloudinary
        continue;
      }

      try {
        console.log(` Deleting Cloudinary asset: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
          invalidate: true,
        });

        if (result.result === 'ok' || result.result === 'not found') {
          console.log(` Successfully removed Cloudinary photo: ${publicId} (${result.result})`);
          deletedPhotosCount++;
        } else {
          console.warn(` Cloudinary returned non-ok result for ${publicId}:`, result);
          allPhotosDeleted = false;
          remainingPhotos.push(photo);
        }
      } catch (cloudErr) {
        console.error(` ERROR deleting Cloudinary photo ${publicId}:`, cloudErr.message);
        allPhotosDeleted = false;
        remainingPhotos.push(photo);
      }
    }

    if (allPhotosDeleted) {
      try {
        await docSnap.ref.delete();
        console.log(` Deleted Firestore submission document: ${docId}`);
        deletedSubmissionsCount++;
      } catch (dbErr) {
        console.error(` ERROR deleting Firestore doc ${docId}:`, dbErr.message);
        failedCount++;
      }
    } else {
      console.warn(` Retention safety: doc ${docId} kept because some Cloudinary photos failed deletion. Will retry next run.`);
      // Update doc with remaining photos so already-deleted photos are not re-attempted
      try {
        await docSnap.ref.update({ photos: remainingPhotos });
      } catch (e) {
        console.warn('Could not update remaining photos on doc:', e.message);
      }
      failedCount++;
    }
  }

  console.log('\n--- Cleanup Summary ---');
  console.log(`Submissions deleted: ${deletedSubmissionsCount}`);
  console.log(`Cloudinary photos deleted: ${deletedPhotosCount}`);
  console.log(`Failed / Pending retry: ${failedCount}`);
  console.log('--- Cleanup Finished Successfully ---');
}

runCleanup().catch(err => {
  console.error('FATAL Error in cleanup script:', err);
  process.exit(1);
});
